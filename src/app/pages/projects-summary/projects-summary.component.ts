import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project/project.service';
import { environnement } from '../../environnement/environnement';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// Import des bibliothèques pour PDF et Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Interface pour les projets
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
  justification?: string;
}

@Component({
  selector: 'app-projects-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-summary.component.html',
  styleUrl: './projects-summary.component.scss'
})
export default class ProjectsSummaryComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  paginatedProjects: Project[] = [];
  pageSizeOptions: number[] = [5, 10, 25, 50];
  
  // Recherche et filtres
  searchTerm: string = '';
  selectedStatus: string = '';
  
  // État de chargement
  isLoading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  
  // URL de base pour les fichiers
  baseUrl: string = environnement.API_URL;
  
  // Pour la visualisation des fichiers
  selectedFile: string | null = null;
  selectedFileType: string | null = null;
  showFileModal: boolean = false;
  safePdfUrl: SafeResourceUrl | null = null;

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
          // Filtrer uniquement les projets validés ou rejetés
          this.projects = response.data.filter((project: Project) => 
            project.statut === 'Validé' || project.statut === 'Rejeté');
          
          this.filteredProjects = [...this.projects];
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

  // Méthode de recherche et filtrage
  applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      // Filtrer par terme de recherche (nom, prénom, email)
      const searchMatch = !this.searchTerm || 
        `${project.nom} ${project.prenoms} ${project.email} ${project.type_projet}`.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtrer par statut
      const statusMatch = !this.selectedStatus || project.statut === this.selectedStatus;
      
      return searchMatch && statusMatch;
    });
    
    // Réinitialiser la pagination après filtrage
    this.currentPage = 1;
    this.applyPagination();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.filteredProjects = [...this.projects];
    this.currentPage = 1;
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

  // Méthodes pour l'affichage
  getPromoteurFullName(project: Project): string {
    return `${project.nom} ${project.prenoms}`;
  }

  // Méthode pour obtenir l'index final des éléments affichés
  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProjects.length);
  }

  // Méthode pour formater les dates
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
  
  // Méthodes pour visualiser les fichiers
  openFileModal(project: Project, fileType: string): void {
    let fileUrl = '';
    
    switch(fileType) {
      case 'cni':
        fileUrl = project.cni_url || '';
        if (!fileUrl && project.cni) {
          fileUrl = this.getFullFileUrl(project.cni);
        }
        break;
      case 'piece_identite':
        fileUrl = project.piece_identite_url || '';
        if (!fileUrl && project.piece_identite) {
          fileUrl = this.getFullFileUrl(project.piece_identite);
        }
        break;
      case 'plan_affaire':
        fileUrl = project.plan_affaire_url || '';
        if (!fileUrl && project.plan_affaire) {
          fileUrl = this.getFullFileUrl(project.plan_affaire);
        }
        break;
    }
    
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

  // Génération du PDF pour un projet
  generatePDF(project: Project): void {
    this.isLoading = true;
    
    try {
      // Créer un nouveau document PDF en format A4
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Ajouter un titre
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Récapitulatif du Projet', 105, 15, { align: 'center' });
      
      // Logo ou en-tête
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('AEJ - Agence Emploi Jeunes', 105, 22, { align: 'center' });
      doc.text('Gestionnaire de Projets', 105, 27, { align: 'center' });
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 30, 190, 30);
      
      // Informations du promoteur
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Informations du Promoteur', 20, 40);
      
      doc.setFontSize(11);
      doc.setTextColor(70, 70, 70);
      
      // Créer un tableau pour les informations de base
      const promoteurData = [
        ['Nom complet', `${project.nom} ${project.prenoms}`],
        ['Email', project.email],
        ['Date de naissance', project.date_naissance ? this.formatDate(project.date_naissance) : 'Non renseigné'],
        ['Lieu de naissance', project.lieu_naissance || 'Non renseigné'],
        ['Numéro CNI', project.num_cni || 'Non renseigné']
      ];
      
      // Ajouter le tableau au document
      autoTable(doc, {
        startY: 45,
        head: [['Détail', 'Valeur']],
        body: promoteurData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20, right: 20 }
      });
      
      // Informations du projet
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Détails du Projet', 20, finalY + 10);
      
      // Créer un tableau pour les informations du projet
      const projetData = [
        ['Type de projet', project.type_projet],
        ['Forme juridique', project.forme_juridique],
        ['Statut', project.statut],
        ['Date de création', this.formatDate(project.created_at)],
        ['Date de mise à jour', this.formatDate(project.updated_at)]
      ];
      
      if (project.justification) {
        projetData.push(['Justification', project.justification]);
      }
      
      // Ajouter le tableau au document
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Détail', 'Valeur']],
        body: projetData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20, right: 20 }
      });
      
      // Ajouter le pied de page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        
        // Pied de page avec date
        const today = new Date();
        const dateStr = `Généré le ${today.toLocaleDateString('fr-FR')} à ${today.toLocaleTimeString('fr-FR')}`;
        doc.text(dateStr, 20, 285);
        
        // Numéro de page
        doc.text(`Page ${i} sur ${pageCount}`, 190, 285, { align: 'right' });
      }
      
      // Générer le PDF et le télécharger
      const fileName = `projet_${project.id}_${project.nom.toLowerCase()}_${project.prenoms.toLowerCase()}.pdf`;
      doc.save(fileName);
      
      this.success = `PDF généré avec succès pour le projet de ${project.nom} ${project.prenoms}`;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      this.error = 'Erreur lors de la génération du PDF. Veuillez réessayer.';
    } finally {
      this.isLoading = false;
      // Effacer le message après 3 secondes
      setTimeout(() => {
        this.success = null;
        this.error = null;
      }, 3000);
    }
  }

  // Exportation des projets en Excel
  exportToExcel(): void {
    this.isLoading = true;
    
    try {
      // Préparer les données pour l'Excel
      const excelData = this.filteredProjects.map(project => ({
        'ID': project.id,
        'Nom': project.nom,
        'Prénoms': project.prenoms,
        'Email': project.email,
        'Type de Projet': project.type_projet,
        'Forme Juridique': project.forme_juridique,
        'Statut': project.statut,
        'Date de Naissance': project.date_naissance ? this.formatDate(project.date_naissance) : '',
        'Lieu de Naissance': project.lieu_naissance || '',
        'Numéro CNI': project.num_cni || '',
        'Date de Création': this.formatDate(project.created_at),
        'Date de Mise à Jour': this.formatDate(project.updated_at),
        'Justification': project.justification || ''
      }));
      
      // Créer un workbook et ajouter une feuille
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Projets');
      
      // Générer l'Excel
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Nom du fichier avec date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      // Définir un filtre pour le nom du fichier
      let statusFilter = '';
      if (this.selectedStatus) {
        statusFilter = `_${this.selectedStatus.toLowerCase()}`;
      }
      
      // Sauvegarder le fichier
      saveAs(data, `projets${statusFilter}_${dateStr}.xlsx`);
      
      this.success = 'Liste des projets exportée avec succès en format Excel';
    } catch (error) {
      console.error('Erreur lors de l\'exportation Excel:', error);
      this.error = 'Erreur lors de l\'exportation Excel. Veuillez réessayer.';
    } finally {
      this.isLoading = false;
      // Effacer le message après 3 secondes
      setTimeout(() => {
        this.success = null; 
        this.error = null;
      }, 3000);
    }
  }
}
