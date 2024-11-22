import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BusinessUnit } from './business.unit.entity';
import { PharmacyProduct } from '../../pharmacies/entities/pharmacy.product.entity';

@Entity()
export class BusinessUnitProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PharmacyProduct, (pharmacyProduct) => pharmacyProduct.id)
  @JoinColumn({ name: 'product_id' })
  product: PharmacyProduct;

  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.businessUnitProducts)
  @JoinColumn({ name: 'bu_id' })
  businessUnit: BusinessUnit;

  @Column({ type: 'int' })
  quantity: number;
}
