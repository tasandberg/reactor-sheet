import type { IdentityVM, VitalsVM } from "../../viewModels/types";
import { formatMod } from "../../viewModels/format";

type Props = { identity: IdentityVM; vitals: VitalsVM };

/** Portrait + name/class row + HP/AC vitals + Init/HD/Move substack in one band. */
export function HeaderBand({ identity, vitals }: Props) {
  return (
    <div className="rs-head">
      <div className="rs-portrait-wrap">
        <img className="rs-portrait" src={identity.img || undefined} alt={identity.name} />
      </div>
      <div className="rs-ident">
        <div className="rs-idhead">
          <div className="rs-name">{identity.name}</div>
          <div className="rs-class">{identity.classLabel} {identity.level} · {identity.alignment}</div>
        </div>
        <div className="rs-vitals">
          <div className="rs-vital hp">
            <div className="vv-l">Hit Points</div>
            <div className="vv-big">{vitals.hp.value}</div>
            <div className="vv-sub">Maximum {vitals.hp.max}</div>
          </div>
          <div className="rs-vital ac">
            <div className="vv-l">Armor Class</div>
            <div className="vv-big">{vitals.ac.ascending}</div>
            <div className="vv-sub">AAC · DAC {vitals.ac.descending}</div>
          </div>
          <div className="rs-substack">
            <div className="ss-row"><span className="ss-k">Init</span><span className="ss-v">{formatMod(vitals.initMod)}</span></div>
            <div className="ss-row"><span className="ss-k">HD</span><span className="ss-v">{vitals.hd}</span></div>
            <div className="ss-row"><span className="ss-k">Move</span><span className="ss-v">{vitals.move}′</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
