import { Controller, Get } from '@nestjs/common';
import { listBeersSortedById } from './beers.catalog';

@Controller('v1/beers')
export class BeersController {
  @Get()
  list() {
    return {
      items: listBeersSortedById().map(({ id, name }) => ({ id, name })),
    };
  }
}
