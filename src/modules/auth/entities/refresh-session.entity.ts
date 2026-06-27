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

@Entity('refresh_sessions')
@Index('IDX_refresh_sessions_user_id', ['userId'])
@Index('IDX_refresh_sessions_expires_at', ['expiresAt'])
export class RefreshSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.refreshSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  refreshTokenHash!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
