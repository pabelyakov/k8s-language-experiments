using System.Collections.Concurrent;
using BeerVote.Dtos;
using BeerVote.Errors;
using BeerVote.Models;

namespace BeerVote.Services;

public sealed class VoteService
{
    private readonly UserService _userService;
    private readonly BeerCatalog _beerCatalog;

    private readonly ConcurrentDictionary<Guid, Vote> _votesById = new();
    private readonly ConcurrentDictionary<Guid, Guid> _voteIdByUserId = new();

    public VoteService(UserService userService, BeerCatalog beerCatalog)
    {
        _userService = userService;
        _beerCatalog = beerCatalog;
    }

    public VoteResponse Cast(CreateVoteRequest? request)
    {
        if (request?.UserId is null)
        {
            throw new ApiException(400, "user_id is required");
        }

        var userId = request.UserId.Value;

        if (!_userService.Exists(userId))
        {
            throw new ApiException(404, "user not found");
        }

        var beer = _beerCatalog.FindById(request.BeerId)
            ?? throw new ApiException(400, "beer_id must be one of the nominees (1..10)");

        var voteId = Guid.NewGuid();
        var vote = new Vote(voteId, userId, beer.Id, DateTimeOffset.UtcNow);

        if (!_voteIdByUserId.TryAdd(userId, voteId))
        {
            throw new ApiException(409, "user has already voted");
        }

        _votesById[voteId] = vote;
        return new VoteResponse(vote.Id, vote.UserId, vote.BeerId, beer.Name, vote.VotedAt);
    }

    public ICollection<Vote> AllVotes() => _votesById.Values;
}
