import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AvailabilitySlot,
  BusinessesService,
  Employee,
  Service,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.css',
})
export class AppointmentCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businessesService = inject(BusinessesService);

  businessId = '';
  employees: Employee[] = [];
  services: Service[] = [];
  slots: AvailabilitySlot[] = [];
  isLoading = true;
  isSearching = false;
  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    employeeId: ['', [Validators.required]],
    serviceId: ['', [Validators.required]],
    date: ['2026-03-17', [Validators.required]],
    startsAt: ['', [Validators.required]],
    customerFirstName: ['Ana', [Validators.required]],
    customerLastName: ['Pérez', [Validators.required]],
    customerEmail: ['ana@example.com'],
    customerPhone: ['600444555'],
    customerNotes: ['Primera visita'],
  });

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    let loaded = 0;
    const finish = () => {
      loaded += 1;
      if (loaded === 2) {
        this.isLoading = false;
      }
    };

    this.businessesService.listEmployees(this.businessId).subscribe({
      next: (response) => {
        this.employees = response.items;
        if (response.items[0]) {
          this.form.patchValue({ employeeId: response.items[0].id });
        }
        finish();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los empleados';
        finish();
      },
    });

    this.businessesService.listServices(this.businessId).subscribe({
      next: (response) => {
        this.services = response.items;
        if (response.items[0]) {
          this.form.patchValue({ serviceId: response.items[0].id });
        }
        finish();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los servicios';
        finish();
      },
    });
  }

  searchAvailability(): void {
    const raw = this.form.getRawValue();

    if (!raw.employeeId || !raw.serviceId || !raw.date) {
      this.errorMessage = 'Selecciona empleado, servicio y fecha';
      return;
    }

    this.isSearching = true;
    this.errorMessage = '';
    this.slots = [];

    const isoDate = `${raw.date}T00:00:00.000Z`;

    this.businessesService
      .getAvailability(
        this.businessId,
        raw.employeeId,
        raw.serviceId,
        isoDate,
        15,
      )
      .subscribe({
        next: (response) => {
          this.slots = response.slots;
          this.isSearching = false;

          if (response.slots[0]) {
            this.form.patchValue({ startsAt: response.slots[0].startsAt });
          }
        },
        error: () => {
          this.errorMessage = 'No se pudo consultar la disponibilidad';
          this.isSearching = false;
        },
      });
  }

  chooseSlot(slot: AvailabilitySlot): void {
    this.form.patchValue({ startsAt: slot.startsAt });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSubmitting = true;
    this.errorMessage = '';

    this.businessesService
      .createAppointment(this.businessId, {
        employeeId: raw.employeeId,
        serviceId: raw.serviceId,
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
          this.isSubmitting = false;
          void this.router.navigate(['/businesses', this.businessId, 'appointments']);
        },
        error: () => {
          this.errorMessage = 'No se pudo crear la cita';
          this.isSubmitting = false;
        },
      });
  }
}