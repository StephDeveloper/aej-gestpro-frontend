import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project/project.service';
import { finalize } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inscription-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inscription-section.component.html',
  styleUrl: './inscription-section.component.scss'
})
export class InscriptionSectionComponent implements OnInit {
  inscriptionForm!: FormGroup;
  error = '';
  isLoading = false;
  submitted = false;
  successMessage = false;

  formesJuridiques: string[] = [
    'SCS',
    'SNC',
    'SARL', 
    'SA', 
    'SAS'
  ];

  constructor(private fb: FormBuilder, private projectService: ProjectService) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.inscriptionForm = this.fb.group({
      nom: ['', Validators.required],
      prenoms: ['', Validators.required],
      date_naissance: ['', Validators.required],
      lieu_naissance: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      type_projet: ['', Validators.required],
      forme_juridique: ['', Validators.required],
      num_cni: ['', Validators.required],
      cni: ['', Validators.required],
      piece_identite: ['', Validators.required],
      plan_affaire: ['', Validators.required]
    });
  }

  get f() { return this.inscriptionForm.controls; }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      const control = this.inscriptionForm.get(controlName);
      
      // Validation de type de fichier
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const allowedPdfType = ['application/pdf'];
      
      let isValidType = false;
      let maxSize = 1 * 1024 * 1024; // 1MB par défaut
      
      if (controlName === 'planAffaires') {
        isValidType = allowedPdfType.includes(file.type);
        maxSize = 1 * 1024 * 1024; // 1MB pour le plan d'affaires
      } else {
        isValidType = allowedImageTypes.includes(file.type);
      }
      
      // Validation de taille
      const isValidSize = file.size <= maxSize;
      
      // Mise à jour des erreurs
      let errors: any = null;
      
      if (!isValidType) {
        errors = {...errors, invalidFileType: true};
      }
      
      if (!isValidSize) {
        errors = {...errors, invalidFileSize: true};
      }
      
      if (errors) {
        control?.setErrors(errors);
      } else {
        control?.setValue(file);
      }
    }
  }

  onSubmit() {
    this.submitted = true;
    const formData = new FormData();

    if (this.inscriptionForm.invalid) {
      return;
    }

    // Ajouter les champs textuels
    Object.keys(this.inscriptionForm.controls).forEach(key => {
      const control = this.inscriptionForm.get(key);
      if (control?.value instanceof File) {
        formData.append(key, control.value, control.value.name);
      } else if (control?.value) {
        formData.append(key, control.value);
      }
    });

    this.isLoading = true;
    this.projectService.createProject(formData)
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = true;
          this.error = '';
          this.submitted = false;
          
          // Réinitialiser complètement le formulaire
          this.inscriptionForm.reset();
          
          // Réinitialiser les champs de type fichier
          this.resetFileInputs();
          
          // Faire défiler vers le haut du formulaire pour montrer le message de succès
          setTimeout(() => {
            const inscriptionElement = document.getElementById('inscription');
            if (inscriptionElement) {
              inscriptionElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 200);
        }
      },
      error: (error: any) => {
        console.log('error', error);
        this.error = error.error.errors;
      }
    });
  }

  /**
   * Réinitialise tous les champs de type fichier du formulaire
   */
  resetFileInputs() {
    // Obtenir tous les éléments input de type file
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    // Réinitialiser chaque input
    fileInputs.forEach((element: Element) => {
      const input = element as HTMLInputElement;
      input.value = '';
    });
    
    // Réinitialiser également les validations dans le formulaire pour les champs de fichier
    ['cni', 'piece_identite', 'plan_affaire'].forEach(fieldName => {
      const control = this.inscriptionForm.get(fieldName);
      if (control) {
        control.setValue(null);
        control.markAsUntouched();
        control.updateValueAndValidity();
      }
    });
  }
}
