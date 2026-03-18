import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AvailabilitySlot,
  BookingChatMessage,
  BookingChatResponse,
  BookingChatState,
  BusinessesService,
  Business,
  Employee,
  Promotion,
  Service,
  ServicePackage,
} from '../../core/services/businesses.service';

@Component({
  selector: 'app-public-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './public-booking.component.html',
  styleUrl: './public-booking.component.css',
})
export class PublicBookingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly businessesService = inject(BusinessesService);

  slug = '';
  business: Business | null = null;
  employees: Employee[] = [];
  services: Service[] = [];
  packages: ServicePackage[] = [];
  promotions: Promotion[] = [];
  slots: AvailabilitySlot[] = [];
  isLoading = true;
  isSearching = false;
  isSubmitting = false;
  isChatLoading = false;
  successMessage = '';
  errorMessage = '';

  chatMessages: BookingChatMessage[] = [];
  chatQuickReplies: Array<{ label: string; value: string }> = [];
  chatState: BookingChatState = {};
  chatInput = '';
  chatProvider: 'mock' | 'openai' | '' = '';

  form = this.fb.nonNullable.group({
    bookingMode: ['SERVICE', [Validators.required]],
    employeeId: ['', [Validators.required]],
    serviceId: [''],
    servicePackageId: [''],
    date: [this.getTomorrowDate(), [Validators.required]],
    startsAt: ['', [Validators.required]],
    customerFirstName: ['', [Validators.required, Validators.minLength(2)]],
    customerLastName: ['', [Validators.required, Validators.minLength(2)]],
    customerEmail: [''],
    customerPhone: [''],
    customerNotes: [''],
  });

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';

    if (!this.slug) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.businessesService.getBusinessBySlug(this.slug).subscribe({
      next: (business) => {
        this.business = business;

        let loaded = 0;
        const finish = () => {
          loaded += 1;
          if (loaded === 4) {
            this.isLoading = false;
            this.startChat();
          }
        };

        this.businessesService.listPublicEmployees(business.id).subscribe({
          next: (response) => {
            this.employees = response.items.filter((e) => e.isBookable);
            if (this.employees[0]) {
              this.form.patchValue({ employeeId: this.employees[0].id });
            }
            finish();
          },
          error: () => {
            this.errorMessage = 'No se pudieron cargar los empleados';
            finish();
          },
        });

        this.businessesService.listPublicServices(business.id).subscribe({
          next: (response) => {
            this.services = response.items;
            if (this.services[0]) {
              this.form.patchValue({ serviceId: this.services[0].id });
            }
            finish();
          },
          error: () => {
            this.errorMessage = 'No se pudieron cargar los servicios';
            finish();
          },
        });

        this.businessesService.listPublicServicePackages(business.id).subscribe({
          next: (response) => {
            this.packages = response.items;
            if (this.packages[0]) {
              this.form.patchValue({ servicePackageId: this.packages[0].id });
            }
            finish();
          },
          error: () => {
            finish();
          },
        });

        this.businessesService.listPublicPromotions(business.id).subscribe({
          next: (response) => {
            this.promotions = response.items;
            finish();
          },
          error: () => {
            finish();
          },
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el negocio';
        this.isLoading = false;
      },
    });
  }

  startChat(): void {
    if (!this.business) return;
    this.sendChatMessage('Hola, quiero reservar una cita', false);
  }

  sendChatFromInput(): void {
    const message = this.chatInput.trim();
    if (!message) return;

    this.chatInput = '';
    this.sendChatMessage(message, true);
  }

  useQuickReply(value: string): void {
    this.sendChatMessage(value, true);
  }

  onBookingModeChange(): void {
    const mode = this.form.getRawValue().bookingMode;

    if (mode === 'SERVICE') {
      this.form.patchValue({
        servicePackageId: '',
        startsAt: '',
      });
    } else {
      this.form.patchValue({
        serviceId: '',
        startsAt: '',
      });
    }

    this.slots = [];
  }

  private sendChatMessage(message: string, pushUserMessage: boolean): void {
    if (!this.business) return;

    this.isChatLoading = true;
    this.errorMessage = '';

    if (pushUserMessage) {
      const visibleText = this.mapVisibleUserMessage(message);
      this.chatMessages.push({
        role: 'user',
        content: visibleText,
      });
    }

    this.businessesService
      .postPublicBookingChat(this.business.id, {
        message,
        messages: this.chatMessages,
        state: this.chatState,
      })
      .subscribe({
        next: (response) => {
          this.applyChatResponse(response);

          this.chatMessages.push({
            role: 'assistant',
            content: response.text,
          });

          this.isChatLoading = false;
        },
        error: (error) => {
          this.errorMessage = this.extractErrorMessage(
            error,
            'No se pudo procesar el chat de reserva',
          );
          this.isChatLoading = false;
        },
      });
  }

  private applyChatResponse(response: BookingChatResponse): void {
    this.chatState = { ...response.state };
    this.chatQuickReplies = response.quickReplies;
    this.chatProvider = response.provider;

    if (response.availableSlots?.length) {
      this.slots = response.availableSlots;
    }

    if (response.state.serviceId) {
      this.form.patchValue({
        bookingMode: 'SERVICE',
        serviceId: response.state.serviceId,
        servicePackageId: '',
      });
    }

    if (response.state.employeeId) {
      this.form.patchValue({ employeeId: response.state.employeeId });
    }

    if (response.state.date) {
      this.form.patchValue({ date: response.state.date });
    }

    if (response.state.startsAt) {
      this.form.patchValue({ startsAt: response.state.startsAt });
    }

    if (response.state.customerFirstName) {
      this.form.patchValue({
        customerFirstName: response.state.customerFirstName,
      });
    }

    if (response.state.customerLastName) {
      this.form.patchValue({
        customerLastName: response.state.customerLastName,
      });
    }

    if (response.state.customerEmail) {
      this.form.patchValue({
        customerEmail: response.state.customerEmail,
      });
    }

    if (response.state.customerPhone) {
      this.form.patchValue({
        customerPhone: response.state.customerPhone,
      });
    }

    if (response.state.customerNotes) {
      this.form.patchValue({
        customerNotes: response.state.customerNotes,
      });
    }

    if (response.appointmentCreated) {
      this.successMessage = 'Reserva creada correctamente desde el chat';
      this.slots = [];
    }
  }

  private buildAvailabilityPayload() {
    const raw = this.form.getRawValue();

    if (raw.bookingMode === 'SERVICE') {
      if (!raw.serviceId) return null;

      return {
        serviceId: raw.serviceId,
        servicePackageId: undefined,
      };
    }

    if (!raw.servicePackageId) return null;

    return {
      serviceId: undefined,
      servicePackageId: raw.servicePackageId,
    };
  }

  searchAvailability(): void {
    if (!this.business) return;

    const raw = this.form.getRawValue();
    const target = this.buildAvailabilityPayload();

    if (!raw.employeeId || !raw.date || !target) {
      this.errorMessage =
        'Selecciona empleado, fecha y un servicio o combo válido';
      return;
    }

    this.isSearching = true;
    this.errorMessage = '';
    this.slots = [];

    const isoDate = `${raw.date}T00:00:00.000Z`;

    this.businessesService
      .getPublicAvailability(this.business.id, raw.employeeId, {
        ...target,
        date: isoDate,
        slotStepMinutes: 15,
      })
      .subscribe({
        next: (response) => {
          this.slots = response.slots;
          this.isSearching = false;

          if (response.slots[0]) {
            this.form.patchValue({ startsAt: response.slots[0].startsAt });
          }
        },
        error: (error) => {
          this.errorMessage = this.extractErrorMessage(
            error,
            'No se pudo consultar la disponibilidad',
          );
          this.isSearching = false;
        },
      });
  }

  chooseSlot(slot: AvailabilitySlot): void {
    this.form.patchValue({ startsAt: slot.startsAt });
    this.chatState = {
      ...this.chatState,
      startsAt: slot.startsAt,
      date: this.form.getRawValue().date,
    };
  }

  submit(): void {
    if (!this.business) return;

    const raw = this.form.getRawValue();
    const target = this.buildAvailabilityPayload();

    if (
      !raw.employeeId ||
      !raw.date ||
      !raw.startsAt ||
      !raw.customerFirstName ||
      !raw.customerLastName ||
      !target
    ) {
      this.form.markAllAsTouched();
      this.errorMessage =
        'Completa los campos obligatorios: empleado, servicio o combo, fecha, hora, nombre y apellidos.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.businessesService
      .createPublicAppointment(this.business.id, {
        employeeId: raw.employeeId,
        serviceId: target.serviceId,
        servicePackageId: target.servicePackageId,
        startsAt: raw.startsAt,
        source: 'WEB',
        customerFirstName: raw.customerFirstName,
        customerLastName: raw.customerLastName,
        customerEmail: raw.customerEmail || undefined,
        customerPhone: raw.customerPhone || undefined,
        customerNotes: raw.customerNotes || undefined,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Reserva creada correctamente';
          this.isSubmitting = false;
          this.slots = [];
          this.form.patchValue({ startsAt: '' });
        },
        error: (error) => {
          this.errorMessage = this.extractErrorMessage(
            error,
            'No se pudo completar la reserva',
          );
          this.isSubmitting = false;
        },
      });
  }

  getVisiblePromotions(): Promotion[] {
    const raw = this.form.getRawValue();

    if (raw.bookingMode === 'PACKAGE') {
      return this.promotions.filter((promo) => !promo.serviceId);
    }

    return this.promotions.filter((promo) => {
      if (!promo.serviceId) return true;
      return promo.serviceId === raw.serviceId;
    });
  }

  formatPromotionValue(promo: Promotion): string {
    if (promo.type === 'PERCENTAGE') {
      return `${promo.value}% de descuento`;
    }

    return `${promo.value}€ de descuento`;
  }

  trackBySlot(index: number, slot: AvailabilitySlot): string {
    return `${index}-${slot.startsAt}`;
  }

  formatSlotLabel(slot: AvailabilitySlot): string {
    return `${slot.startTime} - ${slot.endTime}`;
  }

  private mapVisibleUserMessage(message: string): string {
    if (message.startsWith('service:')) {
      const id = message.slice('service:'.length);
      const match = this.services.find((item) => item.id === id);
      return match?.name ?? message;
    }

    if (message.startsWith('employee:')) {
      const id = message.slice('employee:'.length);
      const match = this.employees.find((item) => item.id === id);
      return match ? `${match.firstName} ${match.lastName}` : message;
    }

    if (message.startsWith('date:')) {
      return message.slice('date:'.length);
    }

    if (message.startsWith('slot:')) {
      return message.slice('slot:'.length);
    }

    if (message === 'confirm_booking') {
      return 'Confirmar reserva';
    }

    if (message === 'reset:date') {
      return 'Cambiar fecha';
    }

    if (message === 'reset:employee') {
      return 'Cambiar profesional';
    }

    return message;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    const anyError = error as {
      error?: { message?: string | string[] };
    };

    const message = anyError?.error?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return fallback;
  }

  private getTomorrowDate(): string {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }
}