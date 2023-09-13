import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS } from './redis.constants';
const redis = require('ioredis')

@Module({
    providers: [
        {
            provide: REDIS,
            useFactory: async (configService: ConfigService) => {
                const client = new redis({
                    host: '127.0.0.1',
                    port: 6379,
                });
                client.set('key', 100, 'ex', 1); //ex denotes seconds, px denotes miliseconds
                return client;
            },
            inject: [ConfigService],
        },
    ],
    exports: [REDIS],
})
export class RedisModule { }
