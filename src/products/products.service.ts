import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductImage } from './entities/product-image.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');
  private readonly PRODUCT_CLOUDINARY_FOLDER = 'NEST_TESLO_SHOP_PRODUCTS';

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(user: User, createProductDto: CreateProductDto) {
    const product = this.productRepository.create({
      ...createProductDto,
      user,
    });
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Help me!!');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    }

    if (!product) {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .leftJoinAndSelect('prod.images', 'prodImages')
        .where('title =:title or slug =:slug', {
          title: term,
          slug: term,
        })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`product with term ${term} don't exists`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    //preload products with changes
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`product with id ${id} don't exists`);
    }

    try {
      await this.productRepository.save(product);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Help me!!');
    }

    return await this.productRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    const public_ids = product.images.map(({ external_id }) => external_id);
    if (public_ids.length > 0) await this.deleteFile(public_ids);

    await this.productRepository.remove(product);
    return;
  }

  async updateImages(id: string, files: Express.Multer.File[]) {
    if (!files) {
      throw new BadRequestException(`images don't found`);
    }

    const product = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //remove previous images
      const public_ids = product.images.map(({ external_id }) => external_id);
      if (public_ids.length > 0) await this.deleteFile(public_ids);
      await queryRunner.manager.delete(ProductImage, { product: { id } });

      //add new images
      const cloudyResponse = await this.uploadFile(files);
      product.images = cloudyResponse.map(({ secure_url, public_id }) =>
        this.productImageRepository.create({
          url: secure_url,
          external_id: public_id,
        }),
      );
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.logger.error(error);
      throw new InternalServerErrorException('Help me!!');
    }
  }

  async uploadFile(files: Express.Multer.File[]) {
    return await this.cloudinaryService
      .uploadImage(files, this.PRODUCT_CLOUDINARY_FOLDER)
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('error during upload images');
      });
  }

  async deleteFile(public_ids: string[]) {
    return await this.cloudinaryService
      .deleteImage(public_ids)
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('error during delete images');
      });
  }

  async deleteAllProducts(): Promise<DeleteResult> {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      console.log(error);
    }
  }
}
