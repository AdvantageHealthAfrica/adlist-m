import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BusinessUnit } from './entities/business.unit.entity';

@Injectable()
export class BusinessUnitsService {
  constructor(
    @InjectRepository(BusinessUnit)
    private readonly businessUnitRepository: Repository<BusinessUnit>,
  ) {}

  // Create a new business unit
  async create(name: string, location: string): Promise<BusinessUnit> {
    const businessUnit = this.businessUnitRepository.create({ name, location });
    try {
      return await this.businessUnitRepository.save(businessUnit);
    } catch (error) {
      throw new BadRequestException('Error creating business unit');
    }
  }

  // Get all business units
  async findAll(): Promise<BusinessUnit[]> {
    try {
      return await this.businessUnitRepository.find();
    } catch (error) {
      throw new BadRequestException('Error fetching business units');
    }
  }

  // Get a single business unit by ID
  async findOne(id: string): Promise<BusinessUnit> {
    const businessUnit = await this.businessUnitRepository.findOne({
      where: { bu_id: id },
    });

    if (!businessUnit) {
      throw new NotFoundException('Business unit not found');
    }

    return businessUnit;
  }

  // Update a business unit
  async update(id: string, name: string, location: string): Promise<BusinessUnit> {
    const businessUnit = await this.businessUnitRepository.findOne({
      where: { bu_id: id },
    });

    if (!businessUnit) {
      throw new NotFoundException('Business unit not found');
    }

    businessUnit.name = name;
    businessUnit.location = location;

    try {
      return await this.businessUnitRepository.save(businessUnit);
    } catch (error) {
      throw new BadRequestException('Error updating business unit');
    }
  }

  // Delete a business unit
  async remove(id: string): Promise<void> {
    const businessUnit = await this.businessUnitRepository.findOne({
      where: { bu_id: id },
    });

    if (!businessUnit) {
      throw new NotFoundException('Business unit not found');
    }

    try {
      await this.businessUnitRepository.remove(businessUnit);
    } catch (error) {
      throw new BadRequestException('Error deleting business unit');
    }
  }

  // Search business units by name or location
  async search(query: string): Promise<BusinessUnit[]> {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }

    try {
      return await this.businessUnitRepository.find({
        where: [
          { name: Like(`%${query}%`) },
          { location: Like(`%${query}%`) },
        ],
      });
    } catch (error) {
      throw new BadRequestException('Error searching business units');
    }
  }
}