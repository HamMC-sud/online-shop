import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserAddressDto {
  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value: string }) => value.trim())
  country!: string;

  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value: string }) => value.trim())
  city!: string;

  @IsString()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value.trim())
  street!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value?: string }) => value?.trim())
  building?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value?: string }) => value?.trim())
  apartment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }: { value?: string }) => value?.trim())
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
