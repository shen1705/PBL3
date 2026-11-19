using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.DTOs.Chatbot;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Chatbot;

public class GeminiChatbotService : IChatbotService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _db;
    private readonly ILogger<GeminiChatbotService> _logger;

    public GeminiChatbotService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ApplicationDbContext db,
        ILogger<GeminiChatbotService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _db = db;
        _logger = logger;
    }

    public async Task<ChatbotMessageResponse> AskChatbotAsync(
        ChatbotMessageRequest request,
        string? currentUserId = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request?.Message))
        {
            return new ChatbotMessageResponse
            {
                IsSuccess = false,
                Reply = "Vui lòng nhập câu hỏi của bạn để được hỗ trợ.",
                ErrorMessage = "Empty message"
            };
        }

        var userMessage = request.Message.Trim();

        // 1. Check API Key
        var apiKey = _configuration["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            apiKey = Environment.GetEnvironmentVariable("GOOGLE_API_KEY");
        }

        var model = _configuration["Gemini:Model"];
        if (string.IsNullOrWhiteSpace(model))
        {
            model = "gemini-2.0-flash";
        }
        if (model.StartsWith("models/"))
        {
            model = model.Substring("models/".Length);
        }

        // 2. If API Key is present, try Gemini Cloud API
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                var geminiReply = await CallGeminiApiAsync(apiKey, model, userMessage, ct);
                if (!string.IsNullOrWhiteSpace(geminiReply))
                {
                    var formatted = FormatReplyAsHtml(geminiReply);
                    var suggestions = GenerateSuggestions(userMessage);

                    return new ChatbotMessageResponse
                    {
                        IsSuccess = true,
                        Reply = formatted,
                        Suggestions = suggestions,
                        Provider = $"Google Gemini ({model})"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini API call failed. Falling back to AZU Car Local Knowledge Engine.");
            }
        }

        // 3. Fallback: Local Knowledge Base (Ensures 100% uptime and resilience)
        var fallback = GetFallbackAnswer(userMessage);
        return new ChatbotMessageResponse
        {
            IsSuccess = true,
            Reply = fallback.Reply,
            Suggestions = fallback.Suggestions,
            Provider = "AZU Knowledge Engine (Local)"
        };
    }

    private async Task<string?> CallGeminiApiAsync(string apiKey, string model, string userMessage, CancellationToken ct)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
        var systemKnowledge = BuildSystemKnowledgePrompt();

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[]
                    {
                        new { text = $"{systemKnowledge}\n\nCÂU HỎI CỦA NGƯỜI DÙNG:\n{userMessage}\n\nTRẢ LỜI CỦA TRỢ LÝ ẢO AZU CAR:" }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.2,
                maxOutputTokens = 1024
            }
        };

        var jsonPayload = JsonSerializer.Serialize(payload);
        var httpContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("GeminiClient");
        client.Timeout = TimeSpan.FromSeconds(12);

        var response = await client.PostAsync(url, httpContent, ct);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(ct);
            _logger.LogWarning("Gemini API returned error status {StatusCode}: {Error}", response.StatusCode, err);
            return null;
        }

        var resJson = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(resJson);

        if (doc.RootElement.TryGetProperty("candidates", out var candidates) &&
            candidates.GetArrayLength() > 0 &&
            candidates[0].TryGetProperty("content", out var content) &&
            content.TryGetProperty("parts", out var parts) &&
            parts.GetArrayLength() > 0 &&
            parts[0].TryGetProperty("text", out var textEl))
        {
            return textEl.GetString();
        }

        return null;
    }

    private string BuildSystemKnowledgePrompt()
    {
        return """
Bạn là "AZU Assistant" - Trợ lý ảo AI thông minh chính thức của nền tảng thuê xe tự lái trực tuyến AZU Car (Dự án PBL3).
Nhiệm vụ của bạn là giải đáp chính xác, lịch sự, thân thiện cho Khách thuê xe và Chủ xe dựa trên TOÀN BỘ QUY CHẾ VÀ ĐẶC TẢ HỆ THỐNG AZU CAR dưới đây:

--- THÔNG TIN CỐT LÕI VỀ AZU CAR ---
1. Tên nền tảng: AZU Car (hoặc A2U Car) - Sàn thương mại điện tử kết nối thuê xe tự lái uy tín tại Hà Nội, Đà Nẵng, TP.HCM.
2. Hotline hỗ trợ 24/7: 1900 9217 (Email: support@azucar.vn).

--- QUY ĐỊNH THUÊ XE & GIẤY TỜ ---
- Bằng lái xe (GPLX): Hạng B1, B2 trở lên còn thời hạn hiệu lực. Chấp nhận xuất trình GPLX điện tử tích hợp trên VNeID cấp độ 2.
- Giấy tờ nhân thân: CCCD gắn chip hoặc Hộ chiếu (Passport) bản gốc để đối chiếu khi bàn giao nhận xe.
- Tài sản thế chấp (Collateral):
  + Xe có nhãn "Miễn thế chấp": Khách chỉ cần thanh toán tiền thuê, không giữ lại tài sản.
  + Xe có thế chấp: Giữ lại Xe máy chính chủ (kèm cà vẹt gốc giá trị >= 15 triệu) HOẶC đặt cọc tiền mặt 5.000.000đ - 15.000.000đ cho chủ xe. Hoàn trả ngay khi trả xe an toàn.

--- THANH TOÁN, KÝ QUỸ CỌC 25% VÀ PHÍ HOA HỒNG SÀN ---
- Tiền cọc giữ chỗ (Deposit Hold): 25% tổng giá trị chuyến đi được ký quỹ bảo chứng qua cổng AZU Escrow ngay khi khách gửi yêu cầu đặt xe.
- Thanh toán còn lại: 75% giá trị chuyến đi được thanh toán lúc nhận xe hoặc khi hoàn tất chuyến đi theo hợp đồng.
- Phí hoa hồng sàn AZU Car: Chỉ 5% trên doanh thu chuyến. Chủ xe nhận trọn vẹn 95% thu nhập ròng sau khi hoàn tất bàn giao trả xe.

--- CHÍNH SÁCH HỦY CHUYẾN & PHẠT HỦY (SRS SECTION 4.3) ---
- Khách tự hủy trước 24 giờ so với giờ nhận xe: Hoàn trả 100% tiền cọc 25% ký quỹ.
- Khách hủy trong vòng 24 giờ trước giờ nhận xe: Phí hủy là 30% giá trị hợp đồng (hoàn lại 70% cọc).
- Khách hủy sau giờ nhận xe: Không hoàn lại tiền cọc.
- Chủ xe tự ý hủy chuyến sau khi đã duyệt (Accepted): Khách được hoàn lại 100% tiền cọc + Chủ xe bị phạt 8% tổng giá trị hợp đồng trừ vào tài khoản hoặc công nợ bồi thường.

--- QUY TRÌNH BÀN GIAO 2 BƯỚC (HANDOVER LIFECYCLE) ---
- Bước 1 - Bàn giao nhận xe (Pickup Handover): Khách và chủ xe cùng kiểm tra thân vỏ 4 góc, lốp, gương kính, số ODO và vạch xăng/pin. Chụp 4 ảnh hiện trường và ký 2 biên bản nhận xe trên ứng dụng.
- Bước 2 - Bàn giao trả xe (Return Handover): Đối soát tình trạng xe so với lúc nhận ban đầu. Hoàn tất 2 biên bản trả xe để hệ thống giải phóng cọc và quyết toán thu nhập cho chủ xe.

--- PHỤ PHÍ VÀ XỬ PHẠT SỰ CỐ PHÁT SINH (DISPUTES) ---
- Hút thuốc lá, mang thức ăn nặng mùi (sầu riêng, hải sản), thú cưng làm bẩn nội thất: Phạt vệ sinh 500.000 đ.
- Hao hụt xăng/dầu hoặc pin xe điện: Thanh toán theo giá thị trường + phụ phí nạp 50.000 đ.
- Trả xe trễ giờ: 100.000 đ/giờ (trả trễ quá 5 giờ tính tương đương 1 ngày thuê).
- Vượt giới hạn quãng đường: 3.000 đ - 5.000 đ/km phụ trội.
- Phạt nguội vi phạm giao thông CSGT: Khách thuê chịu 100% trách nhiệm trong khung giờ thuê xe (thời hạn truy soát trong 30 ngày).
- Nếu phát sinh tranh chấp: Chủ xe hoặc khách thuê có thể mở khiếu nại (Dispute). Ban Quản trị AZU Car sẽ xem xét ảnh biên bản 2 đầu để phán quyết khấu trừ cọc hoặc bồi thường công minh.

--- QUY TẮC PHẢN HỒI ---
1. Trả lời bằng tiếng Việt lịch sự, thân thiện, súc tích, chuyên nghiệp.
2. Sử dụng gạch đầu dòng và in đậm các số liệu hoặc mốc thời gian quan trọng.
3. Nếu người dùng hỏi các nội dung không liên quan đến thuê xe hoặc không có trong quy chế, hãy lịch sự từ chối và hướng dẫn gọi Hotline 1900 9217.
""";
    }

    private string FormatReplyAsHtml(string rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText)) return string.Empty;

        // Convert basic markdown format to clean HTML for display
        var lines = rawText.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
        var sb = new StringBuilder();
        bool inList = false;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (string.IsNullOrEmpty(trimmed))
            {
                if (inList) { sb.Append("</ul>"); inList = false; }
                continue;
            }

            // Bullet points
            if (trimmed.StartsWith("* ") || trimmed.StartsWith("- "))
            {
                if (!inList) { sb.Append("<ul>"); inList = true; }
                var itemText = trimmed.Substring(2).Trim();
                sb.Append($"<li>{FormatBold(itemText)}</li>");
            }
            else if (trimmed.StartsWith("### ") || trimmed.StartsWith("## "))
            {
                if (inList) { sb.Append("</ul>"); inList = false; }
                var heading = trimmed.TrimStart('#').Trim();
                sb.Append($"<p><strong>{FormatBold(heading)}</strong></p>");
            }
            else
            {
                if (inList) { sb.Append("</ul>"); inList = false; }
                sb.Append($"<p>{FormatBold(trimmed)}</p>");
            }
        }

        if (inList) sb.Append("</ul>");

        return sb.ToString();
    }

    private string FormatBold(string text)
    {
        var result = System.Text.RegularExpressions.Regex.Replace(
            text,
            @"\*\*(.+?)\*\*",
            "<strong>$1</strong>");

        return result;
    }

    private List<string> GenerateSuggestions(string userMessage)
    {
        var lower = userMessage.ToLowerInvariant();

        if (lower.Contains("giấy tờ") || lower.Contains("bằng lái") || lower.Contains("gplx"))
        {
            return new List<string>
            {
                "Có cần đặt cọc tiền mặt không?",
                "Quy trình giao nhận xe như thế nào?",
                "Chính sách hủy chuyến & hoàn cọc?"
            };
        }

        if (lower.Contains("cọc") || lower.Contains("tiền") || lower.Contains("thanh toán"))
        {
            return new List<string>
            {
                "Chính sách hủy chuyến & hoàn cọc?",
                "Phí vệ sinh nếu hút thuốc trong xe?",
                "Thủ tục thuê xe cần những giấy tờ gì?"
            };
        }

        if (lower.Contains("hủy") || lower.Contains("phạt"))
        {
            return new List<string>
            {
                "Chủ xe tự ý hủy đơn bị xử lý ra sao?",
                "Nếu xảy ra va chạm thì bảo hiểm giải quyết thế nào?",
                "Thủ tục thuê xe cần những giấy tờ gì?"
            };
        }

        return new List<string>
        {
            "Thủ tục thuê xe cần những giấy tờ gì?",
            "Quy định đặt cọc 25% qua AZU Escrow?",
            "Chính sách hủy chuyến và bồi thường?"
        };
    }

    private (string Reply, List<string> Suggestions) GetFallbackAnswer(string userMessage)
    {
        var lower = userMessage.ToLowerInvariant();

        if (lower.Contains("giấy tờ") || lower.Contains("gplx") || lower.Contains("bằng lái") || lower.Contains("cccd") || lower.Contains("vneid"))
        {
            return (
                """
                <p><strong>📄 Giấy tờ cần chuẩn bị khi nhận xe tự lái tại AZU Car:</strong></p>
                <ul>
                    <li><strong>Bằng lái xe (GPLX):</strong> Hạng B1/B2 trở lên còn hạn (chấp nhận xuất trình GPLX điện tử trên <strong>VNeID mức 2</strong>).</li>
                    <li><strong>CCCD gắn chip hoặc Hộ chiếu (Passport):</strong> Để đối chiếu danh tính người thuê xe.</li>
                    <li><strong>Tài sản thế chấp:</strong> Xe máy chính chủ (kèm cà vẹt gốc) hoặc cọc 5 – 15 triệu đồng (xe có nhãn <em>Miễn thế chấp</em> sẽ không cần cọc tài sản).</li>
                </ul>
                <div class="msg-highlight-box">
                    <i class="fa-solid fa-circle-check"></i> Người nhận xe phải trực tiếp xuất trình GPLX chính chủ khi ký biên bản nhận bàn giao.
                </div>
                """,
                new List<string> { "Có cần đặt cọc tiền mặt không?", "Quy trình giao nhận xe ra sao?", "Chính sách hủy chuyến như thế nào?" }
            );
        }

        if (lower.Contains("cọc") || lower.Contains("escrow") || lower.Contains("thế chấp") || lower.Contains("25%"))
        {
            return (
                """
                <p><strong>💰 Quy định về đặt cọc giữ chỗ & thế chấp tài sản:</strong></p>
                <ul>
                    <li><strong>Ký quỹ giữ chỗ (25%):</strong> Khách hàng ký quỹ 25% giá trị chuyến đi qua tài khoản bảo chứng <strong>AZU Escrow</strong> để giữ lịch xe.</li>
                    <li><strong>Thanh toán còn lại (75%):</strong> Thanh toán khi nhận xe hoặc lúc kết thúc chuyến đi.</li>
                    <li><strong>Tài sản thế chấp:</strong> Với xe có yêu cầu thế chấp, bạn gửi lại xe máy chính chủ (trên 15 triệu) hoặc tiền mặt 5 - 15 triệu cho chủ xe khi nhận chìa khóa.</li>
                </ul>
                <div class="msg-highlight-box">
                    <i class="fa-solid fa-clock-rotate-left"></i> Tiền cọc hoặc xe máy sẽ được hoàn trả đầy đủ ngay khi bạn trả xe không phát sinh sự cố.
                </div>
                """,
                new List<string> { "Chính sách hủy chuyến & hoàn cọc?", "Phụ phí nếu hút thuốc hoặc trả trễ?", "Thủ tục nhận xe gồm những gì?" }
            );
        }

        if (lower.Contains("hủy") || lower.Contains("hoàn tiền") || lower.Contains("hoàn cọc"))
        {
            return (
                """
                <p><strong>❌ Chính sách hủy chuyến & hoàn tiền tại AZU Car (SRS 4.3):</strong></p>
                <ul>
                    <li><strong>Hủy trước 24h giờ nhận xe:</strong> Hoàn lại <strong>100% tiền cọc</strong> ký quỹ cho khách.</li>
                    <li><strong>Hủy trong vòng 24h giờ nhận xe:</strong> Phí hủy là <strong>30% giá trị hợp đồng</strong> (hoàn lại 70% cọc).</li>
                    <li><strong>Hủy sau giờ nhận xe:</strong> Không hoàn lại tiền cọc.</li>
                    <li><strong>Chủ xe tự ý hủy đơn sau khi đã duyệt (Accepted):</strong> Khách nhận lại 100% tiền cọc + Chủ xe bị <strong>phạt 8% giá trị đơn</strong> vào quỹ sàn.</li>
                </ul>
                """,
                new List<string> { "Thủ tục thuê xe gồm những gì?", "Quy định phụ phí quá giờ & vượt km?", "Xử lý khi có va chạm/sự cố?" }
            );
        }

        if (lower.Contains("phạt") || lower.Contains("mùi") || lower.Contains("hút thuốc") || lower.Contains("vệ sinh") || lower.Contains("trễ giờ") || lower.Contains("km"))
        {
            return (
                """
                <p><strong>⚠️ Biểu phí xử phạt vi phạm & phụ phí phát sinh:</strong></p>
                <ul>
                    <li><strong>Hút thuốc / Mùi hôi / Thức ăn nặng mùi:</strong> Phụ phí vệ sinh khử mùi <strong>500.000 đ</strong>.</li>
                    <li><strong>Trả xe trễ giờ:</strong> <strong>100.000 đ/giờ</strong> (trễ trên 5 tiếng tính thành 1 ngày thuê).</li>
                    <li><strong>Vượt giới hạn quãng đường:</strong> Phụ phí <strong>3.000 đ – 5.000 đ/km</strong> vượt mức.</li>
                    <li><strong>Hao hụt nhiên liệu / pin:</strong> Thanh toán theo giá xăng/pin thị trường + 50.000 đ phụ phí nạp.</li>
                    <li><strong>Phạt nguội CSGT:</strong> Khách thuê chịu 100% tiền phạt phát sinh trong khung giờ chuyến đi.</li>
                </ul>
                """,
                new List<string> { "Chính sách hủy chuyến & hoàn cọc?", "Thủ tục thuê xe gồm những gì?", "Xử lý khi có va chạm/sự cố?" }
            );
        }

        if (lower.Contains("va chạm") || lower.Contains("tai nạn") || lower.Contains("bảo hiểm") || lower.Contains("sự cố"))
        {
            return (
                """
                <p><strong>🚨 Hướng dẫn xử lý khi gặp sự cố hoặc va chạm trên đường:</strong></p>
                <ol>
                    <li>Đảm bảo an toàn cho hành khách, bật đèn cảnh báo nguy hiểm.</li>
                    <li><strong>Gọi ngay hotline cứu hộ khẩn cấp 24/7: <a href="tel:19009217" style="color:#ef4444; font-weight:700;">1900 9217</a> (Phím 1)</strong>.</li>
                    <li>Chụp ảnh 4 góc xe, chi tiết vết va quẹt và hiện trường làm bằng chứng.</li>
                    <li>Thông báo ngay cho Chủ xe để làm thủ tục giám định bảo hiểm vật chất xe.</li>
                </ol>
                """,
                new List<string> { "Biểu phí phụ thu và xử lý phạt?", "Chính sách hủy chuyến & hoàn cọc?", "Thủ tục bàn giao xe 2 bước?" }
            );
        }

        if (lower.Contains("chủ xe") || lower.Contains("đăng ký xe") || lower.Contains("hoa hồng") || lower.Contains("cho thuê"))
        {
            return (
                """
                <p><strong>🔑 Trở thành đối tác Chủ xe cùng AZU Car:</strong></p>
                <ul>
                    <li><strong>Hoa hồng sàn cực thấp:</strong> AZU Car chỉ thu <strong>5% phí hoa hồng</strong>, bạn nhận trọn vẹn <strong>95% thu nhập ròng</strong>.</li>
                    <li><strong>Hồ sơ đăng ký:</strong> Ảnh chụp CCCD 2 mặt, Giấy đăng kiểm xe, Bảo hiểm xe còn hiệu lực.</li>
                    <li><strong>Thời hạn duyệt đơn:</strong> Chủ xe có tối đa <strong>24 giờ</strong> để duyệt hoặc từ chối các yêu cầu đặt xe mới.</li>
                </ul>
                """,
                new List<string> { "Chính sách phạt 8% khi chủ xe hủy đơn?", "Quy trình bàn giao xe 2 bước?", "Thủ tục thuê xe gồm những gì?" }
            );
        }

        return (
            $"""
            <p>Cảm ơn câu hỏi của bạn: <em>"{System.Web.HttpUtility.HtmlEncode(userMessage)}"</em>.</p>
            <p>Tôi là <strong>Trợ lý ảo AZU Car</strong>. Bạn có thể tra cứu nhanh các thông tin về: <strong>giấy tờ nhận xe, tiền cọc 25% Escrow, chính sách hủy hoàn cọc, phụ phí hút thuốc/vệ sinh, bàn giao xe 2 bước hoặc đăng ký chủ xe</strong>.</p>
            <p>Nếu cần hỗ trợ gấp, vui lòng liên hệ trực tiếp Tổng đài 24/7: <a href="tel:19009217" style="color:#ef4444; font-weight:700;">1900 9217</a>!</p>
            """,
            new List<string>
            {
                "Thủ tục thuê xe cần những giấy tờ gì?",
                "Quy định đặt cọc 25% qua AZU Escrow?",
                "Chính sách hủy chuyến & bồi hoàn?"
            }
        );
    }
}
