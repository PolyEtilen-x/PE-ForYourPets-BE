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
  ) { }

  async onModuleInit() {
    // Check if any existing record lacks questionEn to force a re-seed of bilingual data
    const existing = await this.questionRepo.find();
    const needsReseed = existing.length === 0 || existing.some((q) => !q.questionEn);

    if (needsReseed) {
      this.logger.log('🔄 Đang làm mới dữ liệu FAQ chatbot sang chế độ song ngữ...');
      try {
        await this.questionRepo.clear();
      } catch (e) {
        // Fallback in case truncate is blocked by foreign key or constraints
        await this.questionRepo.delete({});
      }

      const defaultFAQs = [
        {
          question: 'Camera PE có những tính năng nổi bật gì?',
          questionEn: 'What are the key features of the PE Camera?',
          answer: 'PE AI Health Camera Pro sở hữu các tính năng đột phá: Phát hiện hành vi (ăn uống, bài tiết) 24/7 bằng công nghệ AI, cảnh báo bất thường sức khỏe kịp thời, camera ban đêm hồng ngoại siêu nét, đàm thoại 2 chiều và lưu trữ đám mây bảo mật.',
          answerEn: 'PE AI Health Camera Pro features cutting-edge capabilities: 24/7 AI-powered behavior detection (feeding, waste elimination), real-time health anomaly alerts, high-definition infrared night vision, two-way audio, and secure cloud storage.',
        },
        {
          question: 'Chính sách bảo hành và đổi trả thế nào?',
          questionEn: 'What is the warranty and return policy?',
          answer: 'Mọi thiết bị thông minh chính hãng PE đều được bảo hành 1 đổi 1 trong vòng 12 tháng nếu phát sinh lỗi phần cứng từ nhà sản xuất. Bạn có thể mang thiết bị đến đại lý gần nhất hoặc gửi về trung tâm bảo hành của chúng tôi.',
          answerEn: 'All genuine PE smart devices are covered by a 1-to-1 replacement warranty for 12 months for any manufacturer hardware defects. You can bring the device to the nearest dealer or send it to our warranty center.',
        },
        {
          question: 'Hệ thống hỗ trợ các phương thức thanh toán nào?',
          questionEn: 'What payment methods are supported?',
          answer: 'Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) hoặc Chuyển khoản ngân hàng trực tiếp một cách nhanh chóng và an toàn tuyệt đối.',
          answerEn: 'We support Cash on Delivery (COD) and direct Bank Transfer, ensuring quick and 100% secure payments.',
        },
        {
          question: 'Camera PE kết nối Wi-Fi băng tần nào?',
          questionEn: 'What Wi-Fi bands does the PE Camera support?',
          answer: 'Phiên bản PE AI Camera Pro hỗ trợ cả Wi-Fi 2.4GHz và 5GHz. Bản Lite nhỏ gọn hỗ trợ Wi-Fi 2.4GHz để tối ưu chi phí và độ phủ sóng.',
          answerEn: 'The PE AI Camera Pro version supports dual-band Wi-Fi (2.4GHz and 5GHz), while the compact Lite version supports 2.4GHz Wi-Fi for optimized cost and coverage.',
        },
        {
          question: 'Thông tin liên hệ bộ phận hỗ trợ khách hàng?',
          questionEn: 'How do I contact customer support?',
          answer: 'Bạn có thể gửi yêu cầu hỗ trợ hoặc câu hỏi về địa chỉ email chính thức: polyetilen.vn@gmail.com hoặc liên hệ hotline chăm sóc khách hàng 036.4820.490 để được trợ giúp 24/7.',
          answerEn: 'You can send support requests to our official email: polyetilen.vn@gmail.com or call our 24/7 customer service hotline at 036.4820.490.',
        },
      ];

      for (const faq of defaultFAQs) {
        await this.questionRepo.save(this.questionRepo.create(faq));
      }
      this.logger.log('🌱 Đã seed 5 câu hỏi FAQ chatbot song ngữ thành công vào database!');
    }
  }

  // Trả về gợi ý theo ngôn ngữ (locale)
  async getSuggestedQuestions(locale = 'vi') {
    const list = await this.questionRepo.find({
      order: { createdAt: 'ASC' },
    });

    return list.map((q) => ({
      id: q.id,
      question: locale === 'en' && q.questionEn ? q.questionEn : q.question,
    }));
  }

  // Xử lý câu hỏi dựa trên ngôn ngữ (locale)
  async askQuestion(message: string, locale = 'vi'): Promise<string> {
    const normalizedInput = this.normalizeText(message);

    // 1. Kiểm tra trong DB câu hỏi khớp (cả tiếng Anh lẫn tiếng Việt)
    const dbQuestions = await this.questionRepo.find();
    for (const faq of dbQuestions) {
      const normVi = this.normalizeText(faq.question);
      const normEn = faq.questionEn ? this.normalizeText(faq.questionEn) : '';

      const isMatch =
        normalizedInput === normVi ||
        normalizedInput.includes(normVi) ||
        normVi.includes(normalizedInput) ||
        (normEn && (normalizedInput === normEn || normalizedInput.includes(normEn) || normEn.includes(normalizedInput)));

      if (isMatch) {
        return locale === 'en' && faq.answerEn ? faq.answerEn : faq.answer;
      }
    }

    // 2. Không khớp câu hỏi có sẵn -> Gọi Gemini API nếu có API key
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiKey) {
      try {
        const response = await this.callGemini(message, geminiKey, locale);
        if (response) return response;
      } catch (err) {
        this.logger.error('Lỗi khi gọi Gemini API, chuyển sang fallback', err);
      }
    }

    // 3. Fallback thông minh theo ngôn ngữ
    return this.getSmartFallback(normalizedInput, locale);
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Loại bỏ dấu tiếng Việt để so sánh tốt hơn
  }

  private async callGemini(message: string, apiKey: string, locale: string): Promise<string | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const outputLanguage = locale === 'en' ? 'English' : 'Vietnamese';

    const systemPrompt = `You are a professional AI Assistant for the brand PE - For Your Pets (developed by Healthy Living Corporation - Helicorp).
You must answer questions strictly based on the following product information:
1. PE AI Health Camera Pro: Price $69.99 (original $99.00). 130-degree wide angle, 24/7 AI behavior tracking (eating, waste elimination), anomaly alert notifications, infrared night vision, two-way audio, dual-band Wi-Fi 2.4/5GHz.
2. PE AI Health Camera Lite: Price $49.99 (original $69.00). 1080p resolution, mechanical 360-degree rotation base, micro-USB power cable.
3. PE Smart Pet Feeder: Price $79.99 (original $119.00). 4L dry container, D-cell backup batteries + wall plugin, voice call speakers.
4. PE Smart Water Fountain: Price $34.99 (original $49.00). 3-stage filtration, 2L capacity, ultra-quiet < 20dB.
5. PE Smart GPS Tracker: Price $24.99 (original $39.00). GPS+BDS+LBS+Wi-Fi tracking, IP67 waterproof, 28g neck collar weight.
Warranty Policy: 1-to-1 replacement for 12 months for any manufacturer hardware defects.
Payment: Cash on Delivery (COD) or direct Bank Transfer.
Support Contacts: polyetilen.vn@gmail.com or hotline 036.4820.490.

CRITICAL RULES:
1. You are ONLY allowed to answer questions that are directly related to the PE products listed above, their pricing, warranty, support contacts, or payments.
2. If the user asks about unrelated topics (e.g. general knowledge, programming, jokes, recipes, weather, other brands, capital of countries, general pet health tips not related to our devices, etc.), you MUST politely decline to answer.
3. For unrelated questions, reply exactly with:
   - In Vietnamese: "Tôi chỉ có thể hỗ trợ các thông tin liên quan đến sản phẩm và dịch vụ của PE - For Your Pets. Vui lòng đặt câu hỏi khác liên quan."
   - In English: "I can only assist with information related to PE - For Your Pets products and services. Please ask a related question."
4. You MUST reply only in ${outputLanguage}.`;

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
                text: `${systemPrompt}\n\nCustomer asks: ${message}\nAssistant replies:`
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Gemini API returned error: ${response.status} - ${errText}`);
      return null;
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : null;
  }

  private getSmartFallback(normalizedInput: string, locale: string): string {
    const isEn = locale === 'en';

    if (normalizedInput.includes('gia') || normalizedInput.includes('bao nhieu') || normalizedInput.includes('mua') || normalizedInput.includes('price') || normalizedInput.includes('cost') || normalizedInput.includes('buy')) {
      return isEn
        ? 'PE AI Health Camera Pro is currently offered at $69.99 (original $99.00). You can click on "Order" in the navigation bar to select items and place your order!'
        : 'PE AI Health Camera Pro có giá bán ưu đãi là $69.99 (gốc $99.00). Bạn có thể bấm vào phần Order trên website để chọn mua sản phẩm và điền thông tin đặt hàng nhé!';
    }
    if (normalizedInput.includes('camera') || normalizedInput.includes('tinh nang') || normalizedInput.includes('chuc nang') || normalizedInput.includes('feature')) {
      return isEn
        ? 'The PE AI Health Camera Pro features 130-degree wide angle view, and utilizes advanced AI technology to track cat eating and waste behavior, sending immediate alerts on abnormal signs.'
        : 'Sản phẩm camera giám sát PE AI Camera Pro có khả năng quan sát 130 độ, tích hợp trí tuệ nhân tạo (AI) nhận diện hành vi mèo ăn uống, bài tiết và phát hiện các dấu hiệu sức khỏe bất thường để gửi thông báo kịp thời cho bạn.';
    }
    if (normalizedInput.includes('bao hanh') || normalizedInput.includes('doi tra') || normalizedInput.includes('hong') || normalizedInput.includes('warranty') || normalizedInput.includes('repair')) {
      return isEn
        ? 'All PE devices come with a 1-to-1 replacement warranty for 12 months for any manufacturer hardware defects. You can buy and use them with complete peace of mind!'
        : 'Thiết bị PE của chúng tôi được áp dụng chính sách bảo hành 1 đổi 1 trong vòng 12 tháng nếu có lỗi phần cứng từ nhà sản xuất. Bạn hoàn toàn yên tâm sử dụng nhé!';
    }
    if (normalizedInput.includes('lien he') || normalizedInput.includes('hotline') || normalizedInput.includes('email') || normalizedInput.includes('support') || normalizedInput.includes('contact')) {
      return isEn
        ? 'You can send support requests directly to our email polyetilen.vn@gmail.com or call our hotline 036.4820.490 for immediate assistance!'
        : 'Bạn có thể gửi yêu cầu hỗ trợ trực tiếp đến email polyetilen.vn@gmail.com hoặc liên hệ hotline 036.4820.490 để được hỗ trợ giải quyết ngay nhé!';
    }

    return isEn
      ? 'Hello! I am PE AI Assistant. You can click on the suggested questions above, or ask me anything about the features, pricing, and warranty policies of PE products!'
      : 'Xin chào! Tôi là Trợ lý ảo PE AI. Bạn có thể chọn các câu hỏi gợi ý ở trên, hoặc hỏi tôi bất kỳ điều gì về tính năng, giá bán, chế độ bảo hành của thiết bị giám sát sức khỏe thú cưng PE nhé!';
  }
}
