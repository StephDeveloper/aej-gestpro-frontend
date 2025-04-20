import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DashboardData {
  total_projets: number;
  projets_par_statut: {
    Validé: number;
    Rejeté: number;
    'en cours': number;
    [key: string]: number;
  };
  utilisateurs_uniques: number;
  projets_par_type: {
    [key: string]: number;
  };
  projets_par_forme_juridique: {
    [key: string]: number;
  };
  evolution_mensuelle: {
    period: string;
    total: number;
  }[];
  projets_recents: {
    id: number;
    nom: string;
    prenoms: string;
    email: string;
    type_projet: string;
    forme_juridique: string;
    statut: string;
    created_at: string;
  }[];
  taux_conversion: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export default class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  
  // Accès à l'objet Math global
  Math = Math;
  
  // Pour les graphiques
  statusColors: { [key: string]: string } = {
    'Validé': '#28a745',
    'Rejeté': '#dc3545',
    'en cours': '#ffc107'
  };
  
  typeColors: { [key: string]: string } = {
    'En Création': '#0dcaf0',
    'En Développement': '#6f42c1'
  };
  
  formeJuridiqueColors: { [key: string]: string } = {
    'SARL': '#4285F4',
    'SA': '#EA4335',
    'SNC': '#FBBC05',
    'SAS': '#34A853'
  };

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.dashboardData = response.data;
          console.log('Dashboard data:', this.dashboardData);
        } else {
          this.error = 'Erreur lors du chargement des données du tableau de bord';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Erreur lors du chargement des données du tableau de bord';
        this.isLoading = false;
      }
    });
  }
  
  // Méthode pour obtenir les clés d'un objet
  getObjectKeys(obj: {[key: string]: any}): string[] {
    return Object.keys(obj || {});
  }
  
  // Helper pour formater les dates
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
  
  // Méthode pour naviguer vers les détails d'un projet
  goToProjectDetails(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }
  
  // Méthode pour naviguer vers la liste des projets
  goToProjects(): void {
    this.router.navigateByUrl('/home/projects');
  }
  
  // Pour obtenir le pourcentage pour les graphiques en camembert
  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
  
  // Calculer la valeur du trait de séparation (stroke-dasharray)
  getStrokeDashArray(percentage: number): string {
    const circumference = 2 * Math.PI * 40; // 40 est le rayon du cercle
    return `${(percentage * circumference) / 100} ${circumference}`;
  }
  
  // Génère un ID unique pour les dégradés SVG
  getUniqueId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
