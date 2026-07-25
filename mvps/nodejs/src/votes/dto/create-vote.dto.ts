import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateVoteDto {
  @IsUUID('4', { message: 'user_id is required' })
  user_id!: string;

  @IsInt({ message: 'beer_id must be one of the nominees (1..10)' })
  @Min(1, { message: 'beer_id must be one of the nominees (1..10)' })
  @Max(10, { message: 'beer_id must be one of the nominees (1..10)' })
  beer_id!: number;
}
