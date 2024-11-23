import { Module } from '@nestjs/common';
import { BusinessUnitsService } from './services/business-units.service';
import { BusinessUnitsController } from './business-units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessUnit } from './entities/business.unit.entity';
import { BusinessUnitProduct } from './entities/business.unit.product.entity';
import { Report } from './entities/report.entity';
import { BusinessUnitProductsService } from './services/business-unit-products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessUnit,
      BusinessUnitProduct,
      Report
    ])
  ],
  providers: [BusinessUnitsService, BusinessUnitProductsService],
  exports: [BusinessUnitsService, BusinessUnitProductsService],
  controllers: [BusinessUnitsController]
})
export class BusinessUnitsModule {}
