import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RevokeDTO {
    @IsString()
    token: string;

    @IsString()
    @IsOptional()
    clientId: string;

    @IsString()
    @IsOptional()
    clientSecret: string;

    @IsEnum(['access_token', 'refresh_token'])
    @IsOptional()
    tokenTypeHint: 'access_token' | 'refresh_token';
}
