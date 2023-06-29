import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { ProductImage } from 'src/products/entities/product-image.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async runSeed() {
    //remove cloudinary images
    await this.removeCloudinaryImages();

    //delete tables
    await this.deleteTables();

    //create users
    const user = await this.insertUsers();

    //create products
    await this.insertProducts(user);

    return `SEED EXECUTED`;
  }

  private async insertUsers() {
    const insertPromises: User[] = [];
    const users = initialData.users;

    users.forEach((user) => {
      insertPromises.push(this.userRepository.create(user));
    });

    await Promise.all(insertPromises);
    await this.userRepository.save(insertPromises);

    return insertPromises[0];
  }

  private async insertProducts(user: User) {
    const insertPromises = [];
    const products = initialData.products;

    products.forEach((product) => {
      insertPromises.push(this.productService.create(user, product));
    });

    await Promise.all(insertPromises);
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();

    await this.userRepository.createQueryBuilder().delete().where({}).execute();
  }

  private async removeCloudinaryImages() {
    const cloudinaryImages = await this.productImageRepository.find({
      select: { external_id: true },
    });
    const public_ids = cloudinaryImages.map(({ external_id }) => external_id);

    if (public_ids.length > 0) await this.productService.deleteFile(public_ids);
  }
}
