import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeMethodChartComponent } from './income-method-chart.component';

describe('IncomeMethodChartComponent', () => {
  let component: IncomeMethodChartComponent;
  let fixture: ComponentFixture<IncomeMethodChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeMethodChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeMethodChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
