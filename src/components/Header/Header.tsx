import './Header.css';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { toggleTheme, isDark } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <FontAwesomeIcon icon={faBars} />
        </button>

        <nav className="header-nav">
          <Link to="/" className="header-link">Home</Link>
          <Link to="/usuarios" className="header-link">Usuários</Link>
        </nav>
      </div>

      <div className="header-right">
        {user && <span className="user-name">{user.name}</span>}

        <button onClick={toggleTheme} className="theme-toggle">
          <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
        </button>

        <button onClick={handleLogout} className="btn-logout" title="Sair">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </header>
  );
};

export default Header;
