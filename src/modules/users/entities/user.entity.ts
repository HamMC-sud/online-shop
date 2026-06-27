import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EmailVerificationToken } from '../../auth/entities/email-verification-token.entity';
import { LoginHistory } from '../../auth/entities/login-history.entity';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';
import { RefreshSession } from '../../auth/entities/refresh-session.entity';
import { TwoFactorCode } from '../../auth/entities/two-factor-code.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { UserAddress } from './user-address.entity';
import { UserProfile } from './user-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('IDX_users_email', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null;

  @Index('IDX_users_google_id', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  googleId!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.USER,
  })
  role!: UserRole;

  @Index('IDX_users_status')
  @Column({
    type: 'enum',
    enum: UserStatus,
    enumName: 'user_status_enum',
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: false,
  })
  profile!: UserProfile;

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses!: UserAddress[];

  @OneToMany(() => RefreshSession, (session) => session.user)
  refreshSessions!: RefreshSession[];

  @OneToMany(() => LoginHistory, (loginHistory) => loginHistory.user)
  loginHistoryRecords!: LoginHistory[];

  @OneToMany(
    () => EmailVerificationToken,
    (verificationToken) => verificationToken.user,
  )
  emailVerificationTokens!: EmailVerificationToken[];

  @OneToMany(() => PasswordResetToken, (resetToken) => resetToken.user)
  passwordResetTokens!: PasswordResetToken[];

  @OneToMany(() => TwoFactorCode, (twoFactorCode) => twoFactorCode.user)
  twoFactorCodes!: TwoFactorCode[];
}
