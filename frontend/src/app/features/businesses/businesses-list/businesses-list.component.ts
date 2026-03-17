import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BusinessesService,
  Business,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-businesses-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './businesses-list.component.html',
  styleUrl: './businesses-list.component.css',
})
export class BusinessesListComponent {
  private readonly businessesService = inject(BusinessesService);

  isLoading = true;
  errorMessage = '';
  items: Business[] = [];

  ngOnInit(): void {
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.businessesService.listBusinesses().subscribe({
      next: (response) => {
        this.items = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando negocios:', error);
        this.errorMessage = 'No se pudieron cargar los negocios';
        this.isLoading = false;
      },
    });
  }
}