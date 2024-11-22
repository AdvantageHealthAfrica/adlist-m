import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { BusinessUnit } from './business.unit.entity';
import { PharmacyProduct } from './pharamcy.product.entity';

@Entity('stock_counts')
export class StockCount {
  @PrimaryGeneratedColumn('uuid')
  stock_count_id: string;

  @ManyToOne(() => PharmacyProduct, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: PharmacyProduct;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'counted_by' })
  counted_by: User;

  @CreateDateColumn()
  counted_at: Date;

  @ManyToOne(() => BusinessUnit, { eager: true })
  @JoinColumn({ name: 'business_unit_id' })
  businessUnit: BusinessUnit;

  @Column({ type: 'text', nullable: true })
  comments: string;
}
