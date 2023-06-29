import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Product, ProductImage]),
    CloudinaryModule,
  ],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
