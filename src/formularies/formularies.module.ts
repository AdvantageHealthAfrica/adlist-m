import { Module } from '@nestjs/common';
import { FormulariesService } from './formularies.service';
import { FormulariesController } from './formularies.controller';
import { Formulary } from './formulary.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessUnitsModule } from 'src/business-units/business-units.module';

@Module({
  imports: [
    BusinessUnitsModule,
    TypeOrmModule.forFeature([
      Formulary
    ])
  ],
  providers: [FormulariesService],
  exports: [FormulariesService],
  controllers: [FormulariesController]
})
export class FormulariesModule {}
