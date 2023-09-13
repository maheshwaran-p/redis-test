import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { REDIS } from './modules/redis/redis.constants';

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
    const campaignType = 'M';
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);

    const day = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil(day / 7);
    const month = currentDate.getMonth();



    console.log(day)
    console.log(week)
    console.log(month)



    this.appService.globalFrequencyCheck(day, week, month, userId)
    this.appService.campaignFrequencyCheck(day, week, month, userId, campaignType)


    // console.log(await this.redis.get('key1'))
    return this.appService.getHello();
  }


}
