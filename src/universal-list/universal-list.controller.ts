import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UniversalListService } from './universal-list.service';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../utils/roles.decorator';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@Controller('universal-list')
@ApiTags("Universal List")
export class UniversalListController {
  constructor(
    private universalListService: UniversalListService
  ) { }
  

  @ApiBearerAuth()
  @ApiOperation({ summary: "Get universal list. Restricted for admin access only." })
  @ApiQuery({name: "nafdac_number_or_product_code", required: false})
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getUniversalListProducts(@Query('nafdac_number_or_product_code') nafdac_number_or_product_code?: string) {
    if (nafdac_number_or_product_code) {
      return await this.universalListService.getProductInUniversalList(nafdac_number_or_product_code)
    }
    return await this.universalListService.getUniversalListProducts()
  }


  @ApiBearerAuth()
  @ApiOperation({ summary: "Fetch product details from universal list for agent during stock taking" })
  @ApiParam({ name: "nafdac_number_or_product_code", required: true, description: "NRN or product code" })
  @UseGuards(JwtAuthGuard)
  @Get(':nafdac_number_or_product_code')
  async getProductInUniversalList(@Param('nafdac_number_or_product_code') nafdac_number_or_product_code: string ) {
    return await this.universalListService.getProductInUniversalList(nafdac_number_or_product_code)
  }

}
