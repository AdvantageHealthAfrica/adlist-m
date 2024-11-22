import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class PasswordReset{
  @PrimaryGeneratedColumn()
  id: number

  @Column({unique: true})
  email: string

  @Column({unique: true})
  token: number

  @Column({ type: 'timestamptz' })
  expiry_time: Date

  @Column({ type: 'boolean', default: true })
  is_valid: boolean
}