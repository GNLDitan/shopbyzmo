namespace ByzmoApi.Enum
{
    public static class SendEmail
    {
        public enum TokenType
        {
            Registration = 1,
            ForgotPassword = 2,
            ResetPassword = 3
        }
    }

    public static class Payment
    {
        public enum PaymentType
        {
            Order = 1,
            Layaway = 2,
            PreOrder = 3
        }
    }

    public static class OrderReport
    {
        public enum ReportType
        {
            OrderStatusReport = 1,
            SalesReport = 2,
            ShippedOrderReport = 3,
            OrderWithDiscountReport = 4,
            OrderWithLayawayReport = 5,
            OrdersWithPreOrderReport = 6
        }

        public enum ProductReportType
        {
            ProductPriceListReport = 1,
            StockProductsReport = 2,
            ProductHighestToLowestReport = 3,
            ProductTagReport = 4
        }
    }


    public static class PaymongoStatus
    {
        public enum Status
        {
            Initial = 1,
            Pending = 2,
            Completed = 3
        }
    }
}