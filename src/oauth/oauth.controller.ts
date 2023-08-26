import { convertCaseInterceptor } from '@global/interceptor/convertCase.interceptor';
import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { IdpGuard } from 'src/idp/guard/idp.guard';
import { AuthorizeDTO } from './dto/req/authorize.dto';
import { GetUser } from '@global/decorator/getUser.decorator';
import { User } from '@global/entity/user.entity';
import { OauthService } from './oauth.service';
import { ClientGuard } from 'src/client/guard/client.guard';
import { AnonymousGuard } from './guard/anonymous.guard';

@Controller('oauth')
@UseInterceptors(convertCaseInterceptor)
export class OauthController {
    constructor(private readonly oauthService: OauthController) {}

    @Post('authorize')
    @UseGuards(IdpGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async authorize(@Body() authorizeDTO: AuthorizeDTO, @GetUser() user: User) {
        return this.oauthService.authorize(authorizeDTO, user);
    }

    @Post('token')
    @UseGuards(ClientGuard, AnonymousGuard)
    async token() {
        return;
    }

    @Post('revoke')
    @UseGuards(ClientGuard, AnonymousGuard)
    async revoke() {
        return;
    }

    @Get('certs')
    async certs() {
        return;
    }

    @Get('userinfo')
    async validateJwtToken() {
        return;
    }
}

@Controller('.well-known/openid-configuration')
export class OpenIDDiscoveryController {
    constructor(private readonly oauthService: OauthService) {}
    @Get()
    discovery() {
        return this.oauthService.discovery();
    }
}
