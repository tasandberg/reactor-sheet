/* ============================================================
   Foundry window — tab bodies + ability plaques.
   Pure-window sheet. Every roll flows through window.queueRoll
   (shared dice store); the RollToast in foundry-app renders the
   result. No chat / sidebar.
   ============================================================ */

(function () {
  const { useState } = React;
  const { CHARACTER, SPELLS, RULES } = window.GAME;

  const fmtMod = (n) => (n >= 0 ? "+" : "") + n;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const parseSpec = (spec) => {
    const m = String(spec).match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!m) return { n: 0, sides: 0, mod: 0 };
    return { n: +m[1], sides: +m[2], mod: m[3] ? +m[3] : 0 };
  };
  const ABIL_ORDER = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

  // ---------- Ability plaques ----------
  function FvttAbilities({ char, setChar, editMode }) {
    const roll = (k) => {
      const score = char.abilities[k];
      window.queueRoll({
        kind: "ability",
        label: `${k} Check`,
        source: `1d20 ≤ ${score} (roll-under)`,
        target: score,
        dice: [{ sides: 20, n: 1 }],
        evaluate: ({ total }) => ({
          verdict: total <= score ? "success" : "fail",
          text: total <= score ? `Pass · ${total} ≤ ${score}` : `Fail · ${total} > ${score}`
        })
      });
    };
    const setScore = (k, v) => setChar((c) => ({ ...c, abilities: { ...c.abilities, [k]: Math.max(1, Math.min(20, v)) } }));
    return (
      <div className="fvtt-sec">
        <div className={`fvtt-abilities ${editMode ? "editing" : ""}`}>
          {ABIL_ORDER.map((k) => editMode ?
          <div className="fvtt-abil editing" key={k}>
              <div className="ak">{k}</div>
              <div className="fe-stepper">
                <button onClick={() => setScore(k, char.abilities[k] - 1)} title={`− ${k}`}>−</button>
                <span className="fe-sv">{char.abilities[k]}</span>
                <button onClick={() => setScore(k, char.abilities[k] + 1)} title={`+ ${k}`}>+</button>
              </div>
              <div className="am">{fmtMod(RULES.abilityMod(char.abilities[k]))}</div>
            </div> :

          <div className="fvtt-abil" key={k} onClick={() => roll(k)} title={`Roll ${k} check (roll-under)`}>
              <div className="ak">{k}</div>
              <div className="av">{char.abilities[k]}</div>
              <div className="am">{fmtMod(RULES.abilityMod(char.abilities[k]))}</div>
            </div>
          )}
        </div>
      </div>);

  }

  // ---------- Saving throws + exploration (shared: Actions body OR left rail) ----------
  const SAVE_DEFS = [
  { k: "D", n: "Death" }, { k: "W", n: "Wands" }, { k: "P", n: "Paralys." },
  { k: "B", n: "Breath" }, { k: "S", n: "Spells" }];

  const SKILL_DEFS = [
  { k: "LD", n: "Listen at Door" }, { k: "OD", n: "Open Stuck Door" },
  { k: "SD", n: "Find Secret Door" }, { k: "FT", n: "Find Trap" },
  { k: "FG", n: "Forage" }, { k: "HT", n: "Hunt" }];

  function FvttSavesSkills({ char }) {
    const saves = RULES.savesAtLevel(char.level);
    const wisMod = RULES.abilityMod(char.abilities.WIS);
    const rollSave = (k, label) => {
      const target = saves[k];
      const adj = k === "S" ? wisMod : 0;
      window.queueRoll({
        kind: "save", label: `Save vs ${label}`,
        source: `1d20 ≥ ${target}${adj ? ` (WIS ${fmtMod(adj)})` : ""}`, target,
        dice: [{ sides: 20, n: 1, mod: adj }],
        evaluate: ({ total }) => ({ verdict: total >= target ? "success" : "fail", text: total >= target ? `Saved · ${total} ≥ ${target}` : `Failed · need ${target}` })
      });
    };
    const rollSkill = (k, n, target) => {
      window.queueRoll({
        kind: "skill", label: n, source: `1d6 ≤ ${target} (${target}-in-6)`, target,
        dice: [{ sides: 6, n: 1 }],
        evaluate: ({ total }) => ({ verdict: total <= target ? "success" : "fail", text: total <= target ? `Success · ${total} ≤ ${target}` : `No · rolled ${total}` })
      });
    };
    return (
      <div className="fvtt-split">
        <section className="fvtt-sec">
          <h3><span className="h-title">Saving Throws</span> <span className="h-hint">roll ≥</span></h3>
          <div className="fvtt-saves">
            {SAVE_DEFS.map((s) =>
            <div className="fvtt-save" key={s.k} onClick={() => rollSave(s.k, s.n)} title={`Save vs ${s.n} — roll ≥ ${saves[s.k]}`}>
                <div className="sk">{s.k}</div>
                <div className="sv">{saves[s.k]}+</div>
                <span className="sn">{s.n}</span>
              </div>
            )}
          </div>
        </section>
        <section className="fvtt-sec">
          <h3><span className="h-title">Exploration</span> <span className="h-hint">1-in-6</span></h3>
          <div className="fvtt-explore">
            {SKILL_DEFS.map((s) =>
            <div className="fvtt-skill" key={s.k} onClick={() => rollSkill(s.k, s.n, char.skills[s.k])} title={`Roll d6 ≤ ${char.skills[s.k]}`}>
                <span className="skic">◆</span>
                <span className="skn">{s.n}</span>
                <span className="skv">{char.skills[s.k]}-in-6</span>
              </div>
            )}
          </div>
        </section>
      </div>);

  }

  // ---------- ACTIONS tab ----------
  function FvttActions({ char, setChar }) {
    const ab = RULES.attackBonus(char.level);

    const rollAttack = (w) => {
      if (w.type === "missile" && (w.ammo ?? 1) <= 0) return;
      window.queueRoll({
        kind: "attack",
        label: `Attack · ${w.name}`,
        source: `1d20 ${fmtMod(ab + w.mod)} vs ${char.ac.system}`,
        dice: [{ sides: 20, n: 1, mod: ab + w.mod }],
        evaluate: ({ dice, total }) => {
          const nat = dice[0].value;
          if (nat === 20) return { verdict: "crit", text: `Critical! Beats AAC ${total}` };
          if (nat === 1) return { verdict: "fumble", text: "Fumble" };
          return { verdict: null, text: `Beats AAC ${total}` };
        }
      });
      if (w.type === "missile" && w.ammo != null) {
        setChar((c) => ({ ...c, weapons: c.weapons.map((x) => x === w ? { ...x, ammo: Math.max(0, x.ammo - 1) } : x) }));
      }
    };
    const rollDmg = (w) => {
      window.queueRoll({
        kind: "damage",
        label: `Damage · ${w.name}`,
        source: w.dmg + (w.mod ? ` ${fmtMod(w.mod)}` : ""),
        dice: [{ ...parseSpec(w.dmg), mod: w.mod || 0 }],
        evaluate: ({ total }) => ({ verdict: "dmg", text: `${total} damage` })
      });
    };

    const saves = RULES.savesAtLevel(char.level);
    const wisMod = RULES.abilityMod(char.abilities.WIS);
    const SAVES = [
    { k: "D", n: "Death" }, { k: "W", n: "Wands" }, { k: "P", n: "Paralys." },
    { k: "B", n: "Breath" }, { k: "S", n: "Spells" }];

    const rollSave = (k, label) => {
      const target = saves[k];
      const adj = k === "S" ? wisMod : 0;
      window.queueRoll({
        kind: "save",
        label: `Save vs ${label}`,
        source: `1d20 ≥ ${target}${adj ? ` (WIS ${fmtMod(adj)})` : ""}`,
        target,
        dice: [{ sides: 20, n: 1, mod: adj }],
        evaluate: ({ total }) => ({
          verdict: total >= target ? "success" : "fail",
          text: total >= target ? `Saved · ${total} ≥ ${target}` : `Failed · need ${target}`
        })
      });
    };

    const SKILLS = [
    { k: "LD", n: "Listen at Door" }, { k: "OD", n: "Open Stuck Door" },
    { k: "SD", n: "Find Secret Door" }, { k: "FT", n: "Find Trap" },
    { k: "FG", n: "Forage" }, { k: "HT", n: "Hunt" }];

    const rollSkill = (k, n, t) => {
      window.queueRoll({
        kind: "skill",
        label: n,
        source: `1d6 ≤ ${t} (${t}-in-6)`,
        target: t,
        dice: [{ sides: 6, n: 1 }],
        evaluate: ({ total }) => ({
          verdict: total <= t ? "success" : "fail",
          text: total <= t ? `Success · ${total} ≤ ${t}` : `No · rolled ${total}`
        })
      });
    };

    const mv = RULES.movement(char.encumbrance.current);
    const coinRows = [
    ["gp", "GP", char.coin.gp], ["sp", "SP", char.coin.sp], ["cp", "CP", char.coin.cp],
    ["pp", "PP", char.coin.pp], ["ep", "EP", char.coin.ep]];

    // memorized (prepared) spells — quick-cast from the Actions tab
    const castSpell = (lvl, name) => {
      setChar((c) => ({ ...c, spent: { ...c.spent, [lvl]: [...(c.spent[lvl] || []), name] } }));
      const def = SPELLS[lvl]?.find((s) => s.name === name);
      if (def?.damage) {
        window.queueRoll({ kind: "spell", label: `Cast ${name}`, source: `Level ${lvl} · ${def.damage}`, dice: [{ ...parseSpec(def.damage) }], evaluate: ({ total }) => ({ verdict: "dmg", text: `${total} damage` }) });
      } else {
        window.queueRoll({ kind: "spell", label: `Cast ${name}`, source: `Level ${lvl} · slot spent`, dice: [{ sides: 20, n: 1 }], evaluate: () => ({ verdict: "success", text: `${name} takes effect` }) });
      }
    };
    const prepLevels = Object.keys(char.prepared || {}).map(Number)
      .filter((lvl) => (char.prepared[lvl] || []).length > 0).sort((a, b) => a - b);


    return (
      <>
        <section className="fvtt-sec">
          <h3><span className="h-title">Attacks</span> <span className="h-hint">click to roll</span></h3>
          <div className="fvtt-wtable">
            <div className="whdr"><span>Item</span><span>Hit</span><span>Damage</span><span>Attack</span></div>
            {char.weapons.map((w, i) => {
              const out = w.type === "missile" && (w.ammo ?? 1) <= 0;
              const tags = [w.type === "missile" ? "Missile" : "Melee"];
              if (/quarterstaff/i.test(w.name)) tags.push("Two-handed", "Slow");
              if (/thrown/i.test(w.name)) tags.push("Thrown");
              return (
                <div className="fvtt-weapon" key={i}>
                  <div className="winfo">
                    <div className="wic">{w.type === "missile" ? "↗" : "†"}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="wname">{w.name}</div>
                      <div className="wtags">
                        {tags.map((t) => <span className="fvtt-tag" key={t}>{t}</span>)}
                        {w.ammo != null &&
                        <span className="fvtt-ammo">
                            {Array.from({ length: w.ammoMax }).map((_, j) => <span key={j} className={`pip ${j < w.ammo ? "full" : ""}`} />)}
                            <span style={{ marginLeft: 2 }}>{w.ammo}/{w.ammoMax}</span>
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="wstat"><span className="sl">hit</span>{w.type === "missile" ? "↗" : "†"} {fmtMod(ab + w.mod)}</div>
                  <div className="wstat dmg" onClick={() => rollDmg(w)} title="Roll damage"><span className="sl">dmg</span>{w.dmg}{w.mod ? fmtMod(w.mod) : ""}</div>
                  <button className="fvtt-atk" onClick={() => rollAttack(w)} disabled={out} title={out ? "Out of ammo" : "Roll 1d20 attack"}>⬢</button>
                </div>);

            })}
          </div>
        </section>

        <div className="fvtt-split actions-only">
          <section className="fvtt-sec">
            <h3><span className="h-title">Saving Throws</span> <span className="h-hint">roll ≥</span></h3>
            <div className="fvtt-saves">
              {SAVES.map((s) =>
              <div className="fvtt-save" key={s.k} onClick={() => rollSave(s.k, s.n)} title={`Save vs ${s.n} — roll ≥ ${saves[s.k]}`}>
                  <div className="sk">{s.k}</div>
                  <div className="sv">{saves[s.k]}+</div>
                  <span className="sn">{s.n}</span>
                </div>
              )}
            </div>
          </section>

          <section className="fvtt-sec">
            <h3><span className="h-title">Exploration</span> <span className="h-hint">1-in-6</span></h3>
            <div className="fvtt-explore">
              {SKILLS.map((s) =>
              <div className="fvtt-skill" key={s.k} onClick={() => rollSkill(s.k, s.n, char.skills[s.k])} title={`Roll d6 ≤ ${char.skills[s.k]}`}>
                  <span className="skic">◆</span>
                  <span className="skn">{s.n}</span>
                  <span className="skv">{char.skills[s.k]}-in-6</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {prepLevels.length > 0 && (
          <section className="fvtt-sec">
            <h3><span className="h-title">Memorized Spells</span> <span className="h-hint">click to cast</span></h3>
            <div className="fvtt-castlist">
              {prepLevels.map((lvl) => (char.prepared[lvl] || []).map((name, i) => {
                const def = SPELLS[lvl]?.find((s) => s.name === name);
                const isSpent = (char.spent[lvl] || []).includes(name);
                return (
                  <div className={`fvtt-spell ${isSpent ? "spent" : ""}`} key={lvl + "-" + name + "-" + i}>
                    <div className="chk">✓</div>
                    <div>
                      <span className="spn">{name}</span>
                      <span className="spm"><span>Lvl {lvl}</span>{def?.damage && <span>{def.damage}</span>}{def?.range && <span>{def.range}</span>}</span>
                    </div>
                    <button className="fvtt-btn sm" onClick={() => castSpell(lvl, name)} disabled={isSpent}>{isSpent ? "spent" : "cast"}</button>
                  </div>
                );
              }))}
            </div>
          </section>
        )}

        <div className="fvtt-footer">
          <div>
            <h4>Movement</h4>
            <div className="fvtt-mvlist">
              <span className="mv">Encounter <b>{Math.round(mv.rate / 3)} ft</b></span>
              <span className="mv">Explore <b>{mv.rate} ft</b></span>
              <span className="mv">Travel <b>{Math.round(mv.rate / 5)} mi</b></span>
            </div>
            <div className="band" style={{ fontFamily: "IM Fell English, serif", fontStyle: "italic", fontSize: "var(--fs-sm)", color: "var(--text-mute)", marginTop: 6 }}>{mv.band}</div>
          </div>
          <div>
            <h4>Wealth</h4>
            <div className="fvtt-wlist">
              {coinRows.map(([c, L, v]) => <span className="w" key={c}><span className={`ci ${c}`} />{L} <b>{v}</b></span>)}
            </div>
          </div>
        </div>
      </>);

  }

  // ---------- INVENTORY tab ----------
  function FvttInventory({ char, setChar }) {
    const totalW = char.inventory.reduce((a, b) => a + b.wt * b.qty, 0);
    const mv = RULES.movement(totalW);
    const pct = Math.min(100, totalW / char.encumbrance.cap * 100);
    return (
      <>
        <section className="fvtt-sec">
          <h3><span className="h-title">Carried</span> <span className="h-hint">{char.inventory.length} items · {totalW} cn</span></h3>
          <div className="fvtt-inv">
            <div className="irow ihdr"><span /><span>Item</span><span style={{ textAlign: "right" }}>Qty</span><span style={{ textAlign: "right" }}>cn</span><span /></div>
            {char.inventory.map((it, i) =>
            <div className="irow" key={i}>
                <div className="iic">{it.slot}</div>
                <div className="inm">{it.name}</div>
                <div className="in">{it.qty}</div>
                <div className="in">{it.wt * it.qty}</div>
                <div className="ix" title="Remove" onClick={() => setChar((c) => ({ ...c, inventory: c.inventory.filter((_, j) => j !== i) }))}>×</div>
              </div>
            )}
          </div>
        </section>

        <section className="fvtt-sec">
          <h3>Encumbrance</h3>
          <div className="fvtt-encblock">
            <div className="eh"><span className="et">Load</span><span className="ev">{totalW} / {char.encumbrance.cap} cn</span></div>
            <div className="fvtt-bar enc"><i style={{ width: pct + "%" }} /></div>
            <div className="band">{mv.band} · {mv.rate} ft/turn exploration</div>
          </div>
        </section>
      </>);

  }

  // ---------- SPELLS tab ----------
  function FvttSpells({ char, setChar }) {
    const slots = RULES.slots(char.level);
    const [openBook, setOpenBook] = useState(null);

    const cast = (lvl, name) => {
      setChar((c) => ({ ...c, spent: { ...c.spent, [lvl]: [...(c.spent[lvl] || []), name] } }));
      const def = SPELLS[lvl]?.find((s) => s.name === name);
      if (def?.damage) {
        window.queueRoll({
          kind: "spell", label: `${name} · damage`, source: `Level ${lvl} spell`,
          dice: [{ ...parseSpec(def.damage) }],
          evaluate: ({ total }) => ({ verdict: "dmg", text: `${total} damage` })
        });
      } else {
        window.queueRoll({
          kind: "spell", label: `Cast ${name}`, source: `Level ${lvl} · slot spent`,
          dice: [{ sides: 20, n: 1 }],
          evaluate: () => ({ verdict: "success", text: `${name} takes effect` })
        });
      }
    };
    const togglePrep = (lvl, name, cap) => {
      setChar((c) => {
        const p = c.prepared[lvl] || [];
        if (p.includes(name)) return { ...c, prepared: { ...c.prepared, [lvl]: p.filter((n) => n !== name) } };
        if (p.length >= cap) return c;
        return { ...c, prepared: { ...c.prepared, [lvl]: [...p, name] } };
      });
    };
    const rest = () => {
      const heal = 1 + Math.floor(Math.random() * 3);
      setChar((c) => ({ ...c, spent: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }, hp: { ...c.hp, current: Math.min(c.hp.max, c.hp.current + heal) } }));
      window.queueRoll({
        kind: "rest", label: "Rest · 1 day", source: "Recover 1d3 HP · re-memorize",
        dice: [{ sides: 3, n: 1 }],
        evaluate: () => ({ verdict: "success", text: `+${heal} HP · spells refreshed` })
      });
    };

    return (
      <section className="fvtt-sec">
        <h3><span className="h-title">Spells</span>
          <span className="h-hint">memorised slots</span>
          <span className="h-right"><button className="fvtt-btn primary sm" onClick={rest}>↺ Rest</button></span>
        </h3>
        {slots.map((count, idx) => {
          const lvl = idx + 1;
          const book = char.spellbook[lvl] || [];
          if (count === 0 && book.length === 0) return null;
          const prepared = char.prepared[lvl] || [];
          const spent = char.spent[lvl] || [];
          return (
            <div className="fvtt-spelllevel" key={lvl}>
              <div className="fvtt-spellhead">
                <span className="lv">Level {lvl}</span>
                <span className="sc">{prepared.length - spent.length} / {count} ready</span>
                <span className="slots">
                  {Array.from({ length: count }).map((_, i) => {
                    const nm = prepared[i];const sp = nm && spent.includes(nm);
                    return <span key={i} className={`fvtt-pip ${nm ? sp ? "spent" : "filled" : ""}`}>{nm && !sp ? "✦" : ""}</span>;
                  })}
                </span>
              </div>

              {prepared.length === 0 &&
              <div className="fvtt-spell" style={{ borderRadius: 0 }}>
                  <span /><div className="spn" style={{ fontFamily: "IM Fell English, serif", fontStyle: "italic", fontSize: "var(--fs-sm)", color: "var(--text-faint)" }}>None memorised — open the spellbook.</div><span />
                </div>
              }
              {prepared.map((name) => {
                const def = SPELLS[lvl]?.find((s) => s.name === name);
                const isSpent = spent.includes(name);
                return (
                  <div className={`fvtt-spell ${isSpent ? "spent" : ""}`} key={name}>
                    <div className="chk">✓</div>
                    <div>
                      <div className="spn">{name}</div>
                      <span className="spm">
                        <span>R {def?.range}</span><span>D {def?.dur}</span>
                        <span>{def?.save !== "—" ? `save ${def?.save}` : "no save"}</span>
                        {def?.damage && <span style={{ color: "var(--crimson)" }}>{def.damage}</span>}
                      </span>
                    </div>
                    <button className="fvtt-btn sm" onClick={() => cast(lvl, name)} disabled={isSpent}>{isSpent ? "spent" : "cast"}</button>
                  </div>);

              })}

              <button className="fvtt-bookbtn" onClick={() => setOpenBook(openBook === lvl ? null : lvl)}>
                {openBook === lvl ? "▾" : "▸"} Spellbook ({book.length})
              </button>
              {openBook === lvl &&
              <div className="fvtt-book">
                  {book.map((name) => {
                  const isPrep = prepared.includes(name);
                  const atCap = !isPrep && prepared.length >= count;
                  return (
                    <div key={name} className={`fvtt-bookspell ${isPrep ? "prep" : ""}`}
                    style={{ opacity: atCap ? 0.4 : 1, cursor: atCap ? "not-allowed" : "pointer" }}
                    onClick={() => !atCap && togglePrep(lvl, name, count)}>
                        <span>{name}</span><span className="pa">{isPrep ? "✓" : "+"}</span>
                      </div>);

                })}
                </div>
              }
            </div>);

        })}
      </section>);

  }

  // ---------- ABILITIES (class/race features) tab ----------
  function FvttFeatures({ char }) {
    const [open, setOpen] = useState({});
    const toggle = (i) => setOpen((s) => ({ ...s, [i]: !s[i] }));
    const features = char.features || [];
    const rollFeature = (f) => {
      const r = f.roll;
      if (!r) return;
      window.queueRoll({
        kind: "skill",
        label: f.title,
        source: r.target != null ? `1d${r.sides} ≤ ${r.target}` : `1d${r.sides}`,
        target: r.target,
        dice: [{ sides: r.sides, n: 1 }],
        evaluate: ({ total }) => r.target != null
          ? ({ verdict: total <= r.target ? "success" : "fail", text: total <= r.target ? `Success · ${total} ≤ ${r.target}` : `No · rolled ${total}` })
          : ({ verdict: null, text: `Rolled ${total}` }),
      });
    };
    return (
      <>
        <section className="fvtt-sec">
          <h3><span className="h-title">Class Features</span> <span className="h-hint">{char.cls}</span></h3>
          <div className="fvtt-feats">
            {features.map((f, i) => {
              const isOpen = !!open[i];
              const tag = f.roll ? `1d${f.roll.sides}${f.roll.target != null ? ` ≤ ${f.roll.target}` : ""}` : null;
              return (
                <div className={"fvtt-feat" + (isOpen ? " open" : "")} key={i}>
                  <button className="ft-head" onClick={() => toggle(i)} aria-expanded={isOpen}>
                    <span className="ft-ic" aria-hidden="true">{f.glyph}</span>
                    <span className="ft-title">{f.title}</span>
                    {tag && <span className="ft-roll-tag">{tag}</span>}
                    <span className="ft-chev" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                  </button>
                  {isOpen &&
                  <div className="ft-body">
                    <p className="ft-desc">{f.desc}</p>
                    {f.roll && <button className="fvtt-btn sm" onClick={() => rollFeature(f)}>Roll {tag}</button>}
                  </div>
                  }
                </div>);

            })}
          </div>
        </section>
        <section className="fvtt-sec">
          <h3>Languages</h3>
          <div className="fvtt-langs">{char.languages.map((l) => <span className="fvtt-lang" key={l}>{l}</span>)}</div>
          <p className="fvtt-flavour" style={{ marginTop: 10, marginBottom: 0 }}>Literate. INT 17 grants +3 bonus languages.</p>
        </section>
      </>);

  }

  // ---------- NOTES tab ----------
  function FvttNotes({ char, setChar }) {
    return (
      <section className="fvtt-sec">
        <h3>Notes &amp; Background</h3>
        <p className="fvtt-flavour">{char.title} of {char.cls.toLowerCase()} arts — {char.alignment.toLowerCase()} alignment.</p>
        <textarea className="fvtt-notes" value={char.notes} onChange={(e) => setChar((c) => ({ ...c, notes: e.target.value }))} />
      </section>);

  }

  Object.assign(window, { FvttAbilities, FvttSavesSkills, FvttActions, FvttInventory, FvttSpells, FvttFeatures, FvttNotes });
})();