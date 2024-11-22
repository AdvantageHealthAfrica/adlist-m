import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";
import { PharmacyProductDosageForm } from '../enums/pharmacy.product.dosage.form';

@Entity()
export class UniversalList{
  // @PrimaryGeneratedColumn()
  // id: number

  @PrimaryColumn()
  nafdac_number: string

  // this is brand/product name
  @Column()
  product_name: string

  // @Column({ nullable: true })
  // drug_name: string

  @Column({nullable: true})
  product_code: string

  // making these two fields nullable because they're not yet ready
  @Column({nullable: true})
  manufacturer: string

  @Column({nullable: true})
  strength: string

  @Column({ nullable: true })
  unit: string

  @Column({nullable: true})
  dosage_form: string;
}