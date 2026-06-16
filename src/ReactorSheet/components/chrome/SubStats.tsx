import type { VitalsVM } from "../../viewModels/types";
import { formatMod } from "../../viewModels/format";

type Props = { vm: VitalsVM };

/** Init · HD · Move readout. Read-only (HD roll is later). */
export function SubStats({ vm }: Props) {
  const rows: { k: string; v: string }[] = [
    { k: "Init", v: formatMod(vm.initMod) },
    { k: "HD", v: vm.hd },
    { k: "Move", v: `${vm.move}′` },
  ];
  return (
    <div className="rs-substats">
      {rows.map((r) => (
        <div className="rs-substat" key={r.k}>
          <span className="k">{r.k}</span>
          <span className="v">{r.v}</span>
        </div>
      ))}
    </div>
  );
}
