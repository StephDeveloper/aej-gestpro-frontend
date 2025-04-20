import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project/project.service';
import { environnement } from '../../environnement/environnement';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  cni_url?: string;
  piece_identite_url?: string;
  plan_affaire_url?: string;
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
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  paginatedProjects: Project[] = [];
  pageSizeOptions: number[] = [5, 10, 25, 50];
  
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

  // Pour la visualisation des fichiers
  selectedFile: string | null = null;
  selectedFileType: string | null = null;
  showFileModal: boolean = false;
  baseUrl: string = environnement.API_URL;
  safePdfUrl: SafeResourceUrl | null = null;

  // Pour la gestion des statuts
  isProcessing: boolean = false;
  statusMessage: string | null = null;

  constructor(
    private projectService: ProjectService,
    private sanitizer: DomSanitizer
  ) { }

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
          
          // Initialiser la pagination
          this.applyPagination();
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
    
    // Réinitialiser la pagination après filtrage
    this.currentPage = 1;
    this.applyPagination();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.filteredProjects = [...this.projects];
    this.currentPage = 1;
    this.applyPagination();
  }

  // Méthode pour trier les projets
  sortProjects(field: string): void {
    this.filteredProjects = [...this.filteredProjects].sort((a: any, b: any) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
    
    // Mettre à jour la pagination après le tri
    this.applyPagination();
  }

  // Méthodes pour la pagination
  applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredProjects.length / this.pageSize);
    
    // S'assurer que la page courante est valide
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    
    // Calculer les indices de début et de fin pour la page actuelle
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredProjects.length);
    
    // Récupérer les projets de la page courante
    this.paginatedProjects = this.filteredProjects.slice(startIndex, endIndex);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }
  
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; // Réinitialiser à la première page
    this.applyPagination();
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Nombre maximum de numéros de page visibles
    
    if (this.totalPages <= maxVisiblePages) {
      // Si le nombre total de pages est inférieur ou égal au maximum visible, afficher toutes les pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sinon, afficher un nombre limité de pages centrées autour de la page actuelle
      let startPage = Math.max(this.currentPage - Math.floor(maxVisiblePages / 2), 1);
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // Pour l'affichage des informations du promoteur
  getPromoteurFullName(project: Project): string {
    return `${project.nom} ${project.prenoms}`;
  }

  // Méthodes pour visualiser les fichiers
  openFileModal(project: Project, fileType: string): void {
    let fileUrl = '';
    
    switch(fileType) {
      case 'cni':
        fileUrl = project.cni_url || '';
        // Si on n'a pas d'URL complète, essayer avec le chemin relatif
        if (!fileUrl && project.cni) {
          fileUrl = this.getFullFileUrl(project.cni);
        }
        break;
      case 'piece_identite':
        fileUrl = project.piece_identite_url || '';
        // Si on n'a pas d'URL complète, essayer avec le chemin relatif
        if (!fileUrl && project.piece_identite) {
          fileUrl = this.getFullFileUrl(project.piece_identite);
        }
        break;
      case 'plan_affaire':
        fileUrl = project.plan_affaire_url || '';
        // Si on n'a pas d'URL complète, essayer avec le chemin relatif
        if (!fileUrl && project.plan_affaire) {
          fileUrl = this.getFullFileUrl(project.plan_affaire);
        }
        break;
    }
    
    console.log('Ouverture du fichier:', fileUrl);
    
    // Vérifier que l'URL est valide
    if (!fileUrl) {
      console.error('URL de fichier invalide');
      this.error = `Impossible d'accéder au fichier. URL invalide.`;
      setTimeout(() => this.error = null, 3000);
      return;
    }
    
    this.selectedFile = fileUrl;
    this.selectedFileType = fileType;
    
    // Gérer différemment selon le type de fichier
    if (this.isFileType(fileUrl, 'pdf')) {
      // Utiliser le sanitizer pour les PDFs
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    } else {
      // Pour les autres types, pas besoin de sanitizer
      this.safePdfUrl = null;
    }
    
    this.showFileModal = true;
  }

  closeFileModal(): void {
    this.showFileModal = false;
    this.selectedFile = null;
    this.selectedFileType = null;
    this.safePdfUrl = null;
  }
  
  getFullFileUrl(relativePath: string): string {
    // Si l'URL est déjà complète, la retourner telle quelle
    if (relativePath && (relativePath.startsWith('http') || relativePath.startsWith('//'))) {
      return relativePath;
    }
    // Sinon, construire l'URL complète
    return `${this.baseUrl}/storage/${relativePath}`;
  }
  
  getFileTypeLabel(fileType: string): string {
    switch (fileType) {
      case 'cni': return 'Carte Nationale d\'Identité';
      case 'piece_identite': return 'Pièce d\'Identité';
      case 'plan_affaire': return 'Plan d\'Affaires';
      default: return 'Document';
    }
  }

  // Vérifier le type de fichier
  isFileType(url: string | null, type: string): boolean {
    if (!url) return false;
    
    const lowercasedUrl = url.toLowerCase();
    
    switch(type) {
      case 'pdf':
        return lowercasedUrl.endsWith('.pdf');
      case 'image':
        return lowercasedUrl.endsWith('.png') || 
               lowercasedUrl.endsWith('.jpg') || 
               lowercasedUrl.endsWith('.jpeg') || 
               lowercasedUrl.endsWith('.gif');
      default:
        return false;
    }
  }

  // Méthodes pour la validation et le rejet des projets
  validateProject(project: Project): void {
    if (this.isProcessing) return;
    
    if (confirm(`Êtes-vous sûr de vouloir valider le projet de ${this.getPromoteurFullName(project)} ?`)) {
      this.isProcessing = true;
      this.statusMessage = null;
      
      // Appel API pour mettre à jour le statut
      this.projectService.updateProjectStatus(project.id, 'validé')
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              // Mise à jour locale du projet
              project.statut = 'validé';
              this.statusMessage = 'Le projet a été validé avec succès.';
            } else {
              this.error = response.message || 'Erreur lors de la validation du projet.';
            }
            this.isProcessing = false;
            
            // Faire disparaître le message après 3 secondes
            setTimeout(() => {
              this.statusMessage = null;
              this.error = null;
            }, 3000);
          },
          error: (error) => {
            console.error('Erreur lors de la validation:', error);
            this.error = 'Erreur lors de la validation du projet. Veuillez réessayer.';
            this.isProcessing = false;
            
            // Faire disparaître le message d'erreur après 3 secondes
            setTimeout(() => {
              this.error = null;
            }, 3000);
          }
        });
    }
  }
  
  rejectProject(project: Project): void {
    if (this.isProcessing) return;
    
    if (confirm(`Êtes-vous sûr de vouloir rejeter le projet de ${this.getPromoteurFullName(project)} ?`)) {
      this.isProcessing = true;
      this.statusMessage = null;
      
      // Appel API pour mettre à jour le statut
      this.projectService.updateProjectStatus(project.id, 'rejeté')
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              // Mise à jour locale du projet
              project.statut = 'rejeté';
              this.statusMessage = 'Le projet a été rejeté.';
            } else {
              this.error = response.message || 'Erreur lors du rejet du projet.';
            }
            this.isProcessing = false;
            
            // Faire disparaître le message après 3 secondes
            setTimeout(() => {
              this.statusMessage = null;
              this.error = null;
            }, 3000);
          },
          error: (error) => {
            console.error('Erreur lors du rejet:', error);
            this.error = 'Erreur lors du rejet du projet. Veuillez réessayer.';
            this.isProcessing = false;
            
            // Faire disparaître le message d'erreur après 3 secondes
            setTimeout(() => {
              this.error = null;
            }, 3000);
          }
        });
    }
  }

  // Méthode pour obtenir l'index final des éléments affichés
  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProjects.length);
  }
}
