import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { LoginFailureReason } from '../enums/login-failure-reason.enum';

@Entity('login_history')
@Index('IDX_login_history_user_id', ['userId'])
@Index('IDX_login_history_email', ['email'])
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, (user) => user.loginHistoryRecords, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string | null;

  @Column({ type: 'boolean' })
  success!: boolean;

  @Column({
    type: 'enum',
    enum: LoginFailureReason,
    enumName: 'login_failure_reason_enum',
    nullable: true,
  })
  failureReason!: LoginFailureReason | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
