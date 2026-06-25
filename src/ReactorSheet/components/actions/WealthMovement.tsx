import type { WealthMovementVM } from "../../viewModels/types";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { vm: WealthMovementVM };

/** Coins + movement bands readout. Read-only. */
export function WealthMovement({ vm }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle>Wealth &amp; Movement</SectionTitle>
      <div className="rs-wm">
        <div className="grp">
          <span className="rs-substat k">Wealth</span>
          <div className="rs-coins">
            {vm.coins.length === 0 && <span className="rs-substat k">—</span>}
            {vm.coins.map((c) => (
              <span className="rs-coin" key={c.name}>
                {c.img && <img src={c.img} alt={c.name} />}
                {c.name} <span className="v">{c.qty}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="grp">
          <span className="rs-substat k">Movement</span>
          <div className="rs-moves">
            <span className="rs-move"><span className="k">Encounter</span><span className="v">{vm.move.encounter}′</span></span>
            <span className="rs-move"><span className="k">Explore</span><span className="v">{vm.move.explore}′</span></span>
            <span className="rs-move"><span className="k">Travel</span><span className="v">{vm.move.travel} mi</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
