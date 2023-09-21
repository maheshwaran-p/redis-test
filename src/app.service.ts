import { Inject, Injectable, Logger } from '@nestjs/common';
import e from 'express';
import { REDIS } from './modules/redis/redis.constants';
import * as _ from 'lodash';
import { format } from 'date-fns';
@Injectable()
export class AppService {
  private readonly frequencyCaps = {
    email: { daily: 1, weekly: 2, monthly: 6 },
    appPush: { daily: 2, weekly: 3, monthly: 10 },
  }

  constructor(
    @Inject(REDIS)
    private readonly redis: any,

  ) {

  }
  getHello(): string {
    return 'Hello World!';
  }


  async globalFrequencyCheck(day, week, month, userId) {

    let dayFrequency = await this.redis.get(`G_${userId}_D:${day}`)
    let weekFrequency = await this.redis.get(`G_${userId}_W:${week}`)
    let monthFrequency = await this.redis.get(`G_${userId}_M:${month}`)

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



  async setFrequency(day, week, month, userId, campaignType) {
    let frequency = await this.redis.get(`${userId}`);

    if (!frequency) {
      frequency = {
        "G": [[month, 0], [week, 0], [day, 0]],
        "P": [[month, 0], [week, 0], [day, 0]],
        "M": [[month, 0], [week, 0], [day, 0]],
        "W": [[month, 0], [week, 0], [day, 0]]
      };
    }
    else {
      frequency = JSON.parse(frequency);
      frequency.G[0][1] += 1;
      frequency.G[1][1] += 1;
      frequency.G[2][1] += 1;

      frequency[`${campaignType}`][0][1] += 1;
      frequency[`${campaignType}`][1][1] += 1;
      frequency[`${campaignType}`][2][1] += 1
    }
    await this.redis.set(`${userId}`, JSON.stringify(frequency), 'ex', 1117200);
    return true;

  }

  async frequencyCheck(day, week, month, userId, campaignType) {
    let frequency = await this.redis.get(`${userId}`);
    if (!frequency) {
      return true;
    }
    else {
      frequency = JSON.parse(frequency)
      if (!(frequency.G[0][0] != month || frequency.G[0][1] < 6) && (frequency.G[1][0] != week || frequency.G[0][1] < 3) && (frequency.G[2][0] != day || frequency.G[0][1] != 1))
        return false;

      if (!(frequency[`${campaignType}`][0][0] != month || frequency[campaignType][0][1] < 6) && (frequency[campaignType][1][0] != week || frequency[campaignType][0][1] < 3) && (frequency[campaignType][2][0] != day || frequency[campaignType][0][1] != 1))
        return false;
    }
    return true;
  }







  async recordNotification(
    userId: number,
    notificationType: string,
  ): Promise<any> {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentWeek = format(now, 'w');
    const currentMonth = format(now, 'M');

    const userHashKey = `${userId}:${notificationType}`;

    await this.redis.hincrby(userHashKey, `daily:${today}`, 1);
    await this.redis.hincrby(userHashKey, `weekly:${currentWeek}`, 1);
    await this.redis.hincrby(userHashKey, `monthly:${currentMonth}`, 1);

    await this.redis.expire(userHashKey, 2592000); // Setting expiration time to 30 days
    await this.redis.hget(userHashKey, `monthly:${currentMonth}`)
    return true;
  }

  async checkFrequencyCap(
    userId: number,
    notificationType: string,
  ): Promise<any> {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentWeek = format(now, 'w');
    const currentMonth = format(now, 'M');

    const userHashKey = `${userId}:${notificationType}`;

    const dailyCount = await this.redis.hget(userHashKey, `daily:${today}`);
    const weeklyCount = await this.redis.hget(
      userHashKey,
      `weekly:${currentWeek}`,
    );
    const monthlyCount = await this.redis.hget(
      userHashKey,
      `monthly:${currentMonth}`,
    );

    if (dailyCount >= this.frequencyCaps[notificationType].daily) {
      return false;
    }
    if (weeklyCount > this.frequencyCaps[notificationType].weekly) {
      return false;
    }
    if (monthlyCount > this.frequencyCaps[notificationType].monthly) {
      return false;
    }

    return true;
  }


}
