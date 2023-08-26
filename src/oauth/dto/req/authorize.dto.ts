import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Scope, allowedScopes } from 'src/oauth/oauth.service';

export class AuthorizeDTO {
    @IsString({ message: 'invalid_request' })
    clientId: string;

    @IsString()
    @IsUrl(
        {
            require_valid_protocol: false,
            require_tld: false,
            require_host: false,
        },
        {
            message: 'invalid_request',
        },
    )
    redirectUri: string;

    @IsString()
    @IsOptional()
    nonce?: string;

    @IsArray()
    @IsEnum(allowedScopes, { each: true, message: 'invalid_scope' })
    @Transform(({ value }) => value.split(' '))
    scope: Readonly<Scope[]>;

    @IsArray()
    @IsEnum(['code', 'token', 'id_token'], {
        each: true,
        message: 'unsupported_response_type',
    })
    @Transform(({ value }) => value.split(' '))
    responseType: ('code' | 'token' | 'id_token')[];
}
