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
import { MessageRecord } from "./api/types";

export interface ClickHouseModuleOptions
  extends NodeClickHouseClientConfigOptions {}

export class ClickHouseService {
  private readonly client: ClickHouseClient;

  constructor(options: ClickHouseModuleOptions) {
    console.log("createClickhouseClient(): init");
    this.client = createClient(options);
  }

  public async query<
    TRow,
    TParams extends Record<string, unknown> | undefined = undefined
  >(query: string, queryParams?: TParams): Promise<TRow[]> {
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
    return this.query<MessageRecord>(query);
  }

  private readonly BASE_LIMIT = 7;

  public async getPagesCount() {
    const query = `SELECT count(*) as count FROM messages`;
    const [result] = await this.query<{ count: number }>(query);

    return Math.floor(result.count / 7) + 1;
  }

  public async getMessages(params: {
    order?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }): Promise<MessageRecord[]> {
    const { order, limit, offset } = params;

    const orderBy = order ? `ORDER BY created_at ${order.toUpperCase()}` : "";

    const query = `
            SELECT *
            FROM messages
            ${orderBy}
            LIMIT ${limit ?? this.BASE_LIMIT}
            OFFSET ${offset ?? 0}
        `;

    return this.query<MessageRecord>(query);
  }

  public async insert<TData extends InsertValues<Readable, unknown>>(params: {
    values: TData;
    table: string;
  }) {
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

const clickhouseClient = new ClickHouseService({
  url: process.env.CLICKHOUSE_URL!,
  username: "admin",
  password: "password",
});

export const clickhouse = singleton("clickhouse", () => clickhouseClient);
