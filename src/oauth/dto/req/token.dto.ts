import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class TokenDTO {
    @IsString()
    @IsOptional()
    code: string;

    @IsString()
    @IsOptional()
    refreshToken: string;

    @IsString()
    @IsOptional()
    clientId: string;

    @IsString()
    @IsOptional()
    clientSecret: string;

    @IsString()
    @IsUrl()
    @IsOptional()
    redirectUri: string;

    @IsString()
    @IsEnum(['authorization_code', 'refresh_token'])
    grantType: string;
}
