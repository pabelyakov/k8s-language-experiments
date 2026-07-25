package com.meetup.beervote.results;

import com.meetup.beervote.beer.Beer;
import com.meetup.beervote.beer.BeerCatalog;
import com.meetup.beervote.dto.ApiDtos.ResultItem;
import com.meetup.beervote.dto.ApiDtos.ResultsResponse;
import com.meetup.beervote.vote.Vote;
import com.meetup.beervote.vote.VoteService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResultsService {

    private final VoteService voteService;
    private final BeerCatalog beerCatalog;

    public ResultsService(VoteService voteService, BeerCatalog beerCatalog) {
        this.voteService = voteService;
        this.beerCatalog = beerCatalog;
    }

    public ResultsResponse getResults() {
        Map<Integer, Long> counts = new HashMap<>();
        for (Beer beer : beerCatalog.listAll()) {
            counts.put(beer.getId(), 0L);
        }

        long totalVotes = 0;
        for (Vote vote : voteService.allVotes()) {
            counts.merge(vote.beerId(), 1L, Long::sum);
            totalVotes++;
        }

        final long total = totalVotes;
        List<ResultItem> results = beerCatalog.listAll().stream()
                .map(beer -> {
                    long votes = counts.getOrDefault(beer.getId(), 0L);
                    BigDecimal share = total == 0
                            ? BigDecimal.ZERO.setScale(4)
                            : BigDecimal.valueOf(votes)
                            .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP);
                    return new ResultItem(beer.getId(), beer.getName(), votes, share);
                })
                .sorted(Comparator
                        .comparingLong(ResultItem::votes).reversed()
                        .thenComparingInt(ResultItem::beerId))
                .toList();

        return new ResultsResponse(totalVotes, results);
    }
}
