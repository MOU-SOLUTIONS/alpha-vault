import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTop5Component } from './income-top5.component';

describe('IncomeTop5Component', () => {
  let component: IncomeTop5Component;
  let fixture: ComponentFixture<IncomeTop5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeTop5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTop5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
