import { Shell, Section, RunningHead } from "@/components/ui/Shell";
import { getMenu } from "@/lib/menu";
import { MenuView } from "@/components/sections/MenuView";

/**
 * Menu — Server Component que trae la carta desde Google Sheets (via
 * `getMenu()`) y la pasa a `MenuView`. Si `getMenu()` no puede devolver datos
 * (sheet caida y sin cache previa), se muestra un aviso discreto en vez de
 * romper la pagina.
 */
export async function Menu() {
  const data = await getMenu();

  if (!data) {
    return (
      <Section id="carta" className="surface-paper">
        <Shell>
          <RunningHead label="Carta" />
          <div className="mt-8 py-20 text-center lg:mt-12">
            <p className="text-[0.9375rem] text-cement">
              Carta no disponible en este momento. Vuelve a intentarlo en
              unos minutos.
            </p>
          </div>
        </Shell>
      </Section>
    );
  }

  return <MenuView tabs={data.tabs} itemCount={data.itemCount} />;
}
