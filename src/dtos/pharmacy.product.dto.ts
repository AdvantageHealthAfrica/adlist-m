import { 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  IsString, 
  IsBoolean, 
  IsDate 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PharmacyProductDosageForm } from '../enums/pharmacy.product.dosage.form';
import { QuantityTypes } from '../enums/product.quantity.types';

export class PharmacyProductDto {
  @ApiPropertyOptional({ description: 'NAFDAC number of the product', example: '12345-67890' })
  @IsOptional()
  @IsString()
  nafdac_number?: string;

  @ApiProperty({ description: 'Name of the product', example: 'Paracetamol' })
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'P12345' })
  @IsOptional()
  @IsString()
  product_code?: string;

  @ApiPropertyOptional({ description: 'Drug name', example: 'Acetaminophen' })
  @IsOptional()
  @IsString()
  drug_name?: string;

  @ApiProperty({ description: 'Manufacturer of the product', example: 'Pharma Inc.' })
  @IsNotEmpty()
  @IsString()
  manufacturer: string;

  @ApiPropertyOptional({ description: 'Strength of the drug', example: '500mg' })
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiPropertyOptional({ description: 'Unit of the drug', example: 'Bottle' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ 
    description: 'Dosage form of the product', 
    enum: PharmacyProductDosageForm, 
    example: PharmacyProductDosageForm.TABLETS 
  })
  @IsNotEmpty()
  @IsEnum(PharmacyProductDosageForm)
  dosage_form: PharmacyProductDosageForm;

  @ApiProperty({ description: 'Indicates if the product exists in the universal list', example: true })
  @IsNotEmpty()
  @IsBoolean()
  exists_in_uni_list: boolean;

  @ApiPropertyOptional({ description: 'Quantity of the product', example: 100 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ 
    description: 'Type of quantity', 
    enum: QuantityTypes, 
    example: QuantityTypes.TABLETS 
  })
  @IsNotEmpty()
  @IsEnum(QuantityTypes)
  quantity_type: QuantityTypes;

  @ApiPropertyOptional({ description: 'Selling price of the product', example: 200.5 })
  @IsOptional()
  @IsNumber()
  selling_price?: number;

  @ApiPropertyOptional({ description: 'Cost price of the product', example: 150.0 })
  @IsOptional()
  @IsNumber()
  cost_price?: number;

  @ApiPropertyOptional({ description: 'Expiry date of the product', example: '2025-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry_date?: Date;

  @ApiProperty({ description: 'Business Unit ID', example: 'BU12345' })
  @IsNotEmpty()
  @IsString()
  business_unit_id?: string;

  @ApiPropertyOptional({ description: 'Formulary ID', example: '10' })
  @IsOptional()
  @IsString()
  formulary_id?: string;
}
