import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { DrawerConfig } from '../../types/menuTypes';
import './Drawer.css';

// Internal Icons
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

// Props Interface
interface DrawerProps {
  config: DrawerConfig;
  isOpen: boolean;
  onClose: () => void;
  defaultExpanded?: string[];
}

// Drawer Component
const Drawer: React.FC<DrawerProps> = ({ 
  config, 
  isOpen, 
  onClose, 
  defaultExpanded = [] 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(defaultExpanded));
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
      navigate(path);
      // If on mobile, close the drawer
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  const { logo, user, sections } = config;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="drawer-toggle-btn" onClick={onClose}>
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
          {logo && (
            <div className="drawer-logo">
              {logo.icon && <div className="drawer-logo-icon">{logo.icon}</div>}
              <div className="drawer-logo-text">
                {logo.text}
                {logo.highlight && <span>{logo.highlight}</span>}
              </div>
            </div>
          )}
          <button className="drawer-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <nav className="drawer-content">
          {sections.map((section) => (
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
        {user && (
          <div className="drawer-footer">
            <div className="drawer-user">
              <div className="drawer-user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  user.initials || user.name.charAt(0)
                )}
              </div>
              <div className="drawer-user-info">
                <div className="drawer-user-name">{user.name}</div>
                <div className="drawer-user-role">{user.role}</div>
              </div>
              <MoreVerticalIcon />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Drawer;

// Export hook for drawer state management
export const useDrawer = (initialState = true) => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};
