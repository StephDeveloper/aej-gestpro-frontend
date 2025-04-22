import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderLandingComponent } from './header-landing/header-landing.component';
import { FooterLandingComponent } from './footer-landing/footer-landing.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { InscriptionSectionComponent } from './inscription-section/inscription-section.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    HeaderLandingComponent, 
    FooterLandingComponent,
    HeroSectionComponent,
    InscriptionSectionComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export default class LandingPageComponent {
  // Les fonctionnalités ont été déplacées vers les composants correspondants
}
