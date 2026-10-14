namespace CarRental.Models.Constants;

// Giá trị lấy từ docs/architecture/erd.md. Lưu dạng chuỗi (varchar) trong DB.
// Mỗi nhóm có `All` để validate đầu vào và cấu hình check constraint nếu cần.

// ===== Identity: role + claim =====

public static class RoleNames
{
    public const string Renter = "Renter";
    public const string Owner = "Owner";

    // Identity chỉ có 3 role. Staff và Admin cùng dùng "Admin";
    // phân biệt bằng claim (xem AppClaimTypes). Vì vậy [Authorize(Roles = "Admin")]
    // cho cả Staff đi qua: hành động chỉ dành cho Admin phải kiểm tra claim/policy.
    public const string Admin = "Admin";

    public static readonly IReadOnlyList<string> All = [Renter, Owner, Admin];
}

public static class AppClaimTypes
{
    // Giá trị claim_value lưu "true".
    public const string CanManageSystemConfig = "CanManageSystemConfig";   // UC-AS-06 (và UC-AS-05 nếu SRS gộp)
    public const string CanManageAdminAccounts = "CanManageAdminAccounts"; // UC-AS-07
    public const string GrantedValue = "true";
}

// ===== Owner / tài khoản =====

public static class OwnerApprovalStatuses
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";

    public static readonly IReadOnlyList<string> All = [Pending, Approved, Rejected];
}

public static class OwnerAccessStatuses
{
    public const string Inactive = "Inactive";
    public const string Active = "Active";
    public const string Suspended = "Suspended";

    public static readonly IReadOnlyList<string> All = [Inactive, Active, Suspended];
}

public static class SanctionTypes
{
    public const string Suspend7d = "Suspend7d";
    public const string Suspend30d = "Suspend30d";
    public const string Ban = "Ban";

    public static readonly IReadOnlyList<string> All = [Suspend7d, Suspend30d, Ban];
}

// ===== Xe và tin đăng =====

public static class VehicleStatuses
{
    public const string PendingApproval = "PendingApproval";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Removed = "Removed";

    public static readonly IReadOnlyList<string> All = [PendingApproval, Approved, Rejected, Removed];
}

public static class ListingModerationStatuses
{
    public const string PendingApproval = "PendingApproval";
    public const string Public = "Public";
    public const string Hidden = "Hidden";

    public static readonly IReadOnlyList<string> All = [PendingApproval, Public, Hidden];
}

// ===== Đặt xe =====

public static class DepositHoldStatuses
{
    public const string AwaitingDeposit = "AwaitingDeposit";
    public const string Converted = "Converted";
    public const string Cancelled = "Cancelled";

    public static readonly IReadOnlyList<string> All = [AwaitingDeposit, Converted, Cancelled];
}

public static class BookingStatuses
{
    public const string Pending = "Pending";
    public const string Accepted = "Accepted";
    public const string Rejected = "Rejected";
    public const string Expired = "Expired";
    public const string Ongoing = "Ongoing";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";
    // Không có "Returned": đó là trạng thái chuyển tiếp, không lưu.

    public static readonly IReadOnlyList<string> All =
        [Pending, Accepted, Rejected, Expired, Ongoing, Completed, Cancelled];

    // Trạng thái chặn lịch xe. Rejected, Expired, Cancelled không chặn; Completed không ảnh hưởng tương lai.
    public static readonly IReadOnlyList<string> Locking = [Pending, Accepted, Ongoing];
}

public static class HandoverTypes
{
    public const string Pickup = "Pickup";
    public const string Return = "Return";

    public static readonly IReadOnlyList<string> All = [Pickup, Return];
}

// ===== Thanh toán giả lập =====

public static class DepositStatuses
{
    public const string Held = "Held";
    public const string Refunded = "Refunded";
    public const string Transferred = "Transferred";
    public const string Forfeited = "Forfeited";

    public static readonly IReadOnlyList<string> All = [Held, Refunded, Transferred, Forfeited];
}

public static class MockAccountTypes
{
    public const string User = "User";
    public const string PlatformEscrow = "PlatformEscrow";

    public static readonly IReadOnlyList<string> All = [User, PlatformEscrow];
}

public static class MockAccountStatuses
{
    public const string Active = "Active";
    public const string Locked = "Locked";

    public static readonly IReadOnlyList<string> All = [Active, Locked];
}

public static class MockTransactionTypes
{
    public const string Deposit = "Deposit";
    public const string Refund = "Refund";
    public const string Transfer = "Transfer";
    public const string Penalty = "Penalty";

    public static readonly IReadOnlyList<string> All = [Deposit, Refund, Transfer, Penalty];
}

public static class MockTransactionStatuses
{
    public const string Pending = "Pending";     // Penalty chờ Owner thanh toán
    public const string Succeeded = "Succeeded";
    public const string Failed = "Failed";

    public static readonly IReadOnlyList<string> All = [Pending, Succeeded, Failed];
}

// Mã tham chiếu duy nhất, đảm bảo idempotent: ReferenceCodes.Refund(bookingId) -> "REFUND-12"
public static class ReferenceCodes
{
    public static string Deposit(int holdId) => $"DEPOSIT-{holdId}";
    public static string Refund(int bookingId) => $"REFUND-{bookingId}";
    public static string Settle(int bookingId) => $"SETTLE-{bookingId}";
    public static string Forfeit(int bookingId) => $"FORFEIT-{bookingId}";
    public static string Penalty(int bookingId) => $"PENALTY-{bookingId}";
}

// ===== Khiếu nại =====

public static class DisputeStatuses
{
    public const string Open = "Open";
    public const string Resolved = "Resolved";

    public static readonly IReadOnlyList<string> All = [Open, Resolved];
}

public static class ResolutionActions
{
    public const string None = "None";
    public const string CancelOwnerFault = "CancelOwnerFault";
    public const string ForceComplete = "ForceComplete";

    public static readonly IReadOnlyList<string> All = [None, CancelOwnerFault, ForceComplete];
}

// ===== Cấu hình và quy tắc cố định =====

public static class SettingKeys
{
    public const string CommissionRate = "commission_rate";
}

public static class BusinessRules
{
    public const decimal DepositRate = 0.25m;             // cọc = 25% price_locked_total
    public const decimal OwnerCancelPenaltyRate = 0.40m;  // phạt Owner = 40% price_locked_total
    public const decimal DefaultCommissionRate = 0.05m;   // chỉ dùng khi seed; giá trị thật đọc từ system_settings
    public const int ResponseDeadlineHours = 24;          // hạn Owner phản hồi
}