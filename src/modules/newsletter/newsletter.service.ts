import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepo: Repository<NewsletterSubscriber>,
  ) {}

  // Đăng ký email newsletter (public)
  async subscribe(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    // Kiểm tra email đã đăng ký chưa
    const existing = await this.subscriberRepo.findOne({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Email này đã đăng ký nhận bản tin rồi.');
      }
      // Nếu đã bị hủy trước đó thì kích hoạt lại
      existing.isActive = true;
      await this.subscriberRepo.save(existing);
      this.logger.log(`Re-subscribed: ${cleanEmail}`);
      return { success: true, message: 'Đăng ký thành công!', email: cleanEmail };
    }

    const subscriber = this.subscriberRepo.create({ email: cleanEmail });
    await this.subscriberRepo.save(subscriber);
    this.logger.log(`New subscriber: ${cleanEmail}`);

    return { success: true, message: 'Đăng ký thành công!', email: cleanEmail };
  }

  // Lấy danh sách tất cả subscriber (chỉ admin dùng)
  findAll() {
    return this.subscriberRepo.find({ order: { subscribedAt: 'DESC' } });
  }

  // Xóa (hủy đăng ký) 1 email theo ID (chỉ admin dùng)
  async remove(id: string) {
    const subscriber = await this.subscriberRepo.findOne({ where: { id } });

    if (!subscriber) {
      throw new NotFoundException(`Không tìm thấy subscriber với ID: ${id}`);
    }

    subscriber.isActive = false;
    await this.subscriberRepo.save(subscriber);
    return { message: `Đã hủy đăng ký email: ${subscriber.email}` };
  }

  // Đếm tổng số subscriber đang active (dùng cho admin dashboard)
  countActive() {
    return this.subscriberRepo.count({ where: { isActive: true } });
  }
}
