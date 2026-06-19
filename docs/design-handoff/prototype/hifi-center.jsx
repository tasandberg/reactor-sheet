/* ============================================================
   OSC Hi-Fi sheet — CENTER column panels:
   Spells · Attacks · Inventory · Coin · Notes.
   Rolls pipe through window.queueRoll. Reads window.HF helpers.
   ============================================================ */

(function () {
  const { useState, useRef } = React;
  const { SPELLS, RULES } = window.GAME;
  const { fmtMod, parseSpec, EditHead, EquipIcon } = window.HF;
  const GEAR_EXCLUDE = ["Dagger", "Quarterstaff"];

  const ListIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="8" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="8" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
  const GridIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.4" /><rect x="14" y="3" width="7" height="7" rx="1.4" />
      <rect x="3" y="14" width="7" height="7" rx="1.4" /><rect x="14" y="14" width="7" height="7" rx="1.4" />
    </svg>
  );
  // short stamped monogram for gear tiles (no item art — ink-stamp initials, on-brand)
  const monogram = (name) => {
    const words = String(name).replace(/[^A-Za-z ]/g, " ").trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return (words[0] || "?").slice(0, 2).toUpperCase();
  };

  const spellMeta = (lvl, name) => {
    const s = (SPELLS[lvl] || []).find((x) => x.name === name);
    if (!s) return "";
    const bits = [s.range, s.dur];
    if (s.damage) bits.push(s.damage);
    if (s.save && s.save !== "—") bits.push("save " + s.save);
    return bits.join(" · ");
  };

  /* ============================================================
     SPELLS — prepared (play) / spellbook prep (edit)
     ============================================================ */
  function Spells({ ctx }) {
    const { char, setChar, edit, tog, d } = ctx;
    const levels = [1, 2];

    const cast = (lvl, name) => {
      setChar((c) => ({ ...c, spent: { ...c.spent, [lvl]: [...(c.spent[lvl] || []), name] } }));
      const def = (SPELLS[lvl] || []).find((s) => s.name === name);
      if (def && def.damage) {
        window.queueRoll({
          kind: "spell", label: `${name} — damage`, source: `Spell · level ${lvl}`,
          dice: [{ ...parseSpec(def.damage) }],
          evaluate: ({ total }) => ({ verdict: "dmg", text: `${total} damage` }),
        });
      } else {
        window.queueRoll({
          kind: "spell", label: `Cast ${name}`, source: `Level ${lvl} spell · slot consumed`,
          dice: [{ sides: 20, n: 1 }], breakdown: "cast",
          evaluate: () => ({ verdict: null, text: `${name} takes effect` }),
        });
      }
    };

    const togglePrep = (lvl, name) => setChar((c) => {
      const prep = c.prepared[lvl] || [];
      const has = prep.includes(name);
      if (has) {
        return {
          ...c,
          prepared: { ...c.prepared, [lvl]: prep.filter((n) => n !== name) },
          spent: { ...c.spent, [lvl]: (c.spent[lvl] || []).filter((n) => n !== name) },
        };
      }
      if (prep.length >= d.slots[lvl - 1]) return c;
      return { ...c, prepared: { ...c.prepared, [lvl]: [...prep, name] } };
    });

    return (
      <div className={"hf-section" + (edit.spells ? " is-editing" : "")}>
        <EditHead title="Spells" hint={edit.spells ? null : "cast a prepared spell to spend its slot"}
          on={edit.spells} onToggle={() => tog("spells")} />

        {edit.spells ? (
          <div>
            <p className="hf-note">Tick spells from your book to memorise them — up to the day's slots ({d.slots[0]} × L1 · {d.slots[1]} × L2). Untick to free a slot.</p>
            {levels.map((lvl) => {
              const book = char.spellbook[lvl] || [];
              const prep = char.prepared[lvl] || [];
              if (!book.length) return null;
              return (
                <div key={lvl}>
                  <div className="hf-slots">
                    <span className="lv">L{lvl}</span>
                    <span className="rem">{prep.length} of {d.slots[lvl - 1]} prepared</span>
                  </div>
                  {book.map((name) => {
                    const on = prep.includes(name);
                    return (
                      <div key={name} className="hf-editrow" style={{ cursor: "pointer" }} onClick={() => togglePrep(lvl, name)}>
                        <span className={"hf-chk" + (on ? " on" : "")}>{on ? "✓" : ""}</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontFamily: "var(--display)", fontSize: "var(--fs-base)", color: "var(--text)" }}>{name}</span>
                          <span style={{ display: "block", fontFamily: "var(--mono)", fontSize: "var(--fs-3xs)", color: "var(--text-mute)" }}>{spellMeta(lvl, name)}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {levels.map((lvl) => {
              const count = d.slots[lvl - 1];
              const prep = char.prepared[lvl] || [];
              const spent = char.spent[lvl] || [];
              if (count === 0 && prep.length === 0) return null;
              return (
                <div key={lvl}>
                  <div className="hf-slots">
                    <span className="lv">L{lvl}</span>
                    <span className="hf-pips">
                      {Array.from({ length: count }).map((_, i) => (
                        <span key={i} className={"hf-pip" + (i < spent.length ? " used" : "")} />
                      ))}
                    </span>
                    <span className="rem">{count - spent.length} of {count} slots left</span>
                  </div>
                  {prep.length === 0 && <div className="hf-empty">No level {lvl} spells prepared — open the editor to memorise.</div>}
                  {prep.map((name) => {
                    const isSpent = spent.includes(name);
                    return (
                      <div key={name} className={"hf-act" + (isSpent ? " spent" : "")}>
                        <div className="a-main">
                          <div className="a-name">{name}</div>
                          <div className="a-meta">{spellMeta(lvl, name)}</div>
                        </div>
                        <div className="a-btns">
                          <button className="btn primary sm" disabled={isSpent} onClick={() => cast(lvl, name)}>
                            {isSpent ? "spent" : "cast"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ============================================================
     ATTACKS — derived from equipped weapons
     ============================================================ */
  function Attacks({ ctx }) {
    const { char, setChar, d } = ctx;

    const weaponMeta = (w) => {
      const bits = [w.type, w.dmg];
      if (w.range && w.range !== "—") bits.push(w.range);
      if (w.type === "missile") bits.push(`${w.ammo}/${w.ammoMax} ammo`);
      return bits.join(" · ");
    };
    const rollAttack = (w) => {
      if (w.type === "missile" && (w.ammo ?? 0) <= 0) return;
      const bonus = d.ab + (w.mod || 0);
      window.queueRoll({
        kind: "attack", label: `Attack — ${w.name}`, source: `d20 + AB ${fmtMod(bonus)}`,
        dice: [{ sides: 20, n: 1, mod: bonus }],
        evaluate: ({ dice, total }) => {
          const nat = dice[0].value;
          if (nat === 20) return { verdict: "crit", text: "Natural 20 — Critical hit!" };
          if (nat === 1) return { verdict: "fumble", text: "Natural 1 — Fumble!" };
          return { verdict: null, text: `To-hit ${total} (vs target AAC)` };
        },
      });
      if (w.type === "missile" && w.ammo != null) {
        setChar((c) => ({ ...c, weapons: c.weapons.map((x) => x.name === w.name ? { ...x, ammo: Math.max(0, x.ammo - 1) } : x) }));
      }
    };
    const rollDamage = (w) => {
      window.queueRoll({
        kind: "damage", label: `Damage — ${w.name}`, source: w.dmg + (w.mod ? ` ${fmtMod(w.mod)}` : ""),
        dice: [{ ...parseSpec(w.dmg), mod: w.mod || 0 }],
        evaluate: ({ total }) => ({ verdict: "dmg", text: `${total} damage` }),
      });
    };

    return (
      <div className="hf-section">
        <div className="hf-head">
          <span className="ttl">Attacks</span>
          <span className="hint">equipped weapons · AB {fmtMod(d.ab)}</span>
        </div>
        {d.equippedWeapons.length === 0 ? (
          <div className="hf-empty">No weapon equipped. Equip one from your Inventory below to bring it to hand.</div>
        ) : (
          <div>
            {d.equippedWeapons.map((w) => {
              const dry = w.type === "missile" && (w.ammo ?? 0) <= 0;
              return (
                <div key={w.name} className="hf-act">
                  <div className="a-main">
                    <div className="a-name">{w.name}</div>
                    <div className="a-meta">{weaponMeta(w)}</div>
                  </div>
                  <div className="a-btns">
                    <button className="btn sm roll" disabled={dry} title={`Roll to hit · d20 ${fmtMod(d.ab + (w.mod || 0))}`} onClick={() => rollAttack(w)}>{dry ? "no ammo" : `d20 ${fmtMod(d.ab + (w.mod || 0))}`}</button>
                    <button className="btn sm roll" title={`Roll damage · ${w.dmg}${w.mod ? ` ${fmtMod(w.mod)}` : ""}`} onClick={() => rollDamage(w)}>{w.dmg}{w.mod ? ` ${fmtMod(w.mod)}` : ""}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ============================================================
     INVENTORY — typed groups, equip toggles, live encumbrance
     ============================================================ */
  function Inventory({ ctx }) {
    const { char, setChar, edit, tog, d } = ctx;
    const actorKey = char.id || char.name || "default";

    const [view, setView] = useState(() => {
      try { return localStorage.getItem("osc.invView." + actorKey) || "list"; } catch (e) { return "list"; }
    });
    const setViewP = (v) => { setView(v); try { localStorage.setItem("osc.invView." + actorKey, v); } catch (e) {} };
    const [dragUid, setDragUid] = useState(null);
    const [overZone, setOverZone] = useState(null);
    const [collapsed, setCollapsed] = useState(() => {
      try { return JSON.parse(localStorage.getItem("osc.invCollapsed." + actorKey) || "{}"); } catch (e) { return {}; }
    });
    const toggleCollapse = (key) => setCollapsed((s) => {
      const n = { ...s, [key]: !s[key] };
      try { localStorage.setItem("osc.invCollapsed." + actorKey, JSON.stringify(n)); } catch (e) {}
      return n;
    });
    // section collapse — Equipped collapsed by default, Carried expanded
    const [secOpen, setSecOpen] = useState(() => {
      try { return JSON.parse(localStorage.getItem("osc.invSec." + actorKey) || "null") || { equipped: false, carried: true }; }
      catch (e) { return { equipped: false, carried: true }; }
    });
    const toggleSec = (k) => setSecOpen((s) => {
      const n = { ...s, [k]: !s[k] };
      try { localStorage.setItem("osc.invSec." + actorKey, JSON.stringify(n)); } catch (e) {}
      return n;
    });
    // unified carried-list order (keys), independent of the source arrays so
    // any item can be dragged anywhere in the flat list
    const [carriedOrder, setCarriedOrder] = useState(() => {
      try { return JSON.parse(localStorage.getItem("osc.invOrder." + actorKey) || "[]"); } catch (e) { return []; }
    });
    const carriedOrderRef = useRef([]);
    const [trayOver, setTrayOver] = useState(false);
    // pin the All Items header just below the (sticky) equipped section
    React.useLayoutEffect(() => {
      const set = () => {
        const eq = document.querySelector(".il-sec-equipped");
        const hd = document.querySelector(".il-list .il-sec > .il-sechead");
        if (eq && hd) hd.style.top = eq.offsetHeight + "px";
      };
      set();
      window.addEventListener("resize", set);
      return () => window.removeEventListener("resize", set);
    });

    const reorderList = (listKey, from, to) => {
      if (from == null || to == null || from === to) return;
      setChar((c) => {
        const arr = [...c[listKey]];
        if (from < 0 || to < 0 || from >= arr.length || to >= arr.length) return c;
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        return { ...c, [listKey]: arr };
      });
    };

    // set an item's zone by its list key (w#/a#/g#); nesting also clears equipped
    const setZoneByKey = (key, zone) => {
      if (!key) return;
      const kind = key[0], i = +key.slice(1);
      const nesting = zone !== "carried";
      setChar((c) => {
        if (kind === "w") return { ...c, weapons: c.weapons.map((w, j) => j === i ? { ...w, zone, equipped: nesting ? false : w.equipped } : w) };
        if (kind === "a") return { ...c, armor: c.armor.map((a, j) => j === i ? { ...a, zone, equipped: nesting ? false : a.equipped } : a) };
        return { ...c, inventory: c.inventory.map((it, j) => j === i ? { ...it, zone, equipped: nesting ? false : it.equipped } : it) };
      });
    };

    /* Drag-to-reorder + container nesting, via the shared hook.
       group "carried" → reorder the flat key order; dropping among top-level
       rows also un-nests the moved item. Dropping ONTO a container row nests it. */
    const dnd = window.HF.useDragReorder({
      onReorder: ({ group, from, to, zone }) => {
        if (group === "carried") {
          const arr = [...carriedOrderRef.current];
          if (from < 0 || to < 0 || from >= arr.length || to > arr.length) return;
          const [m] = arr.splice(from, 1);
          arr.splice(Math.min(to, arr.length), 0, m);
          carriedOrderRef.current = arr;
          setCarriedOrder(arr);
          try { localStorage.setItem("osc.invOrder." + actorKey, JSON.stringify(arr)); } catch (e) {}
          setZoneByKey(m, "carried"); // a top-level reorder un-nests the item
          return;
        }
        if (group === "gear") {
          setChar((c) => {
            let arr = c.inventory.map((it, i) => (i === from ? { ...it, zone } : it));
            let t = Math.max(0, Math.min(arr.length - 1, to));
            const [m] = arr.splice(from, 1);
            arr.splice(t, 0, m);
            return { ...c, inventory: arr };
          });
        } else {
          reorderList(group, from, to);
        }
      },
      onNest: ({ group, from, zone }) => {
        if (group === "carried") { setZoneByKey(carriedOrderRef.current[from], zone); return; }
        setChar((c) => ({ ...c, inventory: c.inventory.map((it, i) => (i === from ? { ...it, zone } : it)) }));
      },
    });
    const onDragEndExtras = () => setOverZone(null);
    const rowCls = (group, idx, equipped) => (equipped ? " equipped" : "") + dnd.rowClass(group, idx);

    const toggleWeapon = (name) => setChar((c) => ({ ...c, weapons: c.weapons.map((w) => w.name === name ? { ...w, equipped: !w.equipped } : w) }));
    const toggleArmor = (name) => setChar((c) => ({ ...c, armor: c.armor.map((a) => a.name === name ? { ...a, equipped: !a.equipped } : a) }));

    const gearRows = char.inventory
      .map((it, idx) => ({ it, idx }))
      .filter(({ it }) => !GEAR_EXCLUDE.includes(it.name));
    const setGear = (idx, patch) => setChar((c) => ({ ...c, inventory: c.inventory.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
    const delGear = (idx) => setChar((c) => ({ ...c, inventory: c.inventory.filter((_, i) => i !== idx) }));
    const addGear = () => setChar((c) => ({ ...c, inventory: [...c.inventory, { name: "New item", qty: 1, wt: 10, slot: "▣", zone: "carried" }] }));
    const toggleGearEquip = (idx) => setChar((c) => ({ ...c, inventory: c.inventory.map((it, i) => i === idx ? { ...it, equipped: !it.equipped } : it) }));
    // container model: a flagged gear item owns all gear whose zone === its containerZone
    const containerZones = gearRows.filter(({ it }) => it.container).map(({ it }) => it.containerZone || "backpack");
    const topGear = gearRows.filter(({ it }) => !containerZones.includes(it.zone));

    // weapons sorted equipped-first
    const weaponsSorted = [...char.weapons].sort((a, b) => (b.equipped ? 1 : 0) - (a.equipped ? 1 : 0));
    const armorSorted = [...char.armor].sort((a, b) => (b.equipped ? 1 : 0) - (a.equipped ? 1 : 0));
    const cap = char.encumbrance.cap || 1600;
    const wtTxt = (wt) => (wt > 0 ? wt + " cn" : "—");

    /* ---- grid model: every item gets a uid + zone ---- */
    const tiles = [];
    char.weapons.forEach((w, i) => tiles.push({
      uid: "w" + i, kind: "weapon", name: w.name, glyph: w.type === "missile" ? "↗" : "†",
      equippable: true, equipped: !!w.equipped, zone: w.equipped ? "equipped" : (w.zone || "carried"), badge: w.dmg, qtytag: null, wt: w.wt || 0,
    }));
    char.armor.forEach((a, i) => tiles.push({
      uid: "a" + i, kind: "armor", name: a.name, glyph: "◈",
      equippable: true, equipped: !!a.equipped, zone: a.equipped ? "equipped" : (a.zone || "carried"), badge: null, qtytag: null, wt: a.wt || 0,
    }));
    gearRows.forEach(({ it, idx }) => {
      if (it.container) {
        tiles.push({
          uid: "g" + idx, kind: "gear", name: it.name, glyph: it.slot || monogram(it.name),
          container: true, containerZone: it.containerZone || "backpack",
          equippable: false, equipped: false, zone: it.equipped ? "equipped" : (it.zone || "carried"),
          badge: null, qtytag: null, wt: it.wt || 0,
        });
        return;
      }
      tiles.push({
        uid: "g" + idx, kind: "gear", name: it.name, glyph: monogram(it.name),
      equippable: true, equipped: !!it.equipped, zone: it.equipped ? "equipped" : (it.zone || "carried"),
        badge: null,
        qtytag: it.qtyMax ? `${it.qty}/${it.qtyMax}` : (it.qty > 1 ? `x${it.qty}` : null),
        wt: it.wt || 0,
      });
    });
    // items whose zone is a container's zone are nested inside that folder, not loose
    const nestedOf = (cz) => tiles.filter((t) => !t.container && t.zone === cz);

    const moveItem = (uid, zone) => {
      if (!uid) return;
      const m = uid.match(/^([wag])(\d+)$/);
      if (!m) return;
      const kind = m[1], idx = +m[2];
      if (kind === "w") setChar((c) => ({ ...c, weapons: c.weapons.map((w, i) => i === idx ? { ...w, equipped: zone === "equipped", zone: zone === "equipped" ? (w.zone || "carried") : zone } : w) }));
      else if (kind === "a") setChar((c) => ({ ...c, armor: c.armor.map((a, i) => i === idx ? { ...a, equipped: zone === "equipped", zone: zone === "equipped" ? (a.zone || "carried") : zone } : a) }));
      else if (kind === "g") setChar((c) => ({ ...c, inventory: c.inventory.map((it, i) => i === idx ? { ...it, equipped: zone === "equipped", zone: zone === "equipped" ? (it.zone || "carried") : zone } : it) }));
    };

    /* ---- one tile renderer ---- */
    const renderTile = (t) => (
      <div
        key={t.uid}
        className={"hf-tile" + (t.equipped ? " equipped" : "") + (dragUid === t.uid ? " dragging" : "")}
        draggable
        onDragStart={(e) => { setDragUid(t.uid); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", t.uid); }}
        onDragEnd={() => { setDragUid(null); setOverZone(null); }}
        title={t.name}
      >
        <div className="ph">
          {t.glyph}
          {t.equippable && (
            <button className="hand" title={t.equipped ? "Equipped — click to stow" : "Click to equip"} aria-label="Toggle equip"
              onClick={(e) => { e.stopPropagation(); t.kind === "weapon" ? toggleWeapon(t.name) : t.kind === "armor" ? toggleArmor(t.name) : toggleGearEquip(+t.uid.slice(1)); }}>
              <i className={(t.equipped ? "fa-solid" : "fa-regular") + " fa-hand"} aria-hidden="true"></i>
            </button>
          )}
          {t.badge && <span className="qty">{t.badge}</span>}
          {t.qtytag && <span className="qtytag">{t.qtytag}</span>}
        </div>
        <span className="tname">{t.name}</span>
      </div>
    );

    /* ---- a section = stamp + title + grid; dropping sets each item's zone to `key` ---- */
    const renderSection = (key, title, list, opts) => {
      opts = opts || {};
      return (
        <div key={key} className={"hf-zone" + (opts.equipped ? " equipped-zone" : "") + (opts.container ? " container-zone" : "")}>
          <div className="il-sechead static">
            {opts.glyph && <span className="folderhead-ic" aria-hidden="true">{opts.glyph}</span>}
            <span className="il-sectitle">{title}</span>
            <span className="il-seccount">{list.length} {list.length === 1 ? "item" : "items"} · {list.reduce((s, t) => s + (t.wt || 0), 0)} cn</span>
          </div>
          <div
            className={"hf-grid" + (opts.equipped ? " equipped-zone" : "") + (opts.container ? " container-zone" : "") + (overZone === key ? " over" : "") + (list.length === 0 ? " is-empty" : "")}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (overZone !== key) setOverZone(key); }}
            onDragLeave={(e) => { if (e.target === e.currentTarget) setOverZone(null); }}
            onDrop={(e) => { e.preventDefault(); moveItem(dragUid, key); setOverZone(null); setDragUid(null); }}
          >
            {list.length === 0
              ? <div className="hf-emptyzone">{opts.empty || "Drop items here"}</div>
              : list.map(renderTile)}
          </div>
        </div>
      );
    };

    const head = (
      <div className={"hf-head" + (edit.inventory && view === "list" ? " editing" : "")}>
        <span className="ttl">Inventory</span>
        {edit.inventory && view === "list"
          ? <span className="editing-tag">· editing</span>
          : <span className="hint">equip weapons &amp; armour to bring them into play</span>}
      </div>
    );

    const viewToggle = (
      <div className="hf-viewbar">
        <div className="hf-viewtog" role="group" aria-label="Inventory view">
          <button className={view === "list" ? "on" : ""} onClick={() => setViewP("list")} title="List view" aria-label="List view"><ListIcon /></button>
          <button className={view === "grid" ? "on" : ""} onClick={() => setViewP("grid")} title="Grid view (drag & drop)" aria-label="Grid view"><GridIcon /></button>
        </div>
      </div>
    );

    // ---- lightweight two-section list model ----
    const catOf = (g) => g === "weapons" ? "Weapon" : g === "armor" ? "Armour" : "Gear";
    const iconOf = (g, it) => g === "weapons" ? (it.type === "missile" ? "↗" : "†") : g === "armor" ? "◈" : (it.slot || monogram(it.name));
    const tagsOf = (g, it) => {
      if (g === "weapons") return (it.tags || []).filter((t) => !/cn$/i.test(t));
      if (g === "armor") return it.meta ? [it.meta] : [];
      return [];
    };
    const allEntries = [
      ...char.weapons.map((it, i) => ({ key: "w" + i, group: "weapons", idx: i, it })),
      ...char.armor.map((it, i) => ({ key: "a" + i, group: "armor", idx: i, it })),
      ...gearRows.map(({ it, idx }) => ({ key: "g" + idx, group: "gear", idx, it })),
    ];
    const equippedEntries = allEntries.filter((e) => e.it.equipped);
    const allKeys = allEntries.map((e) => e.key);
    const orderedKeys = [
      ...carriedOrder.filter((k) => allKeys.includes(k)),
      ...allKeys.filter((k) => !carriedOrder.includes(k)),
    ];
    carriedOrderRef.current = orderedKeys;
    const allSorted = orderedKeys.map((k) => allEntries.find((e) => e.key === k)).filter(Boolean);
    // container grouping for the list
    const containerEntries = allEntries.filter((e) => e.it.container);
    const containerZoneSet = containerEntries.map((e) => e.it.containerZone || "backpack");
    const isNested = (it) => containerZoneSet.includes(it.zone);
    const posOf = (key) => orderedKeys.indexOf(key);
    const nestedFor = (cz) => orderedKeys.map((k) => allEntries.find((e) => e.key === k)).filter((e) => e && e.it.zone === cz);
    // build display order: top-level rows, each container followed by its nested children
    const displayRows = [];
    orderedKeys.forEach((k) => {
      const e = allEntries.find((x) => x.key === k);
      if (!e || isNested(e.it)) return;
      if (e.it.container) {
        const cz = e.it.containerZone || "backpack";
        const kids = nestedFor(cz);
        displayRows.push({ e, pos: posOf(k), container: true, cz, count: kids.length });
        if (!collapsed[cz]) kids.forEach((ke) => displayRows.push({ e: ke, pos: posOf(ke.key), nested: true }));
      } else {
        displayRows.push({ e, pos: posOf(k) });
      }
    });
    const toggleEquipFor = (e) => e.group === "weapons" ? toggleWeapon(e.it.name) : e.group === "armor" ? toggleArmor(e.it.name) : toggleGearEquip(e.idx);
    const ilRow = (e, pos, opts) => {
      opts = opts || {};
      const { group, idx, it } = e;
      const equipped = !!it.equipped;
      const qtyN = group === "gear" ? (it.qty || 1) : 1;
      const rp = opts.container
        ? dnd.rowProps("carried", pos, { container: true, containerZone: opts.cz, onEnd: onDragEndExtras })
        : dnd.rowProps("carried", pos, { onEnd: onDragEndExtras });
      return (
        <div key={e.key}
          className={"il-row" + (equipped ? " equipped" : "") + (opts.container ? " il-container" : "") + (opts.nested ? " il-nested" : "") + dnd.rowClass("carried", pos)}
          {...rp}>
          <span className="il-handle" title="Drag to reorder">⸬</span>
          <span className="il-ic" aria-hidden="true">{iconOf(group, it)}</span>
          <span className="il-name">
            {opts.container && <button className="il-caret" onClick={(ev) => { ev.stopPropagation(); toggleCollapse(opts.cz); }} title={collapsed[opts.cz] ? "Expand" : "Collapse"} aria-label={collapsed[opts.cz] ? "Expand" : "Collapse"} draggable={false} onMouseDown={(ev) => ev.stopPropagation()}>{collapsed[opts.cz] ? "▸" : "▾"}</button>}
            <span className="il-nm">{it.name}</span>
            {opts.container ? <span className="il-qtytag">{opts.count}</span> : (qtyN > 1 ? <span className="il-qtytag">x{qtyN}</span> : null)}
          </span>
          <span className="il-type">{catOf(group)}</span>
          <span className="il-mid">{group === "weapons" ? it.dmg : ""}</span>
          <span className="il-wt">{wtTxt(it.wt)}</span>
          <button className={"il-equip" + (equipped ? " on" : "")} onClick={() => toggleEquipFor(e)}
            title={equipped ? "Equipped — click to stow" : "Equip"} aria-label="Toggle equip"><i className={(equipped ? "fa-solid" : "fa-regular") + " fa-hand"} aria-hidden="true"></i></button>
        </div>
      );
    };
    const ilColHead = (
      <div className="il-colhead">
        <span className="il-handle" />
        <span className="il-ic" />
        <span className="il-h">Name</span>
        <span className="il-h">Type</span>
        <span className="il-h" />
        <span className="il-h right">Wt</span>
        <span className="il-h ctr">Equip</span>
      </div>
    );
    // equip-by-drop: dropping a dragged row onto the Equipped tray equips it
    const trayDropProps = {
      onDragOver: (e) => { if (dnd.drag) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (!trayOver) setTrayOver(true); } },
      onDragLeave: (e) => { if (e.target === e.currentTarget) setTrayOver(false); },
      onDrop: (e) => {
        if (dnd.drag) {
          e.preventDefault();
          const key = carriedOrderRef.current[dnd.drag.idx];
          const ent = allEntries.find((x) => x.key === key);
          if (ent && !ent.it.equipped) toggleEquipFor(ent);
        }
        setTrayOver(false);
        dnd.clear();
      },
    };

    const equippedTray = (
      <section className="il-sec il-sec-equipped">
        <div className="il-sechead static">
          <span className="il-sectitle">Equipped items</span>
          <span className="il-seccount">{equippedEntries.length} {equippedEntries.length === 1 ? "item" : "items"} · {equippedEntries.reduce((s, e) => s + (e.it.wt || 0), 0)} cn</span>
        </div>
        <div className={"il-tray" + (trayOver ? " over" : "")} {...trayDropProps}>
          {equippedEntries.length === 0
            ? <span className="il-tray-hint">Drag items here to equip</span>
            : equippedEntries.map((e) => {
                const detail = e.group === "weapons" ? e.it.dmg : e.group === "armor" ? (e.it.meta || "Armour") : (e.it.wt > 0 ? wtTxt(e.it.wt) : null);
                return (
                  <div key={e.key} className="il-tcard">
                    <button className="il-tt" title={e.it.name} onClick={() => toggleEquipFor(e)}>
                      <span className="il-tt-ic" aria-hidden="true">{iconOf(e.group, e.it)}</span>
                    </button>
                    <span className="il-tt-pop" role="tooltip">
                      <span className="il-tt-pop-nm">{e.it.name}</span>
                      <span className="il-tt-pop-meta">
                        <span className="il-tt-pop-type">{catOf(e.group)}</span>
                        {detail && <span className="il-tt-pop-dot">·</span>}
                        {detail && <span className="il-tt-pop-detail">{detail}</span>}
                      </span>
                      <span className="il-tt-pop-act">Click to unequip</span>
                    </span>
                  </div>
                );
              })}
        </div>
      </section>
    );

    return (
      <div className={"hf-section" + (edit.inventory && view === "list" ? " is-editing" : "")}>
        {head}

        {/* encumbrance always visible */}
        <div className="hf-enc">
          <span className="lbl">Encumbrance <b>{d.carried} / {cap} cn</b></span>
          <span className="band">{d.move.band} · {d.move.rate}′</span>
        </div>
        <div className="hf-encbar"><i style={{ width: Math.min(100, (100 * d.carried) / cap) + "%" }} /></div>

        {equippedTray}

        {edit.inventory ? (
          <div>
            <p className="hf-note">Weapons &amp; armour are equipped from the play view. Edit your <b>carried gear</b> here — weights drive encumbrance &amp; movement.</p>
            <div className="hf-invgroup">Gear</div>
            {gearRows.map(({ it, idx }) => (
              <div key={idx} className="hf-editrow">
                <span className="hf-drag">⠿</span>
                <input className="input" value={it.name} onChange={(e) => setGear(idx, { name: e.target.value })} />
                <input className="input mono" style={{ width: 64, flex: "none" }} type="number" value={it.wt}
                  onChange={(e) => setGear(idx, { wt: Number(e.target.value) || 0 })} title="weight (cn)" />
                <button className="hf-del" onClick={() => delGear(idx)} aria-label="Remove item">×</button>
              </div>
            ))}
            <button className="hf-add" onClick={addGear}>+ add item</button>
          </div>
        ) : (
          <div className="il-list">
            <section className="il-sec">
              <div className="il-sechead static">
                <span className="il-sectitle">All Items</span>
                <span className="il-seccount">{allSorted.length} {allSorted.length === 1 ? "item" : "items"} · {allSorted.reduce((s, e) => s + (e.it.wt || 0), 0)} cn</span>
              </div>
              <div className="il-table">{ilColHead}{displayRows.map((r) => ilRow(r.e, r.pos, r))}</div>
            </section>
          </div>
        )}
      </div>
    );
  }

  /* ============================================================
     COIN — always-editable, its own section
     ============================================================ */
  function Coin({ ctx }) {
    const { char, setChar } = ctx;
    const order = ["pp", "gp", "ep", "sp", "cp"];
    const setCoin = (k, v) => setChar((c) => ({ ...c, coin: { ...c.coin, [k]: Math.max(0, Number(v) || 0) } }));
    const total = char.coin.pp * 5 + char.coin.gp + char.coin.ep * 0.5 + char.coin.sp * 0.1 + char.coin.cp * 0.01;
    const totalTxt = Number.isInteger(total) ? total.toLocaleString("en-US") : total.toFixed(1);
    return (
      <div className="hf-section hf-wealth">
        <div className="hf-head sm">
          <span className="ttl">Wealth</span>
          <span className="spring" />
          <span className="hint">at a glance</span>
        </div>
        <div className="hf-wealth-total">
          <span className="v">{totalTxt}</span>
          <span className="u">gp</span>
          <span className="sub">total value</span>
        </div>
        <div className="hf-wchips">
          {order.map((k) => (
            <label key={k} className="hf-wchip">
              <span className="ck">{k.toUpperCase()}</span>
              <input type="number" value={char.coin[k]} onChange={(e) => setCoin(k, e.target.value)} aria-label={k.toUpperCase()} />
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================
     NOTES & BIO
     ============================================================ */
  function Notes({ ctx }) {
    const { char, setChar, edit, tog } = ctx;
    const langs = Array.isArray(char.languages) ? char.languages.join(", ") : char.languages;
    return (
      <div className={"hf-section" + (edit.notes ? " is-editing" : "")}>
        <EditHead title="Notes & Bio" on={edit.notes} onToggle={() => tog("notes")} />
        {edit.notes ? (
          <div>
            <div className="hf-field">
              <span className="lbl">Notes &amp; bio</span>
              <textarea className="textarea" value={char.notes} onChange={(e) => setChar((c) => ({ ...c, notes: e.target.value }))} />
            </div>
            <div className="hf-field">
              <span className="lbl">Languages</span>
              <input className="input" value={langs}
                onChange={(e) => setChar((c) => ({ ...c, languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} />
            </div>
          </div>
        ) : (
          <div>
            <div className="hf-notes-body">{char.notes}</div>
            <div className="hf-langs"><b>Languages</b>{langs}</div>
          </div>
        )}
      </div>
    );
  }

  window.HF = Object.assign(window.HF || {}, { Spells, Attacks, Inventory, Coin, Notes });
})();
