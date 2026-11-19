using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.DTOs.Chatbot;

namespace CarRental.Services.Chatbot;

public interface IChatbotService
{
    Task<ChatbotMessageResponse> AskChatbotAsync(ChatbotMessageRequest request, string? currentUserId = null, CancellationToken ct = default);
}
