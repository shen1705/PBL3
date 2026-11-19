using System.Collections.Generic;

namespace CarRental.Models.DTOs.Chatbot;

public class ChatbotMessageRequest
{
    public string Message { get; set; } = string.Empty;
    public string? SessionId { get; set; }
}

public class ChatbotMessageResponse
{
    public string Reply { get; set; } = string.Empty;
    public bool IsSuccess { get; set; } = true;
    public List<string> Suggestions { get; set; } = new();
    public string? ErrorMessage { get; set; }
    public string Provider { get; set; } = "Gemini";
}
