namespace CarRental.Models
{
    public enum ContractStatus
    {
        Pending, 
        Approved, 
        InRental, 
        Returned, 
        Completed, 
        Cancelled, 
        Expired
    }

    public enum PaymentStatus
    {
        Unpaid,
        Paid
    }

    public enum PaymentType
    {
        Deposit,
        Remaining
    }

    public enum PaymentMethod
    {
        Simulation,
        Cash
    }

    public enum InspectionType
    {
        Pickup,
        Return
    }
}