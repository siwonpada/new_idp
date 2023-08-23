import { IsEmail, IsJWT, IsString } from 'class-validator';
import { IsGistEmail } from 'src/global/validator/gistEmail.validator';

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
