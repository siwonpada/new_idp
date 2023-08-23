import { IsEmail, IsString } from 'class-validator';
import { IsGistEmail } from 'src/global/validator/gistEmail.validator';

export class DeleteUserDTO {
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    password: string;
}
