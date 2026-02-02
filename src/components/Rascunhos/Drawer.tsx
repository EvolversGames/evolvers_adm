import { useState, useCallback } from 'react';
import './Drawer.css';

// Types
interface NestedMenuItem {
  id: string;
  label: string;
  path?: string;
}

interface SubMenuItem {
  id: string;
  label: string;
  path?: string;
  badge?: string;
  badgeType?: 'default' | 'warning' | 'success' | 'danger';
  children?: NestedMenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string;
  badgeType?: 'default' | 'warning' | 'success' | 'danger';
  children?: SubMenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

// Icons Components
const DashboardIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CoursesIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UsersIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ContentIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const FinanceIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MarketingIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BundleIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SupportIcon = () => (
  <svg className="menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="menu-item-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg className="drawer-user-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

// Menu Data - Similar to Udemy Admin
const menuSections: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin/dashboard',
      },
      {
        id: 'courses',
        label: 'Cursos',
        icon: <CoursesIcon />,
        badge: '24',
        children: [
          { id: 'all-courses', label: 'Todos os Cursos', path: '/admin/courses' },
          { id: 'create-course', label: 'Criar Novo', path: '/admin/courses/create' },
          { 
            id: 'categories', 
            label: 'Categorias',
            children: [
              { id: 'cat-unity', label: 'Unity', path: '/admin/categories/unity' },
              { id: 'cat-unreal', label: 'Unreal Engine', path: '/admin/categories/unreal' },
              { id: 'cat-blender', label: 'Blender', path: '/admin/categories/blender' },
              { id: 'cat-godot', label: 'Godot', path: '/admin/categories/godot' },
            ]
          },
          { id: 'reviews', label: 'Avaliações', path: '/admin/courses/reviews', badge: '12', badgeType: 'warning' },
        ],
      },
      {
        id: 'bundles',
        label: 'Bundles',
        icon: <BundleIcon />,
        path: '/admin/bundles',
      },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      {
        id: 'content',
        label: 'Aulas e Materiais',
        icon: <ContentIcon />,
        children: [
          { id: 'lessons', label: 'Aulas', path: '/admin/lessons' },
          { id: 'quizzes', label: 'Quizzes', path: '/admin/quizzes' },
          { id: 'resources', label: 'Recursos', path: '/admin/resources' },
          { 
            id: 'certificates', 
            label: 'Certificados',
            children: [
              { id: 'cert-templates', label: 'Templates', path: '/admin/certificates/templates' },
              { id: 'cert-issued', label: 'Emitidos', path: '/admin/certificates/issued' },
            ]
          },
        ],
      },
    ],
  },
  {
    title: 'Usuários',
    items: [
      {
        id: 'users',
        label: 'Gerenciar Usuários',
        icon: <UsersIcon />,
        children: [
          { id: 'students', label: 'Alunos', path: '/admin/users/students', badge: '2.4M' },
          { id: 'instructors', label: 'Instrutores', path: '/admin/users/instructors' },
          { id: 'admins', label: 'Administradores', path: '/admin/users/admins' },
          { 
            id: 'roles', 
            label: 'Permissões',
            children: [
              { id: 'roles-list', label: 'Papéis', path: '/admin/roles' },
              { id: 'permissions', label: 'Permissões', path: '/admin/permissions' },
            ]
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
        icon: <FinanceIcon />,
        children: [
          { id: 'sales', label: 'Vendas', path: '/admin/finance/sales', badge: 'R$158K', badgeType: 'success' },
          { id: 'coupons', label: 'Cupons', path: '/admin/finance/coupons' },
          { id: 'payments', label: 'Pagamentos', path: '/admin/finance/payments' },
          { 
            id: 'reports', 
            label: 'Relatórios',
            children: [
              { id: 'report-daily', label: 'Diário', path: '/admin/reports/daily' },
              { id: 'report-monthly', label: 'Mensal', path: '/admin/reports/monthly' },
              { id: 'report-yearly', label: 'Anual', path: '/admin/reports/yearly' },
            ]
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
        icon: <MarketingIcon />,
        children: [
          { id: 'promotions', label: 'Promoções', path: '/admin/marketing/promotions' },
          { id: 'email', label: 'Email Marketing', path: '/admin/marketing/email' },
          { id: 'analytics', label: 'Analytics', path: '/admin/marketing/analytics' },
          { id: 'affiliates', label: 'Afiliados', path: '/admin/marketing/affiliates' },
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
        icon: <SettingsIcon />,
        children: [
          { id: 'general', label: 'Geral', path: '/admin/settings/general' },
          { id: 'appearance', label: 'Aparência', path: '/admin/settings/appearance' },
          { id: 'integrations', label: 'Integrações', path: '/admin/settings/integrations' },
          { id: 'notifications', label: 'Notificações', path: '/admin/settings/notifications' },
        ],
      },
      {
        id: 'support',
        label: 'Suporte',
        icon: <SupportIcon />,
        path: '/admin/support',
        badge: '3',
        badgeType: 'danger',
      },
    ],
  },
];

// Drawer Component
const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, currentPath = '' }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['courses']));
  const [expandedSubItems, setExpandedSubItems] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const toggleSubItem = useCallback((subItemId: string) => {
    setExpandedSubItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subItemId)) {
        newSet.delete(subItemId);
      } else {
        newSet.add(subItemId);
      }
      return newSet;
    });
  }, []);

  const isActive = (path?: string) => path === currentPath;

  const handleNavigation = (path?: string) => {
    if (path) {
      // Here you would typically use your router navigation
      console.log('Navigate to:', path);
      // If on mobile, close the drawer
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="drawer-toggle-btn" onClick={() => onClose()}>
        <MenuIcon />
      </button>

      {/* Overlay */}
      <div 
        className={`drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-logo">
            <div className="drawer-logo-icon">🎮</div>
            <div className="drawer-logo-text">
              Evolvers<span>Admin</span>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <nav className="drawer-content">
          {menuSections.map((section) => (
            <div key={section.title} className="menu-section">
              <div className="menu-section-title">{section.title}</div>
              
              {section.items.map((item) => (
                <div key={item.id} className="menu-item">
                  <button
                    className={`menu-item-button ${
                      isActive(item.path) ? 'active' : ''
                    } ${expandedItems.has(item.id) && item.children ? 'expanded' : ''}`}
                    onClick={() => {
                      if (item.children) {
                        toggleItem(item.id);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                  >
                    {item.icon}
                    <span className="menu-item-label">{item.label}</span>
                    {item.badge && (
                      <span className={`menu-item-badge ${item.badgeType || ''}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.children && <ChevronDownIcon />}
                  </button>

                  {/* Submenu (Level 2) */}
                  {item.children && (
                    <div className={`submenu ${expandedItems.has(item.id) ? 'open' : ''}`}>
                      {item.children.map((subItem) => (
                        <div key={subItem.id} className="submenu-item">
                          <button
                            className={`submenu-item-button ${
                              isActive(subItem.path) ? 'active' : ''
                            } ${expandedSubItems.has(subItem.id) && subItem.children ? 'expanded' : ''}`}
                            onClick={() => {
                              if (subItem.children) {
                                toggleSubItem(subItem.id);
                              } else {
                                handleNavigation(subItem.path);
                              }
                            }}
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className={`menu-item-badge ${subItem.badgeType || ''}`}>
                                {subItem.badge}
                              </span>
                            )}
                            {subItem.children && (
                              <svg className="submenu-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {/* Nested Submenu (Level 3) */}
                          {subItem.children && (
                            <div className={`nested-submenu ${expandedSubItems.has(subItem.id) ? 'open' : ''}`}>
                              {subItem.children.map((nestedItem) => (
                                <button
                                  key={nestedItem.id}
                                  className={`nested-submenu-item-button ${
                                    isActive(nestedItem.path) ? 'active' : ''
                                  }`}
                                  onClick={() => handleNavigation(nestedItem.path)}
                                >
                                  {nestedItem.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="drawer-footer">
          <div className="drawer-user">
            <div className="drawer-user-avatar">RP</div>
            <div className="drawer-user-info">
              <div className="drawer-user-name">Rick Prata</div>
              <div className="drawer-user-role">Administrador</div>
            </div>
            <MoreVerticalIcon />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Drawer;

// Export a hook for easier drawer state management
export const useDrawer = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};
