namespace BeerVote.Models;

public sealed record User(Guid Id, string Name, DateTimeOffset CreatedAt);
