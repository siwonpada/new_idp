import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Client } from '../entity/client.entity';

export const GetClient = createParamDecorator(
    (data, ctx: ExecutionContext): Client => {
        const req = ctx.switchToHttp().getRequest();
        return req.user;
    },
);
