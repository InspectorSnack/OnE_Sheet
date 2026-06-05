document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.removeItem('booted'); // clear any lingering session state
    const startupScreen = document.getElementById('startup-screen');
    const builderScreen = document.getElementById('builder-screen');
    const bootScreen = document.getElementById('boot-screen');
    const bootContainer = document.getElementById('boot-container');
    
    const inClass = document.getElementById('in-class');
    const inSubclass = document.getElementById('in-subclass');

    let updateSubclassOptions = () => {};
    let autoSaveDossier = () => {};

    try {
        if (window.OEShared && window.OEShared.initTheme) window.OEShared.initTheme();
        
        if (window.OEShared && window.OEShared.classTemplates) {
            Object.keys(window.OEShared.classTemplates).forEach(cls => {
                inClass.add(new Option(cls, cls));
            });
            window.OEShared.updateSubclassOptions(inClass.value, inSubclass);
            updateSubclassOptions = window.OEShared.updateSubclassOptions;
            autoSaveDossier = () => window.OEShared.autoSaveDossier(characterData);
        }
    } catch (e) {
        console.error("Core library initialization error:", e);
    }

    inClass.addEventListener('change', (e) => {
        updateSubclassOptions(e.target.value, inSubclass);
        if (window.setBuilderStats) setBuilderStats(inSubclass.value);
    });
    inSubclass.addEventListener('change', (e) => {
        if (window.setBuilderStats) setBuilderStats(e.target.value);
    });

    let characterData = {};

    // --- Dossier Log (Recent Files) --- //
    const loadDossierLog = () => {
        try {
            const log = JSON.parse(localStorage.getItem('dossier_log') || '[]');
            const logContainer = document.getElementById('dossier-log-container');
            const logList = document.getElementById('dossier-log-list');
            logList.innerHTML = '';
            if (log.length > 0) {
                logContainer.classList.remove('hidden');
                log.forEach(dossier => {
                    const btn = document.createElement('button');
                    btn.className = 'terminal-btn mini w-100';
                    btn.textContent = `LOAD: ${dossier.name || 'UNKNOWN'}`;
                    btn.onclick = () => {
                        characterData = dossier;
                        startupScreen.classList.add('hidden');
                        startBootSequence();
                    };
                    logList.appendChild(btn);
                });
            }
        } catch (e) {}
    };
    loadDossierLog();

    // --- UI Flow Logic --- //
    document.getElementById('btn-create').addEventListener('click', () => {
        startupScreen.classList.add('hidden');
        builderScreen.classList.remove('hidden');
    });

    document.getElementById('btn-builder-back').addEventListener('click', () => {
        builderScreen.classList.add('hidden');
        startupScreen.classList.remove('hidden');
    });

    document.getElementById('btn-load').addEventListener('click', () => {
        document.getElementById('file-upload').click();
    });

    document.getElementById('file-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                characterData = JSON.parse(event.target.result);
                startupScreen.classList.add('hidden');
                startBootSequence();
            } catch (err) {
                alert("ERROR: Corrupted data sequence. Invalid JSON.");
            }
        };
        reader.readAsText(file);
    });


    // Prevent Enter key from implicitly submitting, instead move to next field
    document.getElementById('builder-form').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            const inputs = Array.from(e.currentTarget.querySelectorAll('input'));
            const index = inputs.indexOf(e.target);
            if (index > -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    // --- Builder Tally Updates & Arrow Logic --- //
    const buildLevel = document.getElementById('in-level');
    const buildXpTot = document.getElementById('build-xp-tot');
    const buildApTot = document.getElementById('build-ap-tot');

    const updateBuilderTally = (checkOnly = false) => {
        const lvl = parseInt(buildLevel.value) || 1;
        const totalXp = lvl * 10;
        const totalAp = lvl * 2;

        const stats = {
            int: parseInt(document.getElementById('build-int').textContent) || 10,
            con: parseInt(document.getElementById('build-con').textContent) || 10,
            will: parseInt(document.getElementById('build-will').textContent) || 10,
            per: parseInt(document.getElementById('build-per').textContent) || 10,
            str: parseInt(document.getElementById('build-str').textContent) || 10,
            dex: parseInt(document.getElementById('build-dex').textContent) || 10,
            hth: parseInt(document.getElementById('build-hth').textContent) || 10
        };

        const defaultStats = { int: 10, con: 10, will: 10, per: 10, str: 10, dex: 10, hth: 10 };
        const subclass = inSubclass.value;
        const baseStats = (window.OEShared.subclassStats && window.OEShared.subclassStats[subclass]) ? window.OEShared.subclassStats[subclass] : defaultStats;

        const spent_xp_attrs = window.OEShared && window.OEShared.calculateXP ? window.OEShared.calculateXP(stats, baseStats) : 0;

        const remXp = totalXp - spent_xp_attrs;
        if (checkOnly && remXp < 0) return false;

        buildXpTot.textContent = remXp;
        buildApTot.textContent = totalAp;
        return true;
    };

    window.setBuilderStats = (subclass) => {
        const defaultStats = { int: 10, con: 10, will: 10, per: 10, str: 10, dex: 10, hth: 10 };
        const stats = (window.OEShared.subclassStats && window.OEShared.subclassStats[subclass]) ? window.OEShared.subclassStats[subclass] : defaultStats;
        
        document.getElementById('build-int').textContent = stats.int;
        document.getElementById('build-con').textContent = stats.con;
        document.getElementById('build-will').textContent = stats.will;
        document.getElementById('build-per').textContent = stats.per;
        document.getElementById('build-str').textContent = stats.str;
        document.getElementById('build-dex').textContent = stats.dex;
        document.getElementById('build-hth').textContent = stats.hth;
        
        updateBuilderTally(false);
    };
    setBuilderStats(inSubclass.value); // Set initial stats

    buildLevel.addEventListener('input', () => updateBuilderTally(false));

    document.getElementById('builder-form').addEventListener('click', (e) => {
        if (e.target.classList.contains('arrow')) {
            const targetId = e.target.getAttribute('data-target');
            const action = e.target.getAttribute('data-action');
            if (targetId) {
                const el = document.getElementById(targetId);
                const warningEl = document.getElementById('build-warning');
                let val = parseInt(el.textContent) || 10;
                let newVal = val;

                const showWarning = (msg) => {
                    el.style.color = 'var(--c-red)';
                    el.style.textShadow = '0 0 5px rgba(var(--c-red-rgb), .6)';
                    warningEl.textContent = msg;
                    warningEl.style.display = 'block';
                    
                    if (el.warningTimeout) clearTimeout(el.warningTimeout);
                    el.warningTimeout = setTimeout(() => {
                        el.style.color = '';
                        el.style.textShadow = '';
                        warningEl.style.display = 'none';
                    }, 1500);
                };

                if (action === 'up') {
                    if (val < 13) newVal++;
                    else {
                        showWarning("SYSTEM ALERT: Maximum starting value is 13.");
                        return;
                    }
                } else if (action === 'down') {
                    if (val > 7) newVal--;
                    else {
                        showWarning("SYSTEM ALERT: Minimum starting value is 7.");
                        return;
                    }
                }
                
                if (newVal !== val) {
                    el.textContent = newVal;
                    // Only prevent the action due to insufficient XP if we are trying to increase a stat.
                    if (!updateBuilderTally(action === 'up')) {
                        el.textContent = val; // Revert visually if there is not enough XP
                        showWarning("SYSTEM ALERT: Insufficient Starting XP.");
                    } else {
                        warningEl.style.display = 'none';
                    }
                }
            }
        }
    });

    document.getElementById('builder-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const initWill = parseInt(document.getElementById('build-will').textContent) || 10;
        const initConnection = Math.floor(initWill / 4);
        const initAmps = initConnection * initWill;

        characterData = {
            name: document.getElementById('in-name').value,
            player: document.getElementById('in-player').value,
            class: document.getElementById('in-class').value,
            subclass: document.getElementById('in-subclass').value,
            connection: initConnection,
            amps: initAmps,
            current_amps: initAmps,
            level: document.getElementById('in-level').value,
            gift_xp: "0",
            gift_ap: "0",
            int: document.getElementById('build-int').textContent,
            con: document.getElementById('build-con').textContent,
            will: document.getElementById('build-will').textContent,
            per: document.getElementById('build-per').textContent,
            str: document.getElementById('build-str').textContent,
            dex: document.getElementById('build-dex').textContent,
            hth: document.getElementById('build-hth').textContent,
            adv: [],
            dis: [],
            skills: [],
            spells: [],
            inventory: [],
            equipped: [],
            fatigue: "Winded",
            composure: "Stable"
        };
        builderScreen.classList.add('hidden');
        startBootSequence();
    });

    // --- Animation Logic --- //
    function startBootSequence() {
        autoSaveDossier();
        document.getElementById('theme-selector-container').classList.add('hidden');
        sessionStorage.setItem('booted', 'true');
        bootScreen.classList.remove('hidden');
        bootContainer.innerHTML = ''; 
        
        const lines = [
            "INITIATING BIOS v2.4.1...",
            "MEMORY CHECK: 64000K OK",
            "LOADING KERNEL MODULES........ DONE",
            "ESTABLISHING SECURE UPLINK TO EXCLUSION ZONE...",
            "UPLINK ESTABLISHED. PING: 14ms",
            `AUTHENTICATING PLAYER ID: [${characterData.player || 'UNKNOWN'}]...`,
            "ACCESS GRANTED.",
            `QUERYING REGISTRY FOR OPERATIVE: [${characterData.name ? characterData.name.toUpperCase() : 'SUBJECT'}]...`,
            "MATCH FOUND. CROSS-REFERENCING ARCHIVES...",
            `> CLASS: ${characterData.class ? characterData.class.toUpperCase() : 'UNKNOWN'}`,
            `> SUBCLASS: ${characterData.subclass ? characterData.subclass.toUpperCase() : 'UNKNOWN'}`,
            `> LEVEL: ${characterData.level || 1}`,
            "DECRYPTING BIO-METRICS AND LOADING BASE CHARACTERISTICS...",
            "RENDERING INTERFACE..."
        ];
    
        const isNotebook = document.documentElement.getAttribute('data-theme') === 'notebook';

        if (isNotebook) {
            lines.forEach(line => {
                const newLog = document.createElement('div');
                newLog.className = 'boot-line';
                newLog.textContent = '> ' + line;
                bootContainer.appendChild(newLog);
            });

            let currentLine = 0;
            const bootLines = bootContainer.querySelectorAll('.boot-line');
            
            const redactLine = () => {
                if (currentLine < bootLines.length) {
                    bootLines[currentLine].innerHTML = '> <span class="redacted">' + lines[currentLine] + '</span>';
                    currentLine++;
                    setTimeout(redactLine, Math.random() * 200 + 100);
                } else {
                    setTimeout(() => {
                        bootScreen.classList.add('fade-out-boot');
                        setTimeout(() => {
                            window.location.href = 'live_metrics.html';
                        }, 500);
                    }, 800);
                }
            };
            
            setTimeout(redactLine, 400);
        } else {
            let currentLine = 0;
            let cursorLine = document.createElement('div');
            cursorLine.className = 'boot-line';
            cursorLine.innerHTML = '> <span class="boot-cursor-block"></span>';
            bootContainer.appendChild(cursorLine);

            const printLine = () => {
                if (currentLine < lines.length) {
                    bootContainer.removeChild(cursorLine);
                    
                    const newLog = document.createElement('div');
                    newLog.className = 'boot-line';
                    newLog.textContent = '> ' + lines[currentLine];
                    bootContainer.appendChild(newLog);
                    bootContainer.appendChild(cursorLine);
                    
                    currentLine++;
                    setTimeout(printLine, Math.random() * 200 + 100);
                } else {
                    setTimeout(() => {
                        bootScreen.classList.add('fade-out-boot');
                        setTimeout(() => {
                            window.location.href = 'live_metrics.html';
                        }, 500);
                    }, 800);
                }
            };
            
            setTimeout(printLine, 400); // Initial pause before first print
        }
    }
});