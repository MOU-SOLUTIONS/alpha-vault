import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseMonthChartComponent } from './expense-month-chart.component';

describe('ExpenseMonthChartComponent', () => {
  let component: ExpenseMonthChartComponent;
  let fixture: ComponentFixture<ExpenseMonthChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseMonthChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseMonthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
