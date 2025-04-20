import { Injectable } from '@angular/core';
import { environnement } from '../../environnement/environnement';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = environnement.API_URL;

  constructor(private http: HttpClientService) { }

  getProjects() {
    return this.http.get(`${this.API_URL}/projets`);
  }

  createProject(project: any) {
    // Si c'est un FormData, ne pas ajouter l'en-tête Content-Type
    const options = isFormData(project) ? {} : undefined;
    return this.http.post(`${this.API_URL}/projets`, project, options);
  }

  
}

// Fonction utilitaire pour vérifier si l'objet est un FormData
function isFormData(value: any): boolean {
  return value instanceof FormData;
}
