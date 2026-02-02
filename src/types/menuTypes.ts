// Menu Types - Estrutura de dados para navegação

export interface NestedMenuItem {
  id: string;
  label: string;
  path?: string;
}

export interface SubMenuItem {
  id: string;
  label: string;
  path?: string;
  badge?: string;
  badgeType?: 'default' | 'warning' | 'success' | 'danger';
  children?: NestedMenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  badge?: string;
  badgeType?: 'default' | 'warning' | 'success' | 'danger';
  children?: SubMenuItem[];
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface DrawerConfig {
  logo?: {
    icon?: string;
    text: string;
    highlight?: string;
  };
  user?: {
    name: string;
    role: string;
    avatar?: string;
    initials?: string;
  };
  sections: MenuSection[];
}
