import { Inject, Injectable, Logger } from '@nestjs/common';
import e from 'express';
import { REDIS } from './modules/redis/redis.constants';
import * as _ from 'lodash';
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
      if (!frequency) {
        frequency = {
          "G": [[8, 5], [37, 0], [254, 0]], // this row represents global frequency
          "P": [[8, 0], [37, 0], [254, 0]], // this row represents push frequency
          "M": [[8, 5], [37, 3], [254, 0]], // this row represents mail frequency
          "W": [[8, 0], [37, 0], [254, 0]]  // this row represents web frequency
        };
        await this.redis.set(`${userId}`, JSON.stringify(frequency), 'ex', 7200);

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










  // async storeArrayAsList(key, array) {
  //   await this.redis.rpush(key, ...array);
  // }

  // // Retrieving an array from Redis (List)
  // async getArrayFromList(key) {
  //   return await this.redis.lrange(key, 0, -1);
  // }


  // async storeArrayInRedis(userId: string, data: any[]): Promise<void> {
  //   // Use the rpush method to push the entire array to a Redis list
  //   await this.redis.rpush(userId, ...data);
  // }


  // async getArrayFromRedis(userId: string): Promise<any[]> {
  //   // Use the lrange method to retrieve the entire array from the Redis list
  //   const arrayData = await this.redis.lrange(userId, 0, -1);

  //   // You may need to parse the array elements based on their data type
  //   // For example, if your array contains JSON data:
  //   return arrayData.map(JSON.parse);
  // }

}
