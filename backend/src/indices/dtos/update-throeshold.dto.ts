import { IsNumber, IsString } from 'class-validator';

export class UpdateThoresholdDto {
  @IsNumber()
  threshold: number;

  @IsString()
  name: string;

  @IsString()
  direction: 'up' | 'down';
}
