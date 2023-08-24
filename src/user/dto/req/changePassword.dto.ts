import { IsGistEmail } from '@global/validator/gistEmail.validator';
import { IsEmail, IsJWT, IsString } from 'class-validator';

export class ChangePasswordDTO {
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    changedPassword: string;

    @IsJWT()
    certificationJwtToken: string;
}
