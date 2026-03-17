import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateAppointmentDto } from '../appointments/dto/create-appointment.dto';
import { GetAvailabilityQueryDto } from '../appointments/dto/get-availability-query.dto';
import { PublicService } from '../public/public.service';
import { BookingAiMockProvider } from './providers/booking-ai.mock.provider';
import { BookingAiOpenAiProvider } from './providers/booking-ai.openai.provider';
import {
  BookingChatProviderInput,
  BookingChatQuickReply,
  BookingChatResponse,
  BookingChatStage,
  BookingChatState,
} from './types/booking-ai.types';

type Business = {
  id: string;
  name: string;
  slug: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  isBookable: boolean;
};

type Service = {
  id: string;
  name: string;
};

type Slot = {
  startsAt: string;
  endsAt: string;
  startTime: string;
  endTime: string;
};

@Injectable()
export class BookingAiService {
  private readonly logger = new Logger(BookingAiService.name);

  constructor(
    private readonly publicService: PublicService,
    private readonly configService: ConfigService,
    private readonly mockProvider: BookingAiMockProvider,
    private readonly openAiProvider: BookingAiOpenAiProvider,
  ) {}

  async chat(
    businessId: string,
    payload: {
      message: string;
      state?: BookingChatState;
    },
  ): Promise<BookingChatResponse> {
    const incomingState: BookingChatState = { ...(payload.state ?? {}) };
    const userMessage = (payload.message ?? '').trim();

    const business = await this.getBusinessStub(businessId);

    const employeesResponse = (await this.publicService.listPublicEmployees(
      businessId,
    )) as { items: Employee[] };

    const servicesResponse = (await this.publicService.listPublicServices(
      businessId,
    )) as { items: Service[] };

    const employees = (employeesResponse.items ?? []).filter(
      (item) => item.isBookable,
    );
    const services = servicesResponse.items ?? [];

    this.applyStructuredSelection(
      userMessage,
      services,
      employees,
      incomingState,
    );

    this.tryInferService(userMessage, services, incomingState);
    this.tryInferEmployee(userMessage, employees, incomingState);
    this.tryInferDate(userMessage, incomingState);
    this.tryInferStartsAt(userMessage, incomingState);
    this.tryInferCustomerData(userMessage, incomingState);

    await this.enrichStateWithOpenAi(
      business.name,
      userMessage,
      incomingState,
      services,
      employees,
    );

    if (!incomingState.serviceId) {
      return this.buildResponse({
        businessName: business.name,
        providerText: '¿Qué servicio quieres reservar?',
        stage: 'choose_service',
        state: incomingState,
        quickReplies: services.slice(0, 8).map((service) => ({
          label: service.name,
          value: `service:${service.id}`,
        })),
        userMessage,
      });
    }

    if (!incomingState.serviceName) {
      const selectedService = services.find(
        (item) => item.id === incomingState.serviceId,
      );
      if (selectedService) {
        incomingState.serviceName = selectedService.name;
      }
    }

    if (!incomingState.employeeId) {
      return this.buildResponse({
        businessName: business.name,
        providerText: `Perfecto. Para ${incomingState.serviceName ?? 'ese servicio'}, ¿con qué profesional quieres reservar?`,
        stage: 'choose_employee',
        state: incomingState,
        quickReplies: employees.slice(0, 8).map((employee) => ({
          label: `${employee.firstName} ${employee.lastName}`,
          value: `employee:${employee.id}`,
        })),
        userMessage,
      });
    }

    if (!incomingState.employeeName) {
      const selectedEmployee = employees.find(
        (item) => item.id === incomingState.employeeId,
      );
      if (selectedEmployee) {
        incomingState.employeeName = `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
      }
    }

    if (!incomingState.date) {
      const today = this.formatDateOnly(new Date());
      const tomorrow = this.formatDateOnly(
        new Date(Date.now() + 24 * 60 * 60 * 1000),
      );

      return this.buildResponse({
        businessName: business.name,
        providerText: `Genial. ¿Para qué fecha quieres la cita con ${incomingState.employeeName}?`,
        stage: 'choose_date',
        state: incomingState,
        quickReplies: [
          { label: `Hoy (${today})`, value: `date:${today}` },
          { label: `Mañana (${tomorrow})`, value: `date:${tomorrow}` },
        ],
        userMessage,
      });
    }

    if (!incomingState.startsAt) {
      const availability = await this.fetchAvailability(
        businessId,
        incomingState.employeeId,
        incomingState.serviceId,
        incomingState.date,
      );

      const slotFromNaturalLanguage = this.findNearestSlotFromRequestedTime(
        incomingState,
        availability,
      );

      if (slotFromNaturalLanguage && !incomingState.startsAt) {
        incomingState.startsAt = slotFromNaturalLanguage.startsAt;
      }

      if (!incomingState.startsAt && availability.length === 0) {
        return this.buildResponse({
          businessName: business.name,
          providerText:
            'No he encontrado huecos para esa combinación. Prueba otra fecha o cambia de profesional.',
          stage: 'choose_date',
          state: {
            ...incomingState,
            startsAt: undefined,
          },
          quickReplies: [
            { label: 'Cambiar fecha', value: 'reset:date' },
            { label: 'Cambiar profesional', value: 'reset:employee' },
          ],
          userMessage,
        });
      }

      if (!incomingState.startsAt) {
        return this.buildResponse({
          businessName: business.name,
          providerText: `He encontrado estos huecos para el ${incomingState.date}. ¿Cuál prefieres?`,
          stage: 'choose_slot',
          state: incomingState,
          quickReplies: availability.slice(0, 8).map((slot) => ({
            label: slot.startTime,
            value: `slot:${slot.startsAt}`,
          })),
          userMessage,
          availableSlots: availability,
        });
      }
    }

    if (!incomingState.customerFirstName || !incomingState.customerLastName) {
      return this.buildResponse({
        businessName: business.name,
        providerText:
          'Ya tengo servicio, profesional, fecha y hora. Ahora necesito tu nombre y apellidos. Puedes escribir por ejemplo: "me llamo Juan Pérez".',
        stage: 'collect_customer',
        state: incomingState,
        quickReplies: [],
        userMessage,
      });
    }

    const userExplicitlyConfirmed = this.detectConfirmation(userMessage);

    if (!userExplicitlyConfirmed) {
      return this.buildResponse({
        businessName: business.name,
        providerText: `Resumen de la reserva:
- Servicio: ${incomingState.serviceName}
- Profesional: ${incomingState.employeeName}
- Fecha: ${incomingState.date}
- Hora: ${this.extractTimeFromIso(incomingState.startsAt)}
- Cliente: ${incomingState.customerFirstName} ${incomingState.customerLastName}

Si está bien, pulsa el botón o escribe "confirmar reserva".`,
        stage: 'confirm',
        state: incomingState,
        quickReplies: [
          { label: 'Confirmar reserva', value: 'confirm_booking' },
        ],
        userMessage,
      });
    }

    const dto: CreateAppointmentDto = {
      employeeId: incomingState.employeeId,
      serviceId: incomingState.serviceId,
      startsAt: incomingState.startsAt,
      source: 'WEB',
      customerFirstName: incomingState.customerFirstName,
      customerLastName: incomingState.customerLastName,
      customerEmail: incomingState.customerEmail,
      customerPhone: incomingState.customerPhone,
      customerNotes: incomingState.customerNotes,
    };

    await this.publicService.createPublicAppointment(businessId, dto);

    return this.buildResponse({
      businessName: business.name,
      providerText: `Reserva confirmada para ${incomingState.customerFirstName} ${incomingState.customerLastName}.
- Servicio: ${incomingState.serviceName}
- Profesional: ${incomingState.employeeName}
- Fecha: ${incomingState.date}
- Hora: ${this.extractTimeFromIso(incomingState.startsAt)}

Tu cita ha quedado creada correctamente.`,
      stage: 'done',
      state: incomingState,
      quickReplies: [],
      userMessage,
      appointmentCreated: true,
    });
  }

  private async fetchAvailability(
    businessId: string,
    employeeId: string,
    serviceId: string,
    date: string,
  ): Promise<Slot[]> {
    const availabilityQuery: GetAvailabilityQueryDto = {
      serviceId,
      date: `${date}T00:00:00.000Z`,
      slotStepMinutes: 15,
    };

    const availability = (await this.publicService.getPublicAvailability(
      businessId,
      employeeId,
      availabilityQuery,
    )) as { slots: Slot[] };

    return availability.slots ?? [];
  }

  private applyStructuredSelection(
    message: string,
    services: Service[],
    employees: Employee[],
    state: BookingChatState,
  ): void {
    const trimmed = message.trim();

    if (trimmed.startsWith('service:')) {
      const serviceId = trimmed.slice('service:'.length);
      const service = services.find((item) => item.id === serviceId);
      if (service) {
        state.serviceId = service.id;
        state.serviceName = service.name;
      }
      return;
    }

    if (trimmed.startsWith('employee:')) {
      const employeeId = trimmed.slice('employee:'.length);
      const employee = employees.find((item) => item.id === employeeId);
      if (employee) {
        state.employeeId = employee.id;
        state.employeeName = `${employee.firstName} ${employee.lastName}`;
      }
      return;
    }

    if (trimmed.startsWith('date:')) {
      const date = trimmed.slice('date:'.length);
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        state.date = date;
        state.startsAt = undefined;
      }
      return;
    }

    if (trimmed.startsWith('slot:')) {
      const startsAt = trimmed.slice('slot:'.length);
      state.startsAt = startsAt;
      return;
    }

    if (trimmed === 'confirm_booking') {
      return;
    }

    if (trimmed === 'reset:date') {
      state.date = undefined;
      state.startsAt = undefined;
      return;
    }

    if (trimmed === 'reset:employee') {
      state.employeeId = undefined;
      state.employeeName = undefined;
      state.startsAt = undefined;
      return;
    }
  }

  private async enrichStateWithOpenAi(
    businessName: string,
    userMessage: string,
    state: BookingChatState,
    services: Service[],
    employees: Employee[],
  ): Promise<void> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();

    const useOpenAi =
      !!apiKey &&
      apiKey !== 'tu_api_key_aqui' &&
      !apiKey.includes('tu_api_key');

    if (!useOpenAi) {
      return;
    }

    try {
      const extraction = await this.openAiProvider.extractBookingData({
        businessName,
        userMessage,
        currentState: state,
        services: services.map((item) => item.name),
        employees: employees.map(
          (item) => `${item.firstName} ${item.lastName}`,
        ),
      });

      if (extraction.serviceName && !state.serviceId) {
        const exactService = services.find(
          (item) =>
            this.normalize(item.name) === this.normalize(extraction.serviceName!),
        );

        if (exactService) {
          state.serviceId = exactService.id;
          state.serviceName = exactService.name;
        } else {
          const partialService = services.find((item) =>
            this.normalize(item.name).includes(
              this.normalize(extraction.serviceName!),
            ),
          );

          if (partialService) {
            state.serviceId = partialService.id;
            state.serviceName = partialService.name;
          }
        }
      }

      if (extraction.employeeName && !state.employeeId) {
        const exactEmployee = employees.find(
          (item) =>
            this.normalize(`${item.firstName} ${item.lastName}`) ===
            this.normalize(extraction.employeeName!),
        );

        if (exactEmployee) {
          state.employeeId = exactEmployee.id;
          state.employeeName = `${exactEmployee.firstName} ${exactEmployee.lastName}`;
        } else {
          const partialEmployee = employees.find((item) => {
            const fullName = `${item.firstName} ${item.lastName}`;
            const normalizedFullName = this.normalize(fullName);
            const normalizedTarget = this.normalize(extraction.employeeName!);

            return (
              normalizedFullName.includes(normalizedTarget) ||
              normalizedTarget.includes(normalizedFullName) ||
              this.normalize(item.firstName).includes(normalizedTarget) ||
              this.normalize(item.lastName).includes(normalizedTarget)
            );
          });

          if (partialEmployee) {
            state.employeeId = partialEmployee.id;
            state.employeeName = `${partialEmployee.firstName} ${partialEmployee.lastName}`;
          }
        }
      }

      if (extraction.date && !state.date) {
        state.date = extraction.date;
      }

      if (extraction.time && state.date && !state.startsAt) {
        state.startsAt = `${state.date}T${extraction.time}:00.000Z`;
      }

      if (extraction.customerFirstName && !state.customerFirstName) {
        state.customerFirstName = extraction.customerFirstName;
      }

      if (extraction.customerLastName && !state.customerLastName) {
        state.customerLastName = extraction.customerLastName;
      }

      if (extraction.customerEmail && !state.customerEmail) {
        state.customerEmail = extraction.customerEmail;
      }

      if (extraction.customerPhone && !state.customerPhone) {
        state.customerPhone = extraction.customerPhone;
      }

      if (extraction.customerNotes && !state.customerNotes) {
        state.customerNotes = extraction.customerNotes;
      }
    } catch (error) {
      this.logger.warn('No se pudo enriquecer el estado con OpenAI');
    }
  }

  private async buildResponse(input: {
    businessName: string;
    providerText: string;
    stage: BookingChatStage;
    state: BookingChatState;
    quickReplies: BookingChatQuickReply[];
    userMessage: string;
    availableSlots?: Slot[];
    appointmentCreated?: boolean;
  }): Promise<BookingChatResponse> {
    const providerInput: BookingChatProviderInput = {
      businessName: input.businessName,
      stage: input.stage,
      state: input.state,
      userMessage: input.userMessage,
      suggestedText: input.providerText,
      quickReplies: input.quickReplies,
    };

    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();

    const useOpenAi =
      !!apiKey &&
      apiKey !== 'tu_api_key_aqui' &&
      !apiKey.includes('tu_api_key');

    if (useOpenAi) {
      try {
        const result = await this.openAiProvider.generate(providerInput);

        return {
          ok: true,
          stage: input.stage,
          provider: 'openai',
          text: result.text,
          quickReplies: input.quickReplies,
          state: input.state,
          availableSlots: input.availableSlots,
          appointmentCreated: input.appointmentCreated,
        };
      } catch (error) {
        this.logger.warn('Fallo provider OpenAI, usando mock');
      }
    }

    const result = await this.mockProvider.generate(providerInput);

    return {
      ok: true,
      stage: input.stage,
      provider: 'mock',
      text: result.text,
      quickReplies: input.quickReplies,
      state: input.state,
      availableSlots: input.availableSlots,
      appointmentCreated: input.appointmentCreated,
    };
  }

  private async getBusinessStub(businessId: string): Promise<Business> {
    return {
      id: businessId,
      name: 'tu negocio',
      slug: businessId,
    };
  }

  private tryInferService(
    message: string,
    services: Service[],
    state: BookingChatState,
  ) {
    if (state.serviceId) return;

    const normalizedMessage = this.normalize(message);

    const exact = services.find(
      (service) => this.normalize(service.name) === normalizedMessage,
    );

    if (exact) {
      state.serviceId = exact.id;
      state.serviceName = exact.name;
      return;
    }

    const partial = services.find((service) =>
      normalizedMessage.includes(this.normalize(service.name)),
    );

    if (partial) {
      state.serviceId = partial.id;
      state.serviceName = partial.name;
    }
  }

  private tryInferEmployee(
    message: string,
    employees: Employee[],
    state: BookingChatState,
  ) {
    if (state.employeeId) return;

    const normalizedMessage = this.normalize(message);

    const exact = employees.find((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`;
      return this.normalize(fullName) === normalizedMessage;
    });

    if (exact) {
      state.employeeId = exact.id;
      state.employeeName = `${exact.firstName} ${exact.lastName}`;
      return;
    }

    const partial = employees.find((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`;
      return (
        normalizedMessage.includes(this.normalize(fullName)) ||
        normalizedMessage.includes(this.normalize(employee.firstName)) ||
        normalizedMessage.includes(this.normalize(employee.lastName))
      );
    });

    if (partial) {
      state.employeeId = partial.id;
      state.employeeName = `${partial.firstName} ${partial.lastName}`;
    }
  }

  private tryInferDate(message: string, state: BookingChatState) {
    if (state.date) return;

    const raw = message.trim().toLowerCase();
    const today = new Date();

    if (raw.includes('hoy')) {
      state.date = this.formatDateOnly(today);
      return;
    }

    if (raw.includes('mañana') || raw.includes('manana')) {
      state.date = this.formatDateOnly(
        new Date(today.getTime() + 24 * 60 * 60 * 1000),
      );
      return;
    }

    const isoMatch = raw.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (isoMatch) {
      state.date = isoMatch[1];
      return;
    }

    const localMatch = raw.match(/\b(\d{2})\/(\d{2})\/(20\d{2})\b/);
    if (localMatch) {
      state.date = `${localMatch[3]}-${localMatch[2]}-${localMatch[1]}`;
    }
  }

  private tryInferStartsAt(message: string, state: BookingChatState) {
    if (state.startsAt) return;
    if (!state.date) return;

    const isoMatch = message.match(
      /\b(20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)\b/,
    );

    if (isoMatch) {
      state.startsAt = isoMatch[1];
      return;
    }

    const hourMatch = message.match(/\b(\d{1,2}):(\d{2})\b/);
    if (hourMatch) {
      const hour = hourMatch[1].padStart(2, '0');
      const minute = hourMatch[2];
      state.startsAt = `${state.date}T${hour}:${minute}:00.000Z`;
    }
  }

  private tryInferCustomerData(message: string, state: BookingChatState) {
    const emailMatch = message.match(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    );
    if (emailMatch && !state.customerEmail) {
      state.customerEmail = emailMatch[0];
    }

    const phoneMatch = message.match(/\b(?:\+34\s?)?[6789]\d{8}\b/);
    if (phoneMatch && !state.customerPhone) {
      state.customerPhone = phoneMatch[0].replace(/\s+/g, '');
    }

    if (!state.customerFirstName || !state.customerLastName) {
      const patterns = [
        /\bme llamo\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\b/i,
        /\bmi nombre es\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\b/i,
        /\bsoy\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\b/i,
        /^([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)$/i,
      ];

      for (const pattern of patterns) {
        const match = message.trim().match(pattern);
        if (match) {
          state.customerFirstName = match[1];
          state.customerLastName = match[2];
          break;
        }
      }
    }
  }

  private detectConfirmation(message: string): boolean {
    const normalized = this.normalize(message);
    return (
      normalized === 'confirm_booking' ||
      normalized.includes('confirmar reserva') ||
      normalized.includes('confirmo') ||
      normalized.includes('adelante')
    );
  }

  private findNearestSlotFromRequestedTime(
    state: BookingChatState,
    availability: Slot[],
  ): Slot | null {
    if (!state.startsAt || availability.length === 0) {
      return null;
    }

    const requested = new Date(state.startsAt).getTime();

    const exact = availability.find((slot) => slot.startsAt === state.startsAt);
    if (exact) {
      return exact;
    }

    let nearest: Slot | null = null;
    let nearestDistance = Number.MAX_SAFE_INTEGER;

    for (const slot of availability) {
      const slotTime = new Date(slot.startsAt).getTime();
      const distance = Math.abs(slotTime - requested);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = slot;
      }
    }

    const maxDistanceMs = 30 * 60 * 1000;
    return nearestDistance <= maxDistanceMs ? nearest : null;
  }

  private extractTimeFromIso(iso: string): string {
    const date = new Date(iso);
    const hours = `${date.getUTCHours()}`.padStart(2, '0');
    const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private formatDateOnly(date: Date): string {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${date.getUTCDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}