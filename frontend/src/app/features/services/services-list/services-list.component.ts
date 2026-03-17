import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BusinessesService,
  Service,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services-list.component.html',
  styleUrl: './services-list.component.css',
})
export class ServicesListComponent {
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);

  businessId = '';
  isLoading = true;
  errorMessage = '';
  items: Service[] = [];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.businessesService.listServices(this.businessId).subscribe({
      next: (response) => {
        this.items = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
        this.errorMessage = 'No se pudieron cargar los servicios';
        this.isLoading = false;
      },
    });
  }

  archive(item: Service): void {
    const ok = window.confirm(`¿Archivar el servicio "${item.name}"?`);
    if (!ok) return;

    this.businessesService.archiveService(this.businessId, item.id).subscribe({
      next: () => this.loadServices(),
      error: (error) => {
        console.error('Error archivando servicio:', error);
        this.errorMessage =
          error?.error?.message || 'No se pudo archivar el servicio';
      },
    });
  }

  activate(item: Service): void {
    this.businessesService.activateService(this.businessId, item.id).subscribe({
      next: () => this.loadServices(),
      error: (error) => {
        console.error('Error activando servicio:', error);
        this.errorMessage =
          error?.error?.message || 'No se pudo activar el servicio';
      },
    });
  }
}