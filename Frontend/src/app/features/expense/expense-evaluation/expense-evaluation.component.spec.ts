import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseEvaluationComponent } from './expense-evaluation.component';

describe('ExpenseEvaluationComponent', () => {
  let component: ExpenseEvaluationComponent;
  let fixture: ComponentFixture<ExpenseEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEvaluationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
