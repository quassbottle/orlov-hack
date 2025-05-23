import { ClickHouseService } from '@app/clickhouse';
import { Injectable } from '@nestjs/common';
import { MessageModel } from './messages.types';
import { ProducerModel } from '../bot/bot.update';

@Injectable()
export class MessagesService {
    constructor(private readonly clickhouse: ClickHouseService) {}

    public async create(params: ProducerModel) {
        await this.clickhouse.insert({
            values: { ...params },
            table: 'messages',
        });
    }

    public async findMany() {
        return this.clickhouse.query<MessageModel[]>(`SELECT * FROM messages`);
    }
}

