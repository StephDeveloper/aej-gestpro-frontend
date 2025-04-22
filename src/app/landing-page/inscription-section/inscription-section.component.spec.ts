import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionSectionComponent } from './inscription-section.component';

describe('InscriptionSectionComponent', () => {
  let component: InscriptionSectionComponent;
  let fixture: ComponentFixture<InscriptionSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
