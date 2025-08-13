import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeWidgetComponent } from './income-widget.component';

describe('IncomeWidgetComponent', () => {
  let component: IncomeWidgetComponent;
  let fixture: ComponentFixture<IncomeWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
