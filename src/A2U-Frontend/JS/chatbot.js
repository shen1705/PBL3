/* AZU CAR - TRỢ LÝ ẢO AI CHATBOT 24/7 (chatbot.js)*/

document.addEventListener('DOMContentLoaded', () => {
    const chatMessagesStream = document.getElementById('chatMessagesStream');
    const chatForm = document.getElementById('chatForm');
    const chatInputText = document.getElementById('chatInputText');
    const typingIndicator = document.getElementById('typingIndicator');
    const chatPromptChips = document.getElementById('chatPromptChips');
    const btnResetChat = document.getElementById('btnResetChat');

    // Tự động focus vào ô nhập tin nhắn khi mở trang
    setTimeout(() => {
        chatInputText?.focus();
        scrollChatToBottom();
    }, 200);

    // Cơ sở tri thức câu trả lời của Trợ lý ảo AZU
    const BOT_RESPONSES = [
        {
            keywords: ['giấy tờ', 'gplx', 'bằng lái', 'b1', 'b2', 'cccd', 'cmnd', 'vneid', 'hộ chiếu', 'passport'],
            reply: `
                <p><strong>📄 Giấy tờ cần chuẩn bị khi nhận xe tự lái:</strong></p>
                <ul>
                    <li><strong>Bằng lái xe (GPLX):</strong> Hạng B1/B2 trở lên còn hạn (chấp nhận GPLX điện tử trên <strong>VNeID mức 2</strong>).</li>
                    <li><strong>CCCD gắn chip hoặc Hộ chiếu (Passport):</strong> Để đối chiếu danh tính người thuê xe.</li>
                    <li><strong>Tài sản thế chấp:</strong> Xe máy chính chủ (kèm cà vẹt gốc) hoặc tiền cọc từ 5 – 15 triệu đồng (xe có nhãn <em>Miễn thế chấp</em> sẽ không cần cọc tài sản).</li>
                </ul>
                <div class="msg-highlight-box">
                    <i class="fa-solid fa-circle-check"></i> Lưu ý: Người nhận xe phải trực tiếp xuất trình GPLX chính chủ khi nhận chìa khóa.
                </div>
            `,
            suggestions: ['Có cần đặt cọc tiền mặt không?', 'Quy trình giao nhận xe ra sao?']
        },
        {
            keywords: ['thủ tục', 'nhận xe', 'lấy xe', 'giao xe', 'bàn giao'],
            reply: `
                <p><strong>🚗 Quy trình nhận xe tự lái AZU Car (5 - 10 phút):</strong></p>
                <ol>
                    <li><strong>Gặp chủ xe:</strong> Tại địa chỉ chủ xe hoặc điểm giao xe theo yêu cầu (Sân bay, khách sạn, nhà riêng).</li>
                    <li><strong>Đối chiếu giấy tờ:</strong> Xuất trình GPLX và CCCD/VNeID để chủ xe kiểm tra.</li>
                    <li><strong>Kiểm tra xe & ODO:</strong> Cùng chủ xe kiểm tra thân vỏ, lốp xe, mức xăng/pin và số km. Chụp ảnh 4 góc xe làm bằng chứng đối chiếu.</li>
                    <li><strong>Ký biên bản điện tử:</strong> Nhận chìa khóa và bắt đầu hành trình an toàn!</li>
                </ol>
            `,
            suggestions: ['Nếu xảy ra va chạm thì xử lý thế nào?', 'Bảng giá thuê xe tính như thế nào?']
        },
        {
            keywords: ['cọc', 'đặt cọc', 'thế chấp', 'tiền mặt', 'xe máy', 'miễn thế chấp', 'cà vẹt'],
            reply: `
                <p><strong>💰 Quy định về đặt cọc & thế chấp tài sản:</strong></p>
                <ul>
                    <li><strong>Xe Miễn thế chấp:</strong> Bạn chỉ cần thanh toán tiền thuê, không cần giữ lại xe máy hay cọc tiền mặt.</li>
                    <li><strong>Xe có thế chấp:</strong> Bạn có thể chọn 1 trong 2 hình thức:
                        <ul>
                            <li>Gửi lại <strong>Xe máy chính chủ</strong> kèm cà vẹt gốc (giá trị xe máy từ 15 triệu trở lên).</li>
                            <li>Hoặc đặt cọc <strong>5.000.000đ – 15.000.000đ</strong> tiền mặt/chuyển khoản cho chủ xe.</li>
                        </ul>
                    </li>
                </ul>
                <div class="msg-highlight-box">
                    <i class="fa-solid fa-clock-rotate-left"></i> Tiền cọc hoặc xe máy sẽ được hoàn trả đầy đủ ngay khi bạn trả xe không có sự cố.
                </div>
            `,
            suggestions: ['Thủ tục thuê xe cần những giấy tờ gì?', 'Chính sách hủy chuyến như thế nào?']
        },
        {
            keywords: ['hủy', 'hủy chuyến', 'hoàn tiền', 'hoàn cọc', 'đổi lịch'],
            reply: `
                <p><strong>❌ Chính sách hủy chuyến & hoàn tiền tại AZU Car:</strong></p>
                <ul>
                    <li><strong>Hủy trước 24h trước giờ nhận xe:</strong> Hoàn lại <strong>100% tiền cọc</strong>.</li>
                    <li><strong>Hủy trong vòng 24h trước giờ nhận xe:</strong> Phí hủy là <strong>30% giá trị chuyến đi</strong> (hoàn lại 70%).</li>
                    <li><strong>Hủy sau giờ nhận xe:</strong> Không hoàn lại tiền cọc.</li>
                    <li><strong>Chủ xe hủy chuyến:</strong> Khách hàng nhận lại 100% tiền kèm voucher đền bù 100.000đ – 200.000đ.</li>
                </ul>
                <p>Tiền hoàn lại sẽ về tài khoản ngân hàng của bạn trong vòng <strong>1 – 3 ngày làm việc</strong>.</p>
            `,
            suggestions: ['Thủ tục thuê xe gồm những gì?', 'Có cần đặt cọc tiền mặt không?']
        },
        {
            keywords: ['sự cố', 'tai nạn', 'va chạm', 'hỏng xe', 'bảo hiểm', 'cứu hộ', 'chết máy', 'thủng lốp'],
            reply: `
                <p><strong>🚨 Hướng dẫn xử lý khi gặp sự cố hoặc va chạm:</strong></p>
                <ol>
                    <li>Bật đèn cảnh báo khẩn cấp và đưa mọi người trên xe đến khu vực an toàn.</li>
                    <li><strong>Gọi ngay hotline cứu hộ 24/7: <a href="tel:19009217" style="color:#ef4444; font-weight:700;">1900 9217</a> (Bấm phím 1)</strong>.</li>
                    <li>Chụp ảnh 4 góc xe, quay video chi tiết hiện trường và giấy tờ xe đối bên (nếu có).</li>
                    <li>Thông báo cho chủ xe để phối hợp đưa xe về garage chính hãng có bảo hiểm chi trả.</li>
                </ol>
                <div class="msg-highlight-box">
                    <i class="fa-solid fa-shield-halved"></i> Toàn bộ xe AZU Car đều được trang bị gói bảo hiểm vật chất xe cơ giới bảo vệ bạn suốt hành trình.
                </div>
            `,
            suggestions: ['Quy định phụ phí quá giờ & vượt km?', 'Tổng đài liên hệ AZU Car?']
        },
        {
            keywords: ['chủ xe', 'cho thuê', 'đăng ký xe', 'hoa hồng', 'doanh thu', 'hợp tác'],
            reply: `
                <p><strong>🔑 Trở thành đối tác Chủ xe trên AZU Car:</strong></p>
                <ul>
                    <li><strong>Điều kiện:</strong> Xe sản xuất từ năm 2018 trở lên, có định vị GPS, đăng kiểm và bảo hiểm bắt buộc còn hạn.</li>
                    <li><strong>Doanh thu hấp dẫn:</strong> Chủ xe nhận từ <strong>80% – 85% giá trị hợp đồng thuê</strong>. Tiền được chuyển vào thứ 2 hàng tuần hoặc sau mỗi chuyến đi.</li>
                    <li><strong>Bảo vệ xe:</strong> AZU Car có hợp đồng pháp lý chặt chẽ và bảo hiểm mở rộng dành riêng cho xe cho thuê tự lái.</li>
                </ul>
                <p>👉 Bạn có thể nhấn vào menu <a href="become-owner.html" style="color:#d1a34b; font-weight:700;">Trở thành chủ xe</a> để đăng ký ngay chỉ mất 5 phút!</p>
            `,
            suggestions: ['Bảo hiểm xe cho thuê được bảo vệ thế nào?', 'Thủ tục thuê xe cần những giấy tờ gì?']
        },
        {
            keywords: ['giá', 'bảng giá', 'chi phí', 'bao nhiêu tiền', 'thuê xe bao nhiêu'],
            reply: `
                <p><strong>💵 Bảng giá thuê xe tự lái tại AZU Car:</strong></p>
                <ul>
                    <li><strong>Xe điện Mini / Sedan phổ thông (VF3, Wuling, Morning, i10):</strong> từ 500.000đ – 700.000đ/ngày.</li>
                    <li><strong>Sedan 5 chỗ gia đình (City, Vios, Accent, Mazda 3):</strong> từ 650.000đ – 850.000đ/ngày.</li>
                    <li><strong>SUV / Crossover gầm cao (Sonet, Seltos, Creta, CX-5):</strong> từ 800.000đ – 1.200.000đ/ngày.</li>
                    <li><strong>MPV 7 chỗ rộng rãi (Xpander, XL7, Veloz, Innova, Carnival):</strong> từ 900.000đ – 1.600.000đ/ngày.</li>
                </ul>
                <p>👉 Bạn có thể vào trang <a href="find.html" style="color:#d1a34b; font-weight:700;">Tìm xe</a> để xem danh sách xe thực tế và giá tốt nhất theo ngày bạn chọn!</p>
            `,
            suggestions: ['Có cần đặt cọc tiền mặt không?', 'Thủ tục thuê xe cần những giấy tờ gì?']
        },
        {
            keywords: ['liên hệ', 'hotline', 'tổng đài', 'số điện thoại', 'sdt', 'email', 'địa chỉ', 'văn phòng'],
            reply: `
                <p><strong>📞 Thông tin liên hệ chính thức AZU Car:</strong></p>
                <ul>
                    <li><strong>Hotline khẩn cấp 24/7:</strong> <a href="tel:19009217" style="color:#ef4444; font-weight:700;">1900 9217</a> (Cứu hộ, đặt xe, hỗ trợ sự cố).</li>
                    <li><strong>Email CSKH:</strong> <a href="mailto:support@azucar.vn">support@azucar.vn</a></li>
                    <li><strong>Văn phòng:</strong> Phường Hải Châu, TP. Đà Nẵng (Giờ mở cửa: 08:00 – 21:00 hàng ngày).</li>
                </ul>
            `,
            suggestions: ['Xử lý khi có va chạm/sự cố?', 'Thủ tục thuê xe gồm những gì?']
        },
        {
            keywords: ['chào', 'hi', 'hello', 'alo', 'chào bạn', 'ad'],
            reply: `
                <p>Dạ xin chào bạn! Rất vui được hỗ trợ bạn hôm nay 😊</p>
                <p>Bạn đang quan tâm đến <strong>thủ tục thuê xe tự lái</strong>, <strong>bảng giá</strong> hay cần hỗ trợ <strong>đăng ký xe cho thuê</strong> ạ? Hãy nhắn cho tôi nhé!</p>
            `,
            suggestions: ['Thủ tục thuê xe cần những giấy tờ gì?', 'Có cần đặt cọc tiền mặt không?', 'Đăng ký xe cho thuê như thế nào?']
        },
        {
            keywords: ['cảm ơn', 'thank', 'thanks', 'cảm ơn bạn', 'ok', 'tuyệt vời'],
            reply: `
                <p>Dạ không có gì ạ! Rất vui vì đã giúp ích được cho bạn ❤️</p>
                <p>Chúc bạn có những chuyến đi tự do, hạnh phúc và an toàn cùng <strong>AZU Car</strong>! Nếu cần hỗ trợ thêm bất kỳ điều gì, bạn cứ nhắn cho tôi nhé!</p>
            `,
            suggestions: ['Tìm xe ngay', 'Thủ tục thuê xe gồm những gì?']
        }
    ];

    function scrollChatToBottom() {
        if (chatMessagesStream) {
            chatMessagesStream.scrollTop = chatMessagesStream.scrollHeight;
        }
    }

    function appendUserMessage(text) {
        const row = document.createElement('div');
        row.className = 'message-row user-row';
        row.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="msg-bubble user-bubble"><p>${escapeHtml(text)}</p></div>
        `;
        chatMessagesStream.appendChild(row);
        scrollChatToBottom();
    }

    function appendBotMessage(htmlContent, suggestions = []) {
        const row = document.createElement('div');
        row.className = 'message-row bot-row';
        row.innerHTML = `
            <div class="msg-avatar bot-avatar-mini"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-bubble bot-bubble">${htmlContent}</div>
        `;
        chatMessagesStream.appendChild(row);

        // Thêm gợi ý câu hỏi tiếp theo
        if (suggestions && suggestions.length > 0) {
            const chipsDiv = document.createElement('div');
            chipsDiv.className = 'chat-prompt-chips';
            suggestions.forEach(item => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'prompt-chip';
                btn.setAttribute('data-prompt', item);
                btn.innerHTML = `<i class="fa-solid fa-lightbulb"></i> ${escapeHtml(item)}`;
                btn.addEventListener('click', () => handleSend(item));
                chipsDiv.appendChild(btn);
            });
            chatMessagesStream.appendChild(chipsDiv);
        }

        scrollChatToBottom();
    }

    function findBotAnswer(userText) {
        const normalized = userText.toLowerCase().trim();

        for (const item of BOT_RESPONSES) {
            const match = item.keywords.some(kw => normalized.includes(kw));
            if (match) {
                return item;
            }
        }

        return {
            reply: `
                <p>Cảm ơn câu hỏi của bạn: <em>"${escapeHtml(userText)}"</em>.</p>
                <p>Bạn có thể thử đặt câu hỏi với các từ khóa ngắn như: <em>giấy tờ, đặt cọc, hủy chuyến, bảo hiểm, bảng giá, chủ xe</em>, hoặc gọi trực tiếp Hotline 24/7 của chúng tôi: <a href="tel:19009217" style="color:#ef4444; font-weight:700;">1900 9217</a> nhé!</p>
            `,
            suggestions: ['Thủ tục thuê xe cần những giấy tờ gì?', 'Có cần đặt cọc tiền mặt không?', 'Xử lý khi có va chạm/sự cố?']
        };
    }

    function handleSend(textToSend) {
        const text = textToSend || chatInputText.value.trim();
        if (!text) return;

        // Xóa prompt chips ban đầu nếu còn
        if (chatPromptChips && chatPromptChips.parentElement) {
            chatPromptChips.remove();
        }

        appendUserMessage(text);
        if (chatInputText) {
            chatInputText.value = '';
        }

        // Hiện typing
        if (typingIndicator) typingIndicator.hidden = false;
        scrollChatToBottom();

        setTimeout(() => {
            if (typingIndicator) typingIndicator.hidden = true;
            const answer = findBotAnswer(text);
            appendBotMessage(answer.reply, answer.suggestions);
        }, 500);
    }

    // Submit form chat
    chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSend();
    });

    // Bắt sự kiện click các gợi ý câu hỏi ban đầu
    document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt) handleSend(prompt);
        });
    });

    // Làm mới cuộc trò chuyện
    btnResetChat?.addEventListener('click', () => {
        chatMessagesStream.innerHTML = `
            <div class="message-row bot-row">
                <div class="msg-avatar bot-avatar-mini"><i class="fa-solid fa-robot"></i></div>
                <div class="msg-bubble bot-bubble">
                    <p><strong>Lịch sử hội thoại đã được làm mới! 🚗</strong></p>
                    <p>Tôi là <strong>Trợ lý ảo AZU Car</strong>. Bạn cần tôi hỗ trợ gì cho chuyến đi sắp tới ạ?</p>
                </div>
            </div>
            <div class="chat-prompt-chips" id="chatPromptChips">
                <button type="button" class="prompt-chip" data-prompt="Thủ tục thuê xe cần những giấy tờ gì?">
                    <i class="fa-solid fa-id-card"></i> Thủ tục thuê xe gồm những gì?
                </button>
                <button type="button" class="prompt-chip" data-prompt="Thuê xe có cần đặt cọc tiền mặt hoặc xe máy không?">
                    <i class="fa-solid fa-money-bill-wave"></i> Có cần đặt cọc tiền mặt không?
                </button>
                <button type="button" class="prompt-chip" data-prompt="Chính sách hủy chuyến và hoàn tiền cọc ra sao?">
                    <i class="fa-solid fa-calendar-xmark"></i> Chính sách hủy chuyến & hoàn cọc?
                </button>
            </div>
        `;
        // Gán lại click cho chips
        chatMessagesStream.querySelectorAll('.prompt-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.getAttribute('data-prompt');
                if (prompt) handleSend(prompt);
            });
        });
        scrollChatToBottom();
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

