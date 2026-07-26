package com.meetup.beervote.web;

import com.meetup.beervote.beer.BeerCatalog;
import com.meetup.beervote.dto.ApiDtos.BeerItem;
import com.meetup.beervote.dto.ApiDtos.BeerListResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/beers")
public class BeerController {

    private final BeerCatalog beerCatalog;

    public BeerController(BeerCatalog beerCatalog) {
        this.beerCatalog = beerCatalog;
    }

    @GetMapping
    public BeerListResponse list() {
        var items = beerCatalog.listAll().stream()
                .map(beer -> new BeerItem(beer.getId(), beer.getName()))
                .toList();
        return new BeerListResponse(items);
    }
}
