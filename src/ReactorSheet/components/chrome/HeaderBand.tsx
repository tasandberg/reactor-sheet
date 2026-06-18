import { useLayoutEffect, useRef } from "react";
import type { IdentityVM, VitalsVM } from "../../viewModels/types";
import { formatMod } from "../../viewModels/format";
import { Stamp } from "../ui/Stamp";

/** Shrink a single-line element's font to fit its box (down to `min`x) instead of
 *  truncating. Sets `--fit-scale`; CSS multiplies the base font-size by it. */
function useFitText(text: string, min = 0.6) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.setProperty("--fit-scale", "1");
      const avail = el.clientWidth;
      const needed = el.scrollWidth;
      const scale = needed > avail && needed > 0 ? Math.max(min, avail / needed) : 1;
      el.style.setProperty("--fit-scale", String(scale));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, min]);
  return ref;
}

type Props = {
  identity: IdentityVM;
  vitals: VitalsVM;
  /** Commit a new current-HP value; when provided, HP renders an editable input. */
  onSetHp?: (value: number) => void;
};

/** Header band. Grid areas (see actions.scss) place: portrait · name+Init/HD/Move
 *  · HP/AC in medium, and stack them in the rail. */
export function HeaderBand({ identity, vitals, onSetHp }: Props) {
  const m = vitals.moveBands;
  const nameRef = useFitText(identity.name);
  return (
    <div className="rs-head">
      <div className="rs-portrait-wrap">
        <img className="rs-portrait" src={identity.img || undefined} alt={identity.name} />
      </div>
      <div className="rs-ident">
        <div className="rs-name" ref={nameRef}>{identity.name}</div>
        <div className="rs-class">{identity.classLabel} {identity.level} · {identity.alignment}</div>
      </div>
      <div className="rs-substats">
        <div className="rs-tile">
          <Stamp>INIT</Stamp>
          <div className="rs-tile-v">{formatMod(vitals.initMod)}</div>
        </div>
        <div className="rs-tile">
          <Stamp>HD</Stamp>
          <div className="rs-tile-v">{vitals.hd}</div>
        </div>
        <div className="rs-tile rs-tile-move">
          <Stamp>MOVE</Stamp>
          <div className="rs-tile-v">{vitals.move}′</div>
          <span className="rs-move-pop" role="tooltip">
            <span className="r"><span className="k">Encounter</span><span className="vv">{m.encounter}′</span></span>
            <span className="r"><span className="k">Explore</span><span className="vv">{m.explore}′</span></span>
            <span className="r"><span className="k">Travel</span><span className="vv">{m.travel} mi</span></span>
          </span>
        </div>
      </div>
      <div className="rs-vitals">
        <div className="rs-vital hp">
          <Stamp className="vv-l">HP</Stamp>
          <div className="vv-row">
            {/* medium+: − / + steppers around the value; XS: an editable input (toggled in CSS) */}
            {onSetHp && (
              <button type="button" className="vv-step" aria-label="Lose 1 HP" onClick={() => onSetHp(vitals.hp.value - 1)}>−</button>
            )}
            <div className="vv-big vv-value">{vitals.hp.value}</div>
            {onSetHp && (
              <input
                className="vv-big vv-input"
                type="number"
                inputMode="numeric"
                min={0}
                max={vitals.hp.max}
                aria-label="Current HP"
                defaultValue={vitals.hp.value}
                key={vitals.hp.value}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                onBlur={(e) => {
                  const n = parseInt(e.currentTarget.value, 10);
                  if (Number.isNaN(n)) {
                    e.currentTarget.value = String(vitals.hp.value);
                    return;
                  }
                  onSetHp(Math.max(0, Math.min(vitals.hp.max, n)));
                }}
              />
            )}
            {onSetHp && (
              <button type="button" className="vv-step" aria-label="Heal 1 HP" onClick={() => onSetHp(vitals.hp.value + 1)}>+</button>
            )}
          </div>
          <div className="vv-sub">
            <span className="full">Max {vitals.hp.max}</span>
            <span className="short">/{vitals.hp.max}</span>
          </div>
        </div>
        <div className="rs-vital ac">
          <Stamp className="vv-l">AC</Stamp>
          <div className="vv-row">
            <div className="vv-big">{vitals.ac.ascending}</div>
          </div>
          <div className="vv-sub">
            <span className="full">Ascending</span>
            <span className="short">asc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
