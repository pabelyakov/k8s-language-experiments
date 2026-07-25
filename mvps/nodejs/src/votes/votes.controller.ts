import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VotesService } from './votes.service';

@Controller('v1/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  cast(@Body() dto: CreateVoteDto) {
    return this.votesService.cast(dto);
  }
}
