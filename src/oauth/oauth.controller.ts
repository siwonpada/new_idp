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
import { TokenDTO } from './dto/req/token.dto';
import { GetClient } from '@global/decorator/getClient.decorator';
import { Client } from '@global/entity/client.entity';
import { AuthorizeResDTO } from './dto/res/authorizeRes.dto';
import { TokenResDTO } from './dto/res/tokenRes.dto';
import { RevokeDTO } from './dto/req/revoke.dto';
import { Oauth2Guard } from './guard/oauth2.guard';

@Controller('oauth')
@UseInterceptors(convertCaseInterceptor)
export class OauthController {
    constructor(private readonly oauthService: OauthService) {}

    @Post('authorize')
    @UseGuards(IdpGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async authorize(
        @Body() authorizeDTO: AuthorizeDTO,
        @GetUser() user: User,
    ): Promise<AuthorizeResDTO> {
        return this.oauthService.authorize(authorizeDTO, user);
    }

    @Post('token')
    @UseGuards(ClientGuard, AnonymousGuard)
    async token(
        @Body() tokenDTO: TokenDTO,
        @GetClient() client: Client,
    ): Promise<TokenResDTO> {
        return this.oauthService.token(tokenDTO, client);
    }

    @Post('revoke')
    @UseGuards(ClientGuard, AnonymousGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async revoke(
        @Body() revokeDTO: RevokeDTO,
        @GetClient() client: Client,
    ): Promise<void> {
        return this.oauthService.revoke(revokeDTO, client);
    }

    @Get('certs')
    async certs() {
        return;
    }

    @Get('userinfo')
    @UseGuards(Oauth2Guard)
    async validateJwtToken(@GetUser() user: User) {
        return user;
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
