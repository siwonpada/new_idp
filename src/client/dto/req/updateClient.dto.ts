import { ClientType } from '@global/types/client.type';
import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateClientDTO
    implements Partial<Pick<ClientType, 'urls' | 'name'>>
{
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    urls?: string[];
}
