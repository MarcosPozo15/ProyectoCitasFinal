import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BusinessesListComponent } from './features/businesses/businesses-list/businesses-list.component';
import { BusinessCreateComponent } from './features/businesses/business-create/business-create.component';
import { EmployeesListComponent } from './features/employees/employee-list/employees-list.component';
import { EmployeeCreateComponent } from './features/employees/employee-create/employee-create.component';
import { ServicesListComponent } from './features/services/services-list/services-list.component';
import { ServiceCreateComponent } from './features/services/service-create/service-create.component';
import { EmployeeServicesListComponent } from './features/employee-services/employee-services-list/employee-services-list.component';
import { EmployeeServiceAssignComponent } from './features/employee-services/employee-service-assign/employee-service-assign.component';
import { BusinessHomeComponent } from './features/businesses/business-home/business-home.component';
import { BusinessHoursComponent } from './features/availability/business-hours/business-hours.component';
import { EmployeeHoursComponent } from './features/availability/employee-hours/employee-hours.component';
import { BlockoutsListComponent } from './features/blockouts/blockouts-list/blockouts-list.component';
import { BlockoutCreateComponent } from './features/blockouts/blockout-create/blockout-create.component';
import { AppointmentsListComponent } from './features/appointments/appointments-list/appointments-list.component';
import { AppointmentCreateComponent } from './features/appointments/appointment-create/appointment-create.component';
import { PublicBookingComponent } from './features/public-booking/public-booking.component';
import { PublicBusinessesComponent } from './features/public-businesses/public-businesses.component';
import { PromotionsListComponent } from './features/promotions/promotions-list/promotions-list.component';
import { PromotionCreateComponent } from './features/promotions/promotion-create/promotion-create.component';

export const appRoutes: Routes = [
  {
    path: 'businesses',
    component: PublicBusinessesComponent,
  },
  {
    path: 'book/:slug',
    component: PublicBookingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'my-business', component: BusinessHomeComponent },
      { path: 'admin/businesses', component: BusinessesListComponent },
      { path: 'admin/businesses/new', component: BusinessCreateComponent },

      { path: 'businesses/:businessId/employees', component: EmployeesListComponent },
      { path: 'businesses/:businessId/employees/new', component: EmployeeCreateComponent },

      { path: 'businesses/:businessId/services', component: ServicesListComponent },
      { path: 'businesses/:businessId/services/new', component: ServiceCreateComponent },

      { path: 'businesses/:businessId/promotions', component: PromotionsListComponent },
      { path: 'businesses/:businessId/promotions/new', component: PromotionCreateComponent },

      {
        path: 'businesses/:businessId/employees/:employeeId/services',
        component: EmployeeServicesListComponent,
      },
      {
        path: 'businesses/:businessId/employees/:employeeId/services/new',
        component: EmployeeServiceAssignComponent,
      },
      {
        path: 'businesses/:businessId/opening-hours',
        component: BusinessHoursComponent,
      },
      {
        path: 'businesses/:businessId/employees/:employeeId/opening-hours',
        component: EmployeeHoursComponent,
      },
      {
        path: 'businesses/:businessId/blockouts',
        component: BlockoutsListComponent,
      },
      {
        path: 'businesses/:businessId/blockouts/new',
        component: BlockoutCreateComponent,
      },
      {
        path: 'businesses/:businessId/appointments',
        component: AppointmentsListComponent,
      },
      {
        path: 'businesses/:businessId/appointments/new',
        component: AppointmentCreateComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'businesses',
  },
];