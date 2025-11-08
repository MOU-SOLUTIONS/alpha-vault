/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoDataGridComponent
  @description Crypto data grid component for displaying crypto data
*/

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoInvestmentFormComponent } from './crypto-investment-form.component';

describe('CryptoInvestmentFormComponent', () => {
  let component: CryptoInvestmentFormComponent;
  let fixture: ComponentFixture<CryptoInvestmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoInvestmentFormComponent, HttpClientTestingModule]
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
