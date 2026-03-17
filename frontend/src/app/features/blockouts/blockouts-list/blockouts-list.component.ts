import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BusinessesService, Blockout } from '../../../core/services/businesses.service';

@Component({
  selector: 'app-blockouts-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blockouts-list.component.html',
  styleUrl: './blockouts-list.component.css',
})
export class BlockoutsListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly businessesService = inject(BusinessesService);

  businessId = '';
  isLoading = true;
  isDeleting = false;
  errorMessage = '';
  items: Blockout[] = [];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.loadBlockouts();
  }

  loadBlockouts(): void {
    this.businessesService.listBlockouts(this.businessId).subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los bloqueos';
        this.isLoading = false;
      },
    });
  }

  deleteBlockout(blockoutId: string): void {
    this.isDeleting = true;
    this.businessesService.deleteBlockout(this.businessId, blockoutId).subscribe({
      next: () => {
        this.items = this.items.filter((item) => item.id !== blockoutId);
        this.isDeleting = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el bloqueo';
        this.isDeleting = false;
      },
    });
  }
}