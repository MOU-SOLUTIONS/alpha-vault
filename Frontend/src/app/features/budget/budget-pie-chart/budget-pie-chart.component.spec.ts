import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPieChartComponent } from './budget-pie-chart.component';

describe('BudgetPieChartComponent', () => {
  let component: BudgetPieChartComponent;
  let fixture: ComponentFixture<BudgetPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPieChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
