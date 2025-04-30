import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProjectAI {
  projet: {
    id: number;
    nom: string;
    prenoms: string;
    email: string;
    type_projet: string;
    forme_juridique: string;
    created_at: string;
  };
  analyse: {
    note_globale: number;
    recommandations: string;
    criteres?: {
      viabilite_economique: number;
      innovation: number;
      conformite_reglementaire: number;
      strategie_financiere: number;
      potentiel_croissance: number;
    };
    forces?: string[];
    faiblesses?: string[];
  };
  rang: number;
  statut?: string;
}

@Component({
  selector: 'app-ai-analysis-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-analysis-modal.component.html',
  styleUrl: './ai-analysis-modal.component.scss'
})
export class AiAnalysisModalComponent {
  @Input() showModal: boolean = false;
  @Input() isAIAnalysisLoading: boolean = false;
  @Input() projectsAI: ProjectAI[] = [];
  @Input() isProcessing: boolean = false;
  @Input() getProjectStatus: ((id: number) => string) | null = null;
  
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() validateProjectEvent = new EventEmitter<number>();
  @Output() rejectProjectEvent = new EventEmitter<number>();
  
  selectedProjectDetails: ProjectAI | null = null;
  showDetailsModal: boolean = false;
  
  constructor() {}
  
  closeModal(): void {
    // if (this.isAIAnalysisLoading) {
    //   return;
    // }
    this.closeModalEvent.emit();
  }
  
  validateProject(projectId: number): void {
    this.validateProjectEvent.emit(projectId);
  }
  
  rejectProject(projectId: number): void {
    this.rejectProjectEvent.emit(projectId);
  }
  
  getProjectStatusClass(status: string): string {
    switch(status) {
      case 'Validé': return 'text-success';
      case 'Rejeté': return 'text-danger';
      default: return 'text-warning';
    }
  }
  
  getStatus(item: ProjectAI): string {
    if (this.getProjectStatus && item.projet.id) {
      return this.getProjectStatus(item.projet.id);
    }
    return item.statut || 'En cours';
  }
  
  showDetails(project: ProjectAI): void {
    this.selectedProjectDetails = project;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProjectDetails = null;
  }
}
