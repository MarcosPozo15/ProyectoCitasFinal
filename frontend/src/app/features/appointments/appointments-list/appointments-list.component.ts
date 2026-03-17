import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Appointment, BusinessesService } from '../../../core/services/businesses.service';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly businessesService = inject(BusinessesService);

  businessId = '';
  isLoading = true;
  errorMessage = '';
  items: Appointment[] = [];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.businessesService.listAppointments(this.businessId).subscribe({
      next: (response) => {
        this.items = response.items;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las citas';
        this.isLoading = false;
      },
    });
  }
}