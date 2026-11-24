import { setLabFlag } from "@/actions/lab";
import Button from "@/components/ui/Button";
import { LAB_FLAGS, type FlagName } from "@/lib/lab-scenarios";

interface LabFlagRowProps {
  flag: FlagName;
  isOn: boolean;
}

/** A switch button: shows whether it is on now and turns it the other way when pressed. */
export default function LabFlagRow({ flag, isOn }: LabFlagRowProps) {
  const info = LAB_FLAGS.find((item) => item.flag === flag)!;
  return (
    <form action={setLabFlag} className="flex items-center gap-4 px-5 py-2.5">
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="value" value={isOn ? "off" : "on"} />
      <input type="hidden" name="returnTo" value="/lab" />
      <Button type="submit" variant={isOn ? "primary" : "outline"} className="w-[220px]">
        {info.label}: {isOn ? "On" : "Off"}
      </Button>
      <p className="text-[13px] text-ink-3">{info.proves} Press to turn {isOn ? "off" : "on"}.</p>
    </form>
  );
}
