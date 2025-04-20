import { Injectable } from '@angular/core';
import { environnement } from '../../environnement/environnement';
import { HttpClientService } from '../http-client/http-client.service';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = environnement.API_URL;

  constructor(private http: HttpClientService) { }

  getProjects(): Observable<any> {
    return this.http.get(`${this.API_URL}/projets`);
  }

  createProject(project: any) {
    // Si c'est un FormData, ne pas ajouter l'en-tête Content-Type
    const options = isFormData(project) ? {} : undefined;
    return this.http.post(`${this.API_URL}/projets`, project, options);
  }

  // Méthode pour mettre à jour le statut d'un projet
  updateProjectStatus(projectId: number, status: string, justification: string) {
    const data = {
      statut: status,
      justification: justification
    };
    
    return this.http.patch(`${this.API_URL}/projets/${projectId}`, data);
  }

  // Méthode pour vérifier si un fichier existe
  checkFileExists(url: string): Observable<boolean> {
    // Utiliser get au lieu de head car le service personnalisé pourrait ne pas implémenter head
    return this.http.get(url, { responseType: 'blob' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getProjectsAI() {
    return this.http.get(`${this.API_URL}/projets/classement`);
  }
}

// Fonction utilitaire pour vérifier si l'objet est un FormData
function isFormData(value: any): boolean {
  return value instanceof FormData;
}
