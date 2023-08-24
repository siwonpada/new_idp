import { UserType } from '@global/type/user.type';
import { IsGistEmail } from '@global/validator/gistEmail.validator';
import { IsEmail, IsString } from 'class-validator';

export class LoginInfoDTO
    implements Pick<UserType, 'userEmailId' | 'userPassword'>
{
    @IsEmail()
    @IsGistEmail()
    userEmailId: string;

    @IsString()
    userPassword: string;
}
