import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AuthorizeResDTO {
    @IsString()
    @IsOptional()
    code?: string;

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
