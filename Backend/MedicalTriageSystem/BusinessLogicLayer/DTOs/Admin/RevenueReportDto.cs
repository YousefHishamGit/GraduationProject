namespace BusinessLogicLayer.DTOs.Admin
{
    public class RevenueReportDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal ThisWeekRevenue { get; set; }
        public decimal ThisMonthRevenue { get; set; }
        public int TotalTransactions { get; set; }
        public int SuccessfulTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public decimal AverageTransactionAmount { get; set; }
        public List<RevenueByPaymentMethodDto> RevenueByPaymentMethod { get; set; } = new();
        public List<RevenueByDateDto> RevenueByDate { get; set; } = new();
    }



   
}
