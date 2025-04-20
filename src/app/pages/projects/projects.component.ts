import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project/project.service';

export interface Project {
  id: number;
  nom: string;
  prenoms: string;
  date_naissance: string;
  lieu_naissance: string;
  email: string;
  type_projet: string;
  forme_juridique: string;
  num_cni: string;
  cni: string;
  piece_identite: string;
  plan_affaire: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export default class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  
  // Filtres
  searchTerm: string = '';
  selectedType: string = '';
  selectedStatus: string = '';
  
  // Options pour les filtres déroulants
  typeOptions: string[] = [];
  statusOptions: string[] = [];
  
  // État de chargement
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.projects = response.data;
          this.filteredProjects = [...this.projects];
          
          // Extraire les options uniques pour les filtres
          this.extractFilterOptions();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des projets';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  extractFilterOptions(): void {
    // Extraire les types de projets uniques
    this.typeOptions = [...new Set(this.projects.map(project => project.type_projet))];
    
    // Extraire les statuts uniques
    this.statusOptions = [...new Set(this.projects.map(project => project.statut))];
  }

  applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      // Filtrer par terme de recherche (nom ou prénom)
      const searchMatch = !this.searchTerm || 
        `${project.nom} ${project.prenoms}`.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtrer par type de projet
      const typeMatch = !this.selectedType || project.type_projet === this.selectedType;
      
      // Filtrer par statut
      const statusMatch = !this.selectedStatus || project.statut === this.selectedStatus;
      
      return searchMatch && typeMatch && statusMatch;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.filteredProjects = [...this.projects];
  }

  // Méthode pour trier les projets
  sortProjects(field: string): void {
    this.filteredProjects = [...this.filteredProjects].sort((a: any, b: any) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
  }

  // Pour l'affichage des informations du promoteur
  getPromoteurFullName(project: Project): string {
    return `${project.nom} ${project.prenoms}`;
  }
}
