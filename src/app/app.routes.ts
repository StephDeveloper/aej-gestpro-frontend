import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    { path: 'landing', title: 'GestPro - Accueil', loadComponent: () => import('./landing-page/landing-page.component') },
    { path: 'login', title: 'GestPro - Connexion', loadComponent: () => import('./login/login.component') },
    { path: 'register', title: 'GestPro - Inscription', loadComponent: () => import('./register/register.component') },
    { path: 'home', loadComponent: () => import('./layout/home/home.component'), canActivate: [authGuard], children: [
        { path: 'dashboard', title: 'GestPro - Tableau de bord', loadComponent: () => import('./pages/dashboard/dashboard.component') },
        { path: 'projects', title: 'GestPro - Liste des Projets', loadComponent: () => import('./pages/projects/projects.component') },
        { path: 'projects-recap', title: 'GestPro - Récapitulatif des Projets', loadComponent: () => import('./pages/projects-summary/projects-summary.component') },
    ] },
];
