export interface RevenueByPaymentMethod {
  paymentMethod: string;
  amount: number;
  count: number;
}

export interface RevenueByDate {
  date: string;
  amount: number;
  transactionCount: number;
}

export interface RevenueReport {
  totalRevenue: number;
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionAmount: number;
  revenueByPaymentMethod: RevenueByPaymentMethod[];
  revenueByDate: RevenueByDate[];
}
