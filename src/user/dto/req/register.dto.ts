import { IsGistEmail } from '@global/validator/gistEmail.validator';
import { IsEmail, IsJWT, IsString } from 'class-validator';

export class RegisterDTO {
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    userPassword: string;

    @IsString()
    userName: string;

    @IsString()
    studentId: string;

    @IsString()
    userPhoneNumber: string;

    @IsJWT()
    registerCertificationJwtToken: string;
}
