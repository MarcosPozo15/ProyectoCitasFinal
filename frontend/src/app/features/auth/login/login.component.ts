import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = '';
  isSubmitting = false;

  form = this.fb.nonNullable.group({
    email: ['superadmin@local.test', [Validators.required, Validators.email]],
    password: ['12345678', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.user.role === 'BUSINESS_ADMIN') {
          void this.router.navigate(['/my-business']);
          return;
        }

        void this.router.navigate(['/']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'No se pudo iniciar sesión';
      },
    });
  }
}