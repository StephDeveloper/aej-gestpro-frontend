import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAnalysisModalComponent } from './ai-analysis-modal.component';

describe('AiAnalysisModalComponent', () => {
  let component: AiAnalysisModalComponent;
  let fixture: ComponentFixture<AiAnalysisModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAnalysisModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiAnalysisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
