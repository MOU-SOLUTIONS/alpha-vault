// src/app/enums/investment-type.ts

export enum InvestmentType {
  // Traditional Assets
  STOCKS = 'stocks',
  BONDS = 'bonds',
  MUTUAL_FUNDS = 'mutual_funds',
  ETF = 'etf',
  
  // Alternative Assets
  REAL_ESTATE = 'real_estate',
  BUSINESS = 'business',
  COMMODITIES = 'commodities',
  FOREX = 'forex',
  
  // Digital Assets
  CRYPTO = 'crypto',
  
  // Other
  OTHER = 'other',
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
