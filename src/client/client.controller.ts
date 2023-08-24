import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { IdpGuard } from 'src/idp/guard/idp.guard';
import { GetUser } from 'src/global/decorator/getUser.decorator';
import { User } from 'src/global/entity/user.entity';
import { Client } from 'src/global/entity/client.entity';
import { ClientInfoDto } from './dto/req/clientInfo.dto';
import { ClientCredentialDTO } from './dto/res/clientCredentialRes.dto';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @Get()
    @UseGuards(IdpGuard)
    async getClientList(@GetUser() user: User): Promise<Client[]> {
        return this.clientService.getClientList(user);
    }

    @Get(':uuid')
    @UseGuards(IdpGuard)
    async getClient(
        @Param('uuid') uuid: string,
        @GetUser() user: User,
    ): Promise<Client> {
        return this.clientService.getClient(uuid, user);
    }

    @Post()
    @UseGuards(IdpGuard)
    @UsePipes(ValidationPipe)
    async registerClient(
        @Body() clientInfoDto: ClientInfoDto,
        @GetUser() user: User,
    ): Promise<ClientCredentialDTO> {
        return this.clientService.registerClient(clientInfoDto, user);
    }

    @Post(':uuid/reset')
    @UseGuards(IdpGuard)
    async resetClientSecret(
        @Param('uuid') uuid: string,
        @GetUser() user: User,
    ): Promise<ClientCredentialDTO> {
        return this.clientService.resetClientSecret(uuid, user);
    }
}
