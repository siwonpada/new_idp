import {
    Body,
    Controller,
    Post,
    Res,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { IdpService } from './idp.service';
import { LoginInfoDto } from './dto/req/loginInfo.dto';
import { convertCaseInterceptor } from 'src/global/interceptor/convertCase.interceptor';
import { Response } from 'express';

@Controller('idp')
@UseInterceptors(convertCaseInterceptor)
export class IdpController {
    constructor(private readonly idpService: IdpService) {}

    @Post('login')
    @UsePipes(ValidationPipe)
    async userLogin(
        @Body() loginInfoDto: LoginInfoDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshToken, ...result } = await this.idpService.login(
            loginInfoDto,
        );
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
        });
        return result;
    }
}
