import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BusinessesService,
  ServicePackage,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-service-packages-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-packages-list.component.html',
  styleUrl: './service-packages-list.component.css',
})
export class ServicePackagesListComponent {
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);

  businessId = '';
  isLoading = true;
  errorMessage = '';
  items: ServicePackage[] = [];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.loadPackages();
  }

  loadPackages(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.businessesService.listServicePackages(this.businessId).subscribe({
      next: (response) => {
        this.items = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando combos:', error);
        this.errorMessage = 'No se pudieron cargar los combos';
        this.isLoading = false;
      },
    });
  }

  trackByPackage(index: number, item: ServicePackage): string {
    return `${index}-${item.id}`;
  }

  toggleActive(item: ServicePackage): void {
    this.businessesService
      .toggleServicePackageActive(this.businessId, item.id)
      .subscribe({
        next: () => this.loadPackages(),
        error: (error) => {
          console.error('Error cambiando estado del combo:', error);
          this.errorMessage =
            error?.error?.message || 'No se pudo cambiar el estado del combo';
        },
      });
  }

  remove(item: ServicePackage): void {
    const ok = window.confirm(`¿Eliminar el combo "${item.name}"?`);
    if (!ok) return;

    this.businessesService.deleteServicePackage(this.businessId, item.id).subscribe({
      next: () => this.loadPackages(),
      error: (error) => {
        console.error('Error eliminando combo:', error);
        this.errorMessage =
          error?.error?.message || 'No se pudo eliminar el combo';
      },
    });
  }
}