/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoInvestmentFormComponent
  @description Crypto investment form component for adding and editing crypto investments
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, Input, OnChanges, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { LoggingService } from '../../../../core/services/logging.service';
import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { AssetService } from '../../../../core/services/asset.service';
import { InvestmentStatus } from '../../../../enums/investment-status';
import { InvestmentType } from '../../../../enums/investment-type';
import { RISK_LEVEL_OPTIONS, RiskLevel } from '../../../../enums/risk-level';
import { Asset } from '../../../../models/asset.model';
import {
  Investment,
  InvestmentRequest,
} from '../../../../models/investment.model';

@Component({
  selector: 'app-crypto-investment-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crypto-investment-form.component.html',
  styleUrls: ['./crypto-investment-form.component.scss'],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Add or modify your cryptocurrency investment entries with detailed tracking, risk assessment, and portfolio management.'
      }
    }
  ],
})
export class CryptoInvestmentFormComponent implements OnInit, OnChanges {
  @Input() initialData: Investment | null = null;
  @Input() mode: 'add' | 'modify' = 'add';

  @Output() formSubmit = new EventEmitter<InvestmentRequest>();
  @Output() cancelForm = new EventEmitter<void>();

  formGroup!: FormGroup;
  readonly risks = RISK_LEVEL_OPTIONS;

  allAssets: Asset[] = [];

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loggingService = inject(LoggingService);

  constructor(private fb: FormBuilder, private assetSvc: AssetService) {}

  trackByAssetSymbol(index: number, asset: Asset): string {
    return asset.symbol;
  }

  trackByRiskValue(index: number, risk: { value: string; label: string }): string {
    return risk.value;
  }

  private convertDateToInputFormat(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    if (dateStr.includes('-') && dateStr.length === 10) {
      return dateStr;
    }
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  }

  ngOnChanges(): void {
    if (this.formGroup) {
      const nameControl = this.formGroup.get('name');
      if (nameControl) {
        if (this.mode === 'modify' && !nameControl.disabled) {
          nameControl.disable();
        } else if (this.mode === 'add' && nameControl.disabled) {
          nameControl.enable();
        }
      }

      if (this.initialData && this.mode === 'modify') {
        let symbolValue = '';
        if (this.initialData.symbol) {
          symbolValue = this.initialData.symbol;
        } else if (this.initialData.name && this.allAssets.length > 0) {
          const matchingAsset = this.allAssets.find(
            asset => asset.symbol === this.initialData!.name || 
                     asset.name === this.initialData!.name ||
                     asset.symbol.toUpperCase() === this.initialData!.name.toUpperCase()
          );
          if (matchingAsset) {
            symbolValue = matchingAsset.symbol;
          } else {
            symbolValue = this.initialData.name;
          }
        } else {
          symbolValue = this.initialData.name || '';
        }

        let riskLevelValue: RiskLevel | null = null;
        if (this.initialData.riskLevel) {
          const normalized = this.initialData.riskLevel.toUpperCase().trim() as RiskLevel;
          if (['LOW', 'MEDIUM', 'HIGH'].includes(normalized)) {
            riskLevelValue = normalized;
          } else {
            riskLevelValue = null;
          }
        }

        this.formGroup.patchValue({
          investmentType: this.initialData.investmentType || InvestmentType.CRYPTO,
          amountInvested: this.initialData.amountInvested || 0,
          startDate: this.convertDateToInputFormat(this.initialData.startDate),
          riskLevel: riskLevelValue,
          notes: this.initialData.notes || '',
          status: this.initialData.status || InvestmentStatus.OPEN,
          soldValue: this.initialData.soldValue || null,
          soldDate: this.convertDateToInputFormat(this.initialData.soldDate),
        });

        if (nameControl && symbolValue) {
          nameControl.setValue(symbolValue, { emitEvent: false });
        }
      } else if (this.mode === 'add') {
        this.formGroup.patchValue({
          investmentType: InvestmentType.CRYPTO,
          name: '',
          amountInvested: 0,
          startDate: '',
          riskLevel: null,
          notes: '',
          status: InvestmentStatus.OPEN,
          soldValue: null,
          soldDate: null,
        });
      }
    }
  }

  ngOnInit() {
    let initialNameValue = '';
    if (this.initialData) {
      initialNameValue = this.initialData.symbol || this.initialData.name || '';
    }

    let initialRiskLevel: RiskLevel | null = null;
    if (this.initialData?.riskLevel) {
      const normalized = this.initialData.riskLevel.toUpperCase().trim() as RiskLevel;
      if (['LOW', 'MEDIUM', 'HIGH'].includes(normalized)) {
        initialRiskLevel = normalized;
      }
    }

    const nameControlConfig: { value: string; disabled: boolean } = {
      value: initialNameValue,
      disabled: this.mode === 'modify'
    };

    this.formGroup = this.fb.group({
      investmentType: [this.initialData?.investmentType || InvestmentType.CRYPTO, Validators.required],
      name: new FormControl(nameControlConfig, Validators.required),
      amountInvested: [this.initialData?.amountInvested || 0, [Validators.required, Validators.min(0.01)]],
      startDate: [this.convertDateToInputFormat(this.initialData?.startDate) || '', Validators.required],
      riskLevel: [initialRiskLevel],
      notes: [this.initialData?.notes || ''],
      status: [this.initialData?.status || InvestmentStatus.OPEN],
      soldValue: [this.initialData?.soldValue || null],
      soldDate: [this.convertDateToInputFormat(this.initialData?.soldDate) || null],
    });

    this.formGroup.get('status')!.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((status) => {
      const isSold = status === InvestmentStatus.CLOSED;
      const valCtrl = this.formGroup.get('soldValue')!;
      const dateCtrl = this.formGroup.get('soldDate')!;
      if (isSold) {
        valCtrl.setValidators([Validators.required, Validators.min(0)]);
        dateCtrl.setValidators([Validators.required]);
      } else {
        valCtrl.clearValidators();
        dateCtrl.clearValidators();
      }
      valCtrl.updateValueAndValidity();
      dateCtrl.updateValueAndValidity();
    });

    this.assetSvc
      .searchAssets(InvestmentType.CRYPTO, '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (assets) => {
          this.allAssets = Array.isArray(assets) ? assets : [];
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loggingService.error('Error fetching assets:', error);
          this.allAssets = [];
          this.cdr.markForCheck();
        }
      });
  }

  submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const formValue = this.formGroup.getRawValue();
    
    let formattedDate = formValue.startDate;
    if (formattedDate && formattedDate.includes('-')) {
      const dateParts = formattedDate.split('-');
      if (dateParts.length === 3) {
        formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
      }
    }
    
    const payload: InvestmentRequest = {
      userId: 0,
      investmentType: formValue.investmentType,
      name: formValue.name,
      amountInvested: Number(formValue.amountInvested),
      startDate: formattedDate,
      riskLevel: formValue.riskLevel || undefined,
      notes: formValue.notes || undefined,
    };
    this.formSubmit.emit(payload);
  }

  InvestmentStatus = InvestmentStatus;

  get nameControl() { return this.formGroup.get('name'); }
  get amountInvestedControl() { return this.formGroup.get('amountInvested'); }
  get startDateControl() { return this.formGroup.get('startDate'); }
  get riskLevelControl() { return this.formGroup.get('riskLevel'); }
  get notesControl() { return this.formGroup.get('notes'); }
  get statusControl() { return this.formGroup.get('status'); }
  get soldValueControl() { return this.formGroup.get('soldValue'); }
  get soldDateControl() { return this.formGroup.get('soldDate'); }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newStatus = target.checked ? InvestmentStatus.CLOSED : InvestmentStatus.OPEN;
    this.formGroup.get('status')!.setValue(newStatus);
  }
}
