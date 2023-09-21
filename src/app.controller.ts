import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { REDIS } from './modules/redis/redis.constants';
import { CAMPAIGN_TYPE } from './services/constants';
import { format } from 'date-fns';
@Controller()
export class AppController {
  private count = 0;
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,

    @Inject(REDIS)
    private readonly redis: any) { }


  @Get('/first')
  async getIntialApproach() {
    const userId = '1'
    let campaignType = 'MAIL';

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);

    const day = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil(day / 7);
    const month = currentDate.getMonth();

    // approach 1
    // Global frequency check
    let globalCheck = await this.appService.globalFrequencyCheck(day, week, month, userId)

    // Campaign level frequnc check
    let campaignCheck = await this.appService.campaignFrequencyCheck(day, week, month, userId, campaignType)




    if (globalCheck && campaignCheck) {
      console.log('WOW. now we can send mail')
    }
    else {
      console.log('We reached maxium limit')
    }

  }

  @Get('second/set')
  async getSecondApproachSet() {
    console.log('set')
    let campaignType = 'M';

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);

    const day = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil(day / 7);
    const month = currentDate.getMonth();

    campaignType = CAMPAIGN_TYPE.MAIL;
    return await this.appService.setFrequency(day, week, month, 130, campaignType);
  }

  @Get('second/check')
  async getSecondApproach() {
    console.log('check')
    console.log(this.count);
    this.count = this.count + 1;
    const userId = '1'
    let campaignType = 'M';

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);

    const day = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil(day / 7);
    const month = currentDate.getMonth();

    campaignType = CAMPAIGN_TYPE.MAIL;
    return await this.appService.frequencyCheck(day, week, month, 130, campaignType);

  }


  @Get('/third/check')
  async check() {
    console.log('check')
    console.log(this.count);
    this.count = this.count + 1;
    return this.appService.checkFrequencyCap(130, 'email')
  }
  @Get('/third/set')
  async increment() {
    console.log('set')
    console.log(this.count);
    this.count = this.count + 1;
    return this.appService.recordNotification(130, 'email')
  }


  @Get('data/cruncher/:approach')
  async dataCruncher(@Param() param) {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);

    const day = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil(day / 7);
    const month = currentDate.getMonth();
    param.approach == 2

    console.log(param.approach)
    let campaignTypeLst
    if (param.approach == 1)
      campaignTypeLst = ['M', 'P', 'W']
    else
      campaignTypeLst = ['email', 'push', 'web', 'global']
    for (let i = 1; i <= 100000; i++) {
      for (const campaignType of campaignTypeLst) {
        console.log(i, campaignType)
        if (param.approach == 1)
          await this.appService.setFrequency(day, week, month, i, campaignType);
        else
          await this.appService.recordNotification(i, campaignType)
      }
    }
  }

}
