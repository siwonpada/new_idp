import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { SendCertificationCodeDTO } from './dto/req/sendCertificationCode.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ValidateCertificationCodeResDTO } from './dto/res/validateCertificationCodeRes.dto';
import { EmailService } from 'src/email/email.service';
import { ValidateCertificationCodeDTO } from './dto/req/validateCertificationCode.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDTO } from './dto/req/register.dto';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { DeleteUserDTO } from './dto/req/deleteUser.dto';
import { ChangePasswordDTO } from './dto/req/changePassword.dto';
import { MessageResDTO } from './dto/res/message.dto';
import { UserType } from '@global/types/user.type';
import { User } from '@global/entity/user.entity';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    async sendCertificationCode({
        userEmailId,
    }: SendCertificationCodeDTO): Promise<MessageResDTO> {
        const emailCertificationCode = Math.random()
            .toString(36)
            .substring(2, 12);

        this.emailService.sendCertificationEmail(
            emailCertificationCode,
            userEmailId,
        );

        await this.cache.set(userEmailId, emailCertificationCode, 180000);

        return { message: 'success' };
    }

    async validateCertificationCode({
        userEmailId,
        emailCertificationCode,
    }: ValidateCertificationCodeDTO): Promise<ValidateCertificationCodeResDTO> {
        const certficationCode: string = await this.cache.get(userEmailId);
        if (certficationCode !== emailCertificationCode) {
            throw new ForbiddenException('auth validation failed');
        }
        return {
            registerCertificationJWTToken: this.jwtService.sign({
                sub: userEmailId,
            }),
        };
    }

    async register({
        userEmailId,
        userPassword,
        userName,
        studentId,
        userPhoneNumber,
        registerCertificationJwtToken,
    }: RegisterDTO): Promise<MessageResDTO> {
        //verify cert token
        const verify: { sub: string } = await this.jwtService
            .verifyAsync(registerCertificationJwtToken)
            .catch(() => {
                return undefined;
            });
        if (!verify) throw new ForbiddenException('auth validation failed');
        if (verify.sub !== userEmailId)
            throw new ForbiddenException('auth validation failed');

        //create user
        const hashedPassword = bcrypt.hashSync(
            userPassword,
            bcrypt.genSaltSync(10),
        );
        await this.userRepository.createUser({
            userEmailId,
            userPassword: hashedPassword,
            userName,
            studentId,
            userPhoneNumber,
        });
        return { message: 'success' };
    }

    async changePassword({
        userEmailId,
        changedPassword,
        certificationJwtToken,
    }: ChangePasswordDTO): Promise<MessageResDTO> {
        //verify cert token
        const verify: { sub: string } = await this.jwtService
            .verifyAsync(certificationJwtToken)
            .catch(() => {
                return undefined;
            });
        if (!verify) throw new ForbiddenException('auth validation failed');
        if (verify.sub !== userEmailId)
            throw new ForbiddenException('auth validation failed');

        //modify user password
        const hashedPassword = bcrypt.hashSync(
            changedPassword,
            bcrypt.genSaltSync(10),
        );
        await this.userRepository.updatePassword({
            userEmailId,
            userPassword: hashedPassword,
        });

        return { message: 'success' };
    }

    async deleteUser({
        userEmailId,
        password,
    }: DeleteUserDTO): Promise<MessageResDTO> {
        //validate user password
        const user = await this.userRepository.findOneByEmailId({
            userEmailId,
        });
        if (!user) throw new NotFoundException('user not found');
        if (!bcrypt.compareSync(password, user.userPassword))
            throw new UnauthorizedException();

        //delete user password
        await this.userRepository.deleteUser({ userEmailId });
        return { message: 'success' };
    }

    async validateUserPassword({
        userEmailId,
        userPassword,
    }: Pick<UserType, 'userEmailId' | 'userPassword'>): Promise<User> {
        const user = await this.userRepository.findOneByEmailId({
            userEmailId: userEmailId,
        });
        if (!user) throw new NotFoundException('user not found');
        if (!bcrypt.compareSync(userPassword, user.userPassword))
            throw new UnauthorizedException('invalid password');
        return user;
    }

    async findUserByUuid({
        userUuid,
    }: Pick<UserType, 'userUuid'>): Promise<User> {
        const user = await this.userRepository.findOneByUuid({ userUuid });
        if (!user) throw new NotFoundException('user not found');
        return user;
    }
}
