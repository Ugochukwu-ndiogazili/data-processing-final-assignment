import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ProfileAgeCategory } from '@prisma/client';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsEnum(ProfileAgeCategory)
  ageCategory: ProfileAgeCategory;
}
