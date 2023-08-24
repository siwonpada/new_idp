import { IsString } from 'class-validator';

export class MessageResDTO {
    @IsString()
    message: string;
}
