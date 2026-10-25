import { iconPath, type IconName } from "@/config/assets";
import { cn } from "@/lib/utils";

type IconProps = {
  name: IconName;
  className?: string;
  label?: string;
};

export function Icon({ name, className, label }: IconProps) {
  const url = `url(${iconPath(name)})`;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-block size-5 shrink-0 bg-current", className)}
      style={{
        WebkitMask: `${url} center / contain no-repeat`,
        mask: `${url} center / contain no-repeat`,
      }}
    />
  );
}
