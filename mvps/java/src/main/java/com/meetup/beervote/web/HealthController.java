package com.meetup.beervote.web;

import com.meetup.beervote.dto.ApiDtos.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("ok", "beer-vote", "java-spring");
    }
}
