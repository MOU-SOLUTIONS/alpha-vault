import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoInvestmentFormComponent } from './crypto-investment-form.component';

describe('CryptoInvestmentFormComponent', () => {
  let component: CryptoInvestmentFormComponent;
  let fixture: ComponentFixture<CryptoInvestmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoInvestmentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoInvestmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
