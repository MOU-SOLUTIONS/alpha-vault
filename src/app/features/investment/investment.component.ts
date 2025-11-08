/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component InvestmentComponent
  @description Main investment dashboard component for managing investment dashboard
*/

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { CryptoComponent } from './crypto/crypto.component';

@Component({
  selector: 'app-investment',
  standalone: true,
  imports: [CommonModule, CryptoComponent],
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
})
export class InvestmentComponent {
}
