import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getCurrentUser(userId);
  }

  @Patch('me/profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateCurrentUserProfile(userId, dto);
  }

  @Post('me/addresses')
  async createAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateUserAddressDto,
  ) {
    return this.usersService.createAddress(userId, dto);
  }

  @Patch('me/addresses/:id')
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUuidPipe) addressId: string,
    @Body() dto: UpdateUserAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUuidPipe) addressId: string,
  ): Promise<void> {
    await this.usersService.deleteAddress(userId, addressId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser('id') userId: string): Promise<void> {
    await this.usersService.softDeleteCurrentUser(userId);
  }
}
