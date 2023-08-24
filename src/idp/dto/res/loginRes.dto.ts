import { IsJWT } from 'class-validator';

export class LoginResDTO {
    @IsJWT()
    accessToken: string;
}
