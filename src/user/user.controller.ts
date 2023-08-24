import {
    Body,
    Controller,
    Delete,
    Patch,
    Post,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { MessageResDTO } from './dto/res/message.dto';
import { SendCertificationCodeDTO } from './dto/req/sendCertificationCode.dto';
import { convertCaseInterceptor } from '@global/interceptor/convertCase.interceptor';
import { ValidateCertificationCodeDTO } from './dto/req/validateCertificationCode.dto';
import { ValidateCertificationCodeResDTO } from './dto/res/validateCertificationCodeRes.dto';
import { RegisterDTO } from './dto/req/register.dto';
import { DeleteUserDTO } from './dto/req/deleteUser.dto';
import { ChangePasswordDTO } from './dto/req/changePassword.dto';

@Controller('v1/user')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(convertCaseInterceptor)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/register/code')
    async sendCertificationCode(
        @Body() sendCertificationCodeDTO: SendCertificationCodeDTO,
    ): Promise<MessageResDTO> {
        return this.userService.sendCertificationCode(sendCertificationCodeDTO);
    }

    @Post('/register/validate')
    async validateCertificationCode(
        @Body() validateCertificationCodeDTO: ValidateCertificationCodeDTO,
    ): Promise<ValidateCertificationCodeResDTO> {
        return this.userService.validateCertificationCode(
            validateCertificationCodeDTO,
        );
    }

    @Post('/register')
    async register(@Body() registerDTO: RegisterDTO): Promise<MessageResDTO> {
        return this.userService.register(registerDTO);
    }

    @Patch('/password')
    async changePassword(
        @Body() changePasswordDTO: ChangePasswordDTO,
    ): Promise<MessageResDTO> {
        return this.userService.changePassword(changePasswordDTO);
    }

    @Delete('')
    async deleteUser(
        @Body() deleteUserDTO: DeleteUserDTO,
    ): Promise<MessageResDTO> {
        return this.userService.deleteUser(deleteUserDTO);
    }
}
