// frontend/src/utils/iconHelper.ts

import {
  faCube,
  faGamepad,
  faLayerGroup,
  faPalette,
  faCode,
  type IconDefinition
} from '@fortawesome/free-solid-svg-icons';

/**
 * Converte o nome do ícone (do banco) em um objeto FontAwesome Icon
 * 
 * @param iconName - Nome do ícone vindo do banco (ex: "faCube", "faGamepad")
 * @returns IconDefinition do FontAwesome
 * 
 * @example
 * const icon = getIconByName("faCube"); // retorna faCube
 * const icon = getIconByName("faGamepad"); // retorna faGamepad
 */
export const getIconByName = (iconName?: string): IconDefinition => {
  if (!iconName) return faCube; // fallback padrão

  // Normalizar: remover "fa" prefix e converter para lowercase
  const normalized = iconName.toLowerCase().replace(/^fa/, '');

  // Mapear nomes para ícones
  const iconMap: { [key: string]: IconDefinition } = {
    cube: faCube,
    gamepad: faGamepad,
    layergroup: faLayerGroup,
    palette: faPalette,
    code: faCode,
  };

  return iconMap[normalized] || faCube; // fallback para cube se não encontrar
};

/**
 * Helper para obter badge class do software (mantido para compatibilidade)
 * Pode ser removido no futuro se não for mais necessário
 */
export const getSoftwareBadgeClass = (software: string): string => {
  const softwareLower = software.toLowerCase();
  if (softwareLower.includes('unity')) return 'badge-unity';
  if (softwareLower.includes('unreal')) return 'badge-unreal';
  if (softwareLower.includes('blender')) return 'badge-blender';
  if (softwareLower.includes('godot')) return 'badge-godot';
  return 'badge-default';
};