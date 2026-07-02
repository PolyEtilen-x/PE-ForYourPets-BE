import { Injectable, ConflictException, Logger } from '@nestjs/common';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private readonly subscribers = new Set<string>();

  subscribe(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    
    if (this.subscribers.has(cleanEmail)) {
      this.logger.warn(`Duplicate subscription attempt for: ${cleanEmail}`);
      throw new ConflictException('This email is already subscribed.');
    }

    this.subscribers.add(cleanEmail);
    this.logger.log(`New subscriber registered: ${cleanEmail}`);
    
    return {
      success: true,
      message: 'Subscription successful',
      email: cleanEmail,
    };
  }

  getSubscribers(): string[] {
    return Array.from(this.subscribers);
  }
}
