import { Inject, Injectable } from '@nestjs/common';
import { REDIS } from './modules/redis/redis.constants';

@Injectable()
export class AppService {

  constructor(
    @Inject(REDIS)
    private readonly redis: any
  ) {

  }
  getHello(): string {
    return 'Hello World!';
  }

  async globalFrequencyCheck(day, week, month, userId) {

    const dayFrequency = await this.redis.get(`G_${userId}-${day}`)
    const weekFrequency = await this.redis.get(`G_${userId}-${week}`)
    const monthFrequency = await this.redis.get(`G_${userId}-${month}`)
    console.log(weekFrequency)
    console.log(`G_${userId}-${week}`)
    if (!dayFrequency) { await this.redis.set(`G_${userId}-${day}`, 1, 'ex', 1); }
    if (!weekFrequency) { await this.redis.set(`G_${userId}-${week}`, 1, 'ex', 1); }
    if (!monthFrequency) { await this.redis.set(`G_${userId}-${month}`, 1, 'ex', 1); }

    // if(weekFrequency<3){

    // }
    return true;
  }

  campaignFrequencyCheck(day, week, month, userId, campaignType) {
    return true;
  }
}
