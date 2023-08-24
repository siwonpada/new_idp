import { IsEmail, IsString } from 'class-validator';
import { UserType } from 'src/global/type/user.type';
import { IsGistEmail } from 'src/global/validator/gistEmail.validator';

export class LoginInfoDto
    implements Pick<UserType, 'userEmailId' | 'userPassword'>
{
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    userPassword: string;
}
