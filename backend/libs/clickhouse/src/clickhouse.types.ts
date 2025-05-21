import { NodeClickHouseClientConfigOptions } from '@clickhouse/client/dist/config';
import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export interface ClickHouseModuleOptions
    extends NodeClickHouseClientConfigOptions {}

export interface ClickHouseModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
    name?: string;
    useExisting?: Type<ClickHouseModuleOptions>;
    useClass?: Type<ClickHouseModuleOptions>;
    useFactory?: (
        ...args: Array<any>
    ) => Promise<ClickHouseModuleOptions> | ClickHouseModuleOptions;
    inject?: Array<any>;
    extraProviders?: Array<Provider>;
}
