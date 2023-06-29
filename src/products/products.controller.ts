import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FILES_MAX_COUNT, fileFilter } from 'src/common/helpers/file.helper';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validRoles } from 'src/auth/interfaces/valid-roles.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(validRoles.admin)
  create(@GetUser() user: User, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(user, createProductDto);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  @Auth(validRoles.admin)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser() user: User,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, user, updateProductDto);
  }

  @Delete(':id')
  @Auth(validRoles.admin)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.remove(id);
  }

  @Post('updateimages/:id')
  @Auth(validRoles.admin)
  @UseInterceptors(
    FilesInterceptor('file', FILES_MAX_COUNT, {
      fileFilter,
    }),
  )
  updateImages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.updateImages(id, files);
  }
}
