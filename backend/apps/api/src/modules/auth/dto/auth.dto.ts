import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class TokenDto {
    @ApiProperty()
    @IsString()
    token: string;
}

export class SignInResponseDto {
    @ApiProperty({ required: true })
    @Expose()
    @IsNumber()
    id: number;

    @ApiProperty({ required: true })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({ required: true })
    @Expose()
    @IsString()
    token: string;
}
