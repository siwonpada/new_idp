import { IsArray, IsOptional, IsString } from 'class-validator';

export class ClientInfoDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    urls?: string[];
}
