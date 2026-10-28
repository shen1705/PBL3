namespace CarRental.Models.Constants;

// role 
public static class RoleNames
{
    public const string Renter = "Renter";
    public const string Owner = "Owner";
    public const string Admin = "Admin";
    public static readonly IReadOnlyList<string> All = [Renter, Owner, Admin];
}
// permission
public static class AppClaimTypes
{
    public const string CanManageSystemConfig = "CanManageSystemConfig";   
    public const string CanManageAdminAccounts = "CanManageAdminAccounts"; 
    public const string GrantedValue = "true";
}
// owner approve
public static class OwnerApprovalStatuses
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";

    public static readonly IReadOnlyList<string> All = [Pending, Approved, Rejected];
}
//owner account status 
public static class OwnerAccessStatuses
{
    public const string Inactive = "Inactive";
    public const string Active = "Active";
    public const string Suspended = "Suspended";

    public static readonly IReadOnlyList<string> All = [Inactive, Active, Suspended];
}
// suspend status 
public static class SanctionTypes
{
    public const string Suspend7d = "Suspend7d";
    public const string Suspend30d = "Suspend30d";
    public const string Ban = "Ban";

    public static readonly IReadOnlyList<string> All = [Suspend7d, Suspend30d, Ban];
}

// vehicle approve status
public static class VehicleStatuses
{
    public const string PendingApproval = "PendingApproval";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Removed = "Removed";

    public static readonly IReadOnlyList<string> All = [PendingApproval, Approved, Rejected, Removed];
}
// post status 
public static class ListingModerationStatuses
{
    public const string PendingApproval = "PendingApproval";
    public const string Public = "Public";
    public const string Hidden = "Hidden";

    public static readonly IReadOnlyList<string> All = [PendingApproval, Public, Hidden];
}
// deposit status 
public static class DepositHoldStatuses
{
    public const string AwaitingDeposit = "AwaitingDeposit";
    public const string Converted = "Converted";
    public const string Cancelled = "Cancelled";

    public static readonly IReadOnlyList<string> All = [AwaitingDeposit, Converted, Cancelled];
}
// booking status 
public static class BookingStatuses
{
    public const string Pending = "Pending";
    public const string Accepted = "Accepted";
    public const string Rejected = "Rejected";
    public const string Expired = "Expired";
    public const string Ongoing = "Ongoing";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";
    public static readonly IReadOnlyList<string> All =
        [Pending, Accepted, Rejected, Expired, Ongoing, Completed, Cancelled];
    public static readonly IReadOnlyList<string> Locking = [Pending, Accepted, Ongoing];
}
// vehicle handover types (start/after)
public static class HandoverTypes
{
    public const string Pickup = "Pickup";
    public const string Return = "Return";

    public static readonly IReadOnlyList<string> All = [Pickup, Return];
}

// TRANSACTION RELATED  
// deposit status 
public static class DepositStatuses
{
    public const string Held = "Held";
    public const string Refunded = "Refunded";
    public const string Transferred = "Transferred";
    public const string Forfeited = "Forfeited";

    public static readonly IReadOnlyList<string> All = [Held, Refunded, Transferred, Forfeited];
}
// simulated bank account
public static class MockAccountTypes
{
    public const string User = "User";
    public const string PlatformEscrow = "PlatformEscrow";

    public static readonly IReadOnlyList<string> All = [User, PlatformEscrow];
}
// bank account status 
public static class MockAccountStatuses
{
    public const string Active = "Active";
    public const string Locked = "Locked";

    public static readonly IReadOnlyList<string> All = [Active, Locked];
}
// transaction type 
public static class MockTransactionTypes
{
    public const string Deposit = "Deposit";
    public const string Refund = "Refund";
    public const string Transfer = "Transfer";
    public const string Penalty = "Penalty";

    public static readonly IReadOnlyList<string> All = [Deposit, Refund, Transfer, Penalty];
}
// simulated transaction status 
public static class MockTransactionStatuses
{
    public const string Pending = "Pending";     
    public const string Succeeded = "Succeeded";
    public const string Failed = "Failed";

    public static readonly IReadOnlyList<string> All = [Pending, Succeeded, Failed];
}
// 
public static class ReferenceCodes
{
    public static string Deposit(int holdId) => $"DEPOSIT-{holdId}";
    public static string Refund(int bookingId) => $"REFUND-{bookingId}";
    public static string Settle(int bookingId) => $"SETTLE-{bookingId}";
    public static string Forfeit(int bookingId) => $"FORFEIT-{bookingId}";
    public static string Penalty(int bookingId) => $"PENALTY-{bookingId}";
}

// dispute status 
public static class DisputeStatuses
{
    public const string Open = "Open";
    public const string Resolved = "Resolved";

    public static readonly IReadOnlyList<string> All = [Open, Resolved];
}
// resolve dispute
public static class ResolutionActions
{
    public const string None = "None";
    public const string CancelOwnerFault = "CancelOwnerFault";
    public const string ForceComplete = "ForceComplete";

    public static readonly IReadOnlyList<string> All = [None, CancelOwnerFault, ForceComplete];
}

//configuration
public static class SettingKeys
{
    public const string CommissionRate = "commission_rate";
}

public static class BusinessRules
{
    public const decimal DepositRate = 0.25m;             // deposit = 25% price_locked_total
    public const decimal OwnerCancelPenaltyRate = 0.40m;  // Owner penalty 40% price_locked_total
    public const decimal DefaultCommissionRate = 0.05m;   // commission 
    public const int ResponseDeadlineHours = 24;          // owner response time 
}

// error 
public static class ErrorCodes
{
    public const string NotFound = "NotFound";         // 404
    public const string Forbidden = "Forbidden";       // tu choi truy cap
    public const string Unauthorized = "Unauthorized"; // chua dang nhap
    public const string Validation = "Validation";     // loi form
    public const string Conflict = "Conflict";         // trung lich / email
    public const string InvalidState = "InvalidState"; // sai trang thai
    public const string Expired = "Expired";           // het han giu cho / duyet
    public const string Unexpected = "Unexpected";     // loi he thong

    public static readonly IReadOnlyList<string> All =
    [
        NotFound,
        Forbidden,
        Unauthorized,
        Validation,
        Conflict,
        InvalidState,
        Expired,
        Unexpected
    ];
}
