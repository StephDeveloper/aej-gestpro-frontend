import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export default class LandingPageComponent implements OnInit {
  inscriptionForm!: FormGroup;
  formesJuridiques: string[] = [
    'SARL', 
    'SA', 
    'SAS', 
    'EURL', 
    'Auto-entrepreneur', 
    'Association', 
    'Coopérative',
    'Autre'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  scrollToInscription(event: Event) {
    event.preventDefault();
    const inscriptionElement = document.getElementById('inscription');
    if (inscriptionElement) {
      inscriptionElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  initForm() {
    this.inscriptionForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      lieuNaissance: ['', Validators.required],
      typeProjet: ['', Validators.required],
      formeJuridique: ['', Validators.required],
      numeroCNI: ['', Validators.required],
      fileCNI: ['', Validators.required],
      pieceIdentite: ['', Validators.required],
      planAffaires: ['', Validators.required]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.inscriptionForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      const control = this.inscriptionForm.get(controlName);
      
      // Validation de type de fichier
      const allowedImageTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const allowedPdfType = ['application/pdf'];
      
      let isValidType = false;
      let maxSize = 5 * 1024 * 1024; // 5MB par défaut
      
      if (controlName === 'planAffaires') {
        isValidType = allowedPdfType.includes(file.type);
        maxSize = 10 * 1024 * 1024; // 10MB pour le plan d'affaires
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
    if (this.inscriptionForm.valid) {
      const formData = new FormData();
      
      // Ajouter les champs textuels
      Object.keys(this.inscriptionForm.controls).forEach(key => {
        const control = this.inscriptionForm.get(key);
        if (control?.value instanceof File) {
          formData.append(key, control.value, control.value.name);
        } else if (control?.value) {
          formData.append(key, control.value);
        }
      });
      
      // Ici, vous pourriez appeler un service pour envoyer les données
      console.log('Formulaire soumis:', formData);
      
      // Logique pour traiter la soumission (par exemple, appel API)
      // this.projetService.soumettre(formData).subscribe(response => {
      //   console.log('Réponse du serveur:', response);
      //   // Redirection ou message de succès
      // });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.inscriptionForm.controls).forEach(key => {
        const control = this.inscriptionForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
