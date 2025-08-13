import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeWeekChartComponent } from './income-week-chart.component';

describe('IncomeWeekChartComponent', () => {
  let component: IncomeWeekChartComponent;
  let fixture: ComponentFixture<IncomeWeekChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeWeekChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeWeekChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
