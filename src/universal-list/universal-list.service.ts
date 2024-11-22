import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UniversalList } from './universal-list.entity';

@Injectable()
export class UniversalListService {
  constructor(
    @InjectRepository(UniversalList) private universalListRepo: Repository<UniversalList>
  ) { }
  
  async getUniversalListProducts() {
    const products = await this.universalListRepo.find()
    return products
  }

  async getProductInUniversalList(nafdacNumberOrProductCode: string) {
    let nafdac_number: string
    let product_code: string

    if (nafdacNumberOrProductCode.includes('-')) {
      nafdac_number = nafdacNumberOrProductCode;
    } else {
      product_code = nafdacNumberOrProductCode;
    }
    const product = nafdac_number != null ? await this.universalListRepo.findOneBy({ nafdac_number: nafdac_number }) : await this.universalListRepo.findOneBy({ product_code: product_code })
    if (!product) {
      throw new HttpException("Product does not exist in universal list", HttpStatus.BAD_REQUEST)
    }
    return product
  }
}
