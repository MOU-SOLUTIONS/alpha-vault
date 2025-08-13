import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseMethodChartComponent } from './expense-method-chart.component';

describe('ExpenseMethodChartComponent', () => {
  let component: ExpenseMethodChartComponent;
  let fixture: ComponentFixture<ExpenseMethodChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseMethodChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseMethodChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
