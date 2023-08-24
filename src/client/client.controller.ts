import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { IdpGuard } from 'src/idp/guard/idp.guard';
import { ClientInfoDto } from './dto/req/clientInfo.dto';
import { ClientCredentialDTO } from './dto/res/clientCredentialRes.dto';
import { ClientGuard } from './guard/client.guard';
import { UpdateClientDTO } from './dto/req/updateClient.dto';
import { GetClient } from '@global/decorator/getClient.decorator';
import { GetUser } from '@global/decorator/getUser.decorator';
import { User } from '@global/entity/user.entity';
import { Client } from '@global/entity/client.entity';

@Controller('client')
@UsePipes(new ValidationPipe({ transform: true }))
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    //유저의 client list
    @Get()
    @UseGuards(IdpGuard)
    async getClientList(@GetUser() user: User): Promise<Client[]> {
        return this.clientService.getClientList(user);
    }

    //특정 client 정보
    @Get(':uuid')
    @UseGuards(IdpGuard)
    async getClient(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @GetUser() user: User,
    ): Promise<Client> {
        return this.clientService.getClient(uuid, user);
    }

    //client 등록
    @Post()
    @UseGuards(IdpGuard)
    async registerClient(
        @Body() clientInfoDto: ClientInfoDto,
        @GetUser() user: User,
    ): Promise<ClientCredentialDTO> {
        return this.clientService.registerClient(clientInfoDto, user);
    }

    //client 비번 변경
    @Post(':uuid/reset')
    @UseGuards(ClientGuard)
    async resetClientSecret(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @GetUser() user: User,
    ): Promise<ClientCredentialDTO> {
        return this.clientService.resetClientSecret(uuid, user);
    }

    //client admin 권한 요청
    @Post('admin')
    @UseGuards(ClientGuard)
    async adminRequest(@GetClient() client: Client): Promise<void> {
        return this.clientService.adminRequest(client);
    }

    //client 정보 변경
    @Patch('')
    @UseGuards(ClientGuard)
    async updateClient(
        @Body() updateClientUrlsDTO: UpdateClientDTO,
        @GetClient() client: Client,
    ): Promise<void> {
        return this.clientService.updateClient(updateClientUrlsDTO, client);
    }
}
