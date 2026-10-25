import { Icon } from "@/components/icon";
import type { IconName } from "@/config/assets";

export function ShareLinks({ title }: { title: string }) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`${title} na Kurio`);
  const links: { icon: IconName; label: string; href: string }[] = [
    { icon: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { icon: "mail", label: "e-mail", href: `mailto:?subject=${text}&body=${url}` },
    { icon: "twitter", label: "Twitter", href: `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
  ];
  return (
    <div className="flex items-center gap-3 text-small font-bold">
      <span>Compartilhar este NFT:</span>
      <ul className="flex gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.icon === "mail" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={`Compartilhar por ${link.label}`}
              className="grid size-7 place-items-center"
            >
              <Icon name={link.icon} className="size-5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
