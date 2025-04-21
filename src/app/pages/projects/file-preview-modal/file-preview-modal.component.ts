import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-preview-modal.component.html',
  styleUrl: './file-preview-modal.component.scss'
})
export class FilePreviewModalComponent {
  @Input() showModal: boolean = false;
  @Input() selectedFile: string | null = null;
  @Input() selectedFileType: string | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  
  safePdfUrl: SafeResourceUrl | null = null;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnChanges(): void {
    // Gérer différemment selon le type de fichier
    if (this.selectedFile && this.isFileType(this.selectedFile, 'pdf')) {
      // Utiliser le sanitizer pour les PDFs
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedFile);
    } else {
      // Pour les autres types, pas besoin de sanitizer
      this.safePdfUrl = null;
    }
  }
  
  closeModal(): void {
    this.closeModalEvent.emit();
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
  
  getFileTypeLabel(fileType: string): string {
    switch (fileType) {
      case 'cni': return 'Carte Nationale d\'Identité';
      case 'piece_identite': return 'Pièce d\'Identité';
      case 'plan_affaire': return 'Plan d\'Affaires';
      default: return 'Document';
    }
  }
}
