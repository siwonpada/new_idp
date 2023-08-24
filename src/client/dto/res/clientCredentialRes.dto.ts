import { IsString, IsUUID } from 'class-validator';

export class ClientCredentialDTO {
    @IsUUID()
    uuid: string;

    @IsString()
    clientId: string;

    @IsString()
    clientSecret: string;
}
