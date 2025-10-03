import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AddressModule } from './address/address.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [AuthModule, PrismaModule, UserModule, ProductModule, AddressModule, CartModule, OrderModule, S3Module],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
