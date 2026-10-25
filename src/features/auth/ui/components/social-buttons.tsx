import { UnavailableLink } from "@/components/unavailable-link";
import { socialLoginIcons } from "@/config/assets";

const base =
  "flex w-full items-center justify-center gap-3 rounded-md border border-primary/30 px-4 py-3 text-micro font-medium text-muted-foreground lg:rounded-sm";

/** Login social está fora do escopo: os botões avisam em vez de fingir sucesso. */
export function SocialButtons() {
  return (
    <div className="flex flex-col gap-3">
      <UnavailableLink message="O login com Google não está disponível nesta versão." className={base}>
        <img src={socialLoginIcons.google} alt="" width={20} height={20} />
        Continuar com Google
      </UnavailableLink>
      <UnavailableLink message="O login com Facebook não está disponível nesta versão." className={base}>
        <img src={socialLoginIcons.facebook} alt="" width={20} height={20} />
        Continuar com Facebook
      </UnavailableLink>
    </div>
  );
}
