using BeerVote.Dtos;

namespace BeerVote.Services;

public sealed class ResultsService
{
    private readonly VoteService _voteService;
    private readonly BeerCatalog _beerCatalog;

    public ResultsService(VoteService voteService, BeerCatalog beerCatalog)
    {
        _voteService = voteService;
        _beerCatalog = beerCatalog;
    }

    public ResultsResponse GetResults()
    {
        var counts = _beerCatalog.ListAll().ToDictionary(b => b.Id, _ => 0L);

        long totalVotes = 0;
        foreach (var vote in _voteService.AllVotes())
        {
            counts[vote.BeerId] = counts.GetValueOrDefault(vote.BeerId) + 1;
            totalVotes++;
        }

        var total = totalVotes;
        var results = _beerCatalog.ListAll()
            .Select(beer =>
            {
                var votes = counts.GetValueOrDefault(beer.Id);
                var share = total == 0
                    ? 0.0000m
                    : decimal.Round(votes / (decimal)total, 4, MidpointRounding.AwayFromZero);
                return new ResultItem(beer.Id, beer.Name, votes, share);
            })
            .OrderByDescending(r => r.Votes)
            .ThenBy(r => r.BeerId)
            .ToList();

        return new ResultsResponse(totalVotes, results);
    }
}
