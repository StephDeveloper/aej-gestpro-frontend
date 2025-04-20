import { Injectable } from '@angular/core';
import { environnement } from '../../environnement/environnement';
import { HttpClientService } from '../http-client/http-client.service';
import { BehaviorSubject, tap, of, catchError, finalize } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environnement.API_URL;

  constructor(
    private http: HttpClientService,
    private router: Router
  ) {}

  register(user: any) {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  login(credentials: any) {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap((response: any) => {
        console.log(response);
        
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  logout() {
    // Essayer d'appeler l'API de déconnexion, mais continuer même en cas d'échec
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      finalize(() => {
        // Nettoyer le localStorage dans tous les cas
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion
        this.router.navigateByUrl('/login');
      }),
      catchError(error => {
        console.error('Erreur lors de la déconnexion:', error);
        // Nettoyer quand même en cas d'erreur et continuer
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion
        this.router.navigateByUrl('/login');
        
        return of(null); // Retourner un observable qui se termine normalement
      })
    ).subscribe();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
