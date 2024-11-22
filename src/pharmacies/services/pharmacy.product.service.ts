import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PharmacyProduct } from '../entities/pharamcy.product.entity';
import { ProductBusinessUnit } from '../entities/product.business.unit';
import { PharmacyProductDto } from '../dtos/pharmacy.product.dto';

@Injectable()
export class PharmacyProductService {
  private readonly logger = new Logger(PharmacyProductService.name);

  constructor(
    @InjectRepository(PharmacyProduct)
    private readonly pharmacyProductRepository: Repository<PharmacyProduct>,
    @InjectRepository(ProductBusinessUnit)
    private readonly productBusinessUnitRepository: Repository<ProductBusinessUnit>,
  ) {}

  async create(pharmacyProductDto: PharmacyProductDto): Promise<PharmacyProduct> {
    const { business_unit_id, quantity, ...productData } = pharmacyProductDto;

    try {
      // Create and save the pharmacy product
      const pharmacyProduct = this.pharmacyProductRepository.create(productData);
      const savedProduct = await this.pharmacyProductRepository.save(pharmacyProduct);

      

      // If business unit ID and quantity are provided, link the product to the business unit
      if (business_unit_id && quantity) {
        const productBusinessUnit = this.productBusinessUnitRepository.create({
          product: savedProduct,
          businessUnit: { bu_id: business_unit_id },
          quantity,
        });

        await this.productBusinessUnitRepository.save(productBusinessUnit);
      }

      return savedProduct;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create PharmacyProduct', error.message);
    }
  }

  async findAll(): Promise<PharmacyProduct[]> {
    return this.pharmacyProductRepository.find({
      relations: ['pharmacy', 'business_unit_id'],
    });
  }

  async findOne(id: number): Promise<PharmacyProduct> {
    const pharmacyProduct = await this.pharmacyProductRepository.findOne({
      where: { id: id },
      relations: ['pharmacy', 'business_unit_id'],
    });

    if (!pharmacyProduct) {
      throw new NotFoundException(`PharmacyProduct with ID ${id} not found`);
    }

    return pharmacyProduct;
  }

  async update(id: number, pharmacyProductDto: any): Promise<PharmacyProduct> {
    const pharmacyProduct = await this.findOne(id);

    const { businessUnitId, quantity, ...productData } = pharmacyProductDto;

    Object.assign(pharmacyProduct, productData);
    const updatedProduct = await this.pharmacyProductRepository.save(pharmacyProduct);

    if (businessUnitId && quantity !== undefined) {
      let productBusinessUnit = await this.productBusinessUnitRepository.findOne({
        where: { product: { id }, businessUnit: { bu_id: businessUnitId } },
        relations: ['product', 'business_unit_id'],
      });

      if (productBusinessUnit) {
        productBusinessUnit.quantity = quantity;
      } else {
        productBusinessUnit = this.productBusinessUnitRepository.create({
          product: updatedProduct,
          businessUnit: { bu_id: businessUnitId },
          quantity,
        });
      }

      await this.productBusinessUnitRepository.save(productBusinessUnit);
    }

    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    try {
      const pharmacyProduct = await this.findOne(id);
      if (!pharmacyProduct) {
        throw new NotFoundException(`PharmacyProduct with ID ${id} not found`);
      }
      await this.pharmacyProductRepository.remove(pharmacyProduct);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete the PharmacyProduct ${error}`);
    }
  }

  async getProductsByBusinessUnit(businessUnitId: string): Promise<PharmacyProduct[]> {
    try {
      const products = await this.pharmacyProductRepository.find({
        where: { business_unit_id: { bu_id: businessUnitId } },
        relations: ['businessUnit'],
      });

      if (!products.length) {
        throw new NotFoundException(`No products found for Business Unit ID ${businessUnitId}`);
      }

      return products;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve products for the Business Unit');
    }
  }


   // Aggregate total stock quantity by business unit
  async aggregateTotalStockByBusinessUnit(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('SUM(product.quantity)', 'totalQuantity')
        .groupBy('product.businessUnitId')
        .getRawMany();
      
      this.logger.log('Aggregated total stock by business unit successfully');
      return result;
    } catch (error) {
      this.logger.error('Error aggregating total stock by business unit', error);
      throw error;
    }
  }

  // Aggregate average selling price by business unit
  async aggregateAverageSellingPriceByBusinessUnit(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('AVG(product.selling_price)', 'averageSellingPrice')
        .groupBy('product.businessUnitId')
        .getRawMany();
      
      this.logger.log('Aggregated average selling price by business unit successfully');
      return result;
    } catch (error) {
      this.logger.error('Error aggregating average selling price by business unit', error);
      throw error;
    }
  }

  // Aggregate total stock value (quantity * selling price) by business unit
  async aggregateStockValueByBusinessUnit(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('SUM(product.quantity * product.selling_price)', 'totalStockValue')
        .groupBy('product.businessUnitId')
        .getRawMany();
      
      this.logger.log('Aggregated stock value by business unit successfully');
      return result;
    } catch (error) {
      this.logger.error('Error aggregating stock value by business unit', error);
      throw error;
    }
  }

  // Group products by business unit and dosage form
  async groupProductsByBusinessUnitAndDosageForm(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('product.dosage_form', 'dosageForm')
        .addSelect('COUNT(product.id)', 'productCount')
        .groupBy('product.businessUnitId, product.dosage_form')
        .getRawMany();
      
      this.logger.log('Grouped products by business unit and dosage form successfully');
      return result;
    } catch (error) {
      this.logger.error('Error grouping products by business unit and dosage form', error);
      throw error;
    }
  }

  // Count products by business unit
  async countProductsByBusinessUnit(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('COUNT(product.id)', 'productCount')
        .groupBy('product.businessUnitId')
        .getRawMany();
      
      this.logger.log('Counted products by business unit successfully');
      return result;
    } catch (error) {
      this.logger.error('Error counting products by business unit', error);
      throw error;
    }
  }

  // Get expired products by business unit
  async getExpiredProductsByBusinessUnit(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('COUNT(product.id)', 'expiredProductCount')
        .where('product.expiry_date < CURRENT_DATE')
        .groupBy('product.businessUnitId')
        .getRawMany();
      
      this.logger.log('Fetched expired products by business unit successfully');
      return result;
    } catch (error) {
      this.logger.error('Error fetching expired products by business unit', error);
      throw error;
    }
  }

  // Count expired products and available stock by business unit
  async countExpiredAndAvailableStockByBusinessUnit(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('COUNT(CASE WHEN product.expiry_date < CURRENT_DATE THEN 1 END)', 'expiredProductCount')
        .addSelect('SUM(CASE WHEN product.expiry_date >= CURRENT_DATE THEN product.quantity ELSE 0 END)', 'availableStock')
        .groupBy('product.businessUnitId')
        .getRawMany();
      
      this.logger.log('Counted expired products and available stock by business unit successfully');
      return result;
    } catch (error) {
      this.logger.error('Error counting expired products and available stock by business unit', error);
      throw error;
    }
  }

  // Aggregate total quantity and selling price by business unit
  async aggregateTotalQuantityAndSellingPriceByBusinessUnit(): Promise<any[]> {
    try {
      const result = await this.pharmacyProductRepository
        .createQueryBuilder('product')
        .select('product.businessUnitId', 'businessUnitId')
        .addSelect('SUM(product.quantity)', 'totalQuantity')
        .addSelect('SUM(product.selling_price)', 'totalSellingPrice')
        .groupBy('product.businessUnitId')
        .getRawMany();
      
      this.logger.log('Aggregated total quantity and selling price by business unit successfully');
      return result;
    } catch (error) {
      this.logger.error('Error aggregating total quantity and selling price by business unit', error);
      throw error;
    }
  }

}
