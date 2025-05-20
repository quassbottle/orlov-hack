import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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

export class SignInPrivyDto {
    @ApiProperty({ required: true })
    @IsString()
    idToken: string;

    @ApiProperty({ required: true })
    @IsString()
    authToken: string;
}