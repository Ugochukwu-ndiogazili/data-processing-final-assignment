import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProfileAgeCategory } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsEnum(ProfileAgeCategory)
  ageCategory?: ProfileAgeCategory;
}
