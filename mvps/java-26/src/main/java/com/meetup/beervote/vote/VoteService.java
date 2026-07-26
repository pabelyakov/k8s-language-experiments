package com.meetup.beervote.vote;

import com.meetup.beervote.beer.Beer;
import com.meetup.beervote.beer.BeerCatalog;
import com.meetup.beervote.dto.ApiDtos.CreateVoteRequest;
import com.meetup.beervote.dto.ApiDtos.VoteResponse;
import com.meetup.beervote.error.ApiException;
import com.meetup.beervote.user.UserService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collection;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VoteService {

    private final UserService userService;
    private final BeerCatalog beerCatalog;

    /** All votes keyed by vote id. */
    private final ConcurrentHashMap<UUID, Vote> votesById = new ConcurrentHashMap<>();

    /** Ensures one vote per user (userId → voteId). */
    private final ConcurrentHashMap<UUID, UUID> voteIdByUserId = new ConcurrentHashMap<>();

    public VoteService(UserService userService, BeerCatalog beerCatalog) {
        this.userService = userService;
        this.beerCatalog = beerCatalog;
    }

    public VoteResponse cast(CreateVoteRequest request) {
        if (request == null || request.userId() == null) {
            throw new ApiException(400, "user_id is required");
        }

        if (!userService.exists(request.userId())) {
            throw new ApiException(404, "user not found");
        }

        Beer beer = beerCatalog.findById(request.beerId())
                .orElseThrow(() -> new ApiException(400, "beer_id must be one of the nominees (1..10)"));

        UUID voteId = UUID.randomUUID();
        Vote vote = new Vote(voteId, request.userId(), beer.getId(), Instant.now());

        UUID existing = voteIdByUserId.putIfAbsent(request.userId(), voteId);
        if (existing != null) {
            throw new ApiException(409, "user has already voted");
        }

        votesById.put(voteId, vote);
        return new VoteResponse(vote.id(), vote.userId(), vote.beerId(), beer.getName(), vote.votedAt());
    }

    public Collection<Vote> allVotes() {
        return votesById.values();
    }
}
