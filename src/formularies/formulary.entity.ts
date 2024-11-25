import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { PharmacyProduct } from 'src/pharmacies/entities/pharmacy.product.entity';
import { BusinessUnit } from 'src/business-units/entities/business.unit.entity';

@Entity()
export class Formulary {
  @PrimaryGeneratedColumn('uuid')
  formulary_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string; 

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.bu_id)
  @JoinColumn({ name: 'business_unit_id' })
  business_unit: BusinessUnit;

  @CreateDateColumn()
  created_at: Date;
}
