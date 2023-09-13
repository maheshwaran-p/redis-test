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

    let dayFrequency = await this.redis.get(`G_${userId}_${day}`)
    let weekFrequency = await this.redis.get(`G_${userId}_${week}`)
    let monthFrequency = await this.redis.get(`G_${userId}_${month}`)

    console.log(weekFrequency)
    console.log(`G_${userId}_${week}`)
    if (!dayFrequency) { await this.redis.set(`G_${userId}_${day}`, 1, 'ex', 30); }
    if (!weekFrequency) { await this.redis.set(`G_${userId}_${week}`, 1, 'ex', 30); weekFrequency = 1 }
    else { weekFrequency = parseInt(weekFrequency) + 1; await this.redis.set(`G_${userId}_${week}`, weekFrequency, 'ex', 30); }
    if (!monthFrequency) { await this.redis.set(`G_${userId}_${month}`, 1, 'ex', 30); monthFrequency = 1 }
    else { monthFrequency = parseInt(monthFrequency) + 1; await this.redis.set(`G_${userId}_${month}`, monthFrequency, 'ex', 30); }


    if (parseInt(weekFrequency) <= 3 && parseInt(monthFrequency) <= 6 && parseInt(dayFrequency) == 1)
      return true;
    else return false;
  }

  async campaignFrequencyCheck(day, week, month, userId, campaignType) {

    let dayFrequency = await this.redis.get(`${campaignType}_${userId}_${day}`)
    let weekFrequency = await this.redis.get(`${campaignType}_${userId}_${week}`)
    let monthFrequency = await this.redis.get(`${campaignType}_${userId}_${month}`)

    if (!dayFrequency) { await this.redis.set(`${campaignType}_${userId}_${day}`, 1, 'ex', 30); }
    if (!weekFrequency) { await this.redis.set(`${campaignType}_${userId}_${week}`, 1, 'ex', 30); weekFrequency = 1 }
    else { weekFrequency = parseInt(weekFrequency) + 1; await this.redis.set(`${campaignType}_${userId}_${week}`, weekFrequency, 'ex', 30); }
    if (!monthFrequency) { await this.redis.set(`${campaignType}_${userId}_${month}`, 1, 'ex', 30); monthFrequency = 1 }
    else { monthFrequency = parseInt(monthFrequency) + 1; await this.redis.set(`${campaignType}_${userId}_${month}`, monthFrequency, 'ex', 30); }

    if (weekFrequency <= 3 && monthFrequency <= 6 && dayFrequency == 1)
      return true;
    else return false;

  }
}
