package com.meetup.beervote.beer;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Hardcoded beer nominees shared by beers list, votes, and results.
 */
public enum Beer {
    PILSNER_URQUELL(1, "Pilsner Urquell"),
    GUINNESS_DRAUGHT(2, "Guinness Draught"),
    HEINEKEN(3, "Heineken"),
    BUDWEISER_BUDVAR(4, "Budweiser Budvar"),
    HOEGAARDEN(5, "Hoegaarden"),
    PAULANER_HEFE(6, "Paulaner Hefe-Weißbier"),
    SIERRA_NEVADA(7, "Sierra Nevada Pale Ale"),
    BREWDOG_PUNK_IPA(8, "BrewDog Punk IPA"),
    CHIMAY_BLUE(9, "Chimay Blue"),
    BALTIC_PORTER(10, "Baltic Porter (local)");

    private final int id;
    private final String name;

    private static final Map<Integer, Beer> BY_ID = Arrays.stream(values())
            .collect(Collectors.toUnmodifiableMap(Beer::getId, Function.identity()));

    private static final List<Beer> SORTED_BY_ID = Arrays.stream(values())
            .sorted(Comparator.comparingInt(Beer::getId))
            .toList();

    Beer(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public static Optional<Beer> findById(int id) {
        return Optional.ofNullable(BY_ID.get(id));
    }

    public static List<Beer> allSortedById() {
        return SORTED_BY_ID;
    }
}
