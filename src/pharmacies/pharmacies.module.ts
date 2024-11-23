import { Module } from '@nestjs/common';
import { PharmaciesService } from './services/pharmacies.service';
import { Pharmacy } from './entities/pharmacy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversalListModule } from '../universal-list/universal-list.module';
import { PharmacyProduct } from './entities/pharmacy.product.entity';
import { CaslModule } from '../casl/casl.module';
import { OverallInventoryUpdateTime } from './entities/overall.pharmacy.product.update.time.entity';
import { BusinessUnitsModule } from '../business-units/business-units.module';


// import { StockCount } from '../entities/stock.counts.entity';
import { PharmacyProductService } from './services/pharmacy.product.service';
import { PharmacyProductController } from './controllers/pharmacy.product.controller';
import { PharmaciesController } from './controllers/pharmacies.controller';

@Module({
  imports: [
    BusinessUnitsModule,
    TypeOrmModule.forFeature([
      Pharmacy, 
      PharmacyProduct, 
      OverallInventoryUpdateTime, 
      // StockCount,
    ]),
    UniversalListModule,
    CaslModule
  ],
  providers: [PharmaciesService, PharmacyProductService,],
  exports: [PharmaciesService,  PharmacyProductService,],
  controllers: [ PharmacyProductController, PharmaciesController],
})
export class PharmaciesModule {}
