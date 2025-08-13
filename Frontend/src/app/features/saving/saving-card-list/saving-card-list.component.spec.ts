import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingCardListComponent } from './saving-card-list.component';

describe('SavingCardListComponent', () => {
  let component: SavingCardListComponent;
  let fixture: ComponentFixture<SavingCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingCardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
