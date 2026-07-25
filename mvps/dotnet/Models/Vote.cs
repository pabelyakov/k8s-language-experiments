namespace BeerVote.Models;

public sealed record Vote(Guid Id, Guid UserId, int BeerId, DateTimeOffset VotedAt);
