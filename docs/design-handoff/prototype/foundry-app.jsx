/* ============================================================
   Foundry window — application shell.
   Titlebar · always-visible header (portrait + AC + meters) ·
   ability plaques · vertical tab rail · roll-result toast.
   Window-only: resizable (default 625×750), container-query
   responsive. No desktop chrome, no chat.
   ============================================================ */

(function () {
  const { useState, useEffect, useRef } = React;
  const { CHARACTER, RULES } = window.GAME;
  const {
    FvttAbilities, FvttSavesSkills, FvttActions, FvttInventory, FvttSpells, FvttFeatures, FvttNotes,
    useDiceStore,
    TweaksPanel, TweakSection, TweakRadio, TweakToggle, useTweaks,
  } = window;

  const fmtMod = (n) => (n >= 0 ? "+" : "") + n;
  const deepCopy = (x) => JSON.parse(JSON.stringify(x));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  const SIZES = {
    "Default": { w: 625, h: 750 },
    "Compact": { w: 380, h: 680 },
    "Wide":    { w: 1040, h: 780 },
  };

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "size": "Default",
    "accent": "Brass",
    "showMap": true,
    "tab": "actions"
  }/*EDITMODE-END*/;

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [char, setChar] = useState(() => deepCopy(CHARACTER));
    const actorKey = CHARACTER.id || CHARACTER.name || "default";
    const [tab, setTab] = useState(() => {
      try { return localStorage.getItem("osc.tab." + actorKey) || t.tab || "actions"; } catch (e) { return t.tab || "actions"; }
    });
    const setTabP = (id) => { setTab(id); try { localStorage.setItem("osc.tab." + actorKey, id); } catch (e) {} };
    const [theme, setTheme] = useState("dark");
    const [editMode, setEditMode] = useState(false);
    const sheetRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const [narrow, setNarrow] = useState(true);
    const setField = (k, v) => setChar((c) => ({ ...c, [k]: v }));
    const setAbility = (k, v) => setChar((c) => ({ ...c, abilities: { ...c.abilities, [k]: Math.max(1, Math.min(20, v)) } }));
    const setMaxHp = (v) => setChar((c) => { const max = Math.max(1, v); return { ...c, hp: { ...c.hp, max, current: Math.min(c.hp.current, max) } }; });

    useEffect(() => { document.body.classList.add("foundry"); }, []);
    useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
    useEffect(() => {
      const el = sheetRef.current;
      if (!el) return;
      const onScroll = () => {
        const nm = el.querySelector(".fvtt-name");
        const threshold = nm ? Math.max(8, nm.offsetTop + nm.offsetHeight - 8) : 48;
        setScrolled(el.scrollTop > threshold);
      };
      onScroll();
      el.addEventListener("scroll", onScroll, { passive: true });
      let ro;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => setNarrow(el.clientWidth < 760));
        ro.observe(el);
      }
      return () => { el.removeEventListener("scroll", onScroll); ro && ro.disconnect(); };
    }, []);

    const nextXp = RULES.nextXp(char.level);
    const curThr = RULES.xpFor(char.level);
    const xpPct = nextXp === Infinity ? 100 : clamp(100 * (char.xp - curThr) / (nextXp - curThr), 0, 100);
    const hpPct = clamp(100 * char.hp.current / char.hp.max, 0, 100);
    const hpLow = char.hp.current <= char.hp.max * 0.34;
    const encPct = clamp(100 * char.encumbrance.current / char.encumbrance.cap, 0, 100);
    const acVal = char.ac.system === "AAC" ? char.ac.ascending : char.ac.descending;
    const preparedCount = Object.values(char.prepared).reduce((a, b) => a + (b?.length || 0), 0);

    const adjustHp = (d) => setChar((c) => ({ ...c, hp: { ...c.hp, current: clamp(c.hp.current + d, 0, c.hp.max) } }));
    const toggleAc = () => setChar((c) => ({ ...c, ac: { ...c.ac, system: c.ac.system === "AAC" ? "DAC" : "AAC" } }));
    const rollHd = () => window.queueRoll({
      kind: "hd", label: "Hit Die", source: RULES.hdFor(char.level),
      dice: [{ ...parse(RULES.hdFor(char.level)) }],
      evaluate: ({ total }) => ({ verdict: null, text: `${total} rolled` }),
    });

    const encBand = RULES.movement(char.encumbrance.current).band;
    const initMod = RULES.abilityMod(char.abilities.DEX);
    const moveRate = RULES.movement(char.encumbrance.current).rate;
    // AC breakdown (AAC contributions; base 10 + DEX + equipped wards)
    const acParts = [
      { label: "Base (unarmored)", aac: 10 },
      ...(initMod !== 0 ? [{ label: `DEX modifier`, aac: initMod }] : []),
      ...(char.armor || []).filter((a) => a.equipped).map((a) => ({ label: a.name, aac: a.ac })),
    ];
    const rollInit = () => window.queueRoll({ kind: "init", label: "Initiative", source: `1d6 ${fmtMod(initMod)}`, dice: [{ sides: 6, n: 1, mod: initMod }] });
    const toggleTheme = () => setTheme((th) => (th === "dark" ? "cream" : "dark"));
    const onRest = () => {
      const heal = 1 + Math.floor(Math.random() * 3);
      setChar((c) => ({ ...c, spent: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }, hp: { ...c.hp, current: Math.min(c.hp.max, c.hp.current + heal) } }));
      window.queueRoll({ kind: "rest", label: "Rest \u00b7 1 day", source: "Recover 1d3 HP \u00b7 re-memorize", dice: [{ sides: 3, n: 1 }], evaluate: () => ({ verdict: "success", text: `+${heal} HP \u00b7 spells refreshed` }) });
    };
    const onLevelUp = () => {
      const reqXp = RULES.nextXp(char.level);
      if (char.xp < reqXp) {
        window.queueRoll({ kind: "levelup", label: "Level Up \u2014 not yet", source: `Need ${reqXp === Infinity ? "\u2014" : reqXp.toLocaleString()} XP`, dice: [{ sides: 20, n: 1 }], evaluate: () => ({ verdict: "fail", text: reqXp === Infinity ? "Max level" : `${(reqXp - char.xp).toLocaleString()} XP to go` }) });
        return;
      }
      const next = char.level + 1;
      const die = parse(RULES.hdFor(next)).sides;
      const entry = window.queueRoll({ kind: "levelup", label: `Level ${next} \u2014 ${RULES.titleFor(next)}`, source: `HP gain \u00b7 1d${die}`, dice: [{ sides: die, n: 1 }], evaluate: ({ total }) => ({ verdict: "success", text: `+${total} HP \u00b7 now level ${next}` }) });
      const gain = entry.total;
      setChar((c) => ({ ...c, level: next, title: RULES.titleFor(next), hp: { ...c.hp, max: c.hp.max + gain, current: c.hp.current + gain } }));
    };

    const sz = SIZES[t.size] || SIZES.Default;
    const winStyle = { width: sz.w, height: sz.h };
    if (t.accent === "Teal") { winStyle["--gold"] = "var(--teal)"; winStyle["--gold-dim"] = "var(--teal-dim)"; winStyle["--gold-soft"] = "color-mix(in srgb, var(--teal) 32%, transparent)"; }

    const TABS = [
      ["actions", "Actions", "◈"],
      ["inventory", "Inventory", "▤", char.inventory.length],
      ["spells", "Spells", "✦", preparedCount],
      ["abilities", "Abilities", "❖"],
      ["notes", "Notes", "✎"],
    ];

    return (
      <>
        {t.showMap && <div className="fvtt-map" />}

        <div className="fvtt-stage">
          <div className="fvtt-window" style={winStyle}>
            {/* Titlebar */}
            <div className="fvtt-titlebar">
              <div className="tb-title">Character: <b>{char.name}</b></div>
              <div className="tb-ctrls">
                <button title="Sheet menu">⋮</button>
                <button title="Open compendium entry">▢</button>
                <button className="close" title="Close">✕</button>
              </div>
            </div>

            {/* Topbar — Lv / XP / Rest / Level-Up / theme (persists across all views) */}
            <div className="fvtt-topbar">
              <div className="ft-lv"><b>Lv {char.level}</b><span className="cur">{curThr.toLocaleString()}</span></div>
              <div className="ft-xp" title={`${char.xp.toLocaleString()} XP`}>
                <div className="ft-xp-bar"><i style={{ width: xpPct + "%" }} /><span className="v">{char.xp.toLocaleString()} XP</span></div>
              </div>
              <div className="ft-lv next"><b>Lv {char.level + 1}</b><span className="cur">{nextXp === Infinity ? "\u2014" : nextXp.toLocaleString()}</span></div>
              <button className="ft-btn" onClick={onRest}><span className="i">☾</span><span className="ft-lbl">Rest</span></button>
              <button className="ft-btn up" onClick={onLevelUp}><span className="i">▲</span><span className="ft-lbl">Level Up</span></button>
              <button className={`ft-btn edit ${editMode ? "on" : ""}`} onClick={() => setEditMode((e) => !e)} title={editMode ? "Finish editing" : "Edit mechanical attributes"}>
                <span className="i">{editMode ? "✓" : "✎"}</span><span className="ft-lbl">{editMode ? "Done" : "Edit"}</span>
              </button>
              <button className="ft-btn icon" onClick={toggleTheme} title="Toggle colour scheme"><span className="i">◐</span></button>
            </div>

            {/* Condensed identity bar — slides in below the topbar once the
                stacked header scrolls away (single-pane width only) */}
            {narrow && (
              <div className={`fvtt-minibar ${scrolled ? "show" : ""}`} aria-hidden={!scrolled}>
                <div className="mb-portrait">
                  <image-slot id="eldra-portrait" shape="rounded" radius="4" placeholder=""></image-slot>
                </div>
                <div className="mb-id">
                  <span className="mb-name">{char.name}</span>
                  <span className="mb-meta">{char.cls} {char.level}</span>
                </div>
                <div className="mb-vitals">
                  <span className="mb-chip hp">
                    <b>HP</b>
                    <input
                      className="mb-hpinput"
                      type="number"
                      min="0"
                      max={char.hp.max}
                      value={char.hp.current}
                      aria-label="Current hit points"
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "");
                        setChar((c) => ({ ...c, hp: { ...c.hp, current: digits === "" ? 0 : clamp(parseInt(digits, 10), 0, c.hp.max) } }));
                      }}
                    />
                    <span className="mb-hpmax">/{char.hp.max}</span>
                  </span>
                  <span className="mb-chip ac" title="Armor Class breakdown">
                    <b>AC</b> {acVal}
                    <div className="fvtt-acpop" role="tooltip">
                      <div className="ap-h">Armor Class<span className="ap-sys">{char.ac.system}</span></div>
                      <ul className="ap-rows">
                        {acParts.map((p, i) => (
                          <li key={i}><span className="ap-k">{p.label}</span><span className="ap-v">{fmtMod(char.ac.system === "AAC" ? p.aac : -p.aac)}</span></li>
                        ))}
                      </ul>
                      <div className="ap-total"><span>Total</span><span className="ap-tv">{acVal}<small> {char.ac.system}</small></span></div>
                    </div>
                  </span>
                </div>
              </div>
            )}

            {/* Body: scrolling sheet + tab rail + toast */}
            <div className={`fvtt-body ${editMode ? "is-editing" : ""}`}>
              <div className="fvtt-sheet" ref={sheetRef}>
                {editMode && (
                  <div className="fvtt-editbanner">
                    <span className="eb-dot" /> Editing mechanical attributes
                    <span className="eb-hint">abilities, identity, max HP &amp; saves — derived stats update live</span>
                  </div>
                )}
                <div className="fvtt-pad">
                  <div className="fvtt-twopane">
                    <div className="fvtt-left">
                      {/* Header */}
                      <div className={`fvtt-head${editMode ? " editing" : ""}`}>
                        <div className="fvtt-portrait-wrap">
                          <div className="fvtt-portrait">
                            <image-slot id="eldra-portrait" shape="rounded" radius="6" placeholder="portrait"></image-slot>
                          </div>
                        </div>

                        <div className="fvtt-ident">
                          {editMode ? (
                            <div className="fvtt-idedit">
                              <label className="fe-field"><span className="fe-l">Name</span>
                                <input className="fe-input" value={char.name} onChange={(e) => setField("name", e.target.value)} /></label>
                              <div className="fe-row">
                                <label className="fe-field locked" title="Class is fixed — it drives saves, HD, spells & more"><span className="fe-l">Class</span>
                                  <span className="fe-locked">{char.cls}<button className="fe-link" onClick={() => window.queueRoll({ kind: "info", label: "Change Class", source: "Wizard coming soon", dice: [{ sides: 20, n: 1 }], evaluate: () => ({ verdict: null, text: "Not yet available" }) })}>Change →</button></span></label>
                                <label className="fe-field locked" title="Level changes only through Level Up"><span className="fe-l">Level</span>
                                  <span className="fe-locked">{char.level}<button className="fe-link" onClick={onLevelUp}>Level Up →</button></span></label>
                              </div>
                              <div className="fe-row">
                                <label className="fe-field"><span className="fe-l">Title</span>
                                  <input className="fe-input" value={char.title} onChange={(e) => setField("title", e.target.value)} /></label>
                                <label className="fe-field"><span className="fe-l">Alignment</span>
                                  <select className="fe-input" value={char.alignment} onChange={(e) => setField("alignment", e.target.value)}>
                                    <option>Lawful</option><option>Neutral</option><option>Chaotic</option>
                                  </select></label>
                              </div>
                            </div>
                          ) : (
                            <div className="fvtt-idhead">
                              <div className="fvtt-name">{char.name}</div>
                              <div className="fvtt-class">{char.cls} {char.level} · {char.alignment}</div>
                            </div>
                          )}
                          {!editMode && (
                            <div className="fvtt-pillrow">
                              <button className="ss-pill" onClick={rollInit} title="Roll initiative"><span className="ss-k">Init</span><span className="ss-v">{fmtMod(initMod)}</span></button>
                              <button className="ss-pill" onClick={rollHd} title="Roll a Hit Die"><span className="ss-k">HD</span><span className="ss-v">{RULES.hdFor(char.level)}</span></button>
                              <div className="ss-pill"><span className="ss-k">Move</span><span className="ss-v">{moveRate}′</span></div>
                            </div>
                          )}
                        </div>

                        <div className={`fvtt-vitals${editMode ? "" : " two"}`}>
                            <div className={`fvtt-vital hp ${hpLow && !editMode ? "low" : ""} ${editMode ? "editing" : ""}`}>
                              {editMode ? (
                                <>
                                  <div className="vv-l">Hit Points</div>
                                  <div className="fe-hp">
                                    <div className="fe-hp-col">
                                      <div className="fe-stepper">
                                        <button onClick={() => adjustHp(-1)} title="− current">−</button>
                                        <span className="fe-sv">{char.hp.current}</span>
                                        <button onClick={() => adjustHp(1)} title="+ current">+</button>
                                      </div>
                                      <span className="fe-hp-l">Current</span>
                                    </div>
                                    <span className="fe-hp-sep">/</span>
                                    <div className="fe-hp-col">
                                      <div className="fe-stepper">
                                        <button onClick={() => setMaxHp(char.hp.max - 1)} title="− max">−</button>
                                        <span className="fe-sv">{char.hp.max}</span>
                                        <button onClick={() => setMaxHp(char.hp.max + 1)} title="+ max">+</button>
                                      </div>
                                      <span className="fe-hp-l">Maximum</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="vv-stamp">HP</div>
                                  <div className="vv-field">
                                    <div className="vv-cap">Hit points</div>
                                    <div className="vv-row">
                                      <button className="vv-step" onClick={() => adjustHp(-1)} title="Lose 1 HP" aria-label="Lose 1 HP">−</button>
                                      <div className="vv-big">{char.hp.current}</div>
                                      <button className="vv-step" onClick={() => adjustHp(1)} title="Heal 1 HP" aria-label="Heal 1 HP">+</button>
                                    </div>
                                    <div className="vv-sub">Maximum {char.hp.max}</div>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className={`fvtt-vital ac ${editMode ? "dim" : ""}`} onClick={editMode ? undefined : toggleAc} title={editMode ? "AC is derived — not editable" : "Click to toggle AC system"}>
                              <div className="vv-stamp">AC</div>
                              <div className="vv-field">
                                <div className="vv-cap">Armor Class</div>
                                <div className="vv-big">{acVal}</div>
                                <div className="vv-sub">{char.ac.system === "AAC" ? `AAC · DAC ${char.ac.descending}` : `DAC · AAC ${char.ac.ascending}`}</div>
                              </div>
                              <div className="fvtt-acpop" role="tooltip">
                                <div className="ap-h">Armor Class<span className="ap-sys">{char.ac.system}</span></div>
                                <ul className="ap-rows">
                                  {acParts.map((p, i) => (
                                    <li key={i}><span className="ap-k">{p.label}</span><span className="ap-v">{fmtMod(char.ac.system === "AAC" ? p.aac : -p.aac)}</span></li>
                                  ))}
                                </ul>
                                <div className="ap-total"><span>Total</span><span className="ap-tv">{acVal}<small> {char.ac.system}</small></span></div>
                                <div className="ap-foot">Click box to switch to {char.ac.system === "AAC" ? "descending" : "ascending"}</div>
                              </div>
                            </div>
                            {editMode && (
                            <div className="fvtt-substack">
                              <button className="ss-row" onClick={rollInit} title="Roll initiative"><span className="ss-k">Init</span><span className="ss-v">{fmtMod(initMod)}</span></button>
                              <button className="ss-row" onClick={rollHd} title="Roll a Hit Die"><span className="ss-k">HD</span><span className="ss-v">{RULES.hdFor(char.level)}</span></button>
                              <div className="ss-row"><span className="ss-k">Move</span><span className="ss-v">{moveRate}′</span></div>
                            </div>
                            )}
                          </div>
                      </div>
                      <div className="fvtt-rail-extra"><FvttSavesSkills char={char} setChar={setChar} editMode={editMode} /></div>
                    </div>

                    <div className="fvtt-right">
                      <div className="fvtt-htabs" role="tablist">
                        {TABS.map(([id, label, ic, ct]) => (
                          <button key={id} className={`fvtt-htab ${tab === id ? "active" : ""}`} onClick={() => setTabP(id)} role="tab" aria-selected={tab === id}>
                            <span className="ht-ic">{ic}</span>{label}
                            {ct != null && <span className="ht-ct">{ct}</span>}
                          </button>
                        ))}
                      </div>
                      {tab === "actions" && (<React.Fragment><FvttAbilities char={char} setChar={setChar} editMode={editMode} /><FvttActions char={char} setChar={setChar} editMode={editMode} /></React.Fragment>)}
                      {tab === "inventory" && (
                        <div className="fvtt-hfinv">
                          {React.createElement(window.HF.Inventory, { ctx: {
                            char, setChar,
                            edit: { inventory: editMode },
                            tog: () => setEditMode((v) => !v),
                            d: window.HF.derive(char, { acOvr: null, saveOvr: {} }),
                          } })}
                        </div>
                      )}
                      {tab === "spells" && <FvttSpells char={char} setChar={setChar} />}
                      {tab === "abilities" && <FvttFeatures char={char} />}
                      {tab === "notes" && <FvttNotes char={char} setChar={setChar} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical tab rail */}
              <nav className="fvtt-tabrail">
                {TABS.map(([id, label, ic, ct]) => (
                  <button key={id} className={`fvtt-tab ${tab === id ? "active" : ""}`} onClick={() => setTabP(id)} title={label}>
                    <span className="tab-ic">{ic}</span>
                    {label}
                    {ct != null && <span className="tab-ct">{ct}</span>}
                  </button>
                ))}
              </nav>

              <RollToast />
            </div>
          </div>
        </div>

        <TweaksPanel title="Foundry window">
          <TweakSection label="Pop-out size" />
          <TweakRadio label="Window" value={t.size} options={["Default", "Compact", "Wide"]} onChange={(v) => setTweak("size", v)} />
          <TweakSection label="Style" />
          <TweakRadio label="Accent" value={t.accent} options={["Brass", "Teal"]} onChange={(v) => setTweak("accent", v)} />
          <TweakToggle label="Map backdrop" value={t.showMap} onChange={(v) => setTweak("showMap", v)} />
        </TweaksPanel>
      </>
    );
  }

  // ---------- Roll-result toast (replaces the chat output) ----------
  function RollToast() {
    const { tray } = useDiceStore();
    const [shown, setShown] = useState(null);
    useEffect(() => {
      if (!tray) return;
      setShown(tray);
      const id = setTimeout(() => setShown((s) => (s && s.id === tray.id ? null : s)), 5400);
      return () => clearTimeout(id);
    }, [tray && tray.id]);

    if (!shown) return null;
    const e = shown;
    return (
      <div className="fvtt-toast" key={e.id}>
        <button className="tclose" onClick={() => setShown(null)} title="Dismiss">✕</button>
        <div className="tdice">
          {e.dice.map((d, i) => (
            <span key={i} className={`tdie ${d.sides === 20 && d.value === 20 ? "crit" : ""} ${d.sides === 20 && d.value === 1 ? "fumble" : ""}`} title={`d${d.sides}`}>{d.value}</span>
          ))}
        </div>
        <div className="tinfo">
          <div className="tlabel">{e.label}</div>
          <div className="tsource">{e.breakdown}{e.target != null ? ` · vs ${e.target}` : ""}</div>
        </div>
        <div className="ttotal">
          <div className="tt">{e.total}</div>
          {e.verdict && <div className={`tverdict ${e.verdict}`}>{e.text || e.verdict}</div>}
          {!e.verdict && e.text && <div className="tverdict">{e.text}</div>}
        </div>
      </div>
    );
  }

  function parse(spec) {
    const m = String(spec).match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!m) return { sides: 4, n: 1, mod: 0 };
    return { n: +m[1], sides: +m[2], mod: m[3] ? +m[3] : 0 };
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
