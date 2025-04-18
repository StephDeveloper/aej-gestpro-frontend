import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    { path: 'landing', title: 'GestPro - Accueil', loadComponent: () => import('./landing-page/landing-page.component') },
    { path: 'home', loadComponent: () => import('./layout/home/home.component'), children: [
        { path: 'dashboard', title: 'GestPro - Tableau de bord', loadComponent: () => import('./pages/dashboard/dashboard.component') },
    ] },
];
