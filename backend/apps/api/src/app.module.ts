import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/db';

@Module({
    imports: [PrismaModule, ConfigModule.forRoot()],
})
export class AppModule {}
