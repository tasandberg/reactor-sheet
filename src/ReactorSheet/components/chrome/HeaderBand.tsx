import type { IdentityVM, VitalsVM } from "../../viewModels/types";
import { formatMod } from "../../viewModels/format";
import { Stamp } from "../ui/Stamp";

type Props = { identity: IdentityVM; vitals: VitalsVM };

/** Inline header row: square portrait · name/class + Init/HD/Move pills · HP/AC.
 *  The MOVE pill reveals the movement bands on hover. */
export function HeaderBand({ identity, vitals }: Props) {
  const m = vitals.moveBands;
  return (
    <div className="rs-head">
      <div className="rs-portrait-wrap">
        <img className="rs-portrait" src={identity.img || undefined} alt={identity.name} />
      </div>
      <div className="rs-ident">
        <div className="rs-name">{identity.name}</div>
        <div className="rs-class">{identity.classLabel} {identity.level} · {identity.alignment}</div>
        <div className="rs-pills">
          <span className="rs-pill">
            <Stamp>INIT</Stamp>
            <span className="v">{formatMod(vitals.initMod)}</span>
          </span>
          <span className="rs-pill">
            <Stamp>HD</Stamp>
            <span className="v">{vitals.hd}</span>
          </span>
          <span className="rs-pill rs-pill-move">
            <Stamp>MOVE</Stamp>
            <span className="v">{vitals.move}′</span>
            <span className="rs-move-pop" role="tooltip">
              <span className="r"><span className="k">Encounter</span><span className="vv">{m.encounter}′</span></span>
              <span className="r"><span className="k">Explore</span><span className="vv">{m.explore}′</span></span>
              <span className="r"><span className="k">Travel</span><span className="vv">{m.travel} mi</span></span>
            </span>
          </span>
        </div>
      </div>
      <div className="rs-vitals">
        <div className="rs-vital hp">
          <Stamp className="vv-l">HP</Stamp>
          <div className="vv-big">{vitals.hp.value}</div>
          <div className="vv-sub">/{vitals.hp.max}</div>
        </div>
        <div className="rs-vital ac">
          <Stamp className="vv-l">AC</Stamp>
          <div className="vv-big">{vitals.ac.ascending}</div>
          <div className="vv-sub">asc</div>
        </div>
      </div>
    </div>
  );
}
