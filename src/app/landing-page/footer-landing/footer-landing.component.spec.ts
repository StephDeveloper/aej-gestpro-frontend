import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterLandingComponent } from './footer-landing.component';

describe('FooterLandingComponent', () => {
  let component: FooterLandingComponent;
  let fixture: ComponentFixture<FooterLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
