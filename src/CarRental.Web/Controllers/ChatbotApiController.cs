using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.DTOs.Chatbot;
using CarRental.Services.Chatbot;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
[Route("api/chatbot")]
public class ChatbotApiController : ControllerBase
{
    private readonly IChatbotService _chatbotService;

    public ChatbotApiController(IChatbotService chatbotService)
    {
        _chatbotService = chatbotService;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatbotMessageRequest request, CancellationToken ct)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var response = await _chatbotService.AskChatbotAsync(request, currentUserId, ct);

        if (!response.IsSuccess && response.ErrorMessage == "Empty message")
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
}
