import { IsNotEmpty, IsString } from 'class-validator';

export class WatchlistDto {
  @IsString()
  @IsNotEmpty()
  titleId: string;
}
