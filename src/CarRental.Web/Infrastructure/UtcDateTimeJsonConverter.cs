using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CarRental.Web.Infrastructure;

/// <summary>
/// JSON Converter cho DateTime đảm bảo serialize luôn có định dạng ISO 8601 kèm múi giờ Việt Nam (+07:00).
/// Giúp trình duyệt web và các bên tích hợp hiển thị chính xác giờ Việt Nam (GMT+7).
/// </summary>
public class UtcDateTimeJsonConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var str = reader.GetString();
        if (string.IsNullOrWhiteSpace(str))
            return DateTime.MinValue;

        if (DateTime.TryParse(str, out var dt))
        {
            return dt;
        }

        return DateTime.MinValue;
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Serialize kèm múi giờ Việt Nam +07:00
        var formatted = value.ToString("yyyy-MM-ddTHH:mm:ss.fff+07:00");
        writer.WriteStringValue(formatted);
    }
}

public class UtcNullableDateTimeJsonConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var str = reader.GetString();
        if (string.IsNullOrWhiteSpace(str))
            return null;

        if (DateTime.TryParse(str, out var dt))
        {
            return dt;
        }

        return null;
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value == null)
        {
            writer.WriteNullValue();
            return;
        }

        var formatted = value.Value.ToString("yyyy-MM-ddTHH:mm:ss.fff+07:00");
        writer.WriteStringValue(formatted);
    }
}
