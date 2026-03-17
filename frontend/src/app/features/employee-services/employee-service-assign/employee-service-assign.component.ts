import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BusinessesService,
  Service,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-employee-service-assign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-service-assign.component.html',
  styleUrl: './employee-service-assign.component.css',
})
export class EmployeeServiceAssignComponent {
  private readonly fb = inject(FormBuilder);
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  businessId = '';
  employeeId = '';
  availableServices: Service[] = [];
  isLoadingServices = true;
  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    serviceId: ['', [Validators.required]],
    customDurationMin: [35],
    customPrice: [18],
  });

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';
    this.employeeId = this.route.snapshot.paramMap.get('employeeId') ?? '';

    if (!this.businessId || !this.employeeId) {
      this.errorMessage = 'Faltan datos de negocio o empleado';
      this.isLoadingServices = false;
      return;
    }

    this.businessesService.listServices(this.businessId).subscribe({
      next: (response) => {
        this.availableServices = response.items;
        this.isLoadingServices = false;

        if (response.items.length > 0) {
          this.form.patchValue({
            serviceId: response.items[0].id,
          });
        }
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
        this.errorMessage = 'No se pudieron cargar los servicios';
        this.isLoadingServices = false;
      },
    });
  }

  submit(): void {
    if (!this.businessId || !this.employeeId) {
      this.errorMessage = 'Faltan datos para asignar el servicio';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();

    this.businessesService
      .assignServiceToEmployee(this.businessId, this.employeeId, {
        serviceId: raw.serviceId,
        customDurationMin: raw.customDurationMin || undefined,
        customPrice: raw.customPrice || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          void this.router.navigate([
            '/businesses',
            this.businessId,
            'employees',
            this.employeeId,
            'services',
          ]);
        },
        error: (error) => {
          console.error('Error asignando servicio:', error);
          this.errorMessage = 'No se pudo asignar el servicio';
          this.isSubmitting = false;
        },
      });
  }
}