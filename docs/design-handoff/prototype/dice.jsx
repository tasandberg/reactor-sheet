/* ============================================================
   Dice — pure JS dice rolling + the visual dice tray.
   Exports to window: rollDie, rollSpec, useDice, DiceTray, ActionLog
   ============================================================ */

(function () {
  const { useState, useEffect, useCallback, useRef } = React;

  // ---------- pure dice ----------
  function rollDie(sides) {
    return 1 + Math.floor(Math.random() * sides);
  }
  // spec: "1d20", "2d6+1", "1d4-1"
  function rollSpec(spec) {
    const m = spec.match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!m) return { total: 0, rolls: [], spec, mod: 0, sides: 0 };
    const n = +m[1], sides = +m[2], mod = m[3] ? +m[3] : 0;
    const rolls = Array.from({ length: n }, () => rollDie(sides));
    return { total: rolls.reduce((a,b)=>a+b,0) + mod, rolls, spec, mod, sides };
  }

  // ---------- A single rendered die ----------
  function Die({ sides, value, kind }) {
    const cls = `die d${sides}${kind ? " " + kind : ""} rolling`;
    return (
      <div className={cls} key={Math.random()}>
        <span className="face">{value}</span>
      </div>
    );
  }

  // ---------- Dice tray + Action log via a shared store ----------
  // We use a small event-bus pattern so any tab can dispatch rolls into the tray.
  const subscribers = new Set();
  let state = {
    tray: null,              // current roll on the tray (or null)
    log: [],                 // historical entries
  };
  function emit() { subscribers.forEach(fn => fn(state)); }
  function setState(next) { state = { ...state, ...next }; emit(); }

  function useDiceStore() {
    const [, force] = useState(0);
    useEffect(() => {
      const fn = () => force(x => x + 1);
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }, []);
    return state;
  }

  // ---------- The public API: queueRoll({...}) ----------
  // payload: { kind, label, source, dice:[{sides,n,mod?}], target?, hit?, damage?, eval? }
  // eval(rolls) -> { verdict: "hit"|"miss"|"crit"|"fumble"|"success"|"fail", text, valueClass? }
  function queueRoll(spec) {
    // roll each die set
    const dice = spec.dice.flatMap(d => {
      const n = d.n || 1;
      return Array.from({ length: n }, () => ({ sides: d.sides, value: rollDie(d.sides) }));
    });
    const total =
      dice.reduce((a, b) => a + b.value, 0) +
      (spec.dice.reduce((a, b) => a + (b.mod || 0), 0));

    // evaluate
    const result = spec.evaluate ? spec.evaluate({ dice, total }) : { verdict: null, text: String(total) };

    const entry = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      kind: spec.kind,
      label: spec.label,
      source: spec.source,
      target: spec.target,
      dice,
      total,
      breakdown: spec.breakdown || dice.map(d => d.value).join(" + ") + spec.dice.reduce((acc, ds) => acc + (ds.mod ? ` ${ds.mod >= 0 ? "+" : ""}${ds.mod}` : ""), ""),
      ...result,
      _replay: spec, // store so we can re-roll
    };

    setState({
      tray: entry,
      log: [entry, ...state.log].slice(0, 80),
    });
    return entry;
  }
  function clearTray() { setState({ tray: null }); }

  // ---------- Components ----------
  function DiceTray() {
    const { tray } = useDiceStore();
    const reroll = () => {
      if (tray && tray._replay) queueRoll(tray._replay);
    };
    return (
      <div className="panel dice-tray">
        <div className="tray-head">
          <span className="ttl">Dice Tray</span>
          {tray && <button className="clear" onClick={clearTray}>clear</button>}
        </div>
        <div className={`dice-stage ${tray ? "" : "empty"}`}>
          {!tray && "— roll something —"}
          {tray && tray.dice.map((d, i) => (
            <div className="die-container" key={tray.id + "-" + i}>
              <Die sides={d.sides} value={d.value}
                   kind={
                     d.sides === 20 && d.value === 20 ? "crit"
                     : d.sides === 20 && d.value === 1 ? "fumble"
                     : null
                   } />
              <div className="src">d{d.sides}</div>
            </div>
          ))}
        </div>
        {tray && (
          <div className="dice-result">
            <div className="title">{tray.label}</div>
            <div className="breakdown">
              {tray.breakdown} = <b style={{ color: "var(--text)" }}>{tray.total}</b>
              {tray.target != null && <span> vs {tray.target}</span>}
            </div>
            {tray.verdict && (
              <div className={`verdict ${tray.verdict}`}>{tray.text || tray.verdict.toUpperCase()}</div>
            )}
            <button className="reroll" onClick={reroll}>↺ re-roll</button>
          </div>
        )}
      </div>
    );
  }

  function ActionLog() {
    const { log } = useDiceStore();
    const ref = useRef();
    return (
      <div className="panel">
        <div className="tray-head">
          <span className="ttl">Action Log</span>
          <button className="clear" onClick={() => setState({ log: [] })}>clear</button>
        </div>
        <div className="log-list" ref={ref}>
          {log.length === 0 && (
            <div style={{ padding: "18px 12px", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 12, color: "var(--text-faint)", background: "var(--bg-2)" }}>
              No rolls yet. The bones lie still upon the felt.
            </div>
          )}
          {log.map(e => (
            <div className="log-entry" key={e.id}>
              <div className="lbl"><b>{e.label}</b>{e.source && <span className="dim"> · {e.source}</span>}</div>
              <div className={`res ${e.verdict || ""}`}>
                {e.verdict === "hit"  && `HIT ${e.total}`}
                {e.verdict === "miss" && `miss ${e.total}`}
                {e.verdict === "crit" && `CRIT ${e.total}`}
                {e.verdict === "fumble" && `fumble (${e.total})`}
                {e.verdict === "success" && `✓ ${e.total}`}
                {e.verdict === "fail" && `✗ ${e.total}`}
                {e.verdict === "dmg" && `${e.total} dmg`}
                {!e.verdict && e.total}
              </div>
              <div className="when" style={{ gridColumn: "1 / -1" }}>{e.time}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // expose
  Object.assign(window, {
    rollDie, rollSpec,
    queueRoll, clearTray,
    DiceTray, ActionLog, useDiceStore,
  });
})();
