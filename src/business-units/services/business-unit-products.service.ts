import { Injectable } from '@nestjs/common';
import { BusinessUnitProduct } from '../../business-units/entities/business.unit.product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PharmacyProduct } from '../../pharmacies/entities/pharmacy.product.entity';
import { BusinessUnit } from '../entities/business.unit.entity';

@Injectable()
export class BusinessUnitProductsService {
  constructor(
    @InjectRepository(BusinessUnitProduct)
    private readonly businessUnitProductRepo: Repository<BusinessUnitProduct>,
  ) { }
  
  async create(product: PharmacyProduct, businessUnit: BusinessUnit, quantity: number) {
    const businessUnitProduct = this.businessUnitProductRepo.create({
      product,
      businessUnit,
      quantity
    })
    await this.businessUnitProductRepo.save(businessUnitProduct)
  }


  async findOne(product_id: number, bu_id: string) {
    let businessUnitProduct = await this.businessUnitProductRepo.findOne({
      where: { product: { id: product_id }, businessUnit: { bu_id: bu_id } },
      relations: ['product', 'business_unit_id'],
    });
    return businessUnitProduct;
  }


  async updateBusinessUnitProductQuantity(product_id: number, bu_id: string, quantity: number) {
    let businessUnitProduct = await this.findOne(product_id, bu_id)
    businessUnitProduct.quantity = quantity;
    await this.businessUnitProductRepo.save(businessUnitProduct)
  }
}
