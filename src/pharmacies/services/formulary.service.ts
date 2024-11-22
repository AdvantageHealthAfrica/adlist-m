import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { CreateFormularyDto } from '../../dtos/create-formulary.dto';
import { UpdateFormularyDto } from '../../dtos/update-formulary.dto';
import { BusinessUnit } from '../entities/business.unit.entity';
import { Formulary } from '../entities/formularies.entity';

@Injectable()
export class FormularyService {
  private readonly logger = new Logger(FormularyService.name);

  constructor(
    @InjectRepository(Formulary)
    private readonly formularyRepository: Repository<Formulary>,
    @InjectRepository(BusinessUnit)
    private readonly businessUnitRepository: Repository<BusinessUnit>,
  ) {}

  // Create a new formulary
  async create(createFormularyDto: CreateFormularyDto): Promise<Formulary> {
    const { business_unit_id } = createFormularyDto;

    try {
      const businessUnit = await this.businessUnitRepository.findOne({
        where: { bu_id: business_unit_id },
      });

      if (!businessUnit) {
        this.logger.error(`Business unit with ID ${business_unit_id} not found`);
        throw new NotFoundException('Business unit not found');
      }

      const formulary = this.formularyRepository.create({
        ...createFormularyDto,
        business_unit: businessUnit,
      });

      return this.formularyRepository.save(formulary);
    } catch (error) {
      this.logger.error('Error creating formulary', error.stack);
      throw new BadRequestException('Error creating formulary');
    }
  }

  // Get all formularies
  async findAll(): Promise<Formulary[]> {
    try {
      return this.formularyRepository.find({
        relations: ['business_unit'],
      });
    } catch (error) {
      this.logger.error('Error fetching formularies', error.stack);
      throw new BadRequestException('Error fetching formularies');
    }
  }

  // Get a single formulary by ID
  async findOne(formularyId: string): Promise<Formulary> {
    try {
      const formulary = await this.formularyRepository.findOne({
        where: { formulary_id: formularyId },
        relations: ['business_unit'],
      });

      if (!formulary) {
        this.logger.error(`Formulary with ID ${formularyId} not found`);
        throw new NotFoundException('Formulary not found');
      }

      return formulary;
    } catch (error) {
      this.logger.error(`Error fetching formulary with ID ${formularyId}`, error.stack);
      throw new BadRequestException('Error fetching formulary');
    }
  }

  async findByBusinessUnitId(businessUnitId: string): Promise<Formulary[]> {
    const businessUnit = await this.businessUnitRepository.findOne({
      where: { bu_id: businessUnitId },
    });

    if (!businessUnit) {
      throw new NotFoundException(`Business unit with ID ${businessUnitId} not found`);
    }

    return this.formularyRepository.find({
      where: { business_unit: businessUnit },
    });
  }

  // Update a formulary
  async update(
    formularyId: string,
    updateFormularyDto: UpdateFormularyDto,
  ): Promise<Formulary> {
    try {
      const formulary = await this.formularyRepository.findOne({
        where: { formulary_id: formularyId },
      });

      if (!formulary) {
        this.logger.error(`Formulary with ID ${formularyId} not found`);
        throw new NotFoundException('Formulary not found');
      }

      const { business_unit_id } = updateFormularyDto;

      if (business_unit_id) {
        const businessUnit = await this.businessUnitRepository.findOne({
          where: { bu_id: business_unit_id },
        });

        if (!businessUnit) {
          this.logger.error(`Business unit with ID ${business_unit_id} not found`);
          throw new NotFoundException('Business unit not found');
        }

        formulary.business_unit = businessUnit;
      }

      Object.assign(formulary, updateFormularyDto);

      return this.formularyRepository.save(formulary);
    } catch (error) {
      this.logger.error(`Error updating formulary with ID ${formularyId}`, error.stack);
      throw new BadRequestException('Error updating formulary');
    }
  }

  // Delete a formulary
  async remove(formularyId: string): Promise<void> {
    try {
      const formulary = await this.formularyRepository.findOne({
        where: { formulary_id: formularyId },
      });

      if (!formulary) {
        this.logger.error(`Formulary with ID ${formularyId} not found`);
        throw new NotFoundException('Formulary not found');
      }

      await this.formularyRepository.remove(formulary);
      this.logger.log(`Formulary with ID ${formularyId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting formulary with ID ${formularyId}`, error.stack);
      throw new BadRequestException('Error deleting formulary');
    }
  }

  async search(query: string): Promise<Formulary[]> {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }

    return this.formularyRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      relations: ['business_unit'],
    });
  }

  // Import formularies from CSV file
  async importFromCSV(filePath: string): Promise<any> {
    const formularies: CreateFormularyDto[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          const formulary: CreateFormularyDto = {
            name: row.name,
            description: row.description,
            business_unit_id: row.business_unit_id,
          };
          formularies.push(formulary);
        })
        .on('end', async () => {
          try {
            // Create formularies in the database
            await this.formularyRepository.save(formularies);
            this.logger.log(`${formularies.length} formularies imported successfully!`);
            resolve({ message: `${formularies.length} formularies imported successfully!` });
          } catch (error) {
            this.logger.error('Error saving formularies to database', error.stack);
            reject(new BadRequestException('Error saving data to the database'));
          }
        })
        .on('error', (error) => {
          this.logger.error('Error reading the CSV file', error.stack);
          reject(new BadRequestException('Error reading the CSV file'));
        });
    });
  }
}
