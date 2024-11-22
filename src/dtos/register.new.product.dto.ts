import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { PharmacyProductDosageForm } from '../enums/pharmacy.product.dosage.form';
import { ApiProperty } from "@nestjs/swagger";


export class RegisterNewProductDto{

  @ApiProperty({description: "The NRN of the product that does not exist in the universal list", example: "A0-ZZD45"})
  @IsOptional()
  @IsString()
  nafdac_number: string

  @ApiProperty({ description: "The product code of the product that does not exist in the universal list", example: "124595979274" })
  @IsOptional()
  @IsString()
  product_code: string

  @ApiProperty({description: "The product's name"})
  @IsNotEmpty()
  @IsString()
  product_name: string

  @ApiProperty({description: "The active ingredient of the product.", required: false})
  @IsOptional()
  @IsString()
  drug_name: string

  @ApiProperty({description: "The manufacturer of the product."})
  @IsOptional()
  @IsString()
  manufacturer: string

  @ApiProperty({description: "The strength of the product.", example: 100})
  @IsOptional()
  @IsString()
  strength: string

  @ApiProperty({description: "The product's unit of strength", example: "mg"})
  @IsNotEmpty()
  @IsString()
  unit: string

  @ApiProperty({description: "The administration options for dosage.", enum: PharmacyProductDosageForm})
  @IsEnum(PharmacyProductDosageForm)
  dosage_form: PharmacyProductDosageForm
}