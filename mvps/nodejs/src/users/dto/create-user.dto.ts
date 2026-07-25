import { IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1, { message: 'name must be 1..64 characters after trim' })
  @MaxLength(64, { message: 'name must be 1..64 characters after trim' })
  name!: string;
}
