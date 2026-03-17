import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BusinessesService,
  Promotion,
} from '../../../core/services/businesses.service';

@Component({
  selector: 'app-promotions-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './promotions-list.component.html',
  styleUrl: './promotions-list.component.css',
})
export class PromotionsListComponent {
  private readonly businessesService = inject(BusinessesService);
  private readonly route = inject(ActivatedRoute);

  businessId = '';
  isLoading = true;
  errorMessage = '';
  items: Promotion[] = [];

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId') ?? '';

    if (!this.businessId) {
      this.errorMessage = 'No se encontró el negocio';
      this.isLoading = false;
      return;
    }

    this.loadPromotions();
  }

  loadPromotions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.businessesService.listPromotions(this.businessId).subscribe({
      next: (response) => {
        this.items = response.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando promociones:', error);
        this.errorMessage = 'No se pudieron cargar las promociones';
        this.isLoading = false;
      },
    });
  }

  formatPromotionValue(item: Promotion): string {
    if (item.type === 'PERCENTAGE') {
      return `${item.value}%`;
    }

    return `${item.value}€`;
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  trackByPromotion(index: number, item: Promotion): string {
    return `${index}-${item.id}`;
  }
}