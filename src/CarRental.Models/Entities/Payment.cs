using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class Payment
{
    public int PaymentId { get; set; }
    public int BookingId { get; set; }
    [Required, MaxLength(20)]
    public string DepositStatus { get; set; } = DepositStatuses.Held;
    public decimal? PenaltyAmount { get; set; }
    public decimal CommissionRate { get; set; } = BusinessRules.DefaultCommissionRate;
    public decimal? CommissionAmount { get; set; }
    public DateTime? RevenueRecordedAt { get; set; }

    public Booking Booking { get; set; } = null!;
    public ICollection<MockBankTransaction> Transactions { get; set; } = new List<MockBankTransaction>();
}
