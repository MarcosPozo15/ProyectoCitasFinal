import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusinessesService } from '../../../core/services/businesses.service';

@Component({
  selector: 'app-blockout-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './blockout-create.component.html',
  styleUrl: './blockout-create.component.css',
})
export class BlockoutCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  businessId = '';
  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    targetType: ['BUSINESS', [Validators.required]],
    employeeId: [''],
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    startsAt: ['2026-03-20T12:00', [Validators.required]],
    endsAt: ['2026-03-20T14:00', [Validators.required]],
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

    const raw = this.form.getRawValue();

    this.businessesService
      .createBlockout(this.businessId, {
        targetType: raw.targetType as 'BUSINESS' | 'EMPLOYEE',
        employeeId: raw.employeeId || undefined,
        title: raw.title,
        description: raw.description || undefined,
        startsAt: new Date(raw.startsAt).toISOString(),
        endsAt: new Date(raw.endsAt).toISOString(),
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          void this.router.navigate(['/businesses', this.businessId, 'blockouts']);
        },
        error: () => {
          this.errorMessage = 'No se pudo crear el bloqueo';
          this.isSubmitting = false;
        },
      });
  }
}