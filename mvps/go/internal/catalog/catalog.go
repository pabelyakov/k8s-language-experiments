package catalog

import "beer-vote/internal/model"

var beers = []model.Beer{
	{ID: 1, Name: "Pilsner Urquell"},
	{ID: 2, Name: "Guinness Draught"},
	{ID: 3, Name: "Heineken"},
	{ID: 4, Name: "Budweiser Budvar"},
	{ID: 5, Name: "Hoegaarden"},
	{ID: 6, Name: "Paulaner Hefe-Weißbier"},
	{ID: 7, Name: "Sierra Nevada Pale Ale"},
	{ID: 8, Name: "BrewDog Punk IPA"},
	{ID: 9, Name: "Chimay Blue"},
	{ID: 10, Name: "Baltic Porter (local)"},
}

var byID map[int]model.Beer

func init() {
	byID = make(map[int]model.Beer, len(beers))
	for _, beer := range beers {
		byID[beer.ID] = beer
	}
}

// All returns the hardcoded beer catalog sorted by id ascending.
func All() []model.Beer {
	out := make([]model.Beer, len(beers))
	copy(out, beers)
	return out
}

// FindByID returns the beer with the given id, if present.
func FindByID(id int) (model.Beer, bool) {
	beer, ok := byID[id]
	return beer, ok
}

// Exists reports whether id is a nominee beer.
func Exists(id int) bool {
	_, ok := byID[id]
	return ok
}
