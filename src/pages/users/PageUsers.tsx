// src/pages/users/PageUsers.tsx

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faPlus,
  faSearch,
  faPen,
  faTrash,
  faShieldAlt,
  faUser,
  faCheckCircle,
  faClock,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { usersApi } from '../../data/users/usersApi';
import type { User, UserFilters } from '../../data/users/usersApi';
import './users.css';

const PageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filtros
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal de confirmação
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });

  // Ref para debounce da busca
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Flag para evitar dupla chamada no mount
  const isFirstRender = useRef(true);

  const loadUsers = async (filters: UserFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersApi.findAll({
        page: filters.page ?? 1,
        limit: filters.limit ?? pagination.limit,
        search: filters.search ?? '',
        role: filters.role ?? '',
        status: filters.status ?? '',
      });
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError(err?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Carrega inicial
  useEffect(() => {
    loadUsers({ page: 1, limit: 10, search: '', role: '', status: '' });
  }, []);

  // Recarrega quando filtros de select mudam (nao search - tem debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadUsers({ page: 1, limit: pagination.limit, search, role: roleFilter, status: statusFilter });
  }, [roleFilter, statusFilter]);

  // Debounce para busca por texto
  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadUsers({
        page: 1,
        limit: pagination.limit,
        search: value,
        role: roleFilter,
        status: statusFilter,
      });
    }, 400);
  };

  const handleSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    loadUsers({ page: 1, limit: pagination.limit, search, role: roleFilter, status: statusFilter });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage: number) => {
    loadUsers({ page: newPage, limit: pagination.limit, search, role: roleFilter, status: statusFilter });
  };

  const reloadCurrentPage = () => {
    loadUsers({ page: pagination.page, limit: pagination.limit, search, role: roleFilter, status: statusFilter });
  };

  const handleRoleChange = async (user: User) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await usersApi.changeRole(user.id, newRole);
      reloadCurrentPage();
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar role');
    }
  };

  const handleToggleVerification = async (user: User) => {
    try {
      await usersApi.toggleVerification(user.id);
      reloadCurrentPage();
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar verificação');
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ open: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      await usersApi.delete(deleteModal.user.id);
      setDeleteModal({ open: false, user: null });
      reloadCurrentPage();
    } catch (err: any) {
      alert(err?.message || 'Erro ao remover usuário');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-header-left">
          <FontAwesomeIcon icon={faUsers} className="users-header-icon" />
          <div>
            <h1>Usuarios</h1>
            <p className="users-subtitle">Gerencie os usuarios do sistema</p>
          </div>
        </div>
        <Link to="/usuarios/novo" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} />
          <span>Novo Usuario</span>
        </Link>
      </header>

      {/* Filtros */}
      <section className="users-filters">
        <div className="filter-search">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas as roles</option>
          <option value="admin">Admin</option>
          <option value="user">Usuario</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos os status</option>
          <option value="verified">Verificados</option>
          <option value="pending">Pendentes</option>
        </select>
        <button onClick={handleSearch} className="btn btn-secondary">
          Filtrar
        </button>
      </section>

      {/* Tabela */}
      {loading ? (
        <div className="users-loading">
          <div className="spinner"></div>
          <p>Carregando usuarios...</p>
        </div>
      ) : error ? (
        <div className="users-error">
          <p>{error}</p>
          <button onClick={reloadCurrentPage} className="btn btn-primary">
            Tentar novamente
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="users-empty">
          <FontAwesomeIcon icon={faUsers} />
          <p>Nenhum usuario encontrado</p>
        </div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleRoleChange(user)}
                        className={`role-badge ${user.role}`}
                        title="Clique para alterar role"
                      >
                        <FontAwesomeIcon icon={user.role === 'admin' ? faShieldAlt : faUser} />
                        <span>{user.role === 'admin' ? 'Admin' : 'Usuario'}</span>
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleVerification(user)}
                        className={`status-badge ${user.email_verified_at ? 'verified' : 'pending'}`}
                        title="Clique para alterar verificacao"
                      >
                        <FontAwesomeIcon icon={user.email_verified_at ? faCheckCircle : faClock} />
                        <span>{user.email_verified_at ? 'Verificado' : 'Pendente'}</span>
                      </button>
                    </td>
                    <td className="date-cell">{formatDate(user.created_at)}</td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          to={`/usuarios/${user.id}/editar`}
                          className="action-btn edit"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="action-btn delete"
                          title="Remover"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="users-pagination">
              <span className="pagination-info">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} usuarios
              </span>
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 2
                  )
                  .map((page, index, arr) => {
                    const showEllipsis = index > 0 && arr[index - 1] !== page - 1;
                    return (
                      <span key={page}>
                        {showEllipsis && (
                          <span className="pagination-ellipsis">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`pagination-btn ${pagination.page === page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="pagination-btn"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar exclusao</h3>
            <p>
              Tem certeza que deseja remover o usuario{' '}
              <strong>{deleteModal.user?.name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageUsers;
