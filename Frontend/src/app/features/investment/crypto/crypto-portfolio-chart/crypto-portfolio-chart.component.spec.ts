import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoPortfolioChartComponent } from './crypto-portfolio-chart.component';

describe('CryptoPortfolioChartComponent', () => {
  let component: CryptoPortfolioChartComponent;
  let fixture: ComponentFixture<CryptoPortfolioChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoPortfolioChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoPortfolioChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
