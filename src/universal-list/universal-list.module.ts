import { Module } from '@nestjs/common';
import { UniversalListService } from './universal-list.service';
import { UniversalListController } from './universal-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversalList } from './universal-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UniversalList])],
  providers: [UniversalListService],
  controllers: [UniversalListController],
  exports: [UniversalListService]
})
export class UniversalListModule {}
