/* ========================================================================
   OSE character + game data — pure data, no React.
   Demo character: Eldra Vey, Level 3 Magic-User (Classic OSE)
   ======================================================================== */

window.GAME = (function () {

  // ---------- Magic-User progression (Classic) ----------
  // Source: OSE Classic Fantasy SRD
  const MU_XP_TABLE = [
    { lvl: 1,  xp: 0,      hd: "1d4",   title: "Medium" },
    { lvl: 2,  xp: 2500,   hd: "2d4",   title: "Seer" },
    { lvl: 3,  xp: 5000,   hd: "3d4",   title: "Conjurer" },
    { lvl: 4,  xp: 10000,  hd: "4d4",   title: "Magician" },
    { lvl: 5,  xp: 20000,  hd: "5d4",   title: "Enchanter" },
    { lvl: 6,  xp: 40000,  hd: "6d4",   title: "Warlock" },
    { lvl: 7,  xp: 80000,  hd: "7d4",   title: "Sorcerer" },
    { lvl: 8,  xp: 150000, hd: "8d4",   title: "Necromancer" },
    { lvl: 9,  xp: 300000, hd: "9d4",   title: "Wizard" },
  ];

  // Spell slots by level: [L1, L2, L3, L4, L5, L6]
  const MU_SLOTS = {
    1: [1, 0, 0, 0, 0, 0],
    2: [2, 0, 0, 0, 0, 0],
    3: [2, 1, 0, 0, 0, 0],
    4: [2, 2, 0, 0, 0, 0],
    5: [2, 2, 1, 0, 0, 0],
    6: [2, 2, 2, 0, 0, 0],
    7: [3, 2, 2, 1, 0, 0],
    8: [3, 3, 2, 2, 0, 0],
    9: [3, 3, 3, 2, 1, 0],
  };

  // Saving throws — Magic-User (lower = better)
  const MU_SAVES = {
    "1-5":  { D: 13, W: 14, P: 13, B: 16, S: 15 },
    "6-10": { D: 11, W: 12, P: 11, B: 14, S: 12 },
  };
  function savesAtLevel(lvl) {
    if (lvl <= 5) return MU_SAVES["1-5"];
    return MU_SAVES["6-10"];
  }

  // Attack bonus (AAC) — Magic-User
  const MU_AB = { 1:0, 2:0, 3:0, 4:0, 5:1, 6:1, 7:1, 8:1, 9:2 };

  // Ability score modifiers (OSE roll-low ability check; mods are small)
  function abilityMod(score) {
    if (score <= 3)  return -3;
    if (score <= 5)  return -2;
    if (score <= 8)  return -1;
    if (score <= 12) return 0;
    if (score <= 15) return 1;
    if (score <= 17) return 2;
    return 3;
  }

  // ---------- Spell catalog (Magic-User, levels 1-2 for demo) ----------
  const SPELLS = {
    1: [
      { name: "Charm Person",      range: "120'", dur: "1 day+", save: "vs spells" },
      { name: "Detect Magic",      range: "60'",  dur: "2 turns", save: "—" },
      { name: "Floating Disc",     range: "6'",   dur: "6 turns", save: "—" },
      { name: "Hold Portal",       range: "10'",  dur: "2d6 turns", save: "—" },
      { name: "Light",             range: "120'", dur: "6 turns", save: "—" },
      { name: "Magic Missile",     range: "150'", dur: "1 turn", save: "—", damage: "1d6+1" },
      { name: "Protection from Evil", range: "self", dur: "6 turns", save: "—" },
      { name: "Read Languages",    range: "self", dur: "2 turns", save: "—" },
      { name: "Read Magic",        range: "self", dur: "1 turn",  save: "—" },
      { name: "Shield",            range: "self", dur: "2 turns", save: "—" },
      { name: "Sleep",             range: "240'", dur: "4d4 turns", save: "—" },
      { name: "Ventriloquism",     range: "60'",  dur: "2 turns", save: "vs spells" },
    ],
    2: [
      { name: "Continual Light",   range: "120'", dur: "perm.",   save: "—" },
      { name: "Detect Evil",       range: "60'",  dur: "2 turns", save: "—" },
      { name: "Detect Invisible",  range: "10'/lv", dur: "6 turns", save: "—" },
      { name: "ESP",               range: "60'",  dur: "12 turns", save: "—" },
      { name: "Invisibility",      range: "240'", dur: "perm.",   save: "—" },
      { name: "Knock",             range: "60'",  dur: "1 round", save: "—" },
      { name: "Levitate",          range: "self", dur: "6 turns+", save: "—" },
      { name: "Locate Object",     range: "60'+", dur: "6 turns", save: "—" },
      { name: "Mirror Image",      range: "self", dur: "6 turns", save: "—" },
      { name: "Phantasmal Force",  range: "240'", dur: "concentration", save: "vs spells" },
      { name: "Web",               range: "10'",  dur: "48 turns", save: "vs spells" },
      { name: "Wizard Lock",       range: "10'",  dur: "perm.",   save: "—" },
    ],
  };

  // ---------- Demo character ----------
  const CHARACTER = {
    name: "Eldra Vey",
    title: "Conjurer",
    cls: "Magic-User",
    level: 3,
    xp: 6420,
    alignment: "Neutral",
    portrait: null,
    abilities: { STR: 9, INT: 17, WIS: 12, DEX: 13, CON: 10, CHA: 11 },
    hp: { current: 8, max: 9, temp: 0 },
    ac: { ascending: 12, descending: 7, system: "AAC" }, // base 10/9 + DEX +1 + Shield-spell when active
    initiative: 0, // +DEX mod (optional)
    coin: { pp: 0, gp: 152, ep: 0, sp: 8, cp: 0 },
    languages: ["Common", "Lawful", "Elvish", "Draconic"],
    encumbrance: { current: 380, threshold: 400, cap: 1600 }, // coins
    // 1-in-6 skills (default; adjusted by class/race)
    skills: {
      FG: 1, FT: 1, HT: 1, LD: 1, OD: 1, SD: 1,
    },
    weapons: [
      { name: "Dagger (melee)", dmg: "1d4", mod: 0, range: "10/20/30", type: "melee", wt: 20, equipped: true,  tags: ["1 slot", "20 cn"] },
      { name: "Dagger (thrown)", dmg: "1d4", mod: 0, range: "10/20/30", type: "missile", ammo: 1, ammoMax: 1, wt: 0, equipped: true, tags: ["thrown", "20 cn"] },
      { name: "Quarterstaff",    dmg: "1d6", mod: 0, range: "—",        type: "melee",   wt: 40, equipped: false, tags: ["2-handed", "40 cn"] },
    ],
    // Armour & wards — equipped pieces raise AC live. Magic-User can't wear armour,
    // so Eldra's only AC source beyond DEX is the protective ring (base 10 + DEX +1 + ring +1 = AAC 12).
    armor: [
      { name: "Ring of protection +1", ac: 1, wt: 0, equipped: true, meta: "+1 AC · always-on ward" },
    ],
    spellbook: {
      1: ["Charm Person", "Detect Magic", "Magic Missile", "Read Magic", "Shield", "Sleep"],
      2: ["Invisibility", "Web"],
    },
    prepared: {
      1: ["Magic Missile", "Sleep"],     // both L1 slots used
      2: ["Web"],                        // L2 slot
    },
    spent: { 1: [], 2: [] },            // names of spells cast since last rest
    inventory: [
      { name: "Spellbook (locked)", qty: 1, wt: 100, slot: "🕮" },
      { name: "Dagger",              qty: 1, wt: 20, slot: "†" },
      { name: "Quarterstaff",        qty: 1, wt: 40, slot: "†" },
      { name: "Backpack",            qty: 1, wt: 0,  slot: "▣" },
      { name: "Iron rations (7 days)",qty: 7, wt: 80, slot: "🜞" },
      { name: "Waterskin (full)",    qty: 1, wt: 30, slot: "◉" },
      { name: "Torches",             qty: 6, wt: 0,  slot: "ψ" },
      { name: "Tinderbox",           qty: 1, wt: 0,  slot: "▣" },
      { name: "Rope, 50'",           qty: 1, wt: 50, slot: "∽" },
      { name: "Iron spikes",         qty: 12, wt: 10,slot: "▽" },
      { name: "Mirror, small steel", qty: 1, wt: 0,  slot: "□" },
      { name: "Chalk",               qty: 3, wt: 0,  slot: "▣" },
      { name: "Wand of magic missiles (3 chg.)", qty: 1, wt: 0, slot: "✦" },
      { name: "Scroll of Knock",     qty: 1, wt: 0,  slot: "📜" },
      { name: "Coin pouch",          qty: 1, wt: 50, slot: "◎" },
    ],
    notes: "Apprenticed to Master Borovan of the Tower at Greymere. Lost the master to a basilisk in the Vaults of Saen-Tora; took up his spellbook and unfinished research on the True Names of jade golems. Suspicious of clerics. Owes 200 gp to the Brass-and-Bell.",
  };

  // ---------- Game-rules helpers ----------
  const RULES = {
    abilityMod,
    savesAtLevel,
    xpFor: (lvl) => MU_XP_TABLE.find(r => r.lvl === lvl)?.xp ?? 0,
    nextXp: (lvl) => MU_XP_TABLE.find(r => r.lvl === lvl + 1)?.xp ?? Infinity,
    titleFor: (lvl) => MU_XP_TABLE.find(r => r.lvl === lvl)?.title ?? "—",
    hdFor:    (lvl) => MU_XP_TABLE.find(r => r.lvl === lvl)?.hd ?? "1d4",
    attackBonus: (lvl) => MU_AB[lvl] ?? 0,
    slots:    (lvl) => MU_SLOTS[lvl] ?? [0,0,0,0,0,0],
    // OSE Classic encumbrance (by coins carried) → exploration movement rate.
    movement: (coins) => {
      if (coins <= 400)  return { rate: 120, band: "Unencumbered" };
      if (coins <= 600)  return { rate: 90,  band: "Lightly loaded" };
      if (coins <= 800)  return { rate: 60,  band: "Heavily loaded" };
      if (coins <= 1600) return { rate: 30,  band: "Severely loaded" };
      return { rate: 0, band: "Overloaded" };
    },
    // OSE ascending AC: AAC hit = d20 + AB + target AAC >= 20
    // OSE descending: roll d20 + AB - target AC vs THAC0...
    // simplified: hit if (d20 + AB) >= (20 - targetAAC) is wrong; OSE rule: hit if d20+AB+targetAAC >= 20
    hitsAAC: (roll, ab, targetAAC) => (roll + ab + targetAAC) >= 20 || roll === 20,
    // Damage = die + mod
    // Roll-under ability check: d20 <= score
    isAbilityCheckPass: (roll, score) => roll <= score,
    // Save: roll d20 >= target
    isSavePass: (roll, target, wisMod = 0, kind = "") => {
      const adj = kind === "S" ? wisMod : 0; // WIS mod to spells
      return (roll + adj) >= target;
    },
  };

  return { CHARACTER, SPELLS, RULES, MU_XP_TABLE };
})();
