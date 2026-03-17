import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-business-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './business-home.component.html',
  styleUrl: './business-home.component.css',
})
export class BusinessHomeComponent {
  private readonly sessionService = inject(SessionService);

  isLoading = true;
  errorMessage = '';
  business: {
    id: string;
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    status: string;
    timezone: string;
    currency: string;
  } | null = null;

  ngOnInit(): void {
    this.sessionService.getMyBusiness().subscribe({
      next: (response) => {
        this.business = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando mi negocio:', error);
        this.errorMessage = 'No se pudo cargar la información del negocio';
        this.isLoading = false;
      },
    });
  }
}