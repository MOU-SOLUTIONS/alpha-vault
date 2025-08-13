
/** Matches DebtRequestDTO */
export interface DebtRequest {
    userId: number;
    creditorName: string;
    totalAmount: number;
    remainingAmount: number;
    interestRate: number;
    dueDate: string; // backend date string
    minPayment: number;
  }
  
  /** Matches DebtResponseDTO */
  export interface Debt {
    id: number;
    userId: number;
    creditorName: string;
    totalAmount: number;
    remainingAmount: number;
    interestRate: number;
    dueDate: string;
    minPayment: number;
  }
  
  /** Matches backend's payment history map */
  export interface DebtHistoryItem {
    paymentDate: string;
    paymentAmount: number;
    remainingAmount: number;
    note?: string;
  }
  