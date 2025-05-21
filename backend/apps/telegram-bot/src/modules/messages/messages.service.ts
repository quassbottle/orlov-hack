import { ClickHouseService } from '@app/clickhouse';
import { Injectable } from '@nestjs/common';
import { MessageCreate, MessageModel } from './messages.types';
import { randomUUID } from 'crypto';

@Injectable()
export class MessagesService {
    constructor(private readonly clickhouse: ClickHouseService) {}

    public async create(params: MessageCreate) {
        await this.clickhouse.insert({
            values: { id: randomUUID(), created_at: new Date(), ...params },
            table: 'messages',
        });
    }

    public async findMany() {
        return this.clickhouse.query<MessageModel[]>(`SELECT * FROM messages`);
    }
}
