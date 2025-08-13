import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseWeekChartComponent } from './expense-week-chart.component';

describe('ExpenseWeekChartComponent', () => {
  let component: ExpenseWeekChartComponent;
  let fixture: ComponentFixture<ExpenseWeekChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseWeekChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseWeekChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
