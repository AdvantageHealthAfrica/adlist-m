import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@Controller('search')
@ApiTags("Search")

export class SearchController {
  constructor(
    private searchService: SearchService
  ) { }
  
  @ApiBearerAuth()
  @ApiOperation({ description: "Searches for pharmacies with the pharmacy_name query" })
  @ApiQuery({ name: "pharmacy_name", description: "The search query for searching pharmacies", required: false })
  @ApiQuery({name: "nrn", description: "The search query for universal list products by NRN", required: false})
  @UseGuards(JwtAuthGuard)
  @Get()
  async search(@Query('pharmacy_name') pharmacy_name: string, @Query('nrn') nrn: string) {
    if (nrn && pharmacy_name) {
      throw new HttpException("Endpoint should not have two query parameters. Search pharmacies OR universal list product.", HttpStatus.BAD_REQUEST)
    }
    if (pharmacy_name) {
      return await this. searchService.searchPharmacies(pharmacy_name)
    }
    if (nrn) {
      return await this.searchService.searchUniversalListProduct(nrn)
    }
    return {
      message: "No results"
    }
  }
}
