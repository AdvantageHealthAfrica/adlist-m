import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { BusinessUnit } from './business.unit.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  report_id: string;

  @Column()
  title: string;

  @Column()
  report_type: string;

  @Column('text')
  data: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by' })
  generated_by: User;

  @ManyToOne(() => BusinessUnit)
  @JoinColumn({ name: 'business_unit_id' })
  business_unit: BusinessUnit; 

  @CreateDateColumn()
  generated_at: Date;
}
