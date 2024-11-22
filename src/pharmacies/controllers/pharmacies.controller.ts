import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';

import { ApiTags, ApiBody, ApiParam, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { CreatePharmOutletDto } from 'src/dtos/create.pharm.outlet.dto';
import { EditNewProductDto } from 'src/dtos/edit.new.product.dto';
import { RegisterNewProductDto } from 'src/dtos/register.new.product.dto';
import { TakePharmacyProductStockDto } from 'src/dtos/take.pharmacy.product.stock.dto';
import { Role } from 'src/enums/role.enum';
import { TimeLapses } from 'src/enums/time.lapses';
import { Roles } from 'src/utils/roles.decorator';
import { PharmaciesService } from '../services/pharmacies.service';
@Controller('pharmacies')
@ApiTags("Pharmacies and Inventories")
export class PharmaciesController {
  constructor(private pharmService: PharmaciesService) { }
  
  // @Get('tsd')
  // async fetchPharmacyEntriesByCustomDates(@Query('start_date') startDate: Date, @Query('end_date') endDate: Date ) {
  //   return await this.pharmService.fetchPharmacyEntriesByCustomDates(startDate, endDate )
  // }

  
  @ApiBearerAuth()
  @ApiOperation({ description: "Enrols a new pharmacy in the API for stock taking. This is restricted for admin usage only." })
  @ApiBody({type: CreatePharmOutletDto})
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  createPharmOutlet(@Request() request, @Body() body: CreatePharmOutletDto) {
    const user = request.user;
    return this.pharmService.createPharmacy(body.name, body.phoneNumber, body.emailAddress, body.location, user);
  }


  @ApiBearerAuth()
  @ApiOperation({ description: "This fetches all enrolled pharmacies." })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getPharmacies(@Request() request) {
    const user = request.user
    return await this.pharmService.getPharmacies(user)
  }


  @ApiBearerAuth()
  @ApiOperation({description: "This endpoint is responsible for registering the pharmacy's product that does not exist on the universal list."})
  @ApiParam({ name: "pharmacy_id", required: true, type: Number, description: "ID primary key of the enrolled pharmacy." })
  @ApiBody({type: RegisterNewProductDto})
  @UseGuards(JwtAuthGuard)
  @Post(':pharmacy_id/products')
  async registerNewProduct(
    @Body() body: RegisterNewProductDto,
    @Param('pharmacy_id') pharmacy_id,
    @Request() request
  ) {
    const user = request.user;
    return await this.pharmService.registerNewPharmacyProduct(
      user,
      body.product_name,
      body.manufacturer,
      body.strength,
      body.unit,
      body.dosage_form,
      pharmacy_id,
      body.drug_name,
      body.nafdac_number,
      body.product_code,
    );
  }


  @ApiBearerAuth()
  @ApiOperation({
    description: "This endpoint takes stock of newly registered product, it also takes stocks of products that already exists on the universal lists, and edits stock taken."
  })
  @ApiParam({ name: "pharmacy_id", description: "ID of the pharmacy that the agent takes stock for.", required: true })
  @ApiParam({ name: "nafdac_number_or_bar_code", description: "NRN or product code of the product.", required: true })
  @ApiBody({type: TakePharmacyProductStockDto})
  @UseGuards(JwtAuthGuard)
  @Patch(':pharmacy_id/product/stock/:nafdac_number_or_bar_code')
  async takeStockOfNewPharmacyProductORtakeStockOfExistingUniversalListProduct(
    @Param('pharmacy_id') pharmacy_id: number,
    @Param('nafdac_number_or_bar_code') nafdac_number_or_bar_code: string,
    @Body() body: TakePharmacyProductStockDto,
    @Request() request
  ) {
    const user =  request.user
    return await this.pharmService.takeStockOfNewPharmacyProductORtakeStockOfExistingUniversalListProduct(
      user,
      pharmacy_id,
      nafdac_number_or_bar_code,
      body.quantity,
      body.selling_price,
      body.expiry_date,
      body.cost_price,
      body.quantity_type
    );
  }


  @ApiBearerAuth()
  @ApiOperation({
    description: "This endpoint edits pharmacy's new entry product that does not exist in the universal list"
  })
  @ApiParam({ name: "pharmacy_id", description: "ID of the pharmacy that the agent takes stock for.", required: true })
  @ApiParam({ name: "entry_id", description: "ID of new product entry.", required: true })
  @ApiBody({type: EditNewProductDto})
  @UseGuards(JwtAuthGuard)
  @Patch(':pharmacy_id/new-product/:entry_id')
  async editPharmacyNewProductDetails(
    @Param('pharmacy_id') pharmacy_id: number,
    @Param('entry_id') entry_id: number,
    @Body() body: EditNewProductDto,
    @Request() request
  ) {
    const user = request.user
    return await this.pharmService.editPharmacyNewProductDetails(
      user,
      pharmacy_id,
      entry_id,
      body.nafdac_number,
      body.product_code,
      body.product_name,
      body.manufacturer,
      body.dosage_form,
      body.strength,
      body.unit
    )
  }


  @ApiBearerAuth()
  @ApiOperation({ description: "This checks for a pharmacy's product in the universal list with NRN or product code" })
  @ApiParam({ name: "pharmacy_id", description: "ID of the pharmacy that the agent takes stock for.", required: true })
  @ApiQuery({ name: "nafdac_number_or_product_code", required: true })
  @ApiResponse({ status: 200, description: " [pharmacy] product exists in universal list" })
  @ApiResponse({status: 404, description: "[pharmacy] product does not exist in universal list"})
  @UseGuards(JwtAuthGuard)
  @Get(':pharmacy_id/product/check-in-universal-list')
  async checkForPharmacyProductInUniversalListWithNafdacNumberOrProductCode(
    @Query('nafdac_number_or_product_code')
    nafdac_number_or_product_code: string,
    @Param('pharmacy_id') pharmacy_id: number,
  ) {
    return await this.pharmService.checkForPharmacyProductInUniversalListWithNafdacNumberOrProductCode(
      pharmacy_id,
      nafdac_number_or_product_code,
    );
  }


  @ApiBearerAuth()
  @ApiOperation({ description: "Fetches all entries for a pharmacy for both new and existing universal list products" })
  @ApiParam({ name: "pharmacy_id", description: "ID of the pharmacy that the agent takes stock for.", required: true })
  @ApiQuery({ name: "time_lapse",description: "Fetches pharmacy entries based on various time lapses", required: false, enum: TimeLapses, example: "today" })
  @ApiQuery({ name: "only_new", description: "If this query parameter is present with the value of 'true' and the current logged in user has an Admin role, all pharmacy products that don't exist on universal list are fetched according to the time lapse specified", example: true, required: false })
  @ApiQuery({ name: "start_date", description: "If time_lapse is set to'custom_dates' value, this parameter must be present using yy-mm-dd format.", example: '2024-07-06', required: false })
  @ApiQuery({ name: "end_date", description: "If time_lapse is set to'custom_dates' value, this parameter must be present using yy-mm-dd format.", example: '2024-07-09', required: false })
  @ApiQuery({ name: "search", description: "Query to retrieve pharmacy inventories by product name, manufacturer, product code or NRN", example: 'Ace', required: false })
  @UseGuards(JwtAuthGuard)
  @Get(':pharmacy_id/products')
  async fetchPharmacyInventory(
    @Request() request,
    @Param('pharmacy_id') pharmacy_id: number,
    @Query('time_lapse') time_lapse: TimeLapses,
    @Query('only_new') only_new: boolean,
    @Query('start_date') start_date: Date,
    @Query('end_date') end_Date: Date,
    @Query('search') search: string // search query
  ) {
    const user = request.user
    return await this.pharmService.fetchPharmacyInventory(pharmacy_id, user, time_lapse, only_new, start_date, end_Date, search)
  }


  @ApiBearerAuth()
  @ApiOperation({ description: "Fetch a single pharmacy detail" })
  @ApiParam({ name: "pharmacy_id", description: "ID of the pharmacy that the agent takes stock for.", required: true })
  @UseGuards(JwtAuthGuard)
  @Get(':pharmacy_id')
  async getPharmacy(@Request() request, @Param('pharmacy_id') pharmacy_id: number) {
    const user = request.user
    return await this.pharmService.getPharmacy(user, pharmacy_id)
  }


  @ApiBearerAuth()
  @ApiOperation({
    description: "This endpoint deletes a pharmacy's entry. Restricted to Admin and Agent"
  })
  @ApiParam({ name: "pharmacy_id", description: "ID of the pharmacy that the agent takes stock for.", required: true })
  @ApiParam({ name: "entry_id", description: "ID of product entry.", required: true })
  @Delete(':pharmacy_id/products/:entry_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Agent)
  async deletePharmacyEntry(
    @Param('pharmacy_id') pharmacy_id: number,
    @Param('entry_id') entry_id: number
  ) {
    return await this.pharmService.deletePharmacyEntry(pharmacy_id, entry_id)
  }
}
