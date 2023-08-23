import { IsEmail, IsJWT, IsString } from 'class-validator';
import { IsGistEmail } from 'src/global/validator/gistEmail.validator';

export class ChangePasswordDTO {
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    changedPassword: string;

    @IsJWT()
    certificationJwtToken: string;
}
