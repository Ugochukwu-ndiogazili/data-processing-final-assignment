import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ViewingProgressDto {
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @IsString()
  @IsNotEmpty()
  titleId: string;

  @IsOptional()
  @IsString()
  episodeId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationWatched?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lastPosition?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
