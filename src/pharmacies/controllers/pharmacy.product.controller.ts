import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PharmacyProductService } from '../services/pharmacy.product.service';
import { PharmacyProduct } from '../entities/pharamcy.product.entity';
import { PharmacyProductDto } from '../dtos/pharmacy.product.dto';


@ApiTags('Pharmacy products')
@Controller('pharmacy-products')
export class PharmacyProductController {
  constructor(private readonly pharmacyProductService: PharmacyProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pharmacy product' })
  async create(@Body() pharmacyProductDto: PharmacyProductDto): Promise<PharmacyProduct> {
    return this.pharmacyProductService.create(pharmacyProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pharmacy products' })
  async findAll(): Promise<PharmacyProduct[]> {
    return this.pharmacyProductService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single pharmacy product by ID' })
  async findOne(@Param('id') id: number): Promise<PharmacyProduct> {
    return this.pharmacyProductService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pharmacy product by ID' })
  async update(
    @Param('id') id: number,
    @Body() pharmacyProductDto: PharmacyProductDto,
  ): Promise<PharmacyProduct> {
    return this.pharmacyProductService.update(id, pharmacyProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pharmacy product by ID' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.pharmacyProductService.remove(id);
  }

  @Get('business-unit/:bu_id')
  @ApiOperation({ summary: 'Get all pharmacy products by business unit ID' })
  async getProductsByBusinessUnit(@Param('bu_id') buId: string): Promise<PharmacyProduct[]> {
    return this.pharmacyProductService.getProductsByBusinessUnit(buId);
  }

  // Aggregate total stock quantity by business unit
  @Get('aggregate-total-stock')
  @ApiOperation({ summary: 'Aggregate total stock quantity by business unit' })
  @ApiResponse({
    status: 200,
    description: 'Returns total stock quantity grouped by business unit',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async aggregateTotalStockByBusinessUnit() {
    try {
      const result = await this.pharmacyProductService.aggregateTotalStockByBusinessUnit();
      return result;
    } catch (error) {
      throw new HttpException('Failed to aggregate total stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Aggregate average selling price by business unit
  @Get('aggregate-average-selling-price')
  @ApiOperation({ summary: 'Aggregate average selling price by business unit' })
  @ApiResponse({
    status: 200,
    description: 'Returns average selling price grouped by business unit',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async aggregateAverageSellingPriceByBusinessUnit() {
    try {
      const result = await this.pharmacyProductService.aggregateAverageSellingPriceByBusinessUnit();
      return result;
    } catch (error) {
      throw new HttpException('Failed to aggregate average selling price', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Aggregate total stock value by business unit
  @Get('aggregate-stock-value')
  @ApiOperation({ summary: 'Aggregate total stock value by business unit' })
  @ApiResponse({
    status: 200,
    description: 'Returns total stock value grouped by business unit',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async aggregateStockValueByBusinessUnit() {
    try {
      const result = await this.pharmacyProductService.aggregateStockValueByBusinessUnit();
      return result;
    } catch (error) {
      throw new HttpException('Failed to aggregate stock value', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Group products by business unit and dosage form
  @Get('group-by-dosage-form')
  @ApiOperation({ summary: 'Group products by business unit and dosage form' })
  @ApiResponse({
    status: 200,
    description: 'Returns products grouped by business unit and dosage form',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async groupProductsByBusinessUnitAndDosageForm() {
    try {
      const result = await this.pharmacyProductService.groupProductsByBusinessUnitAndDosageForm();
      return result;
    } catch (error) {
      throw new HttpException('Failed to group products by business unit and dosage form', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Count products by business unit
  @Get('count-products')
  @ApiOperation({ summary: 'Count products by business unit' })
  @ApiResponse({
    status: 200,
    description: 'Returns product count grouped by business unit',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async countProductsByBusinessUnit() {
    try {
      const result = await this.pharmacyProductService.countProductsByBusinessUnit();
      return result;
    } catch (error) {
      throw new HttpException('Failed to count products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get expired products by business unit
  @Get('expired-products')
  @ApiOperation({ summary: 'Get expired products by business unit' })
  @ApiResponse({
    status: 200,
    description: 'Returns expired products grouped by business unit',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getExpiredProductsByBusinessUnit() {
    try {
      const result = await this.pharmacyProductService.getExpiredProductsByBusinessUnit();
      return result;
    } catch (error) {
      throw new HttpException('Failed to fetch expired products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Count expired products and available stock by business unit
  @Get('count-expired-and-available-stock')
  @ApiOperation({ summary: 'Count expired products and available stock by business unit' })
  @ApiResponse({
    status: 200,
    description: 'Returns count of expired products and available stock by business unit',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async countExpiredAndAvailableStockByBusinessUnit() {
    try {
      const result = await this.pharmacyProductService.countExpiredAndAvailableStockByBusinessUnit();
      return result;
    } catch (error) {
      throw new HttpException('Failed to count expired products and available stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Aggregate total quantity and selling price by business unit
  @Get('aggregate-total-quantity-and-selling-price')
  @ApiOperation({ summary: 'Aggregate total quantity and selling price by business unit' })
  @ApiResponse({
    status: 200,
    description: 'Returns total quantity and selling price by business unit',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async aggregateTotalQuantityAndSellingPriceByBusinessUnit() {
    try {
      const result = await this.pharmacyProductService.aggregateTotalQuantityAndSellingPriceByBusinessUnit();
      return result;
    } catch (error) {
      throw new HttpException('Failed to aggregate total quantity and selling price', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
