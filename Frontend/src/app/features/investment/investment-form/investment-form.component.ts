// src/app/investments/investment-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  Investment,
  InvestmentRequest,
} from '../../../models/investment.model';
import {
  INVESTMENT_TYPE_VALUES,
  InvestmentType,
} from '../../../enums/investment-type';
import { AssetService } from '../../../core/services/asset.service';
import { Asset } from '../../../models/asset.model';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investment-form',
  templateUrl: './investment-form.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    CommonModule,
  ],
})
export class InvestmentFormComponent implements OnInit {
  @Input() initialData: Investment | null = null;
  @Output() formSubmit = new EventEmitter<InvestmentRequest>();
  @Output() cancel = new EventEmitter<void>();
  @Input() mode: 'add' | 'edit' = 'add';

  form: FormGroup;
  filteredAssets: Asset[] = [];
  investmentTypes = INVESTMENT_TYPE_VALUES; // now a real array of values

  constructor(fb: FormBuilder, private assetSvc: AssetService) {
    this.form = fb.group({
      investmentType: [null as InvestmentType | null, Validators.required],
      symbol: [''],
      name: ['', Validators.required],
      amountInvested: [0, Validators.required],
      currentValue: [0, Validators.required],
      startDate: [null, Validators.required],
      notes: [''],
      riskLevel: [null],
      isSold: [false],
      soldValue: [null],
      soldDate: [null],
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }

    // When type changes, clear the symbol/name as appropriate
    this.form.get('investmentType')!.valueChanges.subscribe((type) => {
      const dyn = this.isDynamic(type);
      if (dyn) {
        this.form.get('symbol')!.setValidators([Validators.required]);
        this.form.get('name')!.clearValidators();
      } else {
        this.form.get('symbol')!.clearValidators();
        this.form.get('name')!.setValidators([Validators.required]);
      }
      this.form.get('symbol')!.updateValueAndValidity();
      this.form.get('name')!.updateValueAndValidity();
    });

    // Wire up the asset search
    this.form
      .get('symbol')!
      .valueChanges.pipe(
        debounceTime(300),
        switchMap((q) =>
          this.assetSvc.searchAssets(this.form.value.investmentType, q || '')
        )
      )
      .subscribe((list) => (this.filteredAssets = list));
  }

  isDynamic(type: InvestmentType) {
    return INVESTMENT_TYPE_VALUES.includes(type);
  }

  submit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as InvestmentRequest);
    }
  }

  // when the user picks a symbol, patch the form
  onOptionSelected(a: Asset) {
    this.form.patchValue({
      symbol: a.symbol,
      name: a.name,
    });
  }
}
