import { IsJWT } from 'class-validator';

export class ValidateCertificationCodeResDTO {
    @IsJWT()
    registerCertificationJWTToken: string;
}
