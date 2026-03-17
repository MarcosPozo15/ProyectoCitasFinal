import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusinessesService, OpeningHour } from '../../../core/services/businesses.service';

type EmployeeHourRow = {
  weekday: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
};

@Component({
  selector: 'app-employee-hours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-hours.component.html',
  styleUrl: './employee-hours.component.css',
})
export class EmployeeHoursComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly businessesService = inject(BusinessesService);

  businessId = '';
  employeeId = '';
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  rows: EmployeeHourRow[] = [
    { weekday: 'MONDAY', isWorking: true, startTime: '10:00', endTime: '17:00' },
    { weekday: 'TUESDAY', isWorking: true, startTime: '10:00', endTime: '17:00' },
    { weekday: 'WEDNESDAY', isWorking: true, startTime: '10:00', endTime: '17:00' },
    { weekday: 'THURSDAY', isWorking: true, startTime: '10:00', endTime: '17:00' },
    { weekday: 'FRIDAY', isWorking: true, startTime: '10:00', endTime: '17:00' },
    { weekday: 'SATURDAY', isWorking: false, startTime: '10:00', endTime: '14:00' },
    { weekday: 'SUNDAY', isWorking: false, startTime: '10:00', endTime: '14:00' },
  ];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';
    this.employeeId = this.route.snapshot.paramMap.get('employeeId') ?? '';

    if (!this.businessId || !this.employeeId) {
      this.errorMessage = 'Faltan datos';
      this.isLoading = false;
      return;
    }

    this.businessesService
      .listEmployeeHours(this.businessId, this.employeeId)
      .subscribe({
        next: (items: OpeningHour[]) => {
          for (const item of items) {
            const row = this.rows.find((r) => r.weekday === item.weekday);
            if (row) {
              row.isWorking = item.isWorking ?? true;
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
      this.businessesService.upsertEmployeeHours(
        this.businessId,
        this.employeeId,
        row,
      ),
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