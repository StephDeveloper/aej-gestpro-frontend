import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters-search.component.html',
  styleUrl: './filters-search.component.scss'
})
export class FiltersSearchComponent {
  @Input() searchTerm: string = '';
  @Input() selectedType: string = '';
  @Input() selectedStatus: string = '';
  @Input() typeOptions: string[] = [];
  @Input() statusOptions: string[] = [];
  
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() selectedTypeChange = new EventEmitter<string>();
  @Output() selectedStatusChange = new EventEmitter<string>();
  @Output() applyFiltersEvent = new EventEmitter<void>();
  @Output() resetFiltersEvent = new EventEmitter<void>();
  
  constructor() {}
  
  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
    this.applyFiltersEvent.emit();
  }
  
  onSelectedTypeChange(value: string): void {
    this.selectedType = value;
    this.selectedTypeChange.emit(value);
    this.applyFiltersEvent.emit();
  }
  
  onSelectedStatusChange(value: string): void {
    this.selectedStatus = value;
    this.selectedStatusChange.emit(value);
    this.applyFiltersEvent.emit();
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.searchTermChange.emit(this.searchTerm);
    this.selectedTypeChange.emit(this.selectedType);
    this.selectedStatusChange.emit(this.selectedStatus);
    this.resetFiltersEvent.emit();
  }
}
