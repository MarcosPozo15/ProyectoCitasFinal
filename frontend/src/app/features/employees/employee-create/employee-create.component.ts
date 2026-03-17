import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusinessesService } from '../../../core/services/businesses.service';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-create.component.html',
  styleUrl: './employee-create.component.css',
})
export class EmployeeCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  businessId = '';
  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: [''],
    phone: [''],
    jobTitle: [''],
    bio: [''],
    colorHex: ['#3366FF'],
    isBookable: [true],
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
      .createEmployee(this.businessId, this.form.getRawValue())
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          void this.router.navigate(['/businesses', this.businessId, 'employees']);
        },
        error: (error) => {
          console.error('Error creando empleado:', error);
          this.errorMessage = 'No se pudo crear el empleado';
          this.isSubmitting = false;
        },
      });
  }
}