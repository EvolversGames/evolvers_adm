import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSoftwaresController } from './useSoftwaresController';
import { getIconByName } from '../../utils/icon_helper';
import '../categories/categories.css'; // reutiliza o mesmo css

const PageSoftwares = () => {
  const { softwares, loading, error, deleteSoftware } = useSoftwaresController();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    setDeleteError(null);

    const result = await deleteSoftware(id);

    if (result.success) {
      setDeleteConfirm(null);
      setDeleteError(null);
    } else {
      setDeleteError(result.error || 'Erro ao deletar software');
    }

    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  if (loading && softwares.length === 0) {
    return (
      <div className="categories-page">
        <div className="loading-state">Carregando softwares...</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Softwares</h1>
          <span className="category-count">{softwares.length} softwares</span>
        </div>

        <Link to="/produtos/softwares/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Software
        </Link>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {softwares.length > 0 ? (
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th className="th-icon">Ícone</th>
                <th className="th-name">Nome</th>
                <th className="th-slug">Slug</th>
                <th className="th-order">Ordem</th>
                <th className="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {softwares.map((software) => {
                const iconDef = getIconByName(software.icon || 'faCube');

                return (
                  <tr key={software.id}>
                    <td className="td-icon">
                      <div
                        className="table-category-icon"
                        style={{ backgroundColor: software.color || '#6366f1' }}
                      >
                        <FontAwesomeIcon icon={iconDef} />
                      </div>
                    </td>

                    <td className="td-name">
                      <span className="category-name-text">{software.name}</span>
                    </td>

                    <td className="td-slug">
                      <code className="category-slug-code">/{software.slug}</code>
                    </td>

                    <td className="td-order">
                      <span className="category-order-badge">{software.sort_order}</span>
                    </td>

                    <td className="td-actions">
                      <div className="table-actions">
                        <Link
                          to={`/produtos/softwares/${software.id}/editar`}
                          className="action-btn edit"
                          title="Editar"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        <button
                          className="action-btn delete"
                          title="Deletar"
                          onClick={() => setDeleteConfirm(software.id)}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 100 20 10 10 0 000-20zm3 10H9" />
          </svg>
          <h3>Nenhum software cadastrado</h3>
          <p>Comece criando seu primeiro software</p>
          <Link to="/produtos/softwares/novo" className="btn btn-primary">
            Novo Software
          </Link>
        </div>
      ) : null}

      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir este software?</p>

              {deleteError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <div>{deleteError}</div>
                </div>
              )}

              {!deleteError && (
                <div className="modal-warning">
                  ⚠️ Esta ação não pode ser desfeita. Se houver cursos/assets associados, a exclusão será bloqueada.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSoftwares;
