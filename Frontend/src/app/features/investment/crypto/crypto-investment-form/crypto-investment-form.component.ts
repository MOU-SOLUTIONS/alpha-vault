// src/app/crypto/crypto-investment-form/crypto-investment-form.component.ts

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Investment,
  InvestmentRequest,
} from '../../../../models/investment.model';
import { RISK_LEVEL_OPTIONS } from '../../../../enums/risk-level';
import { AssetService } from '../../../../core/services/asset.service';
import { Asset } from '../../../../models/asset.model';
import { InvestmentType } from '../../../../enums/investment-type';

@Component({
  selector: 'app-crypto-investment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crypto-investment-form.component.html',
  styleUrls: ['./crypto-investment-form.component.scss'],
})
export class CryptoInvestmentFormComponent implements OnInit {
  @Input() initialData: Investment | null = null;
  @Input() mode: 'add' | 'modify' = 'add';

  @Output() formSubmit = new EventEmitter<InvestmentRequest>();
  @Output() cancelForm = new EventEmitter<void>();

  formGroup!: FormGroup;
  risks = RISK_LEVEL_OPTIONS;

  allAssets: Asset[] = [];

  constructor(private fb: FormBuilder, private assetSvc: AssetService) {}

  ngOnInit() {
    // 1) Build the FormGroup with plain controls
    this.formGroup = this.fb.group({
      investmentType: [InvestmentType.CRYPTO, Validators.required],
      name: ['', Validators.required],
      amountInvested: [0, [Validators.required, Validators.min(0.01)]],
      startDate: ['', Validators.required],
      riskLevel: [null],
      notes: [''],
      isSold: [false],
      soldValue: [null],
      soldDate: [null],
    });

    // 2) If in modify mode, patch and disable “name”
    if (this.initialData) {
      this.formGroup.patchValue({
        investmentType: this.initialData.investmentType,
        name: this.initialData.name,
        amountInvested: this.initialData.amountInvested,
        startDate: this.initialData.startDate,
        riskLevel: this.initialData.riskLevel,
        notes: this.initialData.notes,
        isSold: this.initialData.isSold,
        soldValue: this.initialData.soldValue,
        soldDate: this.initialData.soldDate,
      });
      this.formGroup.get('name')!.disable();
    }

    // 3) When isSold toggles, require or clear soldValue/soldDate
    this.formGroup.get('isSold')!.valueChanges.subscribe((sold) => {
      const valCtrl = this.formGroup.get('soldValue')!;
      const dateCtrl = this.formGroup.get('soldDate')!;
      if (sold) {
        valCtrl.setValidators([Validators.required, Validators.min(0)]);
        dateCtrl.setValidators([Validators.required]);
      } else {
        valCtrl.clearValidators();
        dateCtrl.clearValidators();
      }
      valCtrl.updateValueAndValidity();
      dateCtrl.updateValueAndValidity();
    });

    // 4) Fetch all crypto assets so the <select> can show them
    this.assetSvc
      .searchAssets(InvestmentType.CRYPTO, '')
      .subscribe((assets) => {
        this.allAssets = assets;
      });
  }

  submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    // Use getRawValue() so that disabled “name” (in modify) is included
    const payload = this.formGroup.getRawValue() as InvestmentRequest;
    this.formSubmit.emit(payload);
  }
}
