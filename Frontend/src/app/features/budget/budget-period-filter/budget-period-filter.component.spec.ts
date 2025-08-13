import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPeriodFilterComponent } from './budget-period-filter.component';

describe('BudgetPeriodFilterComponent', () => {
  let component: BudgetPeriodFilterComponent;
  let fixture: ComponentFixture<BudgetPeriodFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPeriodFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPeriodFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
