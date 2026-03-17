import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BusinessesService,
  Employee,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employees-list.component.html',
  styleUrl: './employees-list.component.css',
})
export class EmployeesListComponent {
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);

  businessId = '';
  isLoading = true;
  errorMessage = '';
  items: Employee[] = [];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.businessesService.listEmployees(this.businessId).subscribe({
      next: (response) => {
        this.items = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando empleados:', error);
        this.errorMessage = 'No se pudieron cargar los empleados';
        this.isLoading = false;
      },
    });
  }
}