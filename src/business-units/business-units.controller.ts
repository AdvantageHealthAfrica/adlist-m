import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BusinessUnitsService } from './services/business-units.service';
import { BusinessUnitDto } from '../dtos/business.unit.dto';
import { CreateBusinessUnitDto } from '../dtos/create.business.unit.dto';
import { UpdateBusinessUnitDto } from '../dtos/update.business.unit.dto';

@ApiTags('Business-units')
@Controller('business-units')
export class BusinessUnitsController {
  constructor(private readonly businessUnitsService: BusinessUnitsService) {}

  // Create a new business unit
  @Post()
  @ApiOperation({ summary: 'Create a new business unit' })
  @ApiResponse({
    status: 201,
    description: 'Business unit successfully created',
    type: BusinessUnitDto,
  })
  async create(@Body() createBusinessUnitDto: CreateBusinessUnitDto): Promise<BusinessUnitDto> {
    return this.businessUnitsService.create(createBusinessUnitDto.name, createBusinessUnitDto.location);
  }

  // Get all business units
  @Get()
  @ApiOperation({ summary: 'Get all business units' })
  @ApiResponse({
    status: 200,
    description: 'List of all business units',
    type: [BusinessUnitDto],
  })
  async findAll(): Promise<BusinessUnitDto[]> {
    return this.businessUnitsService.findAll();
  }

  // Get a single business unit by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a business unit by ID' })
  @ApiResponse({
    status: 200,
    description: 'Business unit found',
    type: BusinessUnitDto,
  })
  @ApiResponse({ status: 404, description: 'Business unit not found' })
  async findOne(@Param('id') id: string): Promise<BusinessUnitDto> {
    return this.businessUnitsService.findOne(id);
  }

  // Update a business unit
  @Put(':id')
  @ApiOperation({ summary: 'Update a business unit' })
  @ApiResponse({
    status: 200,
    description: 'Business unit successfully updated',
    type: BusinessUnitDto,
  })
  @ApiResponse({ status: 404, description: 'Business unit not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBusinessUnitDto: UpdateBusinessUnitDto,
  ): Promise<BusinessUnitDto> {
    return this.businessUnitsService.update(id, updateBusinessUnitDto.name, updateBusinessUnitDto.location);
  }

  // Delete a business unit
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business unit' })
  @ApiResponse({ status: 200, description: 'Business unit successfully deleted' })
  @ApiResponse({ status: 404, description: 'Business unit not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.businessUnitsService.remove(id);
  }

  // Search business units
  @Get('search')
  @ApiOperation({ summary: 'Search business units by name or location' })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term for business unit name or location',
  })
  @ApiResponse({
    status: 200,
    description: 'List of business units matching the search query',
    type: [BusinessUnitDto],
  })
  async search(@Query('query') query: string): Promise<BusinessUnitDto[]> {
    return this.businessUnitsService.search(query);
  }
}
