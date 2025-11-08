/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoValueChartComponent
  @description Crypto value chart component for displaying crypto portfolio value
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { CryptoValueChartComponent } from './crypto-value-chart.component';

describe('CryptoValueChartComponent', () => {
  let component: CryptoValueChartComponent;
  let fixture: ComponentFixture<CryptoValueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoValueChartComponent],
      providers: [provideAnimationsAsync()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoValueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders timeframe buttons and toggles selection', () => {
    const host: HTMLElement = fixture.nativeElement;
    const buttons = host.querySelectorAll<HTMLButtonElement>('.timeframe-btn');
    expect(buttons.length).toBeGreaterThan(0);
    const target = Array.from(buttons).find(b => b.textContent?.trim() === '30d')!;
    target.click();
    fixture.detectChanges();
    expect((component as any).selectedTimeframe).toBe('30d');
    expect(target.classList.contains('active')).toBeTrue();
  });

  it('refresh button has aria-label and icon is hidden from AT', () => {
    const host: HTMLElement = fixture.nativeElement;
    const btn = host.querySelector<HTMLButtonElement>('.refresh-btn')!;
    expect(btn.getAttribute('aria-label')).toBeTruthy();
    const icon = btn.querySelector('mat-icon')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});
