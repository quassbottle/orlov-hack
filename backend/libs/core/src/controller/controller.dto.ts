import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationQuery {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @ApiPropertyOptional()
    skip: number = 0;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @ApiPropertyOptional()
    take: number = 10;

    constructor(take = 10, skip = 0) {
        this.take = take;
        this.skip = skip;
    }
}