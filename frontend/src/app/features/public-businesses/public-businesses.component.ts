import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  BusinessesService,
  PublicBusiness,
} from '../../core/services/businesses.service';

@Component({
  selector: 'app-public-businesses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-businesses.component.html',
  styleUrl: './public-businesses.component.css',
})
export class PublicBusinessesComponent {
  private readonly businessesService = inject(BusinessesService);
  private readonly router = inject(Router);

  businesses: PublicBusiness[] = [];
  search = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.businessesService.listPublicBusinesses(this.search).subscribe({
      next: (response) => {
        this.businesses = response.items;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los negocios';
        this.isLoading = false;
      },
    });
  }

  submitSearch(): void {
    this.loadBusinesses();
  }

  clearSearch(): void {
    this.search = '';
    this.loadBusinesses();
  }

  openBusiness(slug: string): void {
    this.router.navigate(['/book', slug]);
  }

  getBusinessAccentColor(business: PublicBusiness): string {
    return business.primaryColor?.trim() || '#0f172a';
  }

  trackByBusiness(index: number, business: PublicBusiness): string {
    return `${index}-${business.id}`;
  }
}