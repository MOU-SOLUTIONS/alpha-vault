import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeEvaluationComponent } from './income-evaluation.component';

describe('IncomeEvaluationComponent', () => {
  let component: IncomeEvaluationComponent;
  let fixture: ComponentFixture<IncomeEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeEvaluationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
