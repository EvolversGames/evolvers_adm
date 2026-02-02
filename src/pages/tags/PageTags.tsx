// src/pages/tags/PageTags.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTagsController } from './useTagsController';
import './tags.css';

const PageTags = () => {
  const { tags, loading, error, deleteTag } = useTagsController();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    setDeleteError(null);
    
    const result = await deleteTag(id);
    
    if (result.success) {
      setDeleteConfirm(null);
      setDeleteError(null);
    } else {
      setDeleteError(result.error || 'Erro ao deletar tag');
    }
    
    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  if (loading && tags.length === 0) {
    return (
      <div className="tags-page">
        <div className="loading-state">Carregando tags...</div>
      </div>
    );
  }

  return (
    <div className="tags-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Tags</h1>
          <span className="tag-count">{tags.length} tags</span>
        </div>
        
        <Link to="/produtos/tags/nova" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Tag
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
      {tags.length > 0 ? (
        <div className="table-container">
          <table className="tags-table">
            <thead>
              <tr>
                <th className="th-name">Nome</th>
                <th className="th-slug">Slug</th>
                <th className="th-usage">Usos</th>
                <th className="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  {/* Nome */}
                  <td className="td-name">
                    <span className="tag-name-text">{tag.name}</span>
                  </td>

                  {/* Slug */}
                  <td className="td-slug">
                    <code className="tag-slug-code">/{tag.slug}</code>
                  </td>

                  {/* Contador de uso */}
                  <td className="td-usage">
                    <span className="tag-usage-badge">
                      {tag.usage_count}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="td-actions">
                    <div className="table-actions">
                      <Link 
                        to={`/produtos/tags/${tag.id}/editar`} 
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
                        onClick={() => setDeleteConfirm(tag.id)}
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
          <h3>Nenhuma tag cadastrada</h3>
          <p>Comece criando sua primeira tag</p>
          <Link to="/produtos/tags/nova" className="btn btn-primary">
            Nova Tag
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
              <p>Tem certeza que deseja excluir esta tag?</p>
              
              {/* Erro validado pelo apiErrorValidator */}
              {deleteError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <div>{deleteError}</div>
                </div>
              )}

              {/* Aviso apenas se não houver erro */}
              {!deleteError && (
                <div className="modal-warning">
                  ⚠️ Esta ação não pode ser desfeita. Se houver cursos/artigos/assets associados a esta tag, a exclusão será bloqueada.
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

export default PageTags;
