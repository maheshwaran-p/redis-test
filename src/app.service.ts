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





  async frequencyCheck(day, week, month, userIds, campaignType) {
    let filteredUserIdsList = userIds;
    for (const userId of userIds) {
      let frequency = await this.redis.get(`${userId}`);
      await this.redis.hmset(
        userId,
        'global',
        JSON.stringify([[8, 5], [37, 0], [254, 0]]),
        'push',
        JSON.stringify([[8, 0], [37, 0], [254, 0]]),
        'mail',
        JSON.stringify([[8, 5], [37, 3], [254, 0]]),
        'web',
        JSON.stringify([[8, 0], [37, 0], [254, 0]])
      );


      if (!frequency) {
        // frequency = {
        //   0: [[8, 5], [37, 0], [254, 0]], // this row represents global frequency
        //   1: [[8, 0], [37, 0], [254, 0]], // this row represents push frequency
        //   2: [[8, 5], [37, 3], [254, 0]], // this row represents mail frequency
        //   3: [[8, 0], [37, 0], [254, 0]]  // this row represents web frequency
        // };
        // await this.redis.set(`${userId}`, frequency, 'ex', 7200);

      }
      else {

        console.log(userId)
        frequency = JSON.parse(frequency)

        if ((frequency.G[0][0] != month || frequency.G[0][1] < 6) && (frequency.G[1][0] != week || frequency.G[0][1] < 3) && (frequency.G[2][0] != day || frequency.G[0][1] != 1)) {
          Logger.log('GLOBAL FREQ IS AVALABLE : ', userId)
        }
        else {
          Logger.log('GLOBAL FREQ IS NOT AVALABLE : ', userId);
          filteredUserIdsList = _.remove(filteredUserIdsList, userId);
        }
        if ((frequency[`${campaignType}`][0][0] != month || frequency[campaignType][0][1] < 6) && (frequency[campaignType][1][0] != week || frequency[campaignType][0][1] < 3) && (frequency[campaignType][2][0] != day || frequency[campaignType][0][1] != 1)) {
          Logger.log('CAMPAIGN LEVEL FREQ IS AVALABLE : ', userId)
        }
        else {
          Logger.log('CAMPAIGN LEVEL FREQ IS NOT AVALABLE FOR USER : ', userId)
          filteredUserIdsList = _.remove(filteredUserIdsList, userId);
        }
      }
    }

    console.log('filteredUserIdsList:', filteredUserIdsList);
  }




  async recordNotification(
    userId: number,
    notificationType: string,
  ): Promise<void> {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentWeek = format(now, 'w');
    const currentMonth = format(now, 'M');

    const userHashKey = `${userId}:${notificationType}`;

    await this.redis.hincrby(userHashKey, `daily:${today}`, 1);
    await this.redis.hincrby(userHashKey, `weekly:${currentWeek}`, 1);
    await this.redis.hincrby(userHashKey, `monthly:${currentMonth}`, 1);

    await this.redis.expire(userHashKey, 2592000); // Setting expiration time to 30 days
    return await this.redis.hget(userHashKey, `monthly:${currentMonth}`)
  }

  async checkFrequencyCap(
    userId: number,
    notificationType: string,
  ): Promise<boolean> {
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
