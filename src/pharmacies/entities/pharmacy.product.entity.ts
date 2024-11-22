import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { PharmacyProductDosageForm } from '../../enums/pharmacy.product.dosage.form';
import { QuantityTypes } from '../../enums/product.quantity.types';
import { Formulary } from './formularies.entity';
import { BusinessUnit } from './business.unit.entity';

@Entity('pharmacy_product')
export class PharmacyProduct {
  @PrimaryGeneratedColumn()
  id: number;

  // set to nullable as a result of creating new product with nafdac number or bar code
  @Column({ nullable: true })
  nafdac_number: string;

  @Column()
  product_name: string;

  // set to nullable as a result of creating new product with nafdac number or bar code
  @Column({ nullable: true })
  product_code: string;

  @Column({ nullable: true })
  drug_name: string;

  @Column()
  manufacturer: string;

  @Column({ nullable: true })
  strength: string;

  @Column({ nullable: true })
  unit: string;

  @Column({
    type: 'enum',
    enum: PharmacyProductDosageForm,
    default: PharmacyProductDosageForm.TABLETS,
  })
  dosage_form: PharmacyProductDosageForm;

  // exists in universal list
  @Column({ type: 'boolean', default: false })
  exists_in_uni_list: boolean;

  @Column({ nullable: true })
  quantity: number;

  @Column({
    type: 'enum',
    enum: QuantityTypes,
    default: QuantityTypes.TABLETS,
  })
  quantity_type: QuantityTypes;

  @Column({ nullable: true })
  selling_price: number;

  @Column({ nullable: true })
  cost_price: number;

  @Column({ nullable: true, type: 'date' })
  expiry_date: Date;

  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.products, {
    cascade: ['update'],
    eager: true,
  })
  @JoinColumn()
  pharmacy: Pharmacy;

  @ManyToOne(() => Formulary, { nullable: true })
  @JoinColumn({ name: 'formulary_id' })
  formulary: Formulary;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  stock_taken_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  last_edited_at: Date;


  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.bu_id)
  @JoinColumn({ name: 'business_unit_id' })
  business_unit_id: BusinessUnit;

}
  