import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Role } from '../enums/role.enum';
import { Exclude } from 'class-transformer';
import { Pharmacy } from '../pharmacies/entities/pharmacy.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.Admin })
  role: Role;

  @OneToMany(() => Pharmacy, (pharmacy) => pharmacy.admin)
  pharmacies: Pharmacy[];
}
