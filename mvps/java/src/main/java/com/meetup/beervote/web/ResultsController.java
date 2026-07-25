package com.meetup.beervote.web;

import com.meetup.beervote.dto.ApiDtos.ResultsResponse;
import com.meetup.beervote.results.ResultsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/results")
public class ResultsController {

    private final ResultsService resultsService;

    public ResultsController(ResultsService resultsService) {
        this.resultsService = resultsService;
    }

    @GetMapping
    public ResultsResponse results() {
        return resultsService.getResults();
    }
}
