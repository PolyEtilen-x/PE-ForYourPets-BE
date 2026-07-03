import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotQuestion } from './entities/chatbot-question.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService implements OnModuleInit {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectRepository(ChatbotQuestion)
    private readonly questionRepo: Repository<ChatbotQuestion>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.questionRepo.count();
    if (count === 0) {
      const defaultFAQs = [
        {
          question: 'Camera PE có những tính năng nổi bật gì?',
          answer: 'PE AI Health Camera Pro sở hữu các tính năng đột phá: Phát hiện hành vi (ăn uống, bài tiết) 24/7 bằng công nghệ AI, cảnh báo bất thường sức khỏe kịp thời, camera ban đêm hồng ngoại siêu nét, đàm thoại 2 chiều và lưu trữ đám mây bảo mật.',
        },
        {
          question: 'Chính sách bảo hành và đổi trả thế nào?',
          answer: 'Mọi thiết bị thông minh chính hãng PE đều được bảo hành 1 đổi 1 trong vòng 12 tháng nếu phát sinh lỗi phần cứng từ nhà sản xuất. Bạn có thể mang thiết bị đến đại lý gần nhất hoặc gửi về trung tâm bảo hành của chúng tôi.',
        },
        {
          question: 'Hệ thống hỗ trợ các phương thức thanh toán nào?',
          answer: 'Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) hoặc Chuyển khoản ngân hàng trực tiếp một cách nhanh chóng và an toàn tuyệt đối.',
        },
        {
          question: 'Camera PE kết nối Wi-Fi băng tần nào?',
          answer: 'Phiên bản PE AI Camera Pro hỗ trợ cả Wi-Fi 2.4GHz và 5GHz. Bản Lite nhỏ gọn hỗ trợ Wi-Fi 2.4GHz để tối ưu chi phí và độ phủ sóng.',
        },
        {
          question: 'Thông tin liên hệ bộ phận hỗ trợ khách hàng?',
          answer: 'Bạn có thể gửi yêu cầu hỗ trợ hoặc câu hỏi về địa chỉ email chính thức: tuyendung@helicorp.vn hoặc liên hệ hotline chăm sóc khách hàng 1900-PE-PETS để được trợ giúp 24/7.',
        },
      ];

      for (const faq of defaultFAQs) {
        await this.questionRepo.save(this.questionRepo.create(faq));
      }
      this.logger.log('🌱 Đã seed 5 câu hỏi FAQ chatbot thành công vào database!');
    }
  }

  // Trả về danh sách câu hỏi có sẵn để hiển thị làm gợi ý click cho người dùng
  async getSuggestedQuestions() {
    return this.questionRepo.find({
      select: {
        id: true,
        question: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  // Xử lý câu hỏi của người dùng
  async askQuestion(message: string): Promise<string> {
    const normalizedInput = this.normalizeText(message);

    // 1. Kiểm tra trong DB xem có câu hỏi nào khớp từ khóa chính xác không
    const dbQuestions = await this.questionRepo.find();
    for (const faq of dbQuestions) {
      const normalizedFaq = this.normalizeText(faq.question);
      if (normalizedInput === normalizedFaq || normalizedInput.includes(normalizedFaq) || normalizedFaq.includes(normalizedInput)) {
        return faq.answer;
      }
    }

    // 2. Không khớp câu hỏi có sẵn -> Gọi Gemini API nếu có API key, hoặc dùng AI fallback thông minh
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiKey) {
      try {
        const response = await this.callGemini(message, geminiKey);
        if (response) return response;
      } catch (err) {
        this.logger.error('Lỗi khi gọi Gemini API, chuyển sang fallback', err);
      }
    }

    // 3. Fallback thông minh dựa trên từ khóa nếu không gọi được AI
    return this.getSmartFallback(normalizedInput);
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Loại bỏ dấu tiếng Việt để so sánh tốt hơn
  }

  private async callGemini(message: string, apiKey: string): Promise<string | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `Bạn là Trợ lý Ảo AI chuyên nghiệp của thương hiệu PE - For Your Pets (phát triển bởi Healthy Living Corporation - Helicorp).
Hãy trả lời khách hàng thân thiện, lịch sự, ngắn gọn và chính xác dựa trên thông tin sản phẩm dưới đây:
1. PE AI Health Camera Pro: Giá $69.99 (gốc $99.00). Góc quan sát 130 độ, nhận dạng AI theo hành vi ăn uống/bài tiết, phát hiện sức khỏe bất thường, hoạt động đêm IR, kết nối Wifi 2.4/5GHz.
2. PE AI Health Camera Lite: Giá $49.99 (gốc $69.00). Phân giải 1080p, đế xoay 360 độ cơ học, nguồn cắm điện trực tiếp qua micro-USB.
3. PE Smart Pet Feeder: Giá $79.99 (gốc $119.00). Khay chứa hạt 4L chống ẩm, pin dự phòng D-cell kết hợp cắm điện, loa/mic gọi ăn.
4. PE Smart Water Fountain: Giá $34.99 (gốc $49.00). Lọc 3 lớp màng, bình 2L, hoạt động cực êm dưới 20dB.
5. PE Smart GPS Tracker: Giá $24.99 (gốc $39.00). Định vị GPS+BDS+LBS+Wifi, chống nước IP67, nặng 28g đeo cổ.
Chính sách bảo hành: 1 đổi 1 trong 12 tháng nếu có lỗi sản xuất.
Thanh toán: COD (nhận hàng trả tiền) hoặc Chuyển khoản ngân hàng.
Liên hệ hỗ trợ: tuyendung@helicorp.vn hoặc hotline 1900-PE-PETS.
Trả lời bằng ngôn ngữ của người dùng (Tiếng Việt hoặc Tiếng Anh).`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nKhách hàng hỏi: ${message}\nTrợ lý trả lời:`
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Gemini API trả về lỗi: ${response.status} - ${errText}`);
      return null;
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : null;
  }

  private getSmartFallback(normalizedInput: string): string {
    if (normalizedInput.includes('gia') || normalizedInput.includes('bao nhieu') || normalizedInput.includes('mua')) {
      return 'PE AI Health Camera Pro có giá bán ưu đãi là $69.99 (gốc $99.00). Bạn có thể bấm vào phần Order trên website để chọn mua sản phẩm và điền thông tin đặt hàng nhé!';
    }
    if (normalizedInput.includes('camera') || normalizedInput.includes('tinh nang') || normalizedInput.includes('chuc nang')) {
      return 'Sản phẩm camera giám sát PE AI Camera Pro có khả năng quan sát 130 độ, tích hợp trí tuệ nhân tạo (AI) nhận diện hành vi mèo ăn uống, bài tiết và phát hiện các dấu hiệu sức khỏe bất thường để gửi thông báo kịp thời cho bạn.';
    }
    if (normalizedInput.includes('bao hanh') || normalizedInput.includes('doi tra') || normalizedInput.includes('hong')) {
      return 'Thiết bị PE của chúng tôi được áp dụng chính sách bảo hành 1 đổi 1 trong vòng 12 tháng nếu có lỗi phần cứng từ nhà sản xuất. Bạn hoàn toàn yên tâm sử dụng nhé!';
    }
    if (normalizedInput.includes('lien he') || normalizedInput.includes('hotline') || normalizedInput.includes('email') || normalizedInput.includes('support')) {
      return 'Bạn có thể gửi yêu cầu hỗ trợ trực tiếp đến email tuyendung@helicorp.vn hoặc liên hệ hotline 1900-PE-PETS để được hỗ trợ giải quyết ngay nhé!';
    }
    return 'Xin chào! Tôi là Trợ lý ảo PE AI. Bạn có thể chọn các câu hỏi gợi ý ở trên, hoặc hỏi tôi bất kỳ điều gì về tính năng, giá bán, chế độ bảo hành của thiết bị giám sát sức khỏe thú cưng PE nhé!';
  }
}
