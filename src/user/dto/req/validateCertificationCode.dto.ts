import { IsGistEmail } from '@global/validator/gistEmail.validator';
import { IsEmail, IsString } from 'class-validator';

export class ValidateCertificationCodeDTO {
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    emailCertificationCode: string;
}
