namespace CarRental.Services.Abstractions;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserName { get; }
    string? FullName { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsInRole(string role);
}
