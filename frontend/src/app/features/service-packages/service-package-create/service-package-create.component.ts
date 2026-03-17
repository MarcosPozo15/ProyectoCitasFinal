import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusinessesService } from '../../../core/services/businesses.service';

@Component({
  selector: 'app-service-package-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './service-package-create.component.html',
  styleUrl: './service-package-create.component.css',
})
export class ServicePackageCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businessesService = inject(BusinessesService);

  businessId = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
    }
  }

  submit(): void {
    if (!this.businessId) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.businessesService
      .createServicePackage(this.businessId, {
        name: raw.name,
        slug: raw.slug.toLowerCase().trim(),
        description: raw.description || undefined,
        isActive: raw.isActive,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Combo creado correctamente';
          this.isSubmitting = false;

          setTimeout(() => {
            this.router.navigate(['/businesses', this.businessId, 'service-packages']);
          }, 600);
        },
        error: (error) => {
          console.error('Error creando combo:', error);
          this.errorMessage =
            error?.error?.message || 'No se pudo crear el combo';
          this.isSubmitting = false;
        },
      });
  }
}