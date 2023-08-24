import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';
import { ClientType } from 'src/global/type/client.type';

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
