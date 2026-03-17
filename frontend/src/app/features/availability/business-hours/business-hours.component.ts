import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusinessesService, OpeningHour } from '../../../core/services/businesses.service';

type BusinessHourRow = {
  weekday: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

@Component({
  selector: 'app-business-hours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './business-hours.component.html',
  styleUrl: './business-hours.component.css',
})
export class BusinessHoursComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly businessesService = inject(BusinessesService);

  businessId = '';
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  rows: BusinessHourRow[] = [
    { weekday: 'MONDAY', isOpen: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 'TUESDAY', isOpen: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 'WEDNESDAY', isOpen: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 'THURSDAY', isOpen: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 'FRIDAY', isOpen: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 'SATURDAY', isOpen: false, startTime: '09:00', endTime: '14:00' },
    { weekday: 'SUNDAY', isOpen: false, startTime: '09:00', endTime: '14:00' },
  ];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.businessesService.listBusinessHours(this.businessId).subscribe({
      next: (items: OpeningHour[]) => {
        for (const item of items) {
          const row = this.rows.find((r) => r.weekday === item.weekday);
          if (row) {
            row.isOpen = item.isOpen ?? true;
            row.startTime = item.startTime;
            row.endTime = item.endTime;
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  saveAll(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const requests = this.rows.map((row) =>
      this.businessesService.upsertBusinessHours(this.businessId, row),
    );

    let completed = 0;
    let failed = false;

    for (const request of requests) {
      request.subscribe({
        next: () => {
          completed += 1;
          if (completed === requests.length && !failed) {
            this.isSaving = false;
            this.successMessage = 'Horario guardado correctamente';
          }
        },
        error: () => {
          failed = true;
          this.isSaving = false;
          this.errorMessage = 'No se pudo guardar el horario';
        },
      });
    }
  }

  labelFor(weekday: string): string {
    const labels: Record<string, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };
    return labels[weekday] ?? weekday;
  }
}