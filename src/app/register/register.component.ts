import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export default class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      password_confirmation: ['', [Validators.required]]
    }, { 
      validators: this.createPasswordMatchValidator()
    });
  }

  // getter pour accéder facilement aux champs du formulaire
  get f() {
    return this.registerForm.controls;
  }

  createPasswordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('password_confirmation');

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.value === '') {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ matching: true });
        return { matching: true };
      } else {
        // Si la seule erreur était matching, on la supprime
        const confirmErrors = { ...confirmPassword.errors };
        if (confirmErrors) {
          delete confirmErrors['matching'];
          
          if (Object.keys(confirmErrors).length === 0) {
            confirmPassword.setErrors(null);
          } else {
            confirmPassword.setErrors(confirmErrors);
          }
        }
        return null;
      }
    };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;


    console.log('Données envoyées à l\'API:', this.registerForm.value);

    this.authService.register(this.registerForm.value)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          console.log('Réponse de l\'API:', response);
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          
        }
      });
  }
}
