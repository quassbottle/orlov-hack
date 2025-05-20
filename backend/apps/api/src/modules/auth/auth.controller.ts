import { Controller, Logger } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService) {}

    // @Post('/sign-in')
    // @UseValidationPipe()
    // @ApiBody({ type: SignInDto })
    // async signIn(@Req() req: ExpressRequest, @Body() body: SignInDto) {
    //     const privy = await getPrivyDto(req);

    //     return makeResponse(await this.authService.signIn(privy, body), (data) => toDto(SignInResponseDto, data));
    // }
}
