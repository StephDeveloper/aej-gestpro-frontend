import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer-landing.component.html',
  styleUrl: './footer-landing.component.scss'
})
export class FooterLandingComponent {
  currentYear = new Date().getFullYear();
}
