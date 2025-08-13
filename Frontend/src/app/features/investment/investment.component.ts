import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-investment',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
})
export class InvestmentComponent {
  constructor(private router: Router) {}

  activeTab: 'crypto' = 'crypto';

  selectTab(tab: 'crypto') {
    this.activeTab = tab;
  }

  navigateToCrypto() {
    this.router.navigate(['main/body/investment/crypto']);
  }

  navigateToSaving() {
    this.router.navigate(['main/body/saving']);
  }
}
