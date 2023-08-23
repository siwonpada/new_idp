import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfigModule } from '@global/config/database/database.config.module';
import { UserModule } from './user/user.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath:
                process.env.NODE_ENV === 'production'
                    ? '.production.env'
                    : '.develop.env',
        }),
        DatabaseConfigModule,
        UserModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
