import {
    ClickHouseClient,
    createClient,
    InsertValues,
    ResponseJSON,
} from "@clickhouse/client";
import { NodeClickHouseClientConfigOptions } from "@clickhouse/client/dist/config";
import { Readable } from "stream";
import { singleton } from "./singleton";
import { randomUUID } from "crypto";

// Тип строки таблицы messages
export interface MessageRecord {
    id: string;
    source: string;
    from: string;
    message: string;
    created_at: Date;
    address: string;
    data?: string;
    [key: string]: unknown;
}

// Конфигурация подключения
export interface ClickHouseModuleOptions
    extends NodeClickHouseClientConfigOptions {}

export class ClickHouseService {
    private readonly client: ClickHouseClient;

    constructor(options: ClickHouseModuleOptions) {
        console.log("createClickhouseClient(): init");
        this.client = createClient(options);
    }

    public async query<
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TParams extends Record<string, unknown> | undefined = undefined
  >(
    query: string,
    queryParams?: TParams
  ): Promise<TRow[]> {
    const timerLabel = `clickhouse-query [${query
      .substring(0, 25)
      .replace(/[\n\t\s]+/gi, " ")}][${randomUUID()}]`;
  
    console.time(timerLabel);
    const res = await this.client.query({
      query,
      query_params: queryParams,
    });
  
    const result: ResponseJSON<TRow> = await res.json();
    console.timeEnd(timerLabel);
  
    return result.data;
  }
  


    public async getTableInfo(): Promise<MessageRecord[]> {
        const query = `SELECT * FROM messages`;
        return await this.query<MessageRecord>(query);

    }

    public async insert<TData extends InsertValues<Readable, unknown>>(
        params: {
            values: TData;
            table: string;
        }
    ) {
        console.log("insert", params.values);
        await this.client.insert({
            table: params.table,
            values: params.values,
            format: "JSONEachRow",
            clickhouse_settings: {
                date_time_input_format: "best_effort",
                async_insert: 1,
                wait_for_async_insert: 1,
            },
        });
    }
}

// Инициализация клиента и экспорт через singleton
const clickhouseClient = new ClickHouseService({
    url: process.env.CLICKHOUSE_URL!,
});

export const clickhouse = singleton("clickhouse", () => clickhouseClient);
