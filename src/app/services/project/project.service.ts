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

  createProject(body: any) {
    return this.http.post(`${this.API_URL}/projets`, body);
  }
  
}
