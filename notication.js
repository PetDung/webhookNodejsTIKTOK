

export async function getShop(shopId) {
    const url = `https://api.roninteam.store/webhook/details/${shopId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi thực hiện yêu cầu:', error);
    }

}


//Telegram bot
export async function sendMessageToGroup(token, chatId, message) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML' // Tùy chọn: 'HTML' hoặc 'Markdown' để định dạng văn bản
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.ok) {
            console.log('✅ Tin nhắn đã được gửi thành công!');
            // console.log(data); // In ra toàn bộ phản hồi nếu cần
        } else {
            console.error('❌ Gửi tin nhắn thất bại:', data.description);
        }
    } catch (error) {
        console.error('Lỗi khi thực hiện yêu cầu:', error);
    }
}

export async function sendNotication(message, type) {

    const token = "7984445379:AAFU3b9w__TG1IG99FAyHR7BqiyGfmVGE7k";
    const chatId = "-1003152164716";

    const shop = await getShop(message.shopId);
    const shopName = shop.result.userShopName;

    switch (type) {
        case 'PRODUCT':
            let productId = message.productId;
            let errorMessage = message.suspended_reason;

            var textMessage = `🛒 <b>Sản phẩm lỗi tại ${shopName}!</b>\n\n` +
                  `❗️ <b>Lý do:</b> ${errorMessage}\n` +
                  `📦 <b>Mã sản phẩm:</b> <code>${productId}</code>\n` +
                  `👉 Vui lòng kiểm tra và xử lý ngay!\n`
            await sendMessageToGroup(token, chatId, textMessage);
            break;   
        default:
            break;
    }    

}