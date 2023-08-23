import { IsEmail, IsString } from 'class-validator';
import { IsGistEmail } from 'src/global/validator/gistEmail.validator';

export class ValidateCertificationCodeDTO {
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    emailCertificationCode: string;
}
