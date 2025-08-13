import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeMonthChartComponent } from './income-month-chart.component';

describe('IncomeMonthChartComponent', () => {
  let component: IncomeMonthChartComponent;
  let fixture: ComponentFixture<IncomeMonthChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeMonthChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeMonthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
