import type { IdentityVM, VitalsVM } from "../../viewModels/types";
import { formatMod } from "../../viewModels/format";
import { Stamp } from "../ui/Stamp";

type Props = {
  identity: IdentityVM;
  vitals: VitalsVM;
  /** Adjust current HP by delta; when provided, − / + steppers show on hover. */
  onAdjustHp?: (delta: number) => void;
};

/** Header band. Grid areas (see actions.scss) place: portrait · name+Init/HD/Move
 *  · HP/AC in medium, and stack them in the rail. */
export function HeaderBand({ identity, vitals, onAdjustHp }: Props) {
  const m = vitals.moveBands;
  return (
    <div className="rs-head">
      <div className="rs-portrait-wrap">
        <img className="rs-portrait" src={identity.img || undefined} alt={identity.name} />
      </div>
      <div className="rs-ident">
        <div className="rs-name">{identity.name}</div>
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
            {onAdjustHp && (
              <button type="button" className="vv-step" aria-label="Lose 1 HP" onClick={() => onAdjustHp(-1)}>−</button>
            )}
            <div className="vv-big">{vitals.hp.value}</div>
            {onAdjustHp && (
              <button type="button" className="vv-step" aria-label="Heal 1 HP" onClick={() => onAdjustHp(1)}>+</button>
            )}
          </div>
          <div className="vv-sub">
            <span className="full">Maximum {vitals.hp.max}</span>
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
