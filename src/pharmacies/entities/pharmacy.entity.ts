import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { PharmacyProduct } from './pharamcy.product.entity';

@Entity()
export class Pharmacy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string

  // The email address that can be used to reach out to the pharmacist that owns the pharmacy.
  @Column({nullable: true})
  emailAddress: string

  @Column({ nullable: true })
  location: string

  // to show the admin that created the the pharmacy
  @ManyToOne(() => User, (admin) => admin.pharmacies, { cascade: ['update'] })
  admin: User;

  @OneToMany(() => PharmacyProduct, (product) => product.pharmacy)
  products: PharmacyProduct[]
}
