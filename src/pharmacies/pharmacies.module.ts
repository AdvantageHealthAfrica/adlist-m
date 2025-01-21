import { Module } from '@nestjs/common';
import { PharmaciesService } from './services/pharmacies.service';
import { Pharmacy } from './entities/pharmacy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversalListModule } from '../universal-list/universal-list.module';
import { PharmacyProduct } from './entities/pharamcy.product.entity';
import { CaslModule } from '../casl/casl.module';
import { OverallInventoryUpdateTime } from './entities/overall.pharmacy.product.update.time.entity';
import { BusinessUnit } from './entities/business.unit.entity';
import { ProductBusinessUnit } from './entities/product.business.unit';
import { PharmaciesController } from './controllers/pharmacies.controller';
import { FormularyService } from './services/formulary.service';
import { FormularyController } from './controllers/formulary.controller';
import { Formulary } from './entities/formularies.entity';
import { BusinessUnitController } from './controllers/business.unit.controller';
import { BusinessUnitService } from './services/business.unit.service';
import { PharmacyProductService } from './services/pharmacy.product.service';
import { PharmacyProductController } from './controllers/pharmacy.product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pharmacy, 
      PharmacyProduct, 
      OverallInventoryUpdateTime, 
      BusinessUnit,
      Formulary,
      ProductBusinessUnit,
    ]),
    UniversalListModule,
    CaslModule
  ],
  providers: [PharmaciesService, PharmacyProductService, FormularyService, BusinessUnitService],
  exports: [PharmaciesService, FormularyService, PharmacyProductService, BusinessUnitService],
  controllers: [PharmaciesController, FormularyController, BusinessUnitController, PharmacyProductController],
})
export class PharmaciesModule {}
