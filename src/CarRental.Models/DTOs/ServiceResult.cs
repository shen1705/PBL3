namespace CarRental.Models.Common;
//only result message (state)
public class ServiceResult
{
    public bool IsSuccess { get; init; }
    public string? Message { get; init; }
    public string? ErrorCode { get; init; }

    public static ServiceResult Success(string? message = null)
        => new()
        {
            IsSuccess = true,
            Message = message
        };

    public static ServiceResult Fail(
        string message,
        string? errorCode = null)
        => new()
        {
            IsSuccess = false,
            Message = message,
            ErrorCode = errorCode
        };
}
//Data 
public class ServiceResult<T>
{
    public bool IsSuccess { get; init; }
    public string? Message { get; init; }
    public string? ErrorCode { get; init; }
    public T? Data { get; init; }

    public static ServiceResult<T> Success(
        T data,
        string? message = null)
        => new()
        {
            IsSuccess = true,
            Data = data,
            Message = message
        };

    public static ServiceResult<T> Fail(
        string message,
        string? errorCode = null)
        => new()
        {
            IsSuccess = false,
            Message = message,
            ErrorCode = errorCode
        };
}