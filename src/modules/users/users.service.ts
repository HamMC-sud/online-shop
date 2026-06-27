import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserAddress } from './entities/user-address.entity';
import { UserProfile } from './entities/user-profile.entity';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';

interface CreateUserInput {
  email: string;
  passwordHash: string | null;
  role: UserRole;
  googleId?: string | null;
  isEmailVerified?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfilesRepository: Repository<UserProfile>,
    @InjectRepository(UserAddress)
    private readonly userAddressesRepository: Repository<UserAddress>,
  ) {}

  async createUserWithProfile(
    input: CreateUserInput,
    manager?: EntityManager,
  ): Promise<User> {
    const usersRepository =
      manager?.getRepository(User) ?? this.usersRepository;
    const profilesRepository =
      manager?.getRepository(UserProfile) ?? this.userProfilesRepository;

    const existingUser = await usersRepository.findOne({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const user = usersRepository.create({
      email: input.email,
      passwordHash: input.passwordHash,
      googleId: input.googleId ?? null,
      role: input.role,
      status: UserStatus.ACTIVE,
      isEmailVerified: input.isEmailVerified ?? false,
      deletedAt: null,
      lastLoginAt: null,
    });

    const savedUser = await usersRepository.save(user);
    const profile = profilesRepository.create({
      userId: savedUser.id,
    });

    await profilesRepository.save(profile);

    return this.findByIdOrFail(savedUser.id, manager);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        email,
      },
      relations: {
        profile: true,
        addresses: true,
      },
    });
  }

  async findByIdOrFail(userId: string, manager?: EntityManager): Promise<User> {
    const usersRepository =
      manager?.getRepository(User) ?? this.usersRepository;
    const user = await usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        profile: true,
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getCurrentUser(userId: string) {
    const user = await this.findByIdOrFail(userId);
    return this.toSafeUserResponse(user);
  }

  async updateLastLoginAt(userId: string, lastLoginAt: Date): Promise<void> {
    await this.usersRepository.update(
      {
        id: userId,
      },
      {
        lastLoginAt,
      },
    );
  }

  async updateCurrentUserProfile(userId: string, dto: UpdateUserProfileDto) {
    const user = await this.findByIdOrFail(userId);

    if (!user.profile) {
      user.profile = await this.userProfilesRepository.save(
        this.userProfilesRepository.create({
          userId,
        }),
      );
    }

    Object.assign(user.profile, dto);
    await this.userProfilesRepository.save(user.profile);

    return this.getCurrentUser(userId);
  }

  async createAddress(
    userId: string,
    dto: CreateUserAddressDto,
  ): Promise<UserAddress> {
    await this.findByIdOrFail(userId);

    return this.usersRepository.manager.transaction(async (manager) => {
      if (dto.isDefault) {
        await manager.getRepository(UserAddress).update(
          {
            userId,
          },
          {
            isDefault: false,
          },
        );
      }

      const address = manager.getRepository(UserAddress).create({
        userId,
        country: dto.country,
        city: dto.city,
        street: dto.street,
        building: dto.building ?? null,
        apartment: dto.apartment ?? null,
        postalCode: dto.postalCode ?? null,
        isDefault: dto.isDefault ?? false,
      });

      return manager.getRepository(UserAddress).save(address);
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateUserAddressDto,
  ): Promise<UserAddress> {
    const address = await this.userAddressesRepository.findOne({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.usersRepository.manager.transaction(async (manager) => {
      if (dto.isDefault) {
        await manager.getRepository(UserAddress).update(
          {
            userId,
          },
          {
            isDefault: false,
          },
        );
      }

      Object.assign(address, dto);
      return manager.getRepository(UserAddress).save(address);
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const result = await this.userAddressesRepository.delete({
      id: addressId,
      userId,
    });

    if (!result.affected) {
      throw new NotFoundException('Address not found');
    }
  }

  async softDeleteCurrentUser(userId: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);
    user.status = UserStatus.DELETED;
    user.deletedAt = new Date();
    await this.usersRepository.save(user);
  }

  toSafeUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            id: user.profile.id,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatarUrl: user.profile.avatarUrl,
            verificationStatus: user.profile.verificationStatus,
            createdAt: user.profile.createdAt,
            updatedAt: user.profile.updatedAt,
          }
        : null,
      addresses:
        user.addresses?.map((address) => ({
          id: address.id,
          country: address.country,
          city: address.city,
          street: address.street,
          building: address.building,
          apartment: address.apartment,
          postalCode: address.postalCode,
          isDefault: address.isDefault,
          createdAt: address.createdAt,
          updatedAt: address.updatedAt,
        })) ?? [],
    };
  }
}
