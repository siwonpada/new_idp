import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TokenResDTO {
    @IsString()
    @IsOptional()
    accessToken?: string;

    @IsString()
    @IsOptional()
    tokenType?: string;

    @IsNumber()
    @IsOptional()
    expiresIn?: number;

    @IsString()
    @IsOptional()
    scope?: string;

    @IsString()
    @IsOptional()
    idToken?: string;

    @IsString()
    @IsOptional()
    refreshToken?: string;
}
