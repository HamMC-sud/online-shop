import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  idToken!: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value?: string }) => value?.trim().toLowerCase())
  email?: string;
}
