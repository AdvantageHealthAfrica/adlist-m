import { Module } from '@nestjs/common';
import { FormulariesService } from './formularies.service';
import { FormulariesController } from './formularies.controller';

@Module({
  providers: [FormulariesService],
  controllers: [FormulariesController]
})
export class FormulariesModule {}
