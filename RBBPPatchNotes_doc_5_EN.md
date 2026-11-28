# Realm Traits

## [untouched] Untouched
- Map generation now also excludes handcrafted regions on water.
- Map generation can now include regions with Landmarks.

# Strategic Map

## Landmarks

{{Tempestuous Vortex}}
- [portal] grant +5 → +2 [mana]
- {{Accelerated Movement}}
  - 3 → 1 [turn]

{{Armada's Fall}}
- [quarry] grant +5 → +2 [production]
- [mine] grant +5 → +2 [draft]

{{Perishing Archnemesis}}
- Provinces grant +5 [mana] +10 [draft] → +2 [mana] +3 [draft]

{{Mistflow Gardens}}
- Provinces grant +5 [food] +3 [mana] → +2 [food] +1 [mana]
- [portal] grant +5 → +2 [food]

{{Broken Wizard's Throne}}
- Provinces grant +5 → +1 [knowledge]
- [sciencestation] grant +10 → +2 [mana]

# Empire Tree

## {{General}}

- Position 3B — (60/125 [influence]): Excavation
  - Added strategic spell — {{Excavation}}
    - Casting cost: 80 [mana] 80 [globalspell]
    - Removes Mountain and Stalagmites features from the targeted habitable or uninhabitable province.
    - After casting, the spell goes on cooldown for one turn.

# Rulers

## [dragonlord] Dragon Lord

- Reduced ruler upkeep
  - Per level: 8 → 6 [gold]

## [eldritch] Eldritch Sovereign

- Strategic spell — {{Mesmerizing Draft Ritual}}
  - Reduced bonus
    - +50 → +30 [draft]

## [giantking] Giant King

### Storm Giant King

- Item Forge
  - Passive effect — {{Rune of Creation: Storm}}
    - Active ability — {{Conjure Crystal Pillar}}
      - Unit — {{Crystal Pillar}} T3
        - Has zero Action Points when summoned.

## [eldervampire] Elder Vampire

- Increased upkeep for unlocking special affinity abilities
  - Level 4
    - 10 [gold] → 25 [gold]
  - Level 12
    - 20 [gold] → 45 [gold]
- This upkeep can no longer be reduced.
- City structure — {{Vampire Castle: Chambers}}
  - [combatsummons] Combat Summons no longer receive the [rankchampion] bonus.
- City structure — {{Vampire Castle: Grand Halls}}
  - [combatsummons] Combat Summons no longer receive the [rankchampion] bonus.
- City structure — {{Vampire Castle: Throne of Blood}}
  - [combatsummons] Combat Summons no longer receive the [rankchampion] bonus.
- Passive ability — Experience Drain
  - Reduced effect
    - 20% → 10% [xp]
- Active ability — {{Draining Bite}}
  - Increased damage
    - 18 → 24 [physical]
- Active ability — {{Blood Communion}}
  - Reduced effect
    - Negative Status Effects removed
      - 3 → 2
    - Healing
      - 30 → 20 [temphp]

# Lords

## Created Leaders

### Observer
- This leader cannot be customized.
- Selectable in any game (use in Story Realms is discouraged).
- Remains neutral in team games.
- Is defeated at the start if controlled by the AI.
- Is defeated on the following turn if control passes to the AI.
- Loses the starting city and army at the start without being defeated.
- No additional Free City of the same faction appears on the map.
- Excluded from random leader selection.
- Cannot cast spells or rituals.
- All per-turn resource income is zero.
- Has no Whispering Stones.
- Cannot declare war or propose treaties, pacts, or alliances to players.
- Players cannot declare war or propose treaties, pacts, or alliances to the Observer.
- Players cannot transfer their cities or Ancient Wonders to the Observer.
- Diplomatic standing with other players remains neutral.
- Has vision of the entire map.
- Can see concealed player units.
- Cannot see concealed neutral units.

### The Grey Wizard
- This leader cannot be customized.
- Selectable in any game (use in Story Realms is discouraged).
- Remains neutral in team games.
- Is defeated at the start if controlled by the AI.
- Is defeated on the following turn if control passes to the AI.
- Loses the starting city and army at the start without being defeated.
- No additional Free City of the same faction appears on the map.
- Excluded from random leader selection.
- Cannot cast ordinary spells or rituals.
- Can cast special strategic spells to place Infestations on the map.
- All per-turn resource income is zero.
- Has no Whispering Stones.
- Receives a one-time grant of resources at the start
  - 999999 [gold]
  - 999999 [mana]
  - 99999 [fragments]
  - 99999 [essence]
  - 20 of each Magic Material
- Can use the Item Forge.
- Cannot declare war or propose treaties, pacts, or alliances to players.
- Players cannot declare war or propose treaties, pacts, or alliances to the Grey Wizard.
- Players cannot transfer their cities or Ancient Wonders to the Grey Wizard.
- Diplomatic standing with other players remains neutral.
- Can trade resources and artifacts through diplomacy.
- Can create quests.
- Has vision of the entire map.
- Can see concealed player units.
- Cannot see concealed neutral units.

# Governors

## [scholargov] Scholarly Governor

- Renown level 2
  - Reduced bonus from [sciencestation]
    - +5 → +3 [knowledge]

# Item Forge

## Passive Abilities

### {{Melee Mage}}
- No longer available when forging items.

### {{Death Surge}}
- No longer appears in rewards or Free Cities.

# Cultures

## [culturefeudal] Feudal

### [aristocracysub] Feudal — Aristocracy

- Faction passive ability — Liege Lord
  - The bonus now also applies to the Liege Lord.
  - Reduced world map [hp] recovery bonus
    - 5 → 3 [hp]
  - Reduced unit upkeep discount
    - 10% → 5%

## [culturemystic] Mystic

### [schoolpotential] Mystic — School of Potential

- Faction ability — Arcane Inspiration
  - Also does not apply to Sustained World Spells (reverted to vanilla).

## [culturedark] Dark

### [cultdeath] Dark — Cult of Death

- Faction strategic spell — {{Morbid Sacrifice}}
  - Cost reverted to vanilla.
- Special Province Improvement — {{Mausoleum}}
  - Changed construction cost
    - 130 [production] 1 [embalmedsacrifice] → 60 [gold] 130 [production]

## [cultureoathsworn] Oathsworn

### [oathstrife] Oathsworn — Oath of Strife

- Unit — {{Warbound}} T3
  - Active ability — {{Infernal Blaze}}
    - Fixed an issue where the ability applied harmful effects from unit enchantments to the caster.

## [culturenomad] Nomad

- City structure — {{Sentry Nests}}
  - Fixed an issue where Sentry Nests blocked construction of {{Caltrop Stash}}, {{Arcane Battlements}}, and {{Archer Battlements}}.

## [mercantile] Mercantile

### [mercantile_cartel] Mercantile — Cartel

- Unit — {{Goon}} T1
  - Increased stats (reverted to vanilla).
- Faction mechanic — {{Leverage}}
  - Reverted to vanilla.

### [mercantile_barony] Mercantile — Barony

- Unit — {{Silvershot}} T3
  - Active ability — {{Silver Bullet Shot}}
    - Restored the Base tag (reverted to vanilla).
    - Reduced range
      - 6 → 5 [range]

# Form Traits

## Defense

### {{Inner Radiance}}
- Bonuses and effects reverted to vanilla.
- Reduced cost
  - 2 → 1 point

### {{Inner Lightning}}
- Bonuses and effects reverted to vanilla.
- Reduced cost
  - 2 → 1 point

### {{Inner Frost}}
- Bonuses and effects reverted to vanilla.
- Reduced cost
  - 2 → 1 point

### {{Inner Fire}}
- Bonuses and effects reverted to vanilla.
- Reduced cost
  - 2 → 1 point

# Society Traits

## [affinitychaos] Chaos

### {{Ritual Cannibals}}
- Active ability — {{Corpse Eating}}
  - Can now target corpses of
    - [combatsummons] Combat Summons

### {{Ruthless Raiders}}
- Added a bonus
  - Non-hero units gain +20% [xp] in combat.

## [affinitynature] Nature

### {{Druidic Terraformers}}
- Added to the pool of possible starting units
  - {{Lesser Light Spirit}}

### {{Talented Collectors}}
- Reduced the bonus from Magic Materials in your cities
  - +10 → +7 [draft]
  - +10 → +7 [production]
  - +10 → +7 [food]
  - +10 → +7 [gold]
  - +10 → +7 [mana]

## [affinityastral] Astral

### {{Hermit Kingdom}}
- Removed the city [production] bonus.
- Reduced the starting bonus
  - 100 → 50 [influence]

# Cities

## City Structures

### {{Palisade Walls}}
- Fixed the battle map for water sieges.

### {{Wizard Tower: Chambers}}
- [combatsummons] Combat Summons no longer receive the [rankchampion] bonus.

### {{Wizard Tower: High Halls}}
- [combatsummons] Combat Summons no longer receive the [rankchampion] bonus.

### {{Wizard Tower: Apex}}
- [combatsummons] Combat Summons no longer receive the [rankchampion] bonus.

## Unit Types

### [combatsummons] Combat Summons
- Removed the passive ability {{Status Effect Immunity: Soulbound}}.

# Tomes

## Special

### {{Eldritch Pact}}
- Strategic spell — {{Ritual of the Gloomveil}}
  - No longer interacts with Arcane Inspiration.

## [affinityastral] Astral

### {{Tome of Warding}} T1 [astral] [astral]
- Unit enchantment — {{Static Shields}}
  - {{Stunned}} can now also affect heroes.

### {{Tome of Scrying}} T2 [astral] [astral]
- Unit enchantment — {{Guided Projectiles}}
  - Increased how much of the range penalty to [accuracy] is ignored
    - 1 → 2

## [affinitynature] Nature

### {{Tome of Beasts}} T1 [nature] [nature]
- Unit — {{Wildspeaker}} T2
  - Active ability — {{Conjure Animal}}
    - Increased the summoned animal's lifetime
      - 3 → 4 [turn]

## [affinityorder] Order

### {{Tome of Faith}} T1 [order] [order]
- Strategic spell — {{Army Heal}}
  - Increased healing
    - 25 → 30 [hp]
  - Reduced cost
    - 80 [mana] 80 [globalspell] → 45 [mana] 45 [globalspell]

### {{Tome of Zeal}} T1 [order] [order]
- Strategic spell — {{Fanatical Workforce}}
  - Changed duration
    - 3 [turn] → indefinite
    - Upkeep: 10 [mana] per [turn]
  - Reduced bonus
    - +60 → +20 [production]
  - Changed modifier
    - -20 [food] → +10 [happiness]
- Combat spell — {{Inspiring Chant}}
  - Reduced {{Strengthened}} stacks
    - 2 → 1

## [affinitychaos] Chaos

### {{Tome of the Horde}} T1 [chaos] [chaos]
- Race transformation — {{Spawnkin}}
  - Reduced damage bonus for non-hero units
    - +20% → +15%
- Combat spell — {{Fury of the Horde}}
  - Increased cost
    - 10 [mana] 15 [combatspell] → 30 [mana] 25 [combatspell]
  - Reduced {{Strengthened}} stacks
    - 2 → 1
  - Now grants {{Fortune}}.

## [affinitymaterium] Materium

### {{Tome of Enchantment}} T1 [materium] [materium]
- Strategic spell — {{Awakened Tools}}
  - Reduced effect
    - +20 → +10 [draft]

### {{Tome of Transmutation}} T3 [materium] [materium]
- Special Province Improvement — {{Transmutation Circle}}
  - Can now be built only once in the Throne City.

## Mixed

### {{Tome of Hydromancy}} T1 [nature] [materium]
- Strategic spell — {{Revitalizing Rush}}
  - Increased healing
    - 10 → 20 [hp]
  - Reduced {{Hastened}} duration
    - 3 → 1 [turn]
- Combat spell — {{Riptide}}
  - Removed the bonus that doubled the effect against targets with {{Wet}}.
- Unit — {{Flowbinder Archer}} T1
  - Active ability — {{Waterbind Arrow}}
    - {{Immobilized}} is no longer guaranteed against targets with {{Wet}}.

### {{Tome of the Sprite}} T1 [astral] [nature]
- Strategic spell — {{Catnap}}
  - Increased healing
    - 1 → 2 [hp]
- Unit enchantment — {{Fey Bond}}
  - Increased bonus
    - +10 → +15 [happiness]
- Unit enchantment — {{Fairy Dust}}
  - Active ability — {{Fairy Dust}}
    - Changed the chance to apply the effect
      - 120% → guaranteed
- Combat spell — {{Captivating Lights}}
  - Reduced cost
    - 15 [mana] 20 [combatspell] → 10 [mana] 15 [combatspell]
- Unit — {{Morning Sprite}} T1
  - Active ability — {{Morning Boon}}
    - Added an effect
      - Grace
    - Increased effect
      - 1 → 2 {{Regeneration}}

### {{Tome of the Warband}} T1 [chaos] [materium]
- Strategic spell — {{Training Regimen}}
  - Reduced effect
    - +40 → +30 [draft]

### {{Tome of the Damned}} T2 [chaos] [shadow]
- Combat spell — {{Accursed Undertow}}
  - Reduced radius
    - 2 → 1
- Combat effect — {{Damned}}
  - Reduced the chance bonus
    - 15% → 5%

### {{Tome of Prophecies}} T3 [order] [astral]
- Unit — {{Oracle}} T4 (reverted to vanilla).

# Neutral Units

## T1

### Unit — {{Astral Wisp}} T1
- Added a passive ability
  - {{Low Maintenance}}

## T2

### Unit — {{Blessed Dragon}} T2
- Active ability — {{Graceful Rain}}
  - Increased effect
    - 15 → 25 [temphp]

## T3

### Unit — {{Summer Fairy}} T3
- Active ability — {{Blooming Life}}
  - Increased effect
    - 15 → 25 [temphp]
- Added a passive ability
  - {{Feygrowth}}

### Unit — {{Astral Siphoner}} T3
- Added a passive ability
  - {{Low Maintenance}}
