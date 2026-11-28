async function HandlePage() {
    const ru = languageSelect.value === "RU";
    const lang = ru ? "ru" : "en";
    document.documentElement.lang = lang;
    const tr = (english, russian) => ru ? russian : english;
    const templates = new URLSearchParams(location.search).get("view") === "templates";
    const section = document.querySelector(".infusion-catalog");
    document.getElementById("forgeInfusionsLink").textContent = tr("Infusions", "Усиления");
    document.getElementById("forgeTemplatesLink").textContent = tr("Templates", "Шаблоны");
    document.getElementById(templates ? "forgeTemplatesLink" : "forgeInfusionsLink")
        .setAttribute("aria-current", "page");
    if (templates) {
        section.querySelector("h1").textContent = tr("Item Forge", "Кузня");
        document.getElementById("forgeInfusions").hidden = true;
        const panel = document.getElementById("forgeTemplates");
        panel.hidden = false;
        await renderForgeTemplates(panel, lang, tr);
        section.setAttribute("aria-busy", "false");
        return;
    }
    const collator = new Intl.Collator(lang, { numeric: true, sensitivity: "base" });
    const categoryLabels = {
        Active: tr("Active", "Активное"),
        Passive: tr("Passive", "Пассивное"),
        Damage: tr("Damage", "Тип урона")
    };
    const slotLabels = {
        Primary: tr("Weapons", "Оружие"),
        Secondary: tr("Off hand", "Вторая рука"),
        Head: tr("Head", "Голова"),
        Torso: tr("Torso", "Туловище"),
        Legs: tr("Legs", "Ноги"),
        Ring: tr("Rings", "Кольца"),
        Miscellaneous: tr("Accessories", "Аксессуары")
    };
    const requirements = new Map([
        ["always", { label: tr("Always available", "Доступно всегда") }],
        ["pantheon", { label: tr("Pantheon", "Пантеон"), icon: "Text/pantheon.png" }],
        ["giant", { label: tr("Giant King", "Король великанов"), icon: "FactionCreation/giant_king.png" }]
    ]);
    const fields = Object.fromEntries([...document.querySelectorAll("[data-infusion-field]")]
        .map(input => [input.dataset.infusionField, input]));
    const label = (key, english, russian) => {
        document.querySelector('[data-infusion-label="' + key + '"]').textContent = tr(english, russian);
    };
    label("title", "Item Forge", "Кузня");
    label("query", "Search", "Поиск");
    label("item", "Item type", "Тип предмета");
    label("category", "Infusion type", "Тип усиления");
    label("sort", "Sort by", "Сортировка");
    label("unlock", "Unlock requirement", "Условия открытия");
    label("name", "Infusion", "Усиление");
    label("points", "Points", "Очки");
    label("condition", "Unlock", "Открытие");
    label("compatibility", "Compatible items", "Подходящие предметы");
    fields.query.placeholder = tr("Infusion, effect or item", "Усиление, эффект или предмет");
    const byResid = list => new Map(list.map(item => [item.resid, item]));
    const localItems = byResid(jsonItemForgeTypesLocalized);
    const localInfusions = byResid(jsonItemForgeUpgradesLocalized);
    const baseItems = byResid(jsonHeroItems);
    const localizedBaseItems = byResid(jsonHeroItemsLocalized);
    const types = new Map();
    const names = new Map();
    for (const item of jsonItemForgeTypes) {
        const key = item.slot + ":" + item.name;
        if (!types.has(key)) {
            // This pair of forge templates shares a generic game label with magical weapons.
            const swordStaff = item.tags.some(({ tag }) => tag === "ItemTypeWeapon.MagicMeleeRanged.SwordStaff");
            const localized = swordStaff ? tr("Sword and Staff", "Меч и посох") :
                sanitizeLocalizationMacros(localItems.get(item.resid)?.name || item.name);
            const type = { key, slot: item.slot, english: swordStaff ? "Sword and Staff" : item.name, name: localized, variants: [] };
            types.set(key, type);
            names.set(localized, (names.get(localized) || 0) + 1);
        }
        const type = types.get(key);
        const base = baseItems.get(item.base_hero_item_resid);
        const localizedBase = localizedBaseItems.get(item.base_hero_item_resid);
        const icon = base?.icon;
        if (icon && !type.icon) type.icon = "UnitIcons/" + icon + ".png";
        type.variants.push({
            tags: (item.tags || []).map(({ tag }) => tag.toLowerCase()),
            names: [base?.name, sanitizeLocalizationMacros(localizedBase?.name)].filter(Boolean)
        });
    }
    const sortedTypes = [...types.values()].sort((a, b) => collator.compare(a.name, b.name));
    for (const type of sortedTypes) {
        if (names.get(type.name) > 1 && type.name !== type.english) type.name += " (" + type.english + ")";
    }

    const picker = document.querySelector(".infusion-item-picker");
    const pickerSummary = picker.querySelector("summary");
    const selection = document.getElementById("infusionItemSelection");
    const options = picker.querySelector(".infusion-item-options");
    let selectedItem = "";
    let selectedButton;
    const addChoices = (choices, title) => {
        if (!choices.length) return;
        const group = document.createElement("div");
        if (title) {
            const heading = document.createElement("strong");
            heading.textContent = title;
            group.append(heading);
        }
        for (const type of choices) {
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.itemValue = type.key;
            button.setAttribute("aria-pressed", String(type.key === ""));
            button.append(itemTypeLabel(type));
            if (type.key === "") {
                selectedButton = button;
                selection.append(itemTypeLabel(type));
            }
            button.addEventListener("click", () => {
                selectedButton.setAttribute("aria-pressed", "false");
                selectedButton = button;
                button.setAttribute("aria-pressed", "true");
                selectedItem = type.key;
                selection.replaceChildren(itemTypeLabel(type));
                picker.open = false;
                pickerSummary.focus();
                render();
            });
            group.append(button);
        }
        options.append(group);
    };
    addChoices([{ key: "", name: tr("All items", "Все предметы"), icon: "ItemForge/onehanded.png" }]);
    const swordStaffIcon = types.get("Primary:Magic Strike Weapons")?.icon || "ItemForge/meleeranged.png";
    const families = [
        ["itemtypeweapon.onehanded", tr("One-handed weapons", "Одноручное оружие"), "onehanded.png"],
        ["itemtypeweapon.twohandedheavy", tr("Heavy two-handed weapons", "Тяжёлое двуручное оружие"), "twohandedheavy.png"],
        ["itemtypeweapon.polearm", tr("Polearms", "Древковое оружие (группа)"), "Polearm.png"],
        ["itemtypeweapon.rangedphysical", tr("Ranged weapons", "Стрелковое оружие"), "rangedphysical.png"],
        ["itemtypeweapon.meleeranged", tr("Dual weapons", "Парное оружие"), "meleeranged.png"],
        ["itemtypeweapon.magicmeleeranged", tr("Magical hybrid weapons", "Магическое комбинированное оружие"), swordStaffIcon],
        ["itemtypeweapon.magic", tr("Magical weapons", "Магическое оружие"), "magicalorb.png"],
        ["itemtypeweapon.dragonclaw", tr("Dragon claws", "Когти дракона (группа)"), "dragonclaw.png"],
        ["itemtypeweapon.giantkingweapons", tr("Giant King weapons", "Оружие короля великанов"), "giantaxe.png"],
        ["itemtypeweapon", tr("Main hand (weapons)", "Руки (оружие)"), "onehanded.png"],
        ["itemtypearmor", tr("Armor and shields", "Доспехи и щиты"), "armor.png"],
        ["itemtypearmor.head", tr("Headgear", "Голова"), "Head.png"],
        ["itemtypearmor.shield", tr("Shields", "Щиты"), "Shield.png"],
        ["itemtypearmor.torso", tr("Torso", "Торс"), "armor.png"],
        ["itemtypearmor.legs", tr("Legwear", "Ноги"), "Legs.png"],
        ["itemtypejewelry.ring", tr("Rings", "Кольца"), "Ring.png"],
        ["itemtypemisc.wand", tr("Wands", "Жезлы"), "Wand.png"],
        ["accessories", tr("Accessories", "Аксессуары"), "amulet.png"]
    ].filter(([key]) => sortedTypes.some(type => type.variants.some(({ tags }) => matchesItemFamily(tags, key))))
        .map(([key, name, icon]) => ({ key, name, icon: icon.includes("/") ? icon : "ItemForge/" + icon }));
    addChoices(families, tr("Item families", "Группы предметов"));
    for (const [slot, title] of Object.entries(slotLabels)) {
        addChoices(sortedTypes.filter(type => type.slot === slot), title);
    }
    document.addEventListener("pointerdown", event => {
        if (picker.open && !picker.contains(event.target)) picker.open = false;
    });
    picker.addEventListener("keydown", event => {
        if (event.key === "Escape" && picker.open) {
            event.preventDefault();
            picker.open = false;
            pickerSummary.focus();
        }
    });
    fields.category.add(new Option(tr("All infusions", "Все усиления"), ""));
    for (const [key, title] of Object.entries(categoryLabels)) fields.category.add(new Option(title, key));
    for (const [key, title] of [
        ["default", tr("Game order", "Как в игре")],
        ["name", tr("Name", "Название")],
        ["category", tr("Infusion type", "Тип усиления")],
        ["points", tr("Points", "Очки")],
        ["unlock", tr("Unlock", "Открытие")]
    ]) fields.sort.add(new Option(title, key));

    // The dump omits the forge kind. Live game categories correct the name-based fallback.
    const overlays = await fetchJsonShared("/rbbp/Data/GEN/InfusionCategories.json");
    const abilityBySlug = new Map(jsonUnitAbilitiesLocalized.map(ability => [ability.slug, ability]));
    const pantheon = new Set(pantheonList);
    const htmlText = document.createElement("template");
    const toText = html => {
        htmlText.innerHTML = html;
        return htmlText.content.textContent;
    };

    const rows = jsonItemForgeUpgrades.flatMap(infusion => {
        const local = localInfusions.get(infusion.resid) || infusion;
        const category = overlays[infusion.resid] ||
            (infusion.abilities?.length ? "Active" : infusion.name.includes(" Damage") ? "Damage" : "Passive");
        if (category === "Damage" && !infusion.unlock_requirements?.length) return [];
        const unlocks = (infusion.unlock_requirements || []).map(({ token_name, num_required }, index) => {
            if (!requirements.has(token_name)) {
                requirements.set(token_name, {
                    label: local.unlock_requirements?.[index]?.token_name || token_name,
                    icon: "WorldStructures/" + token_name.toLowerCase().replaceAll(" ", "_") + ".png"
                });
            }
            return { key: token_name, count: num_required };
        });
        if (pantheon.has(infusion.id)) unlocks.unshift({ key: "pantheon" });
        if (!unlocks.length) unlocks.push({ key: infusion.name.startsWith("Rune of ") ? "giant" : "always" });

        const compatible = [];
        for (const type of sortedTypes) {
            const variants = type.variants.flatMap(({ tags, names }) => {
                const result = matchInfusionRule(infusion.tag_filter, tags);
                return result === false ? [] : [{ tags, names, conditional: result === null }];
            });
            if (variants.length) compatible.push({ key: type.key, name: type.name, english: type.english, icon: type.icon, variants });
        }
        const description = sanitizeLocalizationMacros(local.description || "");
        const name = sanitizeLocalizationMacros(local.name);
        const search = [name, infusion.name, toText(description),
            ...(infusion.abilities || []).map(({ slug }) => {
                const ability = abilityBySlug.get(slug);
                return ability ? ability.name + " " + toText(ability.description || "") : "";
            }),
            ...unlocks.map(({ key }) => requirements.get(key).label),
            ...compatible.flatMap(type => [type.name, type.english, ...type.variants.flatMap(variant => variant.names)])].join(" ").toLocaleLowerCase(lang);
        return [{ infusion, name, description, category, unlocks, compatible, search }];
    });

    const toolbar = document.querySelector(".infusion-materials");
    const body = document.getElementById("infusionRows");
    const status = document.getElementById("infusionStatus");
    const materialButtons = new Map();
    let unlock = "";
    const ascending = document.getElementById("infusionDirection");

    function requirementIcon(requirement, label) {
        const icon = document.createElement("img");
        icon.src = "/rbbp/Icons/" + requirement.icon;
        icon.alt = label;
        if (label) icon.title = label;
        icon.width = 24;
        icon.height = 24;
        return icon;
    }

    const specialKeys = ["always", "pantheon", "giant"];
    const materialKeys = [...requirements.keys()].filter(key => !specialKeys.includes(key))
        .sort((a, b) => collator.compare(requirements.get(a).label, requirements.get(b).label));
    const unlockOrder = new Map([...specialKeys, ...materialKeys].map((key, index) => [key, index]));
    const compareRequirements = (a, b) => unlockOrder.get(a.key) - unlockOrder.get(b.key) ||
        (a.count || 0) - (b.count || 0);
    for (const row of rows) row.unlocks.sort(compareRequirements);

    const specialFilters = document.createElement("div");
    specialFilters.className = "infusion-unlock-group";
    const materialFilters = document.createElement("div");
    materialFilters.className = "infusion-unlock-group";
    toolbar.append(specialFilters, materialFilters);
    for (const key of ["", ...specialKeys, ...materialKeys]) {
        const requirement = requirements.get(key) || { label: tr("All requirements", "Все условия") };
        const button = document.createElement("button");
        button.type = "button";
        button.className = "infusion-material";
        button.title = requirement.label;
        button.setAttribute("aria-label", requirement.label);
        button.setAttribute("aria-pressed", String(!key));
        if (requirement.icon) button.append(requirementIcon(requirement, ""));
        else button.textContent = key ? tr("Always", "Всегда") : tr("All", "Все");
        button.addEventListener("click", () => {
            materialButtons.get(unlock).setAttribute("aria-pressed", "false");
            unlock = key;
            button.setAttribute("aria-pressed", "true");
            render();
        });
        materialButtons.set(key, button);
        (materialKeys.includes(key) ? materialFilters : specialFilters).append(button);
    }
    function updateSortDirection() {
        const up = ascending.getAttribute("aria-pressed") !== "false";
        const title = up ? tr("Ascending", "По возрастанию") : tr("Descending", "По убыванию");
        ascending.textContent = up ? "↑" : "↓";
        ascending.title = title;
        ascending.setAttribute("aria-label", title);
    }
    ascending.addEventListener("click", () => {
        ascending.setAttribute("aria-pressed", String(ascending.getAttribute("aria-pressed") === "false"));
        updateSortDirection();
        render();
    });

    function renderRow({ infusion, name, description: effect, category, unlocks, selectedTypes }) {
        const row = document.createElement("tr");
        const identity = row.insertCell();
        const summary = document.createElement("div");
        summary.className = "infusion-title";
        const icon = document.createElement("img");
        icon.src = "/rbbp/Icons/UnitIcons/" + infusion.icon + ".png";
        icon.alt = "";
        icon.loading = "lazy";
        icon.width = 32;
        icon.height = 32;
        icon.addEventListener("error", () => icon.style.visibility = "hidden", { once: true });
        const heading = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = name;
        const kind = document.createElement("small");
        kind.textContent = categoryLabels[category];
        heading.append(title, kind);
        summary.append(icon, heading);
        const description = document.createElement("div");
        description.className = "infusion-description";
        description.innerHTML = AddTagIconsForStatusEffects(effect);
        for (const { slug } of infusion.abilities || []) {
            const ability = abilityBySlug.get(slug);
            if (!ability) continue;
            description.append(GetAbilityInfo(ability));
        }
        if (!description.textContent.trim()) description.textContent = tr("No description available.", "Описание отсутствует.");
        identity.className = "infusion-identity";
        identity.append(summary, description);
        const points = row.insertCell();
        points.className = "infusion-points";
        points.textContent = infusion.point_cost;
        points.setAttribute("data-label", tr("Points", "Очки"));

        const unlock = row.insertCell();
        unlock.className = "infusion-unlocks";
        for (const { key, count } of unlocks) {
            const requirement = requirements.get(key);
            const item = document.createElement("span");
            item.title = requirement.label;
            if (count !== undefined) item.append(String(count));
            if (requirement.icon) item.append(requirementIcon(requirement, requirement.label));
            else item.textContent = tr("Always", "Всегда");
            unlock.append(item);
        }

        const fit = row.insertCell();
        fit.className = "infusion-fit";
        const selected = selectedTypes;
        const heroCondition = tr("* Depends on the hero’s archetype.", "* Зависит от архетипа героя.");
        if (selected.length <= 3) {
            if (selected.length) fit.append(...selected.map(type => itemTypeLabel(type)));
            else fit.textContent = "—";
            if (selected.some(type => type.conditional)) fit.title = heroCondition;
        } else {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = tr("Item types", "Типы предметов") + " · " + selected.length;
            const list = document.createElement("div");
            list.append(...selected.map(type => itemTypeLabel(type)));
            if (selected.some(type => type.conditional)) {
                const note = document.createElement("small");
                note.textContent = heroCondition;
                list.append(note);
            }
            details.append(summary, list);
            fit.append(details);
        }
        return row;
    }

    const sorts = {
        name: row => row.name,
        category: row => categoryLabels[row.category],
        points: row => row.infusion.point_cost
    };
    function render() {
        const query = fields.query.value.trim().toLocaleLowerCase(lang);
        const item = selectedItem;
        const exactType = types.has(item);
        const result = [];
        for (const row of rows) {
            if (query && !row.search.includes(query) ||
                fields.category.value && row.category !== fields.category.value ||
                unlock && !row.unlocks.some(requirement => requirement.key === unlock)) continue;
            const selectedTypes = row.compatible.flatMap(type => {
                if (exactType && type.key !== item) return [];
                const variants = item && !exactType ?
                    type.variants.filter(({ tags }) => matchesItemFamily(tags, item)) : type.variants;
                return variants.length ? [{
                    name: type.name, icon: type.icon, conditional: variants.every(variant => variant.conditional)
                }] : [];
            });
            if (!item || selectedTypes.length) result.push({ ...row, selectedTypes });
        }
        const sort = sorts[fields.sort.value];
        const direction = ascending.getAttribute("aria-pressed") === "false" ? -1 : 1;
        if (fields.sort.value === "unlock") {
            result.sort((a, b) => direction * (compareRequirements(a.unlocks[0], b.unlocks[0]) ||
                a.unlocks.length - b.unlocks.length || collator.compare(a.name, b.name)));
        } else if (sort) result.sort((a, b) => direction * collator.compare(sort(a), sort(b)));
        else if (direction < 0) result.reverse();
        body.replaceChildren(...result.map(renderRow));
        HandleExtraTooltips(body);
        status.textContent = result.length ? tr("Results", "Найдено") + " · " + result.length :
            tr("No infusions match these filters.", "По заданным фильтрам усилений нет.");
    }

    fields.query.addEventListener("input", render);
    for (const select of [fields.category, fields.sort]) select.addEventListener("change", render);
    updateSortDirection();
    render();
    document.querySelector(".infusion-catalog").setAttribute("aria-busy", "false");
}

function itemTypeLabel(type) {
    const label = document.createElement("span");
    label.className = "infusion-type-label";
    if (type.icon) {
        const icon = document.createElement("img");
        icon.src = "/rbbp/Icons/" + type.icon;
        icon.alt = "";
        icon.width = 24;
        icon.height = 24;
        icon.loading = "lazy";
        label.append(icon);
    }
    const name = document.createElement("span");
    name.textContent = type.name + (type.conditional ? " *" : "");
    label.append(name);
    return label;
}

function matchInfusionRule(node, tags) {
    if (!node) return true;
    const { type, text } = parseCondition(node.condition);
    if (type === "all" || type === "any") {
        const values = (node.children || []).map(child => matchInfusionRule(child, tags));
        const determining = type === "any";
        if (values.includes(determining)) return determining;
        return values.includes(null) ? null : !determining;
    }
    if (type === "unknown") return null;
    const condition = text.toLowerCase();
    const inherited = condition.startsWith("inherited ");
    const tag = inherited ? condition.slice("inherited ".length) : condition;
    // A hero can supply archetype tags that are absent from the item template.
    if (tag.startsWith("heroskillarchetype.")) return null;
    const matches = hasInfusionTag(tags, tag, inherited);
    return type === "not" ? !matches : matches;
}

function hasInfusionTag(tags, tag, inherited) {
    return tags.some(candidate => candidate === tag || inherited && candidate.startsWith(tag + "."));
}


function matchesItemFamily(tags, key) {
    if (key === "accessories") {
        return !hasInfusionTag(tags, "itemtypemisc.wand", true) &&
            (hasInfusionTag(tags, "itemtypejewelry.amulet", true) || hasInfusionTag(tags, "itemtypemisc", true));
    }
    return hasInfusionTag(tags, key, true);
}
