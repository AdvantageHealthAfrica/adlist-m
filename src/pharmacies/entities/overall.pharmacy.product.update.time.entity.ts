import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Pharmacy } from "./pharmacy.entity";


@Entity()
export class OverallInventoryUpdateTime{
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Pharmacy)
  @JoinColumn()
  pharmacy: Pharmacy

  @Column({type: 'timestamptz'})
  updated_at: Date
}