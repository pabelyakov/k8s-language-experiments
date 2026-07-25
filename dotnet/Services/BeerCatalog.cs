using BeerVote.Models;

namespace BeerVote.Services;

public sealed class BeerCatalog
{
    private static readonly IReadOnlyList<Beer> Beers =
    [
        new(1, "Pilsner Urquell"),
        new(2, "Guinness Draught"),
        new(3, "Heineken"),
        new(4, "Budweiser Budvar"),
        new(5, "Hoegaarden"),
        new(6, "Paulaner Hefe-Weißbier"),
        new(7, "Sierra Nevada Pale Ale"),
        new(8, "BrewDog Punk IPA"),
        new(9, "Chimay Blue"),
        new(10, "Baltic Porter (local)"),
    ];

    private static readonly IReadOnlyDictionary<int, Beer> ById =
        Beers.ToDictionary(b => b.Id);

    public IReadOnlyList<Beer> ListAll() => Beers;

    public Beer? FindById(int id) => ById.GetValueOrDefault(id);

    public bool Exists(int id) => ById.ContainsKey(id);
}
