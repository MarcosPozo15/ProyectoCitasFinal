import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BusinessesService,
  Service,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-promotion-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './promotion-create.component.html',
  styleUrl: './promotion-create.component.css',
})
export class PromotionCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businessesService = inject(BusinessesService);

  businessId = '';
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  services: Service[] = [];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    type: ['PERCENTAGE', [Validators.required]],
    value: [10, [Validators.required, Validators.min(0.01)]],
    startsAt: ['', [Validators.required]],
    endsAt: ['', [Validators.required]],
    serviceId: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.businessesService.listServices(this.businessId).subscribe({
      next: (response) => {
        this.services = response.items;
        this.form.patchValue({
          startsAt: this.getLocalDateTime(1),
          endsAt: this.getLocalDateTime(24 * 7),
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
        this.errorMessage = 'No se pudieron cargar los servicios';
        this.isLoading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.businessesService
      .createPromotion(this.businessId, {
        name: raw.name,
        description: raw.description || undefined,
        type: raw.type as 'PERCENTAGE' | 'FIXED_AMOUNT',
        value: Number(raw.value),
        startsAt: new Date(raw.startsAt).toISOString(),
        endsAt: new Date(raw.endsAt).toISOString(),
        serviceId: raw.serviceId || undefined,
        isActive: raw.isActive,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Promoción creada correctamente';
          this.isSubmitting = false;

          setTimeout(() => {
            this.router.navigate(['/businesses', this.businessId, 'promotions']);
          }, 600);
        },
        error: (error) => {
          console.error('Error creando promoción:', error);
          this.errorMessage =
            error?.error?.message || 'No se pudo crear la promoción';
          this.isSubmitting = false;
        },
      });
  }

  private getLocalDateTime(offsetHours: number): string {
    const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}