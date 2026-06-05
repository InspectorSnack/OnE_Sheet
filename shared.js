window.OEShared = {
    classTemplates: {
        "Soldier": { name: "Soldier", subclasses: ["Sharpshooter", "Tactician", "Sentinel", "Raider"], casters: {} },
        "Ranger": { name: "Ranger", subclasses: ["Ghost", "Nomad", "Marksman", "Pathfinder"], casters: { "Pathfinder": "Psiphon" } },
        "Engineer": { name: "Engineer", subclasses: ["Scavenger", "Tinker", "Bio Technician", "Combat Engineer"], casters: { "Scavenger": "Psiphon" } },
        "Healer": { name: "Healer", subclasses: ["Surgeon", "Alchemist", "Shaman"], casters: { "Alchemist": "Psiphon", "Shaman": "Conduit" } },
        "Freelancer": { name: "Freelancer", subclasses: ["Smuggler", "Informant", "Emissary", "Trader"], casters: {} },
        "Archivist": { name: "Archivist", subclasses: ["Reliquist", "Lorekeeper", "Drifter", "Infiltrator"], casters: {} },
        "Anomalist": { name: "Anomalist", subclasses: ["Architect", "Psion", "Catalyst", "Voidborn"], casters: { "Architect": "Psiphon", "Psion": "Conduit", "Catalyst": "Conduit", "Voidborn": "Vessel" } },
        "Mystic": { name: "Mystic", subclasses: ["Harbinger", "Warden", "Shaman", "Wayfinder"], casters: { "Harbinger": "Vessel", "Warden": "Conduit", "Shaman": "Conduit", "Wayfinder": "Conduit" } }
    },
    magicData: {
        "Conduit": { type: "Conduit", description: "Conduit Casters channel ambient energy through their connection.", mechanics: [] },
        "Vessel": { type: "Vessel", description: "Vessel Casters internalize entities or raw force into their physical form.", mechanics: [] },
        "Psiphon": { type: "Psiphon", description: "Psiphon Casters draw and manipulate power from surrounding matter and minds.", mechanics: [] }
    },
    subclassStats: {
        "Reliquist": { int: 11, con: 11, will: 8, per: 10, str: 10, dex: 11, hth: 9 },
        "Lorekeeper": { int: 12, con: 11, will: 11, per: 10, str: 8, dex: 9, hth: 9 },
        "Drifter": { int: 11, con: 10, will: 9, per: 9, str: 11, dex: 11, hth: 9 },
        "Infiltrator": { int: 11, con: 9, will: 9, per: 10, str: 11, dex: 12, hth: 8 },
        "Harbinger": { int: 10, con: 12, will: 12, per: 9, str: 10, dex: 9, hth: 8 },
        "Warden": { int: 10, con: 12, will: 11, per: 8, str: 10, dex: 8, hth: 11 },
        "Shaman": { int: 11, con: 11, will: 11, per: 10, str: 9, dex: 7, hth: 11 },
        "Wayfinder": { int: 12, con: 10, will: 11, per: 11, str: 8, dex: 8, hth: 10 },
        "Ghost": { int: 10, con: 11, will: 10, per: 11, str: 10, dex: 12, hth: 10 },
        "Nomad": { int: 11, con: 11, will: 10, per: 11, str: 10, dex: 11, hth: 10 },
        "Marksman": { int: 10, con: 11, will: 10, per: 11, str: 10, dex: 12, hth: 10 },
        "Pathfinder": { int: 12, con: 11, will: 10, per: 12, str: 10, dex: 11, hth: 10 },
        "Sharpshooter": { int: 10, con: 11, will: 10, per: 10, str: 11, dex: 12, hth: 11 },
        "Tactician": { int: 11, con: 10, will: 10, per: 10, str: 11, dex: 11, hth: 10 },
        "Sentinel": { int: 10, con: 10, will: 10, per: 10, str: 12, dex: 11, hth: 12 },
        "Raider": { int: 11, con: 11, will: 10, per: 10, str: 11, dex: 11, hth: 11 },
        "Surgeon": { int: 12, con: 11, will: 11, per: 11, str: 10, dex: 10, hth: 10 },
        "Scavenger": { int: 12, con: 11, will: 10, per: 12, str: 10, dex: 10, hth: 10 },
        "Tinker": { int: 12, con: 11, will: 10, per: 11, str: 11, dex: 10, hth: 10 },
        "Bio Technician": { int: 12, con: 11, will: 11, per: 11, str: 10, dex: 10, hth: 10 },
        "Combat Engineer": { int: 11, con: 10, will: 10, per: 11, str: 11, dex: 11, hth: 10 }
    },
    initTheme: () => {
        const theme = localStorage.getItem('oe_theme') || 'default';
        document.documentElement.setAttribute('data-theme', theme);
        const selTheme = document.getElementById('sel-theme');
        if (selTheme) {
            selTheme.value = theme;
            selTheme.addEventListener('change', (e) => {
                const newTheme = e.target.value;
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('oe_theme', newTheme);
            });
        }
    },
    updateSubclassOptions: (classVal, targetSelect, selectedSub = null) => {
        targetSelect.innerHTML = '';
        if (window.OEShared.classTemplates[classVal]) {
            window.OEShared.classTemplates[classVal].subclasses.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                opt.className = 'bg-bg';
                targetSelect.appendChild(opt);
            });
            if (selectedSub && window.OEShared.classTemplates[classVal].subclasses.includes(selectedSub)) {
                targetSelect.value = selectedSub;
            }
        }
    },
    autoSaveDossier: (characterData) => {
        if (!characterData.name) return;
        localStorage.setItem('active_character', JSON.stringify(characterData));
        try {
            let log = JSON.parse(localStorage.getItem('dossier_log') || '[]');
            log = log.filter(d => d.name !== characterData.name);
            log.unshift(characterData);
            if (log.length > 5) log.pop(); // Keep top 5 latest
            localStorage.setItem('dossier_log', JSON.stringify(log));
        } catch (e) {}
    },
    calculateXP: (stats, baseStats = {int: 10, con: 10, will: 10, per: 10, str: 10, dex: 10, hth: 10}) => {
        let spent = 0;
        const m = [stats.int - baseStats.int, stats.con - baseStats.con, stats.will - baseStats.will, stats.per - baseStats.per];
        const m_pkg = m.every(v => v > 0) ? Math.min(...m) : (m.every(v => v < 0) ? Math.max(...m) : 0);
        spent += m_pkg * 35 + (m[0] - m_pkg) * 15 + (m[1] - m_pkg) * 10 + (m[2] - m_pkg) * 10 + (m[3] - m_pkg) * 10;

        const p = [stats.str - baseStats.str, stats.dex - baseStats.dex, stats.hth - baseStats.hth];
        const p_pkg = p.every(v => v > 0) ? Math.min(...p) : (p.every(v => v < 0) ? Math.max(...p) : 0);
        spent += p_pkg * 36 + (p[0] - p_pkg) * 15 + (p[1] - p_pkg) * 15 + (p[2] - p_pkg) * 10;

        return spent;
    }
};