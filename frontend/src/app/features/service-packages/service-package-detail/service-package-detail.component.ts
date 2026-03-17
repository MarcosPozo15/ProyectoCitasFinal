import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BusinessesService,
  Service,
  ServicePackage,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-service-package-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './service-package-detail.component.html',
  styleUrl: './service-package-detail.component.css',
})
export class ServicePackageDetailComponent {
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  businessId = '';
  packageId = '';
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  packageItem: ServicePackage | null = null;
  services: Service[] = [];

  form = this.fb.nonNullable.group({
    serviceId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';
    this.packageId = this.route.snapshot.paramMap.get('packageId') ?? '';

    if (!this.businessId || !this.packageId) {
      this.errorMessage = 'No se encontró el combo';
      this.isLoading = false;
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    let loaded = 0;
    const finish = () => {
      loaded += 1;
      if (loaded === 2) {
        this.isLoading = false;
      }
    };

    this.businessesService
      .getServicePackage(this.businessId, this.packageId)
      .subscribe({
        next: (response) => {
          this.packageItem = response;
          finish();
        },
        error: (error) => {
          console.error('Error cargando combo:', error);
          this.errorMessage = 'No se pudo cargar el combo';
          finish();
        },
      });

    this.businessesService.listServices(this.businessId).subscribe({
      next: (response) => {
        this.services = response.items;
        finish();
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
        finish();
      },
    });
  }

  submit(): void {
    if (!this.businessId || !this.packageId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.businessesService
      .addServicePackageItem(this.businessId, this.packageId, {
        serviceId: raw.serviceId,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Servicio añadido al combo';
          this.isSubmitting = false;
          this.form.patchValue({ serviceId: '' });
          this.loadData();
        },
        error: (error) => {
          console.error('Error añadiendo servicio al combo:', error);
          this.errorMessage =
            error?.error?.message || 'No se pudo añadir el servicio al combo';
          this.isSubmitting = false;
        },
      });
  }

  removeItem(itemId: string): void {
    if (!this.businessId || !this.packageId) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.businessesService
      .removeServicePackageItem(this.businessId, this.packageId, itemId)
      .subscribe({
        next: () => {
          this.successMessage = 'Servicio eliminado del combo';
          this.loadData();
        },
        error: (error) => {
          console.error('Error eliminando elemento del combo:', error);
          this.errorMessage =
            error?.error?.message || 'No se pudo eliminar el servicio del combo';
        },
      });
  }

  trackByItem(index: number, item: { id: string }): string {
    return `${index}-${item.id}`;
  }
}