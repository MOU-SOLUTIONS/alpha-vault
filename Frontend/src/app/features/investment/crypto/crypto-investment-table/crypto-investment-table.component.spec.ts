/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoInvestmentTableComponent
  @description Crypto investment table component for displaying crypto investments
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoInvestmentTableComponent } from './crypto-investment-table.component';

describe('CryptoInvestmentTableComponent', () => {
  let component: CryptoInvestmentTableComponent;
  let fixture: ComponentFixture<CryptoInvestmentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoInvestmentTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoInvestmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
