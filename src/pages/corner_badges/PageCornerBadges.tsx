// src/pages/corner_badges/PageCornerBadges.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCornerBadgesController } from './useCornerBadgesController';
import './corner_badges.css';

const PageCornerBadges = () => {
  const { cornerBadges, loading, error, deleteCornerBadge } = useCornerBadgesController();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    setDeleteError(null);
    
    const result = await deleteCornerBadge(id);
    
    if (result.success) {
      setDeleteConfirm(null);
      setDeleteError(null);
    } else {
      setDeleteError(result.error || 'Erro ao deletar corner badge');
    }
    
    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  if (loading && cornerBadges.length === 0) {
    return (
      <div className="corner-badges-page">
        <div className="loading-state">Carregando corner badges...</div>
      </div>
    );
  }

  return (
    <div className="corner-badges-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Corner Badges</h1>
          <span className="category-count">{cornerBadges.length} badges</span>
        </div>
        
        <Link to="/produtos/corner-badges/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Corner Badge
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Table */}
      {cornerBadges.length > 0 ? (
        <div className="table-container">
          <table className="corner-badges-table">
            <thead>
              <tr>
                <th className="th-preview">Preview</th>
                <th className="th-name">Nome</th>
                <th className="th-gradient">Gradiente CSS</th>
                <th className="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cornerBadges.map((cornerBadge) => (
                <tr key={cornerBadge.id}>
                  {/* Preview */}
                  <td className="td-preview">
                    <span 
                      className="corner-badge-preview-inline"
                      style={{ 
                        background: cornerBadge.bg_gradient
                      }}
                    >
                      {cornerBadge.name}
                    </span>
                  </td>

                  {/* Nome */}
                  <td className="td-name">
                    <span className="corner-badge-name-text">{cornerBadge.name}</span>
                  </td>

                  {/* Gradiente */}
                  <td className="td-gradient">
                    <code className="gradient-code">{cornerBadge.bg_gradient}</code>
                  </td>

                  {/* Ações */}
                  <td className="td-actions">
                    <div className="table-actions">
                      <Link 
                        to={`/produtos/corner-badges/${cornerBadge.id}/editar`} 
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
                        onClick={() => setDeleteConfirm(cornerBadge.id)}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        /* Empty State */
        <div className="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3>Nenhum corner badge cadastrado</h3>
          <p>Comece criando seu primeiro corner badge</p>
          <Link to="/produtos/corner-badges/novo" className="btn btn-primary">
            Novo Corner Badge
          </Link>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir este corner badge?</p>
              
              {deleteError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <div>{deleteError}</div>
                </div>
              )}

              {!deleteError && (
                <div className="modal-warning">
                  ⚠️ Esta ação não pode ser desfeita. Se houver cursos usando este corner badge, a exclusão será bloqueada.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={closeModal}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageCornerBadges;
