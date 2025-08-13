import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoValueChartComponent } from './crypto-value-chart.component';

describe('CryptoValueChartComponent', () => {
  let component: CryptoValueChartComponent;
  let fixture: ComponentFixture<CryptoValueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoValueChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoValueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
