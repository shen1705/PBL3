using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class MockBankTransaction
{
    [Key]
    public int TransactionId { get; set; }
    [Required, MaxLength(100)]
    public string ReferenceCode { get; set; } = string.Empty;
    public int? PaymentId { get; set; }
    public int FromAccountId { get; set; }
    public int ToAccountId { get; set; }
    [Required, MaxLength(30)]
    public string TransactionType { get; set; } = string.Empty; // Deposit / Refund / Transfer / Penalty
    public decimal Amount { get; set; }
    [Required, MaxLength(20)]
    public string Status { get; set; } = MockTransactionStatuses.Succeeded;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Payment? Payment { get; set; }
    public MockBankAccount FromAccount { get; set; } = null!;
    public MockBankAccount ToAccount { get; set; } = null!;
}
