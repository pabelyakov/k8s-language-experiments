import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be >= 1' })
  @Min(1, { message: 'page must be >= 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page_size must be 1..100' })
  @Min(1, { message: 'page_size must be 1..100' })
  @Max(100, { message: 'page_size must be 1..100' })
  page_size: number = 20;

  @IsOptional()
  @IsIn(['name', 'created_at', 'id'], {
    message: 'sort must be one of: name, created_at, id',
  })
  sort: 'name' | 'created_at' | 'id' = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'order must be one of: asc, desc' })
  order: 'asc' | 'desc' = 'desc';
}
