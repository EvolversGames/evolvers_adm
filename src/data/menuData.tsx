import type { DrawerConfig } from '../types/menuTypes';
import type { JSX } from 'react';

// Icons Components
export const MenuIcons = {
  Dashboard: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Products: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Gears: () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11.983 13.804A3.5 3.5 0 1015.5 10.5a3.5 3.5 0 00-3.517 3.304z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01A1.65 1.65 0 009 4.09V4a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01A1.65 1.65 0 0019.91 11H20a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
  ),

  Users: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Content: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Finance: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Marketing: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  Email: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Support: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Blog: () => (
    <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
};

// Dados do Menu - GameDev Admin (REESTRUTURADO)
export const gameDevMenuConfig: DrawerConfig = {
  logo: {
    icon: '🎮',
    text: 'Evolvers',
    highlight: 'Admin',
  },
  user: {
    name: 'Rick Prata',
    role: 'Administrador',
    initials: 'RP',
  },
  sections: [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <MenuIcons.Dashboard />,
          path: '/',
        },
        // ✨ Produtos com subitens e badges 
        {
          id: 'products',
          label: 'Produtos',
          icon: <MenuIcons.Products />,
          badge: '67',
          badgeType: 'warning',
          children: [
            { 
              id: 'all-products', 
              label: 'Todos os Produtos', 
              path: '/produtos' 
            },
           
           {
              id: 'products-bundles',
              label: 'Bundles',
              path: '/produtos/bundle',
            },
            {
              id: 'products-assets',
              label: 'Assets',
              path: '/produtos/assets',
            },
      
          
          ],
        },
 {
          id: 'articles',
          label: 'Artigos',
           icon: <MenuIcons.Blog />,
          badge: '67',
          badgeType: 'warning',
          children: [
            { 
              id: 'all-articles', 
              label: 'Todos os Artigos', 
              path: '/articles/article' 
            }
           
          ],
        },

        {
          id: 'auxiliares',
          label: 'Auxiliares',
          icon: <MenuIcons.Gears />,
          children: 
          [
             { 
              id: 'all-categories', 
              label: 'Categorias', 
              path: '/produtos/categorias' 
            },
            { 
              id: 'all-tags', 
              label: 'Tags', 
              path: '/produtos/tags' 
            },
             { 
              id: 'all-softwares', 
              label: 'Softwares', 
              path: '/produtos/softwares' 
            },
             { 
              id: 'all-badges', 
              label: 'Badges', 
              path: '/produtos/badges'
            },
            {
              id: 'all-corner-badges',
              label: 'Corner-Badges',
              path: '/produtos/corner-badges'
            },
            {
              id: 'all-article-categories',
              label: 'Categ. Artigos',
              path: '/articles/categorias'
            },

          ]
        },
        // Usuarios
        {
          id: 'users',
          label: 'Usuarios',
          icon: <MenuIcons.Users />,
          children: [
            { id: 'all-users', label: 'Todos os Usuarios', path: '/usuarios' },
            { id: 'instructors', label: 'Instrutores', path: '/usuarios/instrutores' },
          ],
        },
        // Email Marketing
        {
          id: 'email-marketing',
          label: 'Email Marketing',
          icon: <MenuIcons.Email />,
          path: '/email-marketing',
        },
     /*    // Blog (separado de produtos)
        {
          id: 'blog',
          label: 'Blog',
        },
        // Blog (separado de produtos)
        {
          id: 'blog',
          label: 'Blog',
          icon: <MenuIcons.Blog />,
          children: [
            { id: 'all-articles', label: 'Todos os Artigos', path: '/blog' },
            { id: 'create-article', label: 'Novo Artigo', path: '/blog/novo' },
            { id: 'blog-categories', label: 'Categorias', path: '/blog/categorias' },
            { id: 'blog-tags', label: 'Tags', path: '/blog/tags' },
          ],
        }, */
      ],
    },
 /*    {
      title: 'Conteúdo',
      items: [
        {
          id: 'content',
          label: 'Aulas e Materiais',
          icon: <MenuIcons.Content />,
          children: [
            { id: 'lessons', label: 'Aulas', path: '/aulas' },
            { id: 'quizzes', label: 'Quizzes', path: '/quizzes' },
            { id: 'resources', label: 'Recursos', path: '/recursos' },
            {
              id: 'certificates',
              label: 'Certificados',
              children: [
                { id: 'cert-templates', label: 'Templates', path: '/certificados/templates' },
                { id: 'cert-issued', label: 'Emitidos', path: '/certificados/emitidos' },
              ],
            },
          ],
        },
      ],
    }, */
   /*  {
      title: 'Usuários',
      items: [
        {
          id: 'users',
          label: 'Gerenciar Usuários',
          icon: <MenuIcons.Users />,
          children: [
            { id: 'students', label: 'Alunos', path: '/usuarios/alunos', badge: '2.4M' },
            { id: 'instructors', label: 'Instrutores', path: '/usuarios/instrutores' },
            { id: 'admins', label: 'Administradores', path: '/usuarios/admins' },
            {
              id: 'roles',
              label: 'Permissões',
              children: [
                { id: 'roles-list', label: 'Papéis', path: '/permissoes/papeis' },
                { id: 'permissions', label: 'Permissões', path: '/permissoes/lista' },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        {
          id: 'finance',
          label: 'Financeiro',
          icon: <MenuIcons.Finance />,
          children: [
            { id: 'sales', label: 'Vendas', path: '/financeiro/vendas', badge: 'R$158K', badgeType: 'success' },
            { id: 'coupons', label: 'Cupons', path: '/financeiro/cupons' },
            { id: 'payments', label: 'Pagamentos', path: '/financeiro/pagamentos' },
            {
              id: 'reports',
              label: 'Relatórios',
              children: [
                { id: 'report-daily', label: 'Diário', path: '/relatorios/diario' },
                { id: 'report-monthly', label: 'Mensal', path: '/relatorios/mensal' },
                { id: 'report-yearly', label: 'Anual', path: '/relatorios/anual' },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Marketing',
      items: [
        {
          id: 'marketing',
          label: 'Marketing',
          icon: <MenuIcons.Marketing />,
          children: [
            { id: 'promotions', label: 'Promoções', path: '/marketing/promocoes' },
            { id: 'email', label: 'Email Marketing', path: '/marketing/email' },
            { id: 'analytics', label: 'Analytics', path: '/marketing/analytics' },
            { id: 'affiliates', label: 'Afiliados', path: '/marketing/afiliados' },
          ],
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          id: 'settings',
          label: 'Configurações',
          icon: <MenuIcons.Settings />,
          children: [
            { id: 'general', label: 'Geral', path: '/configuracoes/geral' },
            { id: 'appearance', label: 'Aparência', path: '/configuracoes/aparencia' },
            { id: 'integrations', label: 'Integrações', path: '/configuracoes/integracoes' },
            { id: 'notifications', label: 'Notificações', path: '/configuracoes/notificacoes' },
          ],
        },
        {
          id: 'support',
          label: 'Suporte',
          icon: <MenuIcons.Support />,
          path: '/suporte',
          badge: '3',
          badgeType: 'danger',
        },
      ],
    }, */
  ],
};

// Função para carregar menu de JSON externo
export const loadMenuFromJSON = (jsonData: {
  logo?: DrawerConfig['logo'];
  user?: DrawerConfig['user'];
  sections: Array<{
    title: string;
    items: Array<{
      id: string;
      label: string;
      iconName?: string;
      path?: string;
      badge?: string;
      badgeType?: 'default' | 'warning' | 'success' | 'danger';
      children?: Array<{
        id: string;
        label: string;
        path?: string;
        badge?: string;
        badgeType?: 'default' | 'warning' | 'success' | 'danger';
        children?: Array<{
          id: string;
          label: string;
          path?: string;
        }>;
      }>;
    }>;
  }>;
}): DrawerConfig => {
  // Mapeamento de nome do ícone para componente
  const iconMap: Record<string, () => JSX.Element> = {
    dashboard: MenuIcons.Dashboard,
    products: MenuIcons.Products,
    users: MenuIcons.Users,
    content: MenuIcons.Content,
    finance: MenuIcons.Finance,
    marketing: MenuIcons.Marketing,
    settings: MenuIcons.Settings,
    blog: MenuIcons.Blog,
    support: MenuIcons.Support,
  };

  return {
    logo: jsonData.logo,
    user: jsonData.user,
    sections: jsonData.sections.map((section) => ({
      title: section.title,
      items: section.items.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.iconName && iconMap[item.iconName] ? iconMap[item.iconName]() : undefined,
        path: item.path,
        badge: item.badge,
        badgeType: item.badgeType,
        children: item.children,
      })),
    })),
  };
};