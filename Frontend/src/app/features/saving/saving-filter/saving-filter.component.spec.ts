import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingFilterComponent } from './saving-filter.component';

describe('SavingFilterComponent', () => {
  let component: SavingFilterComponent;
  let fixture: ComponentFixture<SavingFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
