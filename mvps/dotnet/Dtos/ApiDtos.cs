namespace BeerVote.Dtos;

public sealed record HealthResponse(string Status, string Service, string Runtime);

public sealed record BeerItem(int Id, string Name);

public sealed record BeerListResponse(IReadOnlyList<BeerItem> Items);

public sealed record CreateUserRequest(string? Name);

public sealed record UserResponse(Guid Id, string Name, DateTimeOffset CreatedAt);

public sealed record UserListResponse(
    IReadOnlyList<UserResponse> Items,
    int Page,
    int PageSize,
    long Total,
    int TotalPages);

public sealed record CreateVoteRequest(Guid? UserId, int BeerId);

public sealed record VoteResponse(
    Guid Id,
    Guid UserId,
    int BeerId,
    string BeerName,
    DateTimeOffset VotedAt);

public sealed record ResultItem(int BeerId, string BeerName, long Votes, decimal Share);

public sealed record ResultsResponse(long TotalVotes, IReadOnlyList<ResultItem> Results);

public sealed record ErrorResponse(string Error, int Status);
