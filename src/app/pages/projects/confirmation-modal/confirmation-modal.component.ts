import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() showModal: boolean = false;
  @Input() confirmAction: string = '';
  @Input() selectedProject: any = null;
  @Input() isProcessing: boolean = false;
  @Input() justificationError: boolean = false;
  
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() confirmStatusEvent = new EventEmitter<string>();
  
  justification: string = '';
  
  constructor() {}
  
  closeModal(): void {
    this.closeModalEvent.emit();
  }
  
  confirmStatus(): void {
    this.confirmStatusEvent.emit(this.justification);
  }
}
