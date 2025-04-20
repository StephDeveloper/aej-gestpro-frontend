import { Injectable } from '@angular/core';
import { environnement } from '../../environnement/environnement';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = environnement.API_URL;

  constructor(private http: HttpClientService) { }

  getDashboardData() {
    return this.http.get(`${this.API_URL}/dashboard/stats`);
  }
}
