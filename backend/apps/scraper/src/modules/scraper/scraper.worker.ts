import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ScraperWorker implements OnModuleInit {
    constructor(
        @Inject('SCRAPER_PRODUCER')
        private readonly producer: ClientKafka,
    ) {}

    async onModuleInit() {
        
    }
}
