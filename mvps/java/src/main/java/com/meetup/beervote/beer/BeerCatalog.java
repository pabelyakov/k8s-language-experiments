package com.meetup.beervote.beer;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class BeerCatalog {

    public List<Beer> listAll() {
        return Beer.allSortedById();
    }

    public Optional<Beer> findById(int id) {
        return Beer.findById(id);
    }

    public boolean exists(int id) {
        return Beer.findById(id).isPresent();
    }
}
