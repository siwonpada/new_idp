import {
    Body,
    Controller,
    Post,
    Req,
    Res,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { IdpService } from './idp.service';
import { LoginInfoDTO } from './dto/req/loginInfo.dto';
import { Request, Response } from 'express';
import { LoginResDTO } from './dto/res/loginRes.dto';
import { MessageResDTO } from './dto/res/message.dto';
import { convertCaseInterceptor } from '@global/interceptor/convertCase.interceptor';

@Controller('idp')
@UseInterceptors(convertCaseInterceptor)
export class IdpController {
    constructor(private readonly idpService: IdpService) {}

    @Post('login')
    @UsePipes(ValidationPipe)
    async userLogin(
        @Body() loginInfoDto: LoginInfoDTO,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LoginResDTO> {
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

    @Post('logout')
    async userLogout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<MessageResDTO> {
        await this.idpService.logout(req.cookies.refresh_token);
        res.clearCookie('refresh_token');
        return { message: 'Logout Success' };
    }

    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LoginResDTO> {
        const { refreshToken, ...result } = await this.idpService.refresh(
            req.cookies.refresh_token,
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
