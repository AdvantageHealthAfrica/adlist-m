import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Query,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import * as path from 'path';
  import { CreateFormularyDto } from '../dtos/create-formulary.dto';
  import { UpdateFormularyDto } from '../dtos/update-formulary.dto';
  import { Formulary } from '../entities/formularies.entity';
  import { FormularyService } from '../services/formulary.service';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('Formularies')
  @Controller('formularies')
  export class FormularyController {
    constructor(private readonly formularyService: FormularyService) {}
  
    // Create a new formulary
    @Post()
    @ApiOperation({ summary: 'Create a new formulary' })
    @ApiResponse({ status: 201, description: 'Formulary created successfully.', type: Formulary })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async create(@Body() createFormularyDto: CreateFormularyDto): Promise<Formulary> {
      return this.formularyService.create(createFormularyDto);
    }
  
    // Get all formularies
    @Get()
    @ApiOperation({ summary: 'Retrieve all formularies' })
    @ApiResponse({ status: 200, description: 'List of all formularies.', type: [Formulary] })
    async findAll(): Promise<Formulary[]> {
      return this.formularyService.findAll();
    }
  
    // Get a single formulary by ID
    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a single formulary by its ID' })
    @ApiResponse({ status: 200, description: 'Formulary found.', type: Formulary })
    @ApiResponse({ status: 404, description: 'Formulary not found' })
    async findOne(@Param('id') id: string): Promise<Formulary> {
      return this.formularyService.findOne(id);
    }

    @Get(':id/formulary')
    @ApiOperation({ summary: 'Get formulary by business unit ID' })
    @ApiResponse({
      status: 200,
      description: 'List of formularies for the given business unit',
      type: [Formulary],
    })
    @ApiResponse({ status: 404, description: 'Business unit or formulary not found' })
    async getFormularyByBusinessUnitId(@Param('id') businessUnitId: string): Promise<Formulary[]> {
      return this.formularyService.findByBusinessUnitId(businessUnitId);
  }
  
    // Update a formulary
    @Put(':id')
    @ApiOperation({ summary: 'Update a formulary' })
    @ApiResponse({ status: 200, description: 'Formulary updated successfully.', type: Formulary })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Formulary not found' })
    async update(
      @Param('id') id: string,
      @Body() updateFormularyDto: UpdateFormularyDto,
    ): Promise<Formulary> {
      return this.formularyService.update(id, updateFormularyDto);
    }
  
    // Delete a formulary
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a formulary' })
    @ApiResponse({ status: 204, description: 'Formulary deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Formulary not found' })
    async remove(@Param('id') id: string): Promise<void> {
      return this.formularyService.remove(id);
    }

    @Get('search')
    @ApiQuery({
      name: 'query',
      required: true,
      type: String,
      description: 'Search term for formulary name or description',
    })
    async search(@Query('query') query: string): Promise<Formulary[]> {
      if (!query) {
        throw new BadRequestException('Query parameter is required');
      }
  
      return this.formularyService.search(query);
    }
  
    // Upload CSV to create formularies in bulk
    @Post('upload')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const extname = path.extname(file.originalname);
            const filename = `${Date.now()}${extname}`;
            callback(null, filename);
          },
        }),
      }),
    )
    @ApiConsumes('multipart/form-data') // This tells Swagger the endpoint accepts a file
    @ApiOperation({ summary: 'Upload a CSV file to create formularies in bulk' })
    @ApiBody({
      description: 'CSV file containing formulary data',
      type: 'string', // No 'format' property needed
    })
    @ApiResponse({ status: 201, description: 'Formularies uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
      if (!file) {
        throw new BadRequestException('File is required');
      }
  
      return this.formularyService.importFromCSV(file.path);
    }
  }
  