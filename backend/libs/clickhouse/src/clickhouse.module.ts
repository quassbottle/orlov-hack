import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ClickHouseService } from './clickhouse.service';
import {
    ClickHouseModuleAsyncOptions,
    ClickHouseModuleOptions,
} from './clickhouse.types';

@Global()
@Module({})
export class ClickHouseModule {
    static forRoot(params: ClickHouseModuleOptions): DynamicModule {
        return {
            module: ClickHouseModule,
            providers: [
                {
                    provide: 'CLICKHOUSE_CONFIG',
                    useValue: params,
                },
                ClickHouseService,
            ],
            exports: [ClickHouseService],
        };
    }

    static forRootAsync(options: ClickHouseModuleAsyncOptions): DynamicModule {
        const asyncProviders = this.createAsyncProviders(options);

        return {
            module: ClickHouseModule,
            imports: options.imports || [],
            providers: [
                ...asyncProviders,
                ClickHouseService,
                ...(options.extraProviders || []),
            ],
            exports: [ClickHouseService],
        };
    }

    private static createAsyncProviders(
        options: ClickHouseModuleAsyncOptions,
    ): Array<Provider> {
        if (options.useFactory) {
            return [
                {
                    provide: 'CLICKHOUSE_CONFIG',
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
            ];
        }

        if (options.useClass) {
            return [
                {
                    provide: 'CLICKHOUSE_CONFIG',
                    useFactory: async (
                        optionsFactory: ClickHouseModuleOptions,
                    ) => optionsFactory,
                    inject: [options.useClass],
                },
                {
                    provide: options.useClass,
                    useClass: options.useClass,
                },
            ];
        }

        if (options.useExisting) {
            return [
                {
                    provide: 'CLICKHOUSE_CONFIG',
                    useFactory: async (
                        optionsFactory: ClickHouseModuleOptions,
                    ) => optionsFactory,
                    inject: [options.useExisting],
                },
            ];
        }

        throw new Error('Invalid async options');
    }
}
