import { IconSet } from 'quasar';

/**
 * Função de mapeamento de ícones para Lucide Icons
 * Permite usar ícones com o prefixo "lucide:" ou mapeamentos customizados
 */
const lucideIconMapFn: typeof IconSet.iconMapFn = (iconName: string) => {
  // Suporte para prefixo "lucide:"
  // Uso: <q-icon name="lucide:home" /> -> <i class="icon-home"></i>
  if (iconName.startsWith('lucide:')) {
    return { cls: `icon-${iconName.slice(7)}` };
  }

  // Deixa o Quasar tratar normalmente se não houver mapeamento
  return undefined;
};

IconSet.iconMapFn = lucideIconMapFn;
