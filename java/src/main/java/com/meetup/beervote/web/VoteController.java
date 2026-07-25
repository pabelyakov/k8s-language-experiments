package com.meetup.beervote.web;

import com.meetup.beervote.dto.ApiDtos.CreateVoteRequest;
import com.meetup.beervote.dto.ApiDtos.VoteResponse;
import com.meetup.beervote.vote.VoteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VoteResponse cast(@RequestBody CreateVoteRequest request) {
        return voteService.cast(request);
    }
}
