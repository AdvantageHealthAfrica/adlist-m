import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BusinessUnitProduct } from './business.unit.product.entity';

@Entity()
export class BusinessUnit {
  @PrimaryGeneratedColumn('uuid')
  bu_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // @OneToMany(() => ProductBusinessUnit, (productBusinessUnit) => productBusinessUnit.businessUnit)
  // productBusinessUnits: ProductBusinessUnit[];

  @OneToMany(() => BusinessUnitProduct, (businessUnitProduct) => businessUnitProduct.businessUnit)
  businessUnitProducts: BusinessUnitProduct[];

  formularies: any;
}
