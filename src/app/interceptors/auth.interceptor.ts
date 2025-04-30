import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Ne pas ajouter de token pour les requêtes d'authentification
  // if (req.url.includes('/login') || req.url.includes('/register')) {
  //   return next(req);
  // }
  
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Si l'erreur est 401 (non autorisé), cela signifie que le token est invalide
      if (error.status === HttpStatusCode.Unauthorized) {
        console.error('Session expirée ou token invalide');
        // Le service d'authentification gère la redirection et le nettoyage
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
