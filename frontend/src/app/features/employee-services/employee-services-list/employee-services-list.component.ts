import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BusinessesService,
  EmployeeServiceAssignment,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-employee-services-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-services-list.component.html',
  styleUrl: './employee-services-list.component.css',
})
export class EmployeeServicesListComponent {
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);

  businessId = '';
  employeeId = '';
  employeeName = '';
  isLoading = true;
  errorMessage = '';
  items: EmployeeServiceAssignment[] = [];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';
    this.employeeId = this.route.snapshot.paramMap.get('employeeId') ?? '';

    if (!this.businessId || !this.employeeId) {
      this.errorMessage = 'Faltan datos de negocio o empleado';
      this.isLoading = false;
      return;
    }

    this.loadAssignments();
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.businessesService
      .listEmployeeAssignments(this.businessId, this.employeeId)
      .subscribe({
        next: (response) => {
          this.items = response.items;
          this.employeeName = `${response.employee.firstName} ${response.employee.lastName}`;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando asignaciones:', error);
          this.errorMessage = 'No se pudieron cargar las asignaciones';
          this.isLoading = false;
        },
      });
  }
}