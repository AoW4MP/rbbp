const unlockableUnitsMapStructures = {
    wildlife_sanctuary: ["goretusk_piglet", "dread_spider_hatchling", "vampire_spider_hatchling", "razorback", "warg"],
    demon_gate: ["inferno_puppy", "gremlin", "inferno_hound", "chaos_eater", "gluttonous_imp"],
    wyvern_eyrie: ["fire_wyvern", "frost_wyvern", "gold_wyvern", "obsidian_wyvern"],
    accursed_shrine: ["accursed_ogre", "accursed_blade", "accursed_trickster"],
    shrine_of_prosperity: ["blessed_dragon", "radiant_guardian", "righteous_judge"]
};

function cleanTranslation(text) {
    if (!text) return text;

    return (
        text
            // Remove ^fa{[1]}fn{[2]} style markers
            .replace(/\^fa\{\[\d+\]\}fn\{\[\d+\]\}/g, "")
            // Remove any ^ followed by a single letter (e.g. ^m, ^N, ^a)
            .replace(/\^[a-zA-Z]/g, "")
            // Clean up leftover spaces
            .trim()
    );
}

const architectCultureUnits = ["surveyor", "cultivator", "earthbreaker", "guardian", "shademaker", "architect"];

const MountedSpecialList = [
    "pioneer",
    "pathfinder",
    "scout",
    "lightseeker",
    "knight",
    "outrider",
    "dark_knight",
    "tyrant_knight",
    "wildspeaker",
    "houndmaster",
    "spellbreaker",
    "dragoon",
    "spirit_tracker",
    "spellshield"
];

const extraFormUnitsList = [
    "phantasm_warrior",
    "evoker",
    "white_witch",
    "necromancer",
    "zombie",
    "decaying_zombie",
    "skeleton",
    "chaplain",
    "zealot",
    "inquisitor",
    "glade_runner",
    "pyromancer",
    "warbreed",
    "exemplar",
    "transmuter",
    "zephyr_archer",
    "afflictor",
    "stormbringer",
    "constrictor",
    "pyre_templar",
    "monk",
    "shade",
    "wildspeaker",
    "houndmaster",
    "geomancer",
    "paladin",
    "oracle",
    "pain_bringer",
    "blood_cultist",
    "subjugator",
    "lieutenant",
    "warlord",
    "temptress",
    "priest_of_the_weave"
];

const secretSpellsList = [
    "abominable_mistling","colossal_penguin", "feylor", "yakas_feline_infusion","fanfare_of_mercy", "ysariels_fallen_form", "bhajifs_disruption", "zaethyls_paradise",
    "karissas_immolation", "cinrens_temptation", "ydgaards_trade", "noctus_mastery", "frikkas_revelation", "nimues_failure",
    "thulyanas_contortion", "belbedors_folly", "articas_ice_age"
];

const incorrectIconOverrideList = [
    "summon_zealot",
    "summon_lightbringer",
    "conjure_divine_beacon",
    "summon_lesser_snow_spirit",
    "summon_wind_rager",
    "summon_balor",
    "summon_lesser_magma_spirit",
    "summon_horned_god",
    "summon_corrupt_soul",
    "summon_lesser_light_spirit",
    "summon_blessed_soul"
];

const extraAbilities = [];

const extraSkills = [
];

function checkSecretSpell(id) {
    
    if (secretSpellsList.includes(id) && !showSecretSpells.checked) {
        return true;
    }
   
    return false;
}

function fetchJsonFiles(filePaths) {
    return Promise.all(
        filePaths.map((filePath) =>
            fetch(filePath).then((response) => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
        )
    );
}
var jsonSiegeProjects;

const dlcMap = {
    DRAGONLORDS: {
        src: "/rbbp/Icons/Text/DragonDawn.png",
        text: "Part of the Dragon Dawn DLC"
    },
    EMPIRESANDASHES: {
        src: "/rbbp/Icons/Text/EmpiresAshes.png",
        text: "Part of the Empires & Ashes DLC"
    },
    PRIMALFURY: {
        src: "/rbbp/Icons/Text/PrimalFury.png",
        text: "Part of the Primal Fury DLC"
    },
    ELDRITCHREALMS: {
        src: "/rbbp/Icons/Text/EldritchRealms.png",
        text: "Part of the Eldritch Realms DLC"
    },
    HERALDOFGLORY: {
        src: "/rbbp/Icons/Text/herald_of_glory.png",
        text: "Part of the Herald of Glory DLC"
    },
    WAYSOFWAR: {
        src: "/rbbp/Icons/Text/waysofwar.png",
        text: "Part of the Ways of War DLC"
    },
    GIANTKINGS: {
        src: "/rbbp/Icons/Text/GKLogo.png",
        text: "Part of the Giant Kings DLC"
    },
    ARCHONPROPHECY: {
        src: "/rbbp/Icons/Text/ArchonProphecy.png",
        text: "Part of the Archon Prophecy DLC"
    },
    COSMICWANDERER: {
        src: "/rbbp/Icons/Text/CosmicWanderer.png",
        text: "Part of the Cosmic Wanderer DLC"
    },
    THRONESOFBLOOD: {
        src: "/rbbp/Icons/Text/ThronesOfBlood.png",
        text: "Part of the Thrones of Blood DLC"
    }, RISEFROMRUIN: {
        src: "/rbbp/Icons/Text/RiseFromRuin.png",
        text: "Part of the Rise From Ruin DLC"
    }, SECRETSOFTHEARCHMAGES: {
        src: "/rbbp/Icons/Text/SecretsOfTheArchmages.png",
        text: "Part of the Secrets of the Archmages DLC"
    }
};

async function GetAllData(selectedLang) {
    let basePathEN = `/rbbp/Data/EN/`;

    const basePathGen = `/rbbp/Data/GEN/`;
    // }
    //  const basePathEN = `/rbbp/Data/EN/`;
    const basePathLocal = `/rbbp/Data/${selectedLang}/`;

    const fileNamesGeneric = [
        "EnchantmentTables.json",
        "all_spawnsets.json",
        "BuilderLookup.json",
        "AscendedInfo.json",
        "BuilderLookupHero.json",
        "UI.json",
        "FactionCreation.json",
        "StatusEffects.json",
        "ExtraToolTips.json",
        "CombatEnchantments.json",
        "WorldStructures.json",
        "CosmicHappenings.json",
        "CityTree.json",
        "all_spawnsets_strategic.json",
        "FreeCities.json",
        "DestinyTraits.json",
        "Relics.json",
        "Pantheon_Tree.json",
        "ExtraLookSpellsOrigin.json"
        
        
    ];
    const fileNames = [
        // ingame dump files
        "HeroItems.json",
        "HeroSkills.json",
        "SiegeProjects.json",
        "Units.json",
        "Traits.json",
        "Tomes.json",
        "Abilities.json",
        "EmpireProgression.json",
        "Spells.json",
        "StructureUpgrades.json",
        "Destinies.json",
        "Governance.json",
          "ItemForgeTypes.json",
         "ItemForgeUpgrades.json",
        // non-ingame-dump-json-files
        "UI.json",
        "all.json"
    ];

    // Create file paths
    const filesToFetchGeneric = fileNamesGeneric.map((f) => basePathGen + f);
    const filesToFetchEN = fileNames.map((f) => basePathEN + f);
    const filesToFetchLocal = fileNames.map((f) => basePathLocal + f);

    try {
        const [dataGen, dataEN, dataLocal, templatesHtml] = await Promise.all([
            fetchJsonFiles(filesToFetchGeneric),
            fetchJsonFiles(filesToFetchEN),
            fetchJsonFiles(filesToFetchLocal),
            fetch("/rbbp/HTML/templates.html").then((res) => res.text())
        ]);

        const genericTargets = [
            "jsonEnchantments",
            "jsonSpawnTables",
            "jsonBuilderLookUp",
            "jsonExtraAscendedInfo",
            "jsonBuilderHeroLookUp",
           
            "jsonUIGeneric",
            "jsonFactionCreation",
            "jsonStatusEffects",
            "jsonExtraTooltips",
            "jsonCombatEnchantments",
            "jsonWorldStructures",
            "jsonCosmicHappenings",
            "jsonCityTreeNodes",
            "jsonSpawnSetsStrat",
            "jsonFreeCities",
              "jsonDestinyTriggers",
            "jsonRelics",
            "jsonPantheon",
            "jsonExtraSpellsLookup"
            
        ];
        const targets = [
            "jsonHeroItems",
            "jsonHeroSkills",
            "jsonSiegeProjects",
            "jsonUnits",
            "jsonFactionCreation2",
            "jsonTomes",
            "jsonUnitAbilities",
            "jsonEmpire",
            "jsonSpells",
            "jsonStructureUpgrades",
            "jsonHeroAmbitions",
            "jsonHeroGovernance",
             "jsonItemForgeTypes",
             "jsonItemForgeUpgrades",
            "jsonUI",
            "jsonAllFromPO"
        ];

        // Assign data to global vars
        genericTargets.forEach((key, i) => {
            window[key] = dataGen[i];
        });

        targets.forEach((key, i) => {
            window[key] = dataEN[i];
            window[key + "Localized"] = dataLocal[i];
        });

        // Inject the template HTML into the page
        const templateContainer = document.createElement("div");
        templateContainer.innerHTML = templatesHtml;
        document.body.appendChild(templateContainer); // or attach to a hidden container
    } catch (error) {
        console.error("Error loading data or templates:", error.message);
    }
}

function AddExtraData() {
    // add extra data to the main data set
    jsonHeroSkills = [...jsonHeroSkills, ...extraSkills];
    jsonHeroSkillsLocalized = [...jsonHeroSkillsLocalized, ...extraSkills];

    jsonUnitAbilities = [...jsonUnitAbilities, ...extraAbilities];
    jsonUnitAbilitiesLocalized = [...jsonUnitAbilitiesLocalized, ...extraAbilities];

    jsonUnitAbilities = [...jsonUnitAbilities, ...jsonExtraTooltips];
    jsonUnitAbilitiesLocalized = [...jsonUnitAbilitiesLocalized, ...jsonExtraTooltips];
}

// The localization export used to build Data/RU (and, rarely, other non-EN
// language dumps) sometimes concatenates the singular and plural form of a
// name with no separator at all, e.g. "ЛучницаЛучницы" ("Archer" + "Archers")
// or "ЧемпионЧемпионы" ("Champion" + "Champions"). The EN dump for the same
// record is always clean ("Archer"), so this only ever surfaces in localized
// text. The join point is always a lowercase letter immediately followed by
// an uppercase letter with nothing in between: a legitimate multi-word Title
// Case name always has a space (or, for id-style values, an underscore)
// before every capitalized word, so this pattern only ever occurs at the
// singular/plural seam. We keep the first (singular) half, which is what the
// rest of the site already assumes there is exactly one name per record.
const DUPLICATED_NAME_SEAM = /[а-яё](?=[А-ЯЁ])/;

function splitDuplicatedLocalizedText(value) {
    if (typeof value !== "string" || value.length === 0) {
        return value;
    }
    const seam = value.match(DUPLICATED_NAME_SEAM);
    if (!seam) {
        return value;
    }
    return value.slice(0, seam.index + 1);
}

function SanitizeLocalizedNames() {
    const fieldsByArray = [
        [typeof jsonUnitsLocalized !== "undefined" ? jsonUnitsLocalized : null, ["name", "id"]],
        [typeof jsonSpellsLocalized !== "undefined" ? jsonSpellsLocalized : null, ["name", "id"]],
        [typeof jsonHeroItemsLocalized !== "undefined" ? jsonHeroItemsLocalized : null, ["name"]],
        [typeof jsonUnitAbilitiesLocalized !== "undefined" ? jsonUnitAbilitiesLocalized : null, ["name"]],
        [typeof jsonHeroSkillsLocalized !== "undefined" ? jsonHeroSkillsLocalized : null, ["name"]],
        [typeof jsonTomesLocalized !== "undefined" ? jsonTomesLocalized : null, ["name"]]
    ];

    for (const [array, fields] of fieldsByArray) {
        if (!array) continue;
        for (const entry of array) {
            if (!entry) continue;
            for (const field of fields) {
                if (field in entry) {
                    entry[field] = splitDuplicatedLocalizedText(entry[field]);
                }
            }
        }
    }
}

const abilityMap = {};
const abilityNameMap = {};

async function CheckData() {
    if (jsonSiegeProjects === undefined) {
        let storedSettings = getUserSettings();
        if (storedSettings === null) {
            setUserSettings({
                tooltipselectable: false,
                fontSize: "16px",
                showSecretSpells : false,
                showBeta: false,
                language: "EN"
            });
            storedSettings = getUserSettings();
        }
        //checkboxTooltip = document.getElementById("tooltipCheckbox");
        checkboxTooltip.checked = storedSettings.tooltipselectable;
            showSecretSpells.checked = storedSettings.showSecretSpells;

        //checkboxNumbers = document.getElementById("numbersCheckbox");
        //checkboxNumbers = document.getElementById("numbersCheckbox");
        checkboxNumbers.checked = storedSettings.isolateNumber;
      

   // showBetaTooltip = document.getElementById("showBetaCheckbox");
        showBetaTooltip.checked = storedSettings.showBeta;


        //  languageSelect = document.getElementById("languageSelect");
        languageSelect.value = storedSettings.language;
        //languageSelect.value = "EN";
        let hoverDiv = document.getElementById("hoverDiv");
        let hoverDiv2 = document.getElementById("hoverDiv2");
        if (checkboxTooltip.checked === true) {
            addTooltipListeners(hoverDiv, null);
            addTooltipListeners(hoverDiv2, null, "something");
        } else {
            removeToolTipListeners(hoverDiv);
            removeToolTipListeners(hoverDiv2);
        }
        CheckBoxTooltips();

   /*  if (storedSettings.showBeta) {
             await GetAllData("BETA");
       } else {*/
        await GetAllData(storedSettings.language);
      // }

//await GetAllData("EN");
        AddExtraData();
        SanitizeLocalizedNames();

        jsonUnitAbilitiesLocalized.forEach((a) => (abilityMap[a.slug] = a));
        jsonUnitAbilitiesLocalized.forEach((a) => (abilityNameMap[a.name] = a));
        
        // maps
        HandlePage();
        if (languageSelect.value != "EN") {
            LocalizeUI();
        }
    }
}

const lookupMaps = new Map(); // cache of maps per "array+key" combo


function buildLookupMap(array, key) {
    const mapKey = array === jsonUnits ? "jsonUnits:" + key :
                   array === jsonUnitAbilities ? "jsonUnitAbilities:" + key :
                   array === jsonUnitAbilitiesLocalized ? "jsonUnitAbilitiesLocalized:" + key :
                   array === jsonSpells ? "jsonSpells:" + key :
                   array === jsonSpellsLocalized ? "jsonSpellsLocalized:" + key :
                   array === jsonTomes ? "jsonTomes:" + key :
                   array === jsonTomesLocalized ? "jsonTomesLocalized:" + key :
                   array === jsonHeroSkills ? "jsonHeroSkills:" + key :
                   array === jsonAllFromPOLocalized ? "jsonAllFromPOLocalized:" + key :
                   null;

    if (!mapKey) return null; // not a static array we track

    if (!lookupMaps.has(mapKey)) {
        const map = new Map();
        for (const entry of array) {
            if (entry[key] !== undefined) {
                map.set(entry[key], entry);
            }
        }
        lookupMaps.set(mapKey, map);
    }
    return lookupMaps.get(mapKey);
}

const patchDates = [
    // date ranges of patches
      { name: "Sprite 1.2", from: new Date("2026-07-02"), to: new Date("2026-11-29") },
      { name: "Sprite 1.1", from: new Date("2026-06-24"), to: new Date("2026-07-01") },
      { name: "Sprite 1.0", from: new Date("2026-06-16"), to: new Date("2026-06-23") },
      { name: "Scorpion 1.2.1", from: new Date("2026-04-01"), to: new Date("2026-06-15") },
     { name: "Scorpion 1.2", from: new Date("2026-03-24"), to: new Date("2026-03-31") },
      { name: "Scorpion 1.1", from: new Date("2026-03-12"), to: new Date("2026-03-23") },
     { name: "Scorpion 1.0", from: new Date("2026-03-09"), to: new Date("2026-03-11") },
     { name: "Gargoyle 1.2.2", from: new Date("2025-12-09"), to: new Date("2026-03-08") },
      { name: "Gargoyle 1.2.1", from: new Date("2025-11-26"), to: new Date("2025-12-08") },
        { name: "Gargoyle 1.2", from: new Date("2025-11-25"), to: new Date("2025-11-25") },
      { name: "Gargoyle 1.1", from: new Date("2025-11-13"), to: new Date("2025-11-24") },
      { name: "Gargoyle 1.0", from: new Date("2025-11-11"), to: new Date("2025-11-12") },
    { name: "Wisp", from: new Date("2025-09-30"), to: new Date("2025-11-10") },
     { name: "Griffon 1.2", from: new Date("2025-08-26"), to: new Date("2025-09-29") },
    { name: "Griffon 1.1", from: new Date("2025-08-14"), to: new Date("2025-08-25") },
    { name: "Griffon 1.0", from: new Date("2025-08-12"), to: new Date("2025-11-13") },
    { name: "Ogre 1.2.1", from: new Date("2025-04-29"), to: new Date("2025-08-11") },
    { name: "Ogre 1.2", from: new Date("2025-04-15"), to: new Date("2025-04-28") }
];

function LocalizeUI(specific) {
    // general ui lookup first
    for (const id in jsonUIGeneric) {
        let el = "";
        if (specific != undefined) {
            el = specific.querySelector("#" + id);
            console.log(el);
        } else {
            el = document.getElementById(id);
        }

        if (el != null) {
            let value = "error";

            // check if there is a lookup in the baseConceptLookup file
            if ("lookup" in jsonUIGeneric[id]) {
                let test = jsonUIGeneric[id].lookup;

                if (test.includes("&")) {
                    test = test.split("&");

                    const found = findBy(jsonAllFromPOLocalized, "id", test[0]);
                    if (found) {
                        value = found[test[1]];
                    }
                } else {
                    const found = findBy(jsonAllFromPOLocalized, "id", test);
                    if (found) {
                        value = found.hyperlink;
                    }
                }
                //   console.log(test);
                value = value.replaceAll("<hyperlink>", "");
                value = value.replaceAll("</hyperlink>", "");
                value = value.split("^")[0];
                // Localized strings (RU and others) can retain raw grammatical
                // agreement placeholders left over from the game's own localization
                // engine, e.g. "Приверженность астралуn<eventColor>{1}</eventColor>x<eventColor>{2}</eventColor>".
                // These always take the form of 1-3 latin declension/count codes
                // (a/f/m/n/l/x) glued directly onto the preceding word, immediately
                // followed by <eventColor>{digit}</eventColor>. The site has no data
                // to resolve them at runtime, so strip them instead of leaking the
                // raw tags/placeholders into the UI. The restricted letter set avoids
                // touching legitimate <eventColor>{...}</eventColor> values (e.g. an
                // already-substituted number or a named placeholder).
                value = value.replace(/[afmnlx]{1,3}<eventColor>\{\d+\}<\/eventColor>/g, "");
                value = value.trim();
            } else if ("unit" in jsonUIGeneric[id]) {
                let test = jsonUIGeneric[id].unit;
                const abilityName = findBy(jsonUnitAbilities, "name", test);
                console.log(abilityName.name);
                const abilityNameLoc = findBy(jsonUnitAbilitiesLocalized, "slug", abilityName.slug);
                value = abilityNameLoc.name;
            } else {
                // Assumes the image is first, text second
                value = jsonUIGeneric[id].label;
            }

            el.childNodes[1].nodeValue = " " + value;
        }
    }
    // then specific for ones that arent in the po file translations
    for (const id in jsonUILocalized) {
        const el = document.getElementById(id);
        if (el) {
            let value = "error";

            // Assumes the image is first, text second
            value = jsonUILocalized[id].label;

            el.childNodes[1].nodeValue = " " + value;
        }
    }
}

