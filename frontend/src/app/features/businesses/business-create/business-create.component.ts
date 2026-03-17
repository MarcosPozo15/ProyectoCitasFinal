import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BusinessesService } from '../../../core/services/businesses.service';

@Component({
  selector: 'app-business-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './business-create.component.html',
  styleUrl: './business-create.component.css',
})
export class BusinessCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly businessesService = inject(BusinessesService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    legalName: [''],
    taxId: [''],
    email: [''],
    phone: [''],
    website: [''],
    description: [''],
    primaryColor: ['#111111'],
    secondaryColor: ['#C9A227'],
    timezone: ['Europe/Madrid'],
    currency: ['EUR'],
    bookingCancellationHours: [1, [Validators.required]],
    allowCustomerCancellation: [true],
    depositPercentage: [20, [Validators.required]],
    addressLine1: [''],
    city: [''],
    postalCode: [''],
    country: ['España'],
    adminEmail: ['', [Validators.required, Validators.email]],
    adminPassword: ['12345678', [Validators.required, Validators.minLength(8)]],
    adminFirstName: ['', [Validators.required, Validators.minLength(2)]],
    adminLastName: ['', [Validators.required, Validators.minLength(2)]],
    adminPhone: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.businessesService.createBusiness(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigate(['/businesses']);
      },
      error: (error) => {
        console.error('Error creando negocio:', error);
        this.errorMessage = 'No se pudo crear el negocio';
        this.isSubmitting = false;
      },
    });
  }
}