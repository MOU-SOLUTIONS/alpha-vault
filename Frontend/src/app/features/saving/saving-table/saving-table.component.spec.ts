import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingTableComponent } from './saving-table.component';

describe('SavingTableComponent', () => {
  let component: SavingTableComponent;
  let fixture: ComponentFixture<SavingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
