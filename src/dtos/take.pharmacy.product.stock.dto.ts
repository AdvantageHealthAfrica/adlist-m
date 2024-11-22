import { IsString, IsNotEmpty, IsNumber, IsDate, IsOptional, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { QuantityTypes } from "../enums/product.quantity.types";

export class TakePharmacyProductStockDto{

  @ApiProperty({description: "The quantity of the product during stock taking.", example: 120})
  @IsNotEmpty()
  @IsNumber()
  quantity: number

  @ApiProperty({description: "The quantity type.", example: "Vials"})
  @IsOptional()
  @IsEnum(QuantityTypes)
  quantity_type: QuantityTypes

  @ApiProperty({description: "The selling price of the product", example: 4000})
  @IsNotEmpty()
  @IsNumber()
  selling_price: number

  @ApiProperty({description: "The selling price of the product", example: 3000})
  @IsOptional()
  @IsNumber()
  cost_price: number

  @ApiProperty({description: "The expiry date of the product", example: "2024-12-11"})
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date) // to parse date in request body
  expiry_date: Date
}