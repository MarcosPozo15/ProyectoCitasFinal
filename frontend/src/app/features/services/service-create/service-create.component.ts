import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusinessesService } from '../../../core/services/businesses.service';

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './service-create.component.html',
  styleUrl: './service-create.component.css',
})
export class ServiceCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  businessId = '';
  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    durationMinutes: [30, [Validators.required, Validators.min(5)]],
    price: [15, [Validators.required, Validators.min(0)]],
    isCombo: [false],
    requiresDeposit: [true],
    depositPercentage: [20],
  });

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';
  }

  submit(): void {
    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.businessesService
      .createService(this.businessId, this.form.getRawValue())
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          void this.router.navigate(['/businesses', this.businessId, 'services']);
        },
        error: (error) => {
          console.error('Error creando servicio:', error);
          this.errorMessage = 'No se pudo crear el servicio';
          this.isSubmitting = false;
        },
      });
  }
}