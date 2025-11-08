// expense-category.ts

export type ExpenseCategory =
  // FIXED LIVING EXPENSES
  | 'RENT'
  | 'MORTGAGE'
  | 'UTILITIES'
  | 'INTERNET_PHONE'
  | 'HOME_INSURANCE'
  | 'PROPERTY_TAX'
  | 'HOME_MAINTENANCE'

  // FOOD & DINING
  | 'GROCERIES'
  | 'RESTAURANTS'
  | 'COFFEE_SNACKS'
  | 'FOOD_DELIVERY'

  // TRANSPORTATION
  | 'FUEL'
  | 'CAR_PAYMENT'
  | 'CAR_INSURANCE'
  | 'CAR_REPAIRS'
  | 'PARKING_TOLLS'
  | 'PUBLIC_TRANSPORT'

  // PERSONAL & HEALTH
  | 'HEALTH_INSURANCE'
  | 'MEDICAL'
  | 'PHARMACY'
  | 'FITNESS'
  | 'PERSONAL_CARE'

  // SHOPPING & ESSENTIALS
  | 'CLOTHING'
  | 'ELECTRONICS'
  | 'HOME_SUPPLIES'
  | 'BEAUTY_COSMETICS'

  // FAMILY & CHILDCARE
  | 'CHILDCARE'
  | 'EDUCATION_CHILD'
  | 'TOYS_GAMES'
  | 'PET_EXPENSES'

  // EDUCATION & SELF-DEVELOPMENT
  | 'TUITION'
  | 'ONLINE_COURSES'
  | 'BOOKS'
  | 'WORKSHOPS'

  // ENTERTAINMENT & LEISURE
  | 'STREAMING'
  | 'MOVIES_EVENTS'
  | 'TRAVEL'
  | 'HOBBIES'

  // DEBT & SAVINGS
  | 'LOAN_PAYMENT'
  | 'CREDIT_CARD_PAYMENT'
  | 'SAVINGS_CONTRIBUTION'
  | 'INVESTMENT_CONTRIBUTION'

  // BUSINESS & PROFESSIONAL
  | 'WORK_TOOLS'
  | 'PROFESSIONAL_SERVICES'
  | 'PROFESSIONAL_SUBSCRIPTIONS'
  | 'OFFICE_RENT'

  // GIVING & DONATIONS
  | 'CHARITY'
  | 'GIFTS'
  | 'RELIGIOUS_OFFERING'

  // EMERGENCY & UNPLANNED
  | 'EMERGENCY_EXPENSE'
  | 'ACCIDENT'
  | 'UNPLANNED_TRAVEL'
  | 'MEDICAL_EMERGENCY'

  // FEES & CHARGES
  | 'BANK_FEES'
  | 'LATE_FEES'
  | 'SERVICE_CHARGES'
  | 'FOREIGN_FEES';

export const EXPENSE_CATEGORY_OPTIONS: {
  value: ExpenseCategory;
  label: string;
}[] = [
  // FIXED LIVING EXPENSES
  { value: 'RENT', label: 'Rent' },
  { value: 'MORTGAGE', label: 'Mortgage' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'INTERNET_PHONE', label: 'Internet & Phone' },
  { value: 'HOME_INSURANCE', label: 'Home Insurance' },
  { value: 'PROPERTY_TAX', label: 'Property Tax' },
  { value: 'HOME_MAINTENANCE', label: 'Home Maintenance' },

  // FOOD & DINING
  { value: 'GROCERIES', label: 'Groceries' },
  { value: 'RESTAURANTS', label: 'Restaurants' },
  { value: 'COFFEE_SNACKS', label: 'Coffee & Snacks' },
  { value: 'FOOD_DELIVERY', label: 'Food Delivery' },

  // TRANSPORTATION
  { value: 'FUEL', label: 'Fuel' },
  { value: 'CAR_PAYMENT', label: 'Car Payment' },
  { value: 'CAR_INSURANCE', label: 'Car Insurance' },
  { value: 'CAR_REPAIRS', label: 'Car Repairs' },
  { value: 'PARKING_TOLLS', label: 'Parking & Tolls' },
  { value: 'PUBLIC_TRANSPORT', label: 'Public Transport' },

  // PERSONAL & HEALTH
  { value: 'HEALTH_INSURANCE', label: 'Health Insurance' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'PERSONAL_CARE', label: 'Personal Care' },

  // SHOPPING & ESSENTIALS
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'HOME_SUPPLIES', label: 'Home Supplies' },
  { value: 'BEAUTY_COSMETICS', label: 'Beauty & Cosmetics' },

  // FAMILY & CHILDCARE
  { value: 'CHILDCARE', label: 'Childcare' },
  { value: 'EDUCATION_CHILD', label: 'Child Education' },
  { value: 'TOYS_GAMES', label: 'Toys & Games' },
  { value: 'PET_EXPENSES', label: 'Pet Expenses' },

  // EDUCATION & SELF-DEVELOPMENT
  { value: 'TUITION', label: 'Tuition' },
  { value: 'ONLINE_COURSES', label: 'Online Courses' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'WORKSHOPS', label: 'Workshops' },

  // ENTERTAINMENT & LEISURE
  { value: 'STREAMING', label: 'Streaming' },
  { value: 'MOVIES_EVENTS', label: 'Movies & Events' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'HOBBIES', label: 'Hobbies' },

  // DEBT & SAVINGS
  { value: 'LOAN_PAYMENT', label: 'Loan Payment' },
  { value: 'CREDIT_CARD_PAYMENT', label: 'Credit Card Payment' },
  { value: 'SAVINGS_CONTRIBUTION', label: 'Savings Contribution' },
  { value: 'INVESTMENT_CONTRIBUTION', label: 'Investment Contribution' },

  // BUSINESS & PROFESSIONAL
  { value: 'WORK_TOOLS', label: 'Work Tools' },
  { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
  { value: 'PROFESSIONAL_SUBSCRIPTIONS', label: 'Professional Subscriptions' },
  { value: 'OFFICE_RENT', label: 'Office Rent' },

  // GIVING & DONATIONS
  { value: 'CHARITY', label: 'Charity' },
  { value: 'GIFTS', label: 'Gifts' },
  { value: 'RELIGIOUS_OFFERING', label: 'Religious Offering' },

  // EMERGENCY & UNPLANNED
  { value: 'EMERGENCY_EXPENSE', label: 'Emergency Expense' },
  { value: 'ACCIDENT', label: 'Accident' },
  { value: 'UNPLANNED_TRAVEL', label: 'Unplanned Travel' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency' },

  // FEES & CHARGES
  { value: 'BANK_FEES', label: 'Bank Fees' },
  { value: 'LATE_FEES', label: 'Late Fees' },
  { value: 'SERVICE_CHARGES', label: 'Service Charges' },
  { value: 'FOREIGN_FEES', label: 'Foreign Fees' },
];
