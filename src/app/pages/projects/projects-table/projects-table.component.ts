import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-projects-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-table.component.html',
  styleUrl: './projects-table.component.scss'
})
export class ProjectsTableComponent {
  @Input() paginatedProjects: Project[] = [];
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  @Input() filteredProjects: Project[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 5;
  @Input() totalPages: number = 1;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];

  @Output() validateProjectEvent = new EventEmitter<Project>();
  @Output() rejectProjectEvent = new EventEmitter<Project>();
  @Output() openFileModalEvent = new EventEmitter<{project: Project, fileType: string}>();
  @Output() sortProjectsEvent = new EventEmitter<string>();
  @Output() pageChangeEvent = new EventEmitter<number>();
  @Output() pageSizeChangeEvent = new EventEmitter<number>();
  @Output() previousPageEvent = new EventEmitter<void>();
  @Output() nextPageEvent = new EventEmitter<void>();

  constructor() {}

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProjects.length);
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

  getPromoteurFullName(project: Project): string {
    return `${project.nom} ${project.prenoms}`;
  }

  // Événements
  onValidateProject(project: Project): void {
    this.validateProjectEvent.emit(project);
  }

  onRejectProject(project: Project): void {
    this.rejectProjectEvent.emit(project);
  }

  onOpenFileModal(project: Project, fileType: string): void {
    this.openFileModalEvent.emit({ project, fileType });
  }

  onSortProjects(field: string): void {
    this.sortProjectsEvent.emit(field);
  }

  onPageChange(page: number): void {
    this.pageChangeEvent.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChangeEvent.emit(size);
  }

  onPreviousPage(): void {
    this.previousPageEvent.emit();
  }

  onNextPage(): void {
    this.nextPageEvent.emit();
  }
}
