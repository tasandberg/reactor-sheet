/* ============================================================
   OSC Hi-Fi sheet — shared helpers, derivation, icons, and the
   LEFT RAIL panels (Identity & Vitals, Abilities, Saves, Skills).
   Rolls pipe through the production window.queueRoll store.
   Attaches everything to window.HF for hifi-center.jsx + hifi-app.jsx.
   ============================================================ */

(function () {
  const { useState } = React;
  const { SPELLS, RULES } = window.GAME;

  /* ---------- pure helpers ---------- */
  const fmtMod = (n) => (n >= 0 ? "+" : "") + n;
  function parseSpec(spec) {
    const m = String(spec).match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!m) return { n: 0, sides: 0, mod: 0 };
    return { n: +m[1], sides: +m[2], mod: m[3] ? +m[3] : 0 };
  }
  // weapon lines also appear in the gear list; show them once (in the weapons group)
  const GEAR_EXCLUDE = ["Dagger", "Quarterstaff"];

  const SAVE_DEFS = [
    ["D", "Death, poison"],
    ["W", "Magic wands"],
    ["P", "Paralysis, petrify"],
    ["B", "Breath attacks"],
    ["S", "Spells, rods, staves"],
  ];
  const SAVE_LONG = { D: "Death", W: "Wands", P: "Paralysis", B: "Breath", S: "Spells" };
  const SKILL_DEFS = [
    ["LD", "Listen at door"],
    ["SD", "Find secret door"],
    ["FT", "Find room trap"],
    ["OD", "Open stuck door"],
    ["FG", "Forage in the wild"],
    ["HT", "Hunt in the wild"],
  ];
  const SKILL_SHORT = { FG: "Forage", FT: "Find trap", HT: "Hunt", LD: "Listen", OD: "Open door", SD: "Secret door" };
  const ABIL_HINTS = {
    STR: "Melee, open doors",
    INT: "Languages, literacy",
    WIS: "Saves vs magic",
    DEX: "Missile, AC, initiative",
    CON: "Hit points",
    CHA: "Reactions, retainers",
  };

  /* ---------- derivation (single source of computed truth) ---------- */
  function derive(char, hr) {
    const dexMod = RULES.abilityMod(char.abilities.DEX);
    const armorAc = char.armor.filter((a) => a.equipped).reduce((s, a) => s + (a.ac || 0), 0);
    const acComputed = 10 + dexMod + armorAc;
    const acDesc = 9 - dexMod - armorAc;
    const sys = char.ac.system; // "AAC" | "DAC"
    const acBase = sys === "AAC" ? acComputed : acDesc;
    const ac = hr.acOvr != null ? hr.acOvr : acBase;

    const baseSaves = RULES.savesAtLevel(char.level);
    const saves = {};
    SAVE_DEFS.forEach(([k]) => { saves[k] = hr.saveOvr[k] != null ? hr.saveOvr[k] : baseSaves[k]; });

    const slots = RULES.slots(char.level);
    const xpThis = RULES.xpFor(char.level);
    const xpNext = RULES.nextXp(char.level);
    const xpPct = xpNext === Infinity ? 100
      : Math.max(0, Math.min(100, (100 * (char.xp - xpThis)) / (xpNext - xpThis)));

    const equippedWeapons = char.weapons.filter((w) => w.equipped);
    const gearItems = char.inventory.filter((it) => !GEAR_EXCLUDE.includes(it.name));
    const carried =
      char.weapons.reduce((s, w) => s + (w.wt || 0), 0) +
      char.armor.reduce((s, a) => s + (a.wt || 0), 0) +
      gearItems.reduce((s, it) => s + (it.wt || 0), 0);
    const move = RULES.movement(carried);

    return {
      dexMod, armorAc, acComputed, acDesc, acBase, ac, sys,
      baseSaves, saves, slots,
      xpThis, xpNext, xpPct,
      init: dexMod, hd: RULES.hdFor(char.level), ab: RULES.attackBonus(char.level),
      equippedWeapons, gearItems, carried, move,
    };
  }

  /* ---------- icons (kept to simple primitives) ---------- */
  const EquipIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 12.5 10 17.5 19 6.5" />
    </svg>
  );
  const CaretIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );

  /* ---------- per-section edit head ---------- */
  function EditHead({ title, hint, sm, on, onToggle, locked }) {
    return (
      <div className={"hf-head" + (sm ? " sm" : "") + (on ? " editing" : "")}>
        <span className="ttl">{title}</span>
        {on
          ? <span className="editing-tag">· editing</span>
          : (hint ? <span className="hint">{hint}</span> : <span className="spring" />)}
        {!locked && (on
          ? <button className="hf-edit done" onClick={onToggle}>✓ Done</button>
          : <button className="hf-edit" onClick={onToggle}>✎ Edit</button>)}
      </div>
    );
  }

  /* ============================================================
     IDENTITY & VITALS  (left rail, single editor)
     ============================================================ */
  function Identity({ ctx }) {
    const { char, setChar, hr, setHr, edit, tog, d, onLevelUp } = ctx;
    const editing = edit.identity;
    const setField = (k, v) => setChar((c) => ({ ...c, [k]: v }));

    if (!editing) {
      return (
        <div className="hf-section hf-identity">
          <div className="hf-portrait">
            <span className="corner tl" /><span className="corner br" />
            <image-slot id="eldra-portrait" shape="rect" fit="cover" placeholder="Drop a portrait"></image-slot>
          </div>
          <div className="hf-id">
            <button className="hf-edit pencil" onClick={() => tog("identity")} aria-label="Edit identity">✎</button>
            <div className="nm">{char.name}</div>
            <div className="meta">{char.cls} · Level {char.level} · {char.title}<br />{char.alignment}</div>
          </div>
        </div>
      );
    }

    // ---- editor ----
    return (
      <div className="hf-section is-editing">
        <div className="hf-head sm editing">
          <span className="ttl">Identity &amp; Vitals</span>
          <span className="editing-tag">· editing</span>
          <button className="hf-edit done" onClick={() => tog("identity")}>✓ Done</button>
        </div>

        <div className="hf-field">
          <span className="lbl">Name</span>
          <input className="input" value={char.name} onChange={(e) => setField("name", e.target.value)} />
        </div>
        <div className="hf-grid2">
          <div className="hf-field">
            <span className="lbl">Class</span>
            <input className="input" value={char.cls} onChange={(e) => setField("cls", e.target.value)} />
          </div>
          <div className="hf-field">
            <span className="lbl">Level</span>
            <div className="hf-locked" title="Level changes only through the Level Up procedure">
              <span className="lv-val">{char.level}</span>
              <button className="lv-link" onClick={onLevelUp}>Level Up <CaretIcon /></button>
            </div>
          </div>
        </div>
        <div className="hf-grid2">
          <div className="hf-field">
            <span className="lbl">Title</span>
            <input className="input" value={char.title} onChange={(e) => setField("title", e.target.value)} />
          </div>
          <div className="hf-field">
            <span className="lbl">Alignment</span>
            <select className="select" value={char.alignment} onChange={(e) => setField("alignment", e.target.value)}>
              <option>Lawful</option><option>Neutral</option><option>Chaotic</option>
            </select>
          </div>
        </div>

        <div className="hf-field">
          <span className="lbl">Portrait</span>
          <div className="hf-portrait" style={{ aspectRatio: "16 / 9" }}>
            <span className="corner tl" /><span className="corner br" />
            <image-slot id="eldra-portrait" shape="rect" fit="cover" placeholder="Drop a portrait"></image-slot>
          </div>
        </div>

        <div className="hf-grid2">
          <div className="hf-field">
            <span className="lbl">Maximum HP</span>
            <input className="input mono" type="number" value={char.hp.max}
              onChange={(e) => setChar((c) => ({ ...c, hp: { ...c.hp, max: Math.max(1, Number(e.target.value) || 1), current: Math.min(c.hp.current, Math.max(1, Number(e.target.value) || 1)) } }))} />
          </div>
          <div className="hf-field">
            <span className="lbl">Armor Class</span>
            <div className="hf-drow" style={{ padding: 0, border: "none" }}>
              <span className="dk" style={{ fontFamily: "var(--mono)", fontSize: "var(--fs-xs)", color: "var(--text-mute)" }}>AAC</span>
              <div className="dright">
                {hr.acOvr != null
                  ? <input className="hf-ovr-input" type="number" value={hr.acOvr}
                      onChange={(e) => setHr((h) => ({ ...h, acOvr: Number(e.target.value) || 0 }))} />
                  : <span className="dval">{d.acBase}</span>}
                <button className={"hf-ovr" + (hr.acOvr != null ? " on" : "")}
                  onClick={() => setHr((h) => ({ ...h, acOvr: h.acOvr != null ? null : d.acBase }))}>
                  {hr.acOvr != null ? "✓ override" : "override"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hf-field">
          <span className="lbl">AC System</span>
          <div className="hf-ac-sys" style={{ alignSelf: "flex-start" }}>
            <button className={d.sys === "AAC" ? "on" : ""} onClick={() => setChar((c) => ({ ...c, ac: { ...c.ac, system: "AAC" } }))}>Ascending</button>
            <button className={d.sys === "DAC" ? "on" : ""} onClick={() => setChar((c) => ({ ...c, ac: { ...c.ac, system: "DAC" } }))}>Descending</button>
          </div>
        </div>

        <p className="hf-note" style={{ marginTop: 4 }}>
          AC = 10 + DEX {fmtMod(d.dexMod)} + worn {fmtMod(d.armorAc)} = <b>{d.acComputed}</b>.
          Hit Dice <b>{d.hd}</b>, Initiative {fmtMod(d.init)} and Move {d.move.rate}′ are derived from class, level &amp; load.
        </p>
      </div>
    );
  }

  /* ============================================================
     VITALS  (left rail — HP + AC, side by side, emphasized by size + border)
     ============================================================ */
  function Vitals({ ctx }) {
    const { char, setChar, hr, d } = ctx;
    const [hpEditing, setHpEditing] = useState(false);
    const setHp = (v) => setChar((c) => ({ ...c, hp: { ...c.hp, current: Math.max(0, Math.min(c.hp.max, v)) } }));
    const acSub = hr.acOvr != null
      ? "house rule"
      : (d.sys === "AAC" ? `AAC · DAC ${d.acDesc}` : `DAC · AAC ${d.acComputed}`);

    return (
      <div className="hf-vitals">
        <div className="hf-vital hp">
          <span className="k">Hit Points</span>
          <span className="val">
            {hpEditing ? (
              <input className="hf-hp-input" type="number" autoFocus value={char.hp.current}
                onChange={(e) => setHp(e.target.value === "" ? 0 : Number(e.target.value))}
                onBlur={() => setHpEditing(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setHpEditing(false); }}
                aria-label="Current hit points" />
            ) : (
              <span className="cur" onClick={() => setHpEditing(true)} title="Click to edit current HP">{char.hp.current}</span>
            )}
          </span>
          <span className="sub">Maximum {char.hp.max}</span>
        </div>
        <div className="hf-vital ac">
          <span className="k">Armor Class</span>
          <span className="val">{d.ac}</span>
          <span className={"sub" + (hr.acOvr != null ? " ovr" : "")}>{acSub}</span>
        </div>
      </div>
    );
  }

  /* ============================================================
     SUB-STATS  (Init / HD / Move — left rail, under portrait)
     ============================================================ */
  function SubStats({ ctx }) {
    const { d } = ctx;
    return (
      <div className="hf-substats">
        <div className="hf-substat roll" onClick={() => ctx.rollInit()} title="Roll initiative (1d6 + DEX)">
          <span className="stamp">Init</span>
          <div className="v mono">{fmtMod(d.init)}</div>
        </div>
        <div className="hf-substat">
          <span className="stamp">HD</span>
          <div className="v mono">{d.hd}</div>
        </div>
        <div className="hf-substat">
          <span className="stamp">Move</span>
          <div className="v mono">{d.move.rate}′</div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ABILITIES  (center top — horizontal row, score big / mod small)
     ============================================================ */
  function Abilities({ ctx }) {
    const { char, setChar, edit, tog } = ctx;
    const order = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

    const roll = (k) => {
      const score = char.abilities[k];
      window.queueRoll({
        kind: "ability",
        label: `${k} check`,
        source: "Ability check · roll-under",
        target: score,
        dice: [{ sides: 20, n: 1 }],
        evaluate: ({ total }) => ({
          verdict: total <= score ? "success" : "fail",
          text: total <= score ? `Success (${total} ≤ ${score})` : `Fail (${total} > ${score})`,
        }),
      });
    };
    const setScore = (k, v) => setChar((c) => ({ ...c, abilities: { ...c.abilities, [k]: Math.max(1, Math.min(20, v)) } }));

    return (
      <div className={"hf-abilities" + (edit.abilities ? " is-editing" : "")}>
        <div className="hf-abil-cap">
          <span className="cap">Abilities</span>
          <span className="hint">{edit.abilities ? "· editing" : "roll-under d20"}</span>
          <span className="spring" />
          {edit.abilities
            ? <button className="hf-edit done" onClick={() => tog("abilities")}>✓ Done</button>
            : <button className="hf-edit" onClick={() => tog("abilities")}>✎ Edit</button>}
        </div>

        <div className="hf-abil-row">
          {order.map((k) => {
            const score = char.abilities[k];
            const mod = RULES.abilityMod(score);
            if (edit.abilities) {
              return (
                <div key={k} className="hf-abil-cell editing">
                  <span className="key">{k}</span>
                  <input className="hf-abil-input" type="number" value={score}
                    onChange={(e) => setScore(k, Number(e.target.value) || 0)} aria-label={`${k} score`} />
                  <div className="hf-abil-step">
                    <button onClick={() => setScore(k, score - 1)} aria-label={`Lower ${k}`}>−</button>
                    <button onClick={() => setScore(k, score + 1)} aria-label={`Raise ${k}`}>+</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={k} className="hf-abil-cell" onClick={() => roll(k)} title={`Roll ${k} check (roll-under ${score})`}>
                <span className="key">{k}</span>
                <span className="score">{score}</span>
                <span className="mod">{fmtMod(mod)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ============================================================
     SAVING THROWS
     ============================================================ */
  function Saves({ ctx }) {
    const { char, hr, setHr, edit, tog, d } = ctx;

    const roll = (k) => {
      const target = d.saves[k];
      const wisAdj = k === "S" ? RULES.abilityMod(char.abilities.WIS) : 0;
      window.queueRoll({
        kind: "save",
        label: `Save vs ${SAVE_LONG[k]}`,
        source: `target ${target}+${wisAdj ? ` · WIS ${fmtMod(wisAdj)}` : ""}`,
        target,
        dice: [{ sides: 20, n: 1, mod: wisAdj }],
        evaluate: ({ total }) => ({
          verdict: total >= target ? "success" : "fail",
          text: total >= target ? `Saved! (${total} ≥ ${target})` : `Failed (need ${target})`,
        }),
      });
    };
    const toggleOvr = (k) => setHr((h) => ({
      ...h, saveOvr: { ...h.saveOvr, [k]: h.saveOvr[k] != null ? null : d.baseSaves[k] },
    }));
    const setOvr = (k, v) => setHr((h) => ({ ...h, saveOvr: { ...h.saveOvr, [k]: Number(v) || 0 } }));

    return (
      <div className={"hf-section" + (edit.saves ? " is-editing" : "")}>
        <EditHead sm title="Saving Throws" hint="roll-over d20" on={edit.saves} onToggle={() => tog("saves")} />
        {edit.saves ? (
          <div>
            <p className="hf-note">Computed from the Magic-User table at level {char.level}. <b>Override</b> a column for a house rule.</p>
            {SAVE_DEFS.map(([k, name]) => {
              const ov = hr.saveOvr[k] != null;
              return (
                <div key={k} className="hf-drow">
                  <span className="dk">{k}</span>
                  <span className="dc">{name.split(",")[0]} · tbl {d.baseSaves[k]}</span>
                  <div className="dright">
                    {ov
                      ? <input className="hf-ovr-input" type="number" value={hr.saveOvr[k]} onChange={(e) => setOvr(k, e.target.value)} />
                      : <span className="dval">{d.baseSaves[k]}</span>}
                    <button className={"hf-ovr" + (ov ? " on" : "")} onClick={() => toggleOvr(k)}>{ov ? "✓ override" : "override"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="hf-saves">
            {SAVE_DEFS.map(([k, name]) => {
              const ov = hr.saveOvr[k] != null;
              return (
                <div key={k} className="hf-save" onClick={() => roll(k)} title={`Save vs ${SAVE_LONG[k]} (≥ ${d.saves[k]})`}>
                  <span className="key">{k}</span>
                  <span className="nm">{name.split(",")[0]}</span>
                  <span className={"v" + (ov ? " ovr" : "")}>{d.saves[k]}</span>
                  <span className="hf-roll-tag">save</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ============================================================
     ADVENTURING SKILLS  (1-in-6)
     ============================================================ */
  function Skills({ ctx }) {
    const { char, setChar, edit, tog } = ctx;

    const roll = (k) => {
      const target = char.skills[k];
      window.queueRoll({
        kind: "skill",
        label: SKILL_SHORT[k],
        source: `1-in-6 · success ≤ ${target}`,
        target,
        dice: [{ sides: 6, n: 1 }],
        evaluate: ({ total }) => ({
          verdict: total <= target ? "success" : "fail",
          text: total <= target ? `Success (${total} ≤ ${target})` : `No (${total})`,
        }),
      });
    };
    const setVal = (k, v) => setChar((c) => ({ ...c, skills: { ...c.skills, [k]: v } }));

    return (
      <div className={"hf-section" + (edit.skills ? " is-editing" : "")}>
        <EditHead sm title="Adventuring Skills" hint="1-in-6" on={edit.skills} onToggle={() => tog("skills")} />
        {edit.skills ? (
          <div>
            <p className="hf-note">The six standard dungeon skills. Set each chance in <b>X-in-6</b>.</p>
            {SKILL_DEFS.map(([k, name]) => (
              <div key={k} className="hf-editrow">
                <span style={{ flex: 1, fontFamily: "var(--serif)", fontSize: "var(--fs-sm)", color: "var(--text-dim)" }}>{name}</span>
                <select className="select" style={{ width: 92 }} value={char.skills[k]} onChange={(e) => setVal(k, Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}-in-6</option>)}
                </select>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {SKILL_DEFS.map(([k, name]) => (
              <div key={k} className="hf-skill" onClick={() => roll(k)} title={`Roll ${name} (≤ ${char.skills[k]})`}>
                <span className="nm">{name}</span>
                <span className="val">{char.skills[k]}-in-6</span>
                <span className="hf-roll-tag">roll</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  window.HF = Object.assign(window.HF || {}, {
    derive, fmtMod, parseSpec, EditHead, EquipIcon, CaretIcon,
    Identity, Vitals, SubStats, Abilities, Saves, Skills,
    SAVE_LONG, SKILL_SHORT,
  });
})();
