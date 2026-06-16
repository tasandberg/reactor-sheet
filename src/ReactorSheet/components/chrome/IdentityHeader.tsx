import type { IdentityVM } from "../../viewModels/types";

type Props = { vm: IdentityVM };

/** Portrait + name + "Class Level · Alignment". Read-only (FilePicker is later). */
export function IdentityHeader({ vm }: Props) {
  return (
    <div className="rs-identity">
      <img className="portrait" src={vm.img || undefined} alt={vm.name} />
      <div className="ident">
        <div className="name">{vm.name}</div>
        <div className="sub">
          {vm.classLabel} {vm.level} · {vm.alignment}
        </div>
      </div>
    </div>
  );
}
