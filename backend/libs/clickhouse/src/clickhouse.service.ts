import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClickHouseModuleOptions } from './clickhouse.types';
import {
    ClickHouseClient,
    createClient,
    InputJSON,
    InsertValues,
} from '@clickhouse/client';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class ClickHouseService {
    private readonly logger = new Logger(ClickHouseService.name);
    private readonly client: ClickHouseClient;

    constructor(
        @Inject('CLICKHOUSE_CONFIG')
        options: ClickHouseModuleOptions,
    ) {
        this.logger.log('createClickhouseClient(): init');

        this.client = createClient(options);
    }

    public async query<
        TResult,
        TParams extends Record<string, unknown> | undefined = undefined,
    >(query: string, queryParams?: TParams) {
        const timerLabel = `clickhouse-query [${query.substring(0, 25).replace(/[\n\t\s]+/gi, ' ')}][${randomUUID()}]`;

        console.time(timerLabel);
        const res = await this.client.query({
            query,
            query_params: queryParams,
        });

        const json = await res.json<TResult>();
        console.timeEnd(timerLabel);

        return json;
    }

    async insert<TData extends InsertValues<Readable, unknown>>(
        params: {
            values: TData;
            table: string;
        },
        settings?: { waitAsyncInsert: boolean },
    ) {
        console.log('insert', params.values);
        await this.client.insert({
            table: params.table,
            values: params.values,
            format: 'JSONEachRow',
            clickhouse_settings: {
                date_time_input_format: 'best_effort',
                async_insert: 1,
                wait_for_async_insert: 1,
            },
        });
    }
}
