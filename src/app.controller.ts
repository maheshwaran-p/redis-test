import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { REDIS } from './modules/redis/redis.constants';
import { CAMPAIGN_TYPE } from './services/constants';
import { format } from 'date-fns';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @Inject(REDIS)
    private readonly redis: any) { }

  @Get()
  async getHello() {
    const userId = '1'
    let campaignType = 'MAIL';

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);

    const day = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil(day / 7);
    const month = currentDate.getMonth();

    // approach 1
    // Global frequency check 
    // let globalCheck = await this.appService.globalFrequencyCheck(day, week, month, userId)

    // Campaign level frequnc check
    // let campaignCheck = await this.appService.campaignFrequencyCheck(day, week, month, userId, campaignType)




    // if (globalCheck && campaignCheck) {
    //   console.log('WOW. now we can send mail')
    // }
    // else {
    //   console.log('We reached maxium limit')
    // }

    const userIds = [1, 2]
    campaignType = CAMPAIGN_TYPE.MAIL;
    await this.appService.frequencyCheck(day, week, month, userIds, campaignType);
    return this.appService.getHello();
  }


  @Get('/check')
  async check() {
    console.log('check')
    return this.appService.checkFrequencyCap(130, 'email')
  }
  @Get('/set')
  async increment() {
    console.log('set')
    return this.appService.recordNotification(130, 'email')
  }

}
