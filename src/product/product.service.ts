import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  private logger = new Logger('Product');
  constructor(
    @InjectRepository(ProductRepository)
    private productRepository: ProductRepository,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    const products = await this.productRepository.find();

    this.logger.verbose(`getAllProducts is called`);

    if (!products) {
      throw new NotFoundException('상품이 존재하지 않습니다.');
    }

    const sorted_porducts = products.sort((a, b) => a.id - b.id);

    return sorted_porducts;
  }

  async getProductById(id: number): Promise<Product> {
    const found = await this.productRepository.findOneBy({ id });

    this.logger.verbose(`getProductById is called with ${id}`);

    if (!found) {
      throw new NotFoundException(`${id}번 상품은 존재하지 않습니다.`);
    }

    return found;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return this.productRepository.createProduct(createProductDto);
  }

  async deleteProduct(id: number): Promise<void | string> {
    return this.productRepository.deleteProduct(id);
  }

  async getFileUploadURL(): Promise<{ ok: boolean; result: any }> {
    console.log('requested UploadURL');
    const response = await (
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ID}/images/v2/direct_upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CF_TOKEN}`,
          },
        },
      )
    ).json();

    console.log(response);

    //@ts-ignore
    return { ok: true, ...response.result };
  }

  reviseProduct = (product: Product): Promise<{ ok: boolean; result: any }> => {
    return this.productRepository.reviseProduct(product);
  };
}
