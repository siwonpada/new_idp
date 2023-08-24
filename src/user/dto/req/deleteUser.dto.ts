import { IsGistEmail } from '@global/validator/gistEmail.validator';
import { IsEmail, IsString } from 'class-validator';

export class DeleteUserDTO {
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    password: string;
}
