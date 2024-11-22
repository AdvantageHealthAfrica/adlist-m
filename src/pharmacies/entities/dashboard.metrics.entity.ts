import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
  } from 'typeorm';
  import { BusinessUnit } from './business.unit.entity'; // Assuming BusinessUnit exists
  
  @Entity('dashboard_metrics')
  export class DashboardMetric {
    @PrimaryGeneratedColumn('uuid')
    metric_id: string;
  
    @Column()
    name: string;
  
    @Column()
    value: number;
  
    @Column()
    unit: string;
  
    @ManyToOne(() => BusinessUnit)
    @JoinColumn({ name: 'business_unit_id' })
    business_unit: BusinessUnit;
  
    @CreateDateColumn()
    created_at: Date;
  }
  