// src/app/enums/investment-type.ts

export enum InvestmentType {
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  STOCK = 'STOCKS',
  ETF = 'ETF',
  COMMODITY = 'COMMODITIES',
  REAL_ESTATE = 'REAL_ESTATE',
  BUSINESS = 'BUSINESS',
  OTHER = 'OTHER',
}

// For *ngFor and filtering
export const INVESTMENT_TYPE_VALUES: InvestmentType[] =
  Object.values(InvestmentType);

// (Optional) nicer labels if you want them:
// export const INVESTMENT_TYPE_OPTIONS: { value: InvestmentType; label: string }[] = [
//   { value: InvestmentType.CRYPTO,      label: 'Crypto'       },
//   { value: InvestmentType.FOREX,       label: 'Forex'        },
//   { value: InvestmentType.STOCK,       label: 'Stock'        },
//   { value: InvestmentType.ETF,         label: 'ETF'          },
//   { value: InvestmentType.COMMODITY,   label: 'Commodity'    },
//   { value: InvestmentType.REAL_ESTATE, label: 'Real Estate'  },
//   { value: InvestmentType.BUSINESS,    label: 'Business'     },
//   { value: InvestmentType.OTHER,       label: 'Other'        },
// ];
