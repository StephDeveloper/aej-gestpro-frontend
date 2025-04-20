import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export default class LandingPageComponent implements OnInit {
  inscriptionForm!: FormGroup;
  error = '';
  isLoading = false;
  submitted = false;

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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

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
    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.error = error.error.message;
      }
    });
  }
}
