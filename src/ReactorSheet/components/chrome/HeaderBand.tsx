import type { IdentityVM, VitalsVM } from "../../viewModels/types";
import { formatMod } from "../../viewModels/format";
import { Stamp } from "../ui/Stamp";

type Props = { identity: IdentityVM; vitals: VitalsVM };

/** Inline header row (small portrait · name/class · HP/AC floated right), with
 *  the Init/HD/Move stamp tiles as a full-width row beneath. */
export function HeaderBand({ identity, vitals }: Props) {
  return (
    <>
      <div className="rs-head">
        <div className="rs-portrait-wrap">
          <img className="rs-portrait" src={identity.img || undefined} alt={identity.name} />
        </div>
        <div className="rs-ident">
          <div className="rs-name">{identity.name}</div>
          <div className="rs-class">{identity.classLabel} {identity.level} · {identity.alignment}</div>
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
      <div className="rs-substats">
        <div className="rs-tile">
          <Stamp>INIT</Stamp>
          <div className="rs-tile-v">{formatMod(vitals.initMod)}</div>
        </div>
        <div className="rs-tile">
          <Stamp>HD</Stamp>
          <div className="rs-tile-v">{vitals.hd}</div>
        </div>
        <div className="rs-tile">
          <Stamp>MOVE</Stamp>
          <div className="rs-tile-v">{vitals.move}′</div>
        </div>
      </div>
    </>
  );
}
