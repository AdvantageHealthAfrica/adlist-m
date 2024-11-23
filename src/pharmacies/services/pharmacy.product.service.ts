import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PharmacyProduct } from '../entities/pharmacy.product.entity';
import { BusinessUnitProduct } from '../../business-units/entities/business.unit.product.entity';
import { PharmacyProductDto } from '../../dtos/pharmacy.product.dto';
import { BusinessUnitsService } from '../../business-units/services/business-units.service';
import { BusinessUnitProductsService } from '../../business-units/services/business-unit-products.service';
import { User } from '../../users/user.entity';
import { Role } from '../../enums/role.enum';
import { PharmaciesService } from './pharmacies.service';
import { DataSource } from 'typeorm';

@Injectable()
export class PharmacyProductService {
  private readonly logger = new Logger(PharmacyProductService.name);

  constructor(
    @InjectRepository(PharmacyProduct)
    private readonly pharmacyProductRepository: Repository<PharmacyProduct>,
    private businessUnitsService: BusinessUnitsService,
    private businessUnitProductsService: BusinessUnitProductsService,
    private pharmaciesService: PharmaciesService,
    private dataSource: DataSource,
  ) {}

  async create(pharmacyProductDto: PharmacyProductDto): Promise<PharmacyProduct> {
    const { business_unit_id, quantity, ...productData } = pharmacyProductDto;

    try {
      // Create and save the pharmacy product
      const pharmacyProduct = this.pharmacyProductRepository.create(productData);
      const savedProduct = await this.pharmacyProductRepository.save(pharmacyProduct);

      const businessUnit = await this.businessUnitsService.findOne(business_unit_id)
      // If business unit ID and quantity are provided, link the product to the business unit
      if (business_unit_id && quantity) {
        await this.businessUnitProductsService.create(savedProduct, businessUnit, quantity)
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

    const businessUnit = await this.businessUnitsService.findOne(businessUnitId)

    Object.assign(pharmacyProduct, productData);
    const updatedProduct = await this.pharmacyProductRepository.save(pharmacyProduct);

    if (businessUnitId && quantity !== undefined) {
      let businessUnitProduct = await this.businessUnitProductsService.findOne(id, businessUnitId);

      if (businessUnitProduct) {
        await this.businessUnitProductsService.updateBusinessUnitProductQuantity(id, businessUnitId, quantity);
      } else {
        await this.businessUnitProductsService.create(updatedProduct, businessUnit, quantity);
      }
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


  async searchPharmacyProductByProductName(pharmacyId: number, searchQuery: string, user: User) {
    const pharmacy = await this.pharmaciesService.getPharmacy(user, pharmacyId)
    const pharmacy_id = pharmacy.id
    let searchResults = await this.dataSource
      .createQueryBuilder()
      .select("pharmacy_product")
      .from(PharmacyProduct, "pharmacy_product")
      .where('pharmacy_product.pharmacyId = :pharmacyId', { pharmacy_id })
      .andWhere("pharmacy_product.product_name ILIKE :searchQuery", { searchQuery: `%${searchQuery}%` })
      .getMany();
    
      if (searchResults.length) {
        return searchResults
      }
      return {
        "message": "No results found."
      }
  }

}
