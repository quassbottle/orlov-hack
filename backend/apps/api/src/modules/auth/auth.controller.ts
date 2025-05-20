import { BadRequestError, ExpressRequest, UnauthorizedError, makeResponse } from '@app/core';
import { toDto } from '@app/core/utils/dto';
import { ApiDescribe } from '@app/core/utils/openapi';
import { getPrivyDto } from '@app/core/utils/privy';
import { UseValidationPipe } from '@app/core/utils/validation';
import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RefCodeNotFoundButProvided } from '../referral/referral.errors';
import { AuthService } from './auth.service';
import { SignInDto, SignInResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService) {}

    @Post('/sign-in')
    @UseValidationPipe()
    @ApiBody({ type: SignInDto })
    async signIn(@Req() req: ExpressRequest, @Body() body: SignInDto) {
        const privy = await getPrivyDto(req);

        return makeResponse(await this.authService.signIn(privy, body), (data) => toDto(SignInResponseDto, data));
    }
}
