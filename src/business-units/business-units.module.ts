import { Module } from '@nestjs/common';
import { BusinessUnitsService } from './business-units.service';
import { BusinessUnitsController } from './business-units.controller';

@Module({
  providers: [BusinessUnitsService],
  controllers: [BusinessUnitsController]
})
export class BusinessUnitsModule {}
