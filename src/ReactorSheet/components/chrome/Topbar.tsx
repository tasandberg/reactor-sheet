import type { TopbarVM } from "../../viewModels/types";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";

type Props = { vm: TopbarVM };

/** Persistent topbar: level, XP progress, next level. Buttons are inert in the
 *  display pass (wired in the interactive pass). */
export function Topbar({ vm }: Props) {
  return (
    <div className="rs-topbar-inner">
      <div className="rs-topbar-lv">
        <b>Lv {vm.level}</b>
        <span>{vm.xp.value.toLocaleString()}</span>
      </div>
      <div className="rs-topbar-xp">
        <ProgressBar value={vm.xp.value} max={vm.xp.next} color="var(--gold)" />
        <span className="xp-val">
          {vm.xp.value.toLocaleString()} / {vm.xp.next.toLocaleString()} XP
        </span>
      </div>
      <div className="rs-topbar-lv">
        <b>Lv {vm.nextLevel}</b>
        <span>{vm.xp.next.toLocaleString()}</span>
      </div>
      <div className="rs-topbar-actions">
        <Button size="sm" variant="ghost" disabled>Rest</Button>
        <Button size="sm" variant="ghost" disabled>Level Up</Button>
        <Button size="sm" variant="ghost" disabled>Edit</Button>
        <Button size="sm" variant="ghost" disabled>Theme</Button>
      </div>
    </div>
  );
}
