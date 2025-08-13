import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTop5Component } from './expense-top5.component';

describe('ExpenseTop5Component', () => {
  let component: ExpenseTop5Component;
  let fixture: ComponentFixture<ExpenseTop5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseTop5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTop5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
