import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartViewingDto {
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @IsString()
  @IsNotEmpty()
  titleId: string;

  @IsOptional()
  @IsString()
  episodeId?: string;
}
