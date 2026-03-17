import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

export type Business = {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
};

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  bio?: string;
  colorHex?: string;
  status: string;
  isBookable: boolean;
  createdAt: string;
};
export type CancelAppointmentPayload = {
  reason?: string;
};
export type Service = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  price: string;
  isCombo: boolean;
  status: string;
  requiresDeposit: boolean;
  depositPercentage?: string | null;
  createdAt: string;
};

export type EmployeeServiceAssignment = {
  id: string;
  customDurationMin?: number | null;
  customPrice?: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    durationMinutes: number;
    price: string;
    status: string;
    requiresDeposit: boolean;
    depositPercentage?: string | null;
  };
};

export type OpeningHour = {
  id: string;
  weekday: string;
  startTime: string;
  endTime: string;
  isOpen?: boolean;
  isWorking?: boolean;
};

export type Blockout = {
  id: string;
  targetType: 'BUSINESS' | 'EMPLOYEE';
  employeeId?: string | null;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
};

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  startTime: string;
  endTime: string;
};

export type AvailabilityResponse = {
  businessId: string;
  employeeId: string;
  serviceId: string;
  weekday: string;
  date: string;
  durationMinutes?: number;
  reason?: string;
  slots: AvailabilitySlot[];
};

export type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  source: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  service: {
    id: string;
    name: string;
  };
};

export type BookingChatQuickReply = {
  label: string;
  value: string;
};

export type BookingChatState = {
  serviceId?: string;
  serviceName?: string;
  employeeId?: string;
  employeeName?: string;
  date?: string;
  startsAt?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNotes?: string;
};

export type BookingChatStage =
  | 'choose_service'
  | 'choose_employee'
  | 'choose_date'
  | 'choose_slot'
  | 'collect_customer'
  | 'confirm'
  | 'done';

export type BookingChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type BookingChatResponse = {
  ok: boolean;
  stage: BookingChatStage;
  provider: 'mock' | 'openai';
  text: string;
  quickReplies: BookingChatQuickReply[];
  state: BookingChatState;
  availableSlots?: AvailabilitySlot[];
  appointmentCreated?: boolean;
};

export type ListAppointmentsResponse = {
  items: Appointment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ListBusinessesResponse = {
  items: Business[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ListEmployeesResponse = {
  items: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ListServicesResponse = {
  items: Service[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ListEmployeeAssignmentsResponse = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: EmployeeServiceAssignment[];
  meta: {
    total: number;
  };
};

export type CreateBusinessPayload = {
  name: string;
  slug: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  timezone?: string;
  currency?: string;
  bookingCancellationHours?: number;
  allowCustomerCancellation?: boolean;
  depositPercentage: number;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone?: string;
};

export type CreateEmployeePayload = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  bio?: string;
  colorHex?: string;
  isBookable?: boolean;
};

export type CreateServicePayload = {
  name: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isCombo?: boolean;
  requiresDeposit?: boolean;
  depositPercentage?: number;
};

export type AssignServicePayload = {
  serviceId: string;
  customDurationMin?: number;
  customPrice?: number;
};

export type UpsertBusinessHoursPayload = {
  weekday: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

export type UpsertEmployeeHoursPayload = {
  weekday: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
};

export type CreateBlockoutPayload = {
  targetType: 'BUSINESS' | 'EMPLOYEE';
  employeeId?: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
};

export type CreateAppointmentPayload = {
  employeeId: string;
  serviceId: string;
  startsAt: string;
  source: 'WEB' | 'APP' | 'WHATSAPP' | 'MANUAL';
  customerFirstName: string;
  customerLastName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNotes?: string;
};

export type ServicePackageItem = {
  id: string;
  servicePackageId: string;
  serviceId: string;
  sortOrder: number;
  durationMinutes: number;
  price: string;
  createdAt: string;
  service: {
    id: string;
    name: string;
    slug: string;
    durationMinutes: number;
    price: string;
    status: string;
  };
};

export type ServicePackage = {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  description?: string;
  totalDurationMin: number;
  totalPrice: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: ServicePackageItem[];
};

export type ListServicePackagesResponse = {
  items: ServicePackage[];
  meta: {
    total: number;
  };
};

export type CreateServicePackagePayload = {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
};

export type AddServicePackageItemPayload = {
  serviceId: string;
  sortOrder?: number;
};

@Injectable({
  providedIn: 'root',
})
export class BusinessesService {
  private readonly http = inject(HttpClient);

  listBusinesses(): Observable<ListBusinessesResponse> {
    return this.http.get<ListBusinessesResponse>(`${API_BASE_URL}/businesses`);
  }

  createBusiness(payload: CreateBusinessPayload): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/businesses`, payload);
  }

  getBusinessBySlug(slug: string): Observable<Business> {
    return this.http.get<Business>(`${API_BASE_URL}/public/businesses/${slug}`);
  }

  listEmployees(businessId: string): Observable<ListEmployeesResponse> {
    return this.http.get<ListEmployeesResponse>(
      `${API_BASE_URL}/businesses/${businessId}/employees`,
    );
  }

  listPublicEmployees(businessId: string): Observable<ListEmployeesResponse> {
    return this.http.get<ListEmployeesResponse>(
      `${API_BASE_URL}/public/businesses/${businessId}/employees`,
    );
  }

  createEmployee(
    businessId: string,
    payload: CreateEmployeePayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/businesses/${businessId}/employees`,
      payload,
    );
  }

  listServices(businessId: string): Observable<ListServicesResponse> {
    return this.http.get<ListServicesResponse>(
      `${API_BASE_URL}/businesses/${businessId}/services`,
    );
  }

  listPublicServices(businessId: string): Observable<ListServicesResponse> {
    return this.http.get<ListServicesResponse>(
      `${API_BASE_URL}/public/businesses/${businessId}/services`,
    );
  }

  createService(
    businessId: string,
    payload: CreateServicePayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/businesses/${businessId}/services`,
      payload,
    );
  }

  listEmployeeAssignments(
    businessId: string,
    employeeId: string,
  ): Observable<ListEmployeeAssignmentsResponse> {
    return this.http.get<ListEmployeeAssignmentsResponse>(
      `${API_BASE_URL}/businesses/${businessId}/employees/${employeeId}/services`,
    );
  }

  assignServiceToEmployee(
    businessId: string,
    employeeId: string,
    payload: AssignServicePayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/businesses/${businessId}/employees/${employeeId}/services`,
      payload,
    );
  }

  listBusinessHours(businessId: string): Observable<OpeningHour[]> {
    return this.http.get<OpeningHour[]>(
      `${API_BASE_URL}/businesses/${businessId}/opening-hours`,
    );
  }


  upsertBusinessHours(
    businessId: string,
    payload: UpsertBusinessHoursPayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/businesses/${businessId}/opening-hours`,
      payload,
    );
  }

  listEmployeeHours(
    businessId: string,
    employeeId: string,
  ): Observable<OpeningHour[]> {
    return this.http.get<OpeningHour[]>(
      `${API_BASE_URL}/businesses/${businessId}/employees/${employeeId}/opening-hours`,
    );
  }

  upsertEmployeeHours(
    businessId: string,
    employeeId: string,
    payload: UpsertEmployeeHoursPayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/businesses/${businessId}/employees/${employeeId}/opening-hours`,
      payload,
    );
  }

  listBlockouts(
    businessId: string,
    employeeId?: string,
  ): Observable<Blockout[]> {
    const suffix = employeeId ? `?employeeId=${employeeId}` : '';
    return this.http.get<Blockout[]>(
      `${API_BASE_URL}/businesses/${businessId}/blockouts${suffix}`,
    );
  }

  createBlockout(
    businessId: string,
    payload: CreateBlockoutPayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/businesses/${businessId}/blockouts`,
      payload,
    );
  }

  deleteBlockout(
    businessId: string,
    blockoutId: string,
  ): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${API_BASE_URL}/businesses/${businessId}/blockouts/${blockoutId}`,
    );
  }

  getAvailability(
    businessId: string,
    employeeId: string,
    serviceId: string,
    date: string,
    slotStepMinutes = 15,
  ): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(
      `${API_BASE_URL}/businesses/${businessId}/employees/${employeeId}/availability?serviceId=${serviceId}&date=${encodeURIComponent(date)}&slotStepMinutes=${slotStepMinutes}`,
    );
  }

  getPublicAvailability(
    businessId: string,
    employeeId: string,
    serviceId: string,
    date: string,
    slotStepMinutes = 15,
  ): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(
      `${API_BASE_URL}/public/businesses/${businessId}/employees/${employeeId}/availability?serviceId=${serviceId}&date=${encodeURIComponent(date)}&slotStepMinutes=${slotStepMinutes}`,
    );
  }

  createAppointment(
    businessId: string,
    payload: CreateAppointmentPayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/businesses/${businessId}/appointments`,
      payload,
    );
  }

  createPublicAppointment(
    businessId: string,
    payload: CreateAppointmentPayload,
  ): Observable<unknown> {
    return this.http.post(
      `${API_BASE_URL}/public/businesses/${businessId}/appointments`,
      payload,
    );
  }

  postPublicBookingChat(
    businessId: string,
    payload: {
      message: string;
      messages?: BookingChatMessage[];
      state?: BookingChatState;
    },
  ): Observable<BookingChatResponse> {
    return this.http.post<BookingChatResponse>(
      `${API_BASE_URL}/public/businesses/${businessId}/booking-chat`,
      payload,
    );
  }

  listAppointments(
    businessId: string,
  ): Observable<ListAppointmentsResponse> {
    return this.http.get<ListAppointmentsResponse>(
      `${API_BASE_URL}/businesses/${businessId}/appointments`,
    );
  }

  createPublicWaitlistEntry(
    businessId: string,
    payload: CreateWaitlistPayload,
  ): Observable<WaitlistEntry> {
    return this.http.post<WaitlistEntry>(
      `${API_BASE_URL}/public/businesses/${businessId}/waitlist`,
      payload,
    );
  }

  createWaitlistEntry(
    businessId: string,
    payload: CreateWaitlistPayload,
  ): Observable<WaitlistEntry> {
    return this.http.post<WaitlistEntry>(
      `${API_BASE_URL}/businesses/${businessId}/waitlist`,
      payload,
    );
  }

  listWaitlistEntries(
    businessId: string,
    params?: {
      serviceId?: string;
      employeeId?: string;
      preferredDate?: string;
      status?: WaitlistStatus;
      page?: number;
      limit?: number;
    },
  ): Observable<ListWaitlistResponse> {
    const query = new URLSearchParams();

    if (params?.serviceId) query.set('serviceId', params.serviceId);
    if (params?.employeeId) query.set('employeeId', params.employeeId);
    if (params?.preferredDate) query.set('preferredDate', params.preferredDate);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const suffix = query.toString() ? `?${query.toString()}` : '';

    return this.http.get<ListWaitlistResponse>(
      `${API_BASE_URL}/businesses/${businessId}/waitlist${suffix}`,
    );
  }

  findWaitlistMatches(
    businessId: string,
    payload: FindWaitlistMatchesPayload,
  ): Observable<{
    businessId: string;
    serviceId: string;
    employeeId: string;
    startsAt: string;
    items: Array<WaitlistEntry & { matchScore: number }>;
    meta: { total: number };
  }> {
    return this.http.post<{
      businessId: string;
      serviceId: string;
      employeeId: string;
      startsAt: string;
      items: Array<WaitlistEntry & { matchScore: number }>;
      meta: { total: number };
    }>(`${API_BASE_URL}/businesses/${businessId}/waitlist/matches`, payload);
  }

    listPublicBusinesses(search?: string): Observable<ListPublicBusinessesResponse> {
    const suffix = search?.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : '';

    return this.http.get<ListPublicBusinessesResponse>(
      `${API_BASE_URL}/public/businesses${suffix}`,
    );
  }
    listPublicPromotions(
    businessId: string,
    serviceId?: string,
  ): Observable<ListPromotionsResponse> {
    const suffix = serviceId
      ? `?serviceId=${encodeURIComponent(serviceId)}`
      : '';

    return this.http.get<ListPromotionsResponse>(
      `${API_BASE_URL}/public/businesses/${businessId}/promotions${suffix}`,
    );
  }

  listPromotions(
    businessId: string,
    serviceId?: string,
    activeOnly?: boolean,
  ): Observable<ListPromotionsResponse> {
    const query = new URLSearchParams();

    if (serviceId) query.set('serviceId', serviceId);
    if (activeOnly !== undefined) query.set('activeOnly', String(activeOnly));

    const suffix = query.toString() ? `?${query.toString()}` : '';

    return this.http.get<ListPromotionsResponse>(
      `${API_BASE_URL}/businesses/${businessId}/promotions${suffix}`,
    );
  }

  createPromotion(
    businessId: string,
    payload: CreatePromotionPayload,
  ): Observable<Promotion> {
    return this.http.post<Promotion>(
      `${API_BASE_URL}/businesses/${businessId}/promotions`,
      payload,
    );
  }

    listServicePackages(
    businessId: string,
    activeOnly?: boolean,
  ): Observable<ListServicePackagesResponse> {
    const suffix =
      activeOnly !== undefined ? `?activeOnly=${String(activeOnly)}` : '';

    return this.http.get<ListServicePackagesResponse>(
      `${API_BASE_URL}/businesses/${businessId}/service-packages${suffix}`,
    );
  }

  getServicePackage(
    businessId: string,
    packageId: string,
  ): Observable<ServicePackage> {
    return this.http.get<ServicePackage>(
      `${API_BASE_URL}/businesses/${businessId}/service-packages/${packageId}`,
    );
  }

  createServicePackage(
    businessId: string,
    payload: CreateServicePackagePayload,
  ): Observable<ServicePackage> {
    return this.http.post<ServicePackage>(
      `${API_BASE_URL}/businesses/${businessId}/service-packages`,
      payload,
    );
  }

  addServicePackageItem(
    businessId: string,
    packageId: string,
    payload: AddServicePackageItemPayload,
  ): Observable<ServicePackageItem> {
    return this.http.post<ServicePackageItem>(
      `${API_BASE_URL}/businesses/${businessId}/service-packages/${packageId}/items`,
      payload,
    );
  }

  removeServicePackageItem(
    businessId: string,
    packageId: string,
    itemId: string,
  ): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${API_BASE_URL}/businesses/${businessId}/service-packages/${packageId}/items/${itemId}`,
    );
  }

  listPublicServicePackages(
    businessId: string,
    activeOnly = true,
  ): Observable<ListServicePackagesResponse> {
    return this.http.get<ListServicePackagesResponse>(
      `${API_BASE_URL}/public/businesses/${businessId}/service-packages?activeOnly=${String(activeOnly)}`,
    );
  }
    deactivateEmployee(
    businessId: string,
    employeeId: string,
  ): Observable<Employee> {
    return this.http.patch<Employee>(
      `${API_BASE_URL}/businesses/${businessId}/employees/${employeeId}/deactivate`,
      {},
    );
  }

  activateEmployee(
    businessId: string,
    employeeId: string,
  ): Observable<Employee> {
    return this.http.patch<Employee>(
      `${API_BASE_URL}/businesses/${businessId}/employees/${employeeId}/activate`,
      {},
    );
  }

  archiveService(
    businessId: string,
    serviceId: string,
  ): Observable<Service> {
    return this.http.patch<Service>(
      `${API_BASE_URL}/businesses/${businessId}/services/${serviceId}/archive`,
      {},
    );
  }

  activateService(
    businessId: string,
    serviceId: string,
  ): Observable<Service> {
    return this.http.patch<Service>(
      `${API_BASE_URL}/businesses/${businessId}/services/${serviceId}/activate`,
      {},
    );
  }

  cancelAppointment(
    businessId: string,
    appointmentId: string,
    payload?: CancelAppointmentPayload,
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${API_BASE_URL}/businesses/${businessId}/appointments/${appointmentId}/cancel`,
      payload ?? {},
    );
  }

  togglePromotionActive(
    businessId: string,
    promotionId: string,
  ): Observable<Promotion> {
    return this.http.patch<Promotion>(
      `${API_BASE_URL}/businesses/${businessId}/promotions/${promotionId}/toggle-active`,
      {},
    );
  }

  deletePromotion(
    businessId: string,
    promotionId: string,
  ): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${API_BASE_URL}/businesses/${businessId}/promotions/${promotionId}`,
    );
  }

  toggleServicePackageActive(
    businessId: string,
    packageId: string,
  ): Observable<ServicePackage> {
    return this.http.patch<ServicePackage>(
      `${API_BASE_URL}/businesses/${businessId}/service-packages/${packageId}/toggle-active`,
      {},
    );
  }

  deleteServicePackage(
    businessId: string,
    packageId: string,
  ): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${API_BASE_URL}/businesses/${businessId}/service-packages/${packageId}`,
    );
  }
}
export type WaitlistStatus =
  | 'ACTIVE'
  | 'MATCHED'
  | 'CONVERTED'
  | 'CANCELLED';

export type WaitlistEntry = {
  id: string;
  businessId: string;
  serviceId: string;
  employeeId?: string | null;
  status: WaitlistStatus;
  preferredDate: string;
  timeFrom?: string | null;
  timeTo?: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  source: string;
  matchedAt?: string | null;
  convertedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type ListWaitlistResponse = {
  items: WaitlistEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateWaitlistPayload = {
  serviceId: string;
  employeeId?: string;
  preferredDate: string;
  timeFrom?: string;
  timeTo?: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  source?: 'WEB' | 'APP' | 'WHATSAPP' | 'MANUAL';
};

export type FindWaitlistMatchesPayload = {
  serviceId: string;
  employeeId: string;
  startsAt: string;
};
export type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: string;
};

export type ListPublicBusinessesResponse = {
  items: PublicBusiness[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type Promotion = {
  id: string;
  businessId: string;
  serviceId?: string | null;
  name: string;
  description?: string | null;
  type: PromotionType;
  value: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
  } | null;
};

export type ListPromotionsResponse = {
  items: Promotion[];
  meta: {
    total: number;
  };
};

export type CreatePromotionPayload = {
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  startsAt: string;
  endsAt: string;
  serviceId?: string;
  isActive?: boolean;
};
