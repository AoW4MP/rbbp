async function renderForgeTemplates(panel, lang, tr) {
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.textContent = tr("Loading templates…", "Загружаются шаблоны…");
    panel.append(status);
    let templates;
    try {
        templates = await fetchJsonShared("/rbbp/Data/GEN/ForgeTemplates.json");
    } catch {
        status.textContent = tr("Templates could not be loaded.", "Не удалось загрузить шаблоны.");
        return;
    }

    const byId = entries => new Map(entries.map(entry => [entry.resid, entry]));
    const types = byId(jsonItemForgeTypes);
    const localizedTypes = byId(jsonItemForgeTypesLocalized);
    const items = byId(jsonHeroItems);
    const localizedItems = byId(jsonHeroItemsLocalized);
    const upgrades = byId(jsonItemForgeUpgrades);
    const localizedUpgrades = byId(jsonItemForgeUpgradesLocalized);
    const abilities = new Map(jsonUnitAbilitiesLocalized.map(ability => [ability.slug, ability]));
    const label = document.createElement("label");
    label.className = "forge-template-search";
    const query = document.createElement("input");
    query.type = "search";
    query.placeholder = tr("Name, item type or infusion", "Название, тип предмета или усиление");
    label.append(tr("Search templates", "Поиск шаблонов"), query);
    status.before(label);

    const groups = new Map();
    for (const [source, title] of [
        ["quests", tr("Quests", "Задания")], ["pantheon", tr("Pantheon", "Пантеон")]
    ]) {
        const section = document.createElement("details");
        section.className = "forge-template-group";
        section.open = source === "pantheon";
        const heading = document.createElement("summary");
        const rows = document.createElement("ul");
        section.append(heading, rows);
        panel.append(section);
        groups.set(source, { section, heading, title, entries: [] });
    }

    for (const template of templates) {
        const type = types.get(template.itemType);
        if (!type) continue;
        const name = template.name[lang.toUpperCase()] || template.name.EN;
        const englishType = forgeTemplateItemType(type, type.name, (en) => en);
        const typeName = forgeTemplateItemType(type, localizedTypes.get(template.itemType)?.name || type.name, tr);
        const effects = template.infusions.map(id => ({
            data: upgrades.get(id),
            local: localizedUpgrades.get(id) || upgrades.get(id)
        }));
        const upgradeNames = effects.map(({ local }) => local.name);
        const row = document.createElement("li");
        row.className = "forge-template-row";
        const item = items.get(type.base_hero_item_resid);
        const art = item?.icon;
        if (art) {
            const icon = document.createElement("img");
            icon.src = "/rbbp/Icons/UnitIcons/" + art + ".png";
            icon.alt = "";
            icon.loading = "lazy";
            icon.width = 44;
            icon.height = 44;
            row.append(icon);
        }
        const content = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = name;
        const subtitle = document.createElement("small");
        subtitle.textContent = typeName;
        content.append(title, subtitle);
        const availability = document.createElement("div");
        availability.className = "forge-template-meta";
        const points = effects.reduce((sum, { data }) => sum + data.point_cost, 0);
        const source = template.source === "pantheon"
            ? tr("Unlock this template in the Pantheon", "Открыть этот шаблон в Пантеоне")
            : tr("Obtain this template as a quest reward in the current game", "Получить этот шаблон в награду за задание в текущей партии");
        availability.textContent = tr("Points occupied: ", "Занято очков: ") + points + " · " + source;
        content.append(availability);

        const effectList = document.createElement("div");
        effectList.className = "forge-template-effects";
        for (const { data, local } of effects) {
            const effect = document.createElement("div");
            effect.className = "forge-template-effect";
            const header = document.createElement("div");
            header.className = "forge-template-effect-title";
            if (data.icon) {
                const icon = document.createElement("img");
                icon.src = "/rbbp/Icons/UnitIcons/" + data.icon + ".png";
                icon.alt = "";
                icon.width = 28;
                icon.height = 28;
                icon.loading = "lazy";
                header.append(icon);
            }
            const effectName = document.createElement("strong");
            effectName.textContent = local.name;
            header.append(effectName);
            const description = document.createElement("div");
            description.innerHTML = AddTagIconsForStatusEffects(sanitizeLocalizationMacros(local.description || ""));
            effect.append(header, description);
            for (const { slug } of data.abilities || []) {
                const ability = abilities.get(slug);
                if (ability) effect.append(GetAbilityInfo(ability));
            }
            if (data.unlock_requirements?.length) {
                const materials = document.createElement("div");
                materials.className = "forge-template-materials";
                materials.append(tr("Materials to unlock this infusion:", "Материалы для открытия усиления:"));
                data.unlock_requirements.forEach(({ token_name, num_required }, index) => {
                    const material = document.createElement("span");
                    const name = local.unlock_requirements?.[index]?.token_name || token_name;
                    const icon = document.createElement("img");
                    icon.alt = name;
                    icon.src = "/rbbp/Icons/WorldStructures/" + token_name.toLowerCase().replaceAll(" ", "_") + ".png";
                    material.title = name;
                    material.append(String(num_required), icon);
                    materials.append(material);
                });
                effect.append(materials);
            }
            effectList.append(effect);
        }
        content.append(effectList);
        row.append(content);
        const group = groups.get(template.source);
        group.section.querySelector("ul").append(row);
        const search = [template.name.RU, template.name.EN, typeName, englishType, type.name, item?.name,
            sanitizeLocalizationMacros(localizedItems.get(type.base_hero_item_resid)?.name),
            ...upgradeNames].filter(Boolean).join(" ").toLocaleLowerCase(lang);
        group.entries.push({ row, search });
    }

    function filter() {
        const term = query.value.trim().toLocaleLowerCase(lang);
        let total = 0;
        for (const { section, heading, title, entries } of groups.values()) {
            let count = 0;
            for (const { row, search } of entries) {
                row.hidden = !search.includes(term);
                if (!row.hidden) count++;
            }
            heading.textContent = title + " (" + count + ")";
            section.hidden = Boolean(term) && !count;
            if (term && count) section.open = true;
            total += count;
        }
        status.textContent = total ? "" : tr("No templates match the search.", "Шаблоны не найдены.");
    }
    query.addEventListener("input", filter);
    filter();
}


// The dump's name can describe a unique item or a hero origin. The type tag describes the equipment.
function forgeTemplateItemType(type, fallback, tr) {
    const tag = type.tags.find(({ tag }) => /^ItemType(?:Weapon|Armor|Jewelry|Misc)\./.test(tag))?.tag;
    const kind = tag?.split(".").at(-1);
    const labels = {
        Sword: ["Sword", "Меч"], Axe: ["Axe", "Топор"], Mace: ["Mace", "Булава"],
        Cestus: ["Cestus", "Цестус"], Bow: ["Bow", "Лук"], Greatbow: ["Greatbow", "Длинный лук"],
        Crossbow: ["Crossbow", "Арбалет"], Lance: ["Lance", "Рыцарское копьё"],
        Spear: ["Spear", "Копьё"], Pike: ["Pike", "Пика"],
        Greatsword: ["Greatsword", "Двуручный меч"], Greataxe: ["Greataxe", "Двуручный топор"],
        Greathammer: ["Greathammer", "Двуручный молот"], MagicalOrb: ["Magical Orb", "Магический шар"],
        Staff: ["Staff", "Посох"], MeleeRanged: ["Melee and ranged weapon", "Комбинированное оружие"],
        SwordPistol: ["Sword and pistol", "Меч и пистолет"], SwordStaff: ["Sword and Staff", "Меч и посох"],
        Shield: ["Shield", "Щит"], Mask: ["Mask", "Маска"], LightArmor: ["Light armor", "Лёгкий доспех"],
        HeavyArmor: ["Heavy armor", "Тяжёлый доспех"], Robe: ["Robe", "Одеяние"], Cloak: ["Cloak", "Плащ"],
        Feet: ["Footwear", "Обувь"], Greaves: ["Greaves", "Поножи"], Ring: ["Ring", "Кольцо"],
        Amulet: ["Amulet", "Амулет"], Wand: ["Wand", "Палочка"], Horn: ["Horn", "Рог"],
        Bell: ["Bell", "Колокол"], Dagger: ["Dagger", "Кинжал"], Bottle: ["Bottle", "Флакон"]
    };
    if (type.tags.some(({ tag }) => tag.endsWith(".SwordThrowingDaggerFlavor"))) {
        return tr("Sword and throwing dagger", "Меч и метательный кинжал");
    }
    return labels[kind] ? tr(...labels[kind]) : sanitizeLocalizationMacros(fallback);
}
