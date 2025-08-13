import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseWidgetComponent } from './expense-widget.component';

describe('ExpenseWidgetComponent', () => {
  let component: ExpenseWidgetComponent;
  let fixture: ComponentFixture<ExpenseWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
