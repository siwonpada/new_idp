import { IsGistEmail } from '@global/validator/gistEmail.validator';
import { IsEmail } from 'class-validator';

export class SendCertificationCodeDTO {
    @IsEmail()
    @IsGistEmail({ message: 'Please use your GIST email.' })
    userEmailId: string;
}
