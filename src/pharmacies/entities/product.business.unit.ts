import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BusinessUnit } from './business.unit.entity';
import { PharmacyProduct } from './pharamcy.product.entity';

@Entity('product_business_unit')
export class ProductBusinessUnit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PharmacyProduct, (pharmacyProduct) => pharmacyProduct.id)
  @JoinColumn({ name: 'product_id' })
  product: PharmacyProduct;

  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.productBusinessUnits)
  @JoinColumn({ name: 'bu_id' })
  businessUnit: BusinessUnit;

  @Column({ type: 'int' })
  quantity: number;
}
