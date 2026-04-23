export interface DashboardStatsDto {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  todayRevenue: number;
  activeDepartments: number;
  pendingLabRequests: number;
}

export interface UserListDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdOn: string;
}

export interface AppointmentsByDoctorDto {
  doctorId: number;
  doctorName: string;
  count: number;
}

export interface AppointmentsByTypeDto {
  type: string;
  count: number;
}

export interface AppointmentsReportDto {
  totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
  pendingCount: number;
  noShowCount: number;
  completionRate: number;
  cancellationRate: number;
  appointmentsByDoctor: AppointmentsByDoctorDto[];
  appointmentsByType: AppointmentsByTypeDto[];
}

export interface RevenueByPaymentMethodDto {
  paymentMethod: string;
  amount: number;
  count: number;
}

export interface RevenueByDateDto {
  date: string;
  amount: number;
  transactionCount: number;
}

export interface RevenueReportDto {
  totalRevenue: number;
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionAmount: number;
  revenueByPaymentMethod: RevenueByPaymentMethodDto[];
  revenueByDate: RevenueByDateDto[];
}
