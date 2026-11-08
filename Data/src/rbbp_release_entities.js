async function AddRbbpReleaseEntities(index, lang, abilitiesEN, abilitiesLoc, skillsEN, skillsLoc, includeGuide) {
    const path = "/rbbp/";
    const unitIcon = (icon) => "Icons/UnitIcons/" + icon + ".png";
    function set(name, icon, obj, loc, link) {
        if (obj) index.set(name, { type: "reference", icon: path + icon, obj, loc, link: link && path + link });
    }

    const skill = skillsEN.find(({ id }) => id === "hs_siphon_blood");
    const ability = abilitiesEN.find(({ slug }) => slug === skill?.abilities?.[0]?.slug);
    if (ability) {
        const loc = abilitiesLoc.find(({ slug }) => slug === ability.slug);
        const skillLoc = skillsLoc.find(({ resid }) => resid === skill.resid);
        const withSkill = (entry, meta) => ({
            ...entry,
            name: meta?.name || entry.name,
            description: (meta?.group_name || skill.group_name) + "<br>" +
                entry.accuracy + " " + entry.actionPoints + " · " + entry.range + " <range></range><br>" +
                entry.description
        });
        set(skill.name, unitIcon(skill.icon), withSkill(ability, skill), loc && withSkill(loc, skillLoc),
            "HTML/HeroSkillsList.html?skill=Siphon%20Blood");
    }

    for (const name of ["Taunt Strike", "Taunting Advance"]) {
        const entry = index.get(name);
        if (entry) {
            const withModifiers = (obj) => ({
                ...obj,
                description: obj.description + "<bulletlist>" + (obj.modifiers || []).map(({ description }) =>
                    "<bullet>" + description + "</bullet>").join("") + "</bulletlist>"
            });
            entry.obj = withModifiers(entry.obj);
            if (entry.loc) entry.loc = withModifiers(entry.loc);
        }
    }

    const [upgrades, upgradesLoc] = await Promise.all(["EN", lang].map((language) =>
        fetchJsonShared(path + "Data/" + language + "/ItemForgeUpgrades.json")));
    for (const [name, id] of Object.entries({
        "Inflict Bleeding": "equipment_upgrade_passive_inflict_bleeding_90%",
        "Infecting": "equipment_upgrade_passive_infecting",
        "Tempest's Chorus": "equipment_upgrade_passive_tempests_chorus"
    })) {
        const upgrade = upgrades.find((entry) => entry.id === id);
        if (upgrade) set(name, unitIcon(upgrade.icon), upgrade,
            upgradesLoc.find(({ resid }) => resid === upgrade.resid), "HTML/Infusions.html");
    }

    const [poEN, poLoc] = await Promise.all([
        Promise.resolve(jsonAllFromPO),
        lang === languageSelect.value ? Promise.resolve(jsonAllFromPOLocalized) :
            fetchJsonShared(path + "Data/" + lang + "/all.json")
    ]);
    function fromPO(name, id, icon, link) {
        const obj = findBy(poEN, "id", id);
        if (obj) set(name, icon, { ...obj, name: obj.name || name }, findBy(poLoc, "id", id), link);
    }
    fromPO("Taunted", "STATUSEFFECTS_UNITPROPERTIES@TAUNTED", "Icons/StatusEffects/taunted.png");
    if (!includeGuide) return;

    index.delete("Lost Soul");
    const cannon = abilitiesEN.find(({ slug }) =>
        slug === "fire_magelock_cannon_ability_0000049000000160_0000048d00001f64");
    if (cannon) set(cannon.name, unitIcon(cannon.icon), cannon,
        abilitiesLoc.find(({ slug }) => slug === cannon.slug));
    fromPO("Insanity Immunity", "COMBATPROPERTIES_TACTICAL@SLEEPER_IN_SHADOW_INSANE_IMMUNE",
        "Icons/StatusEffects/insanity.png", "HTML/StatusEffects.html#0000041b00000b17btn");
    fromPO("Status Resistance", "CONCEPT@STATUS_RESISTANCE", "Icons/Text/status_resistance.png");
    const ruler = jsonFactionCreation.find(({ id }) => id === "eldritch_sovereign");
    fromPO(ruler.name, ruler.extraLookup, "Icons/FactionCreation/" + ruler.icon + ".png",
        "HTML/FactionCreation.html");

    for (const [name, id, icon] of [
        ["Umbral Abyss", "DLC@ELDRITCHREALMS@META_EMPIRE@TRAIT_SHADOW_ENABLED", "umbral_abyss"],
        ["Crystal Dwelling", "DLC@GIANTKINGS@REALM_TRAIT@CRYSTAL_DWELLING", "crystal_dwelling"],
        ["Shrouded Isles", "DLC@SECRETSOFTHEARCHMAGES@META_EMPIRE@TRAIT_SHROUDED_REGIONS", "shrouded_isles"]
    ]) {
        // Art from the Age of Wonders Fandom realms gallery (RU).
        fromPO(name, id, "Icons/RealmTraits/" + icon + ".png");
    }

    for (const [name, id] of Object.entries({
        "Crusader Host": "crusader_host",
        "Umbral Nest": "umbral_nest",
        "Wizard Tower": "lost_wizard_tower",
        "Forsaken Temple": "forsaken_temple",
        "Hidden Wellspring": "hidden_wellspring",
        "World Tree": "world_tree",
        "Vaultsphere": "vaultsphere",
        "Ancient Dragon Hoard": "ancient_dragon_hoard",
        "Subterranean Monuments": "subterreanean_passage",
        "Infernal Volcano": "volcano",
        "Lithorite Peaks": "lithorine_peak",
        "Haunted Battlefield": "haunted_battlefield",
        "Icebound Behemoth": "trapped_behemoth",
        "Grand Statuary": "giant_steps",
        "Cascade Falls": "waterfalls",
        "Fountain of Creation": "fountain_of_creation",
        "Thorn Heart": "thorn_heart"
    })) {
        const structure = findBy(jsonWorldStructures, "id", id);
        if (!structure) continue;
        const page = structure.type === "Spawner" ? "Spawners" :
            structure.type === "Landmark" ? "Landmarks" : "AncientWonders";
        fromPO(name, structure.extraLookup, "Icons/StructurePics/" + id + ".png", "HTML/" + page + ".html");
    }

    const health = upgrades.find(({ id }) => id === "equipment_upgrade_defense_hp__5");
    if (health) set("Hit Points", unitIcon(health.icon), { name: "Hit Points" },
        lang === "RU" ? { name: "Здоровье" } : undefined, "HTML/Infusions.html");

    const relic = jsonItemForgeTypes.find(({ id }) => id === "equipment_item_relic_of_mind_type");
    if (relic) set("Eldritch Relic", "Icons/ItemForge/eldritchrelic.png", relic,
        lang === languageSelect.value && jsonItemForgeTypesLocalized.find(({ resid }) => resid === relic.resid),
        "HTML/ItemForge.html");
}
