// src/pages/categories/PageCategories.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCategoriesController } from './useCategoriesController';
import { getIconByName } from '../../utils/icon_helper';
import './categories.css';

const PageCategories = () => {
  const { categories, loading, error, deleteCategory } = useCategoriesController();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    setDeleteError(null);
    
    // ✅ Usa o validator através do controller
    const result = await deleteCategory(id);
    
    if (result.success) {
      setDeleteConfirm(null);
      setDeleteError(null);
    } else {
      // ✅ Erro vem validado do apiErrorValidator
      setDeleteError(result.error || 'Erro ao deletar categoria');
    }
    
    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="categories-page">
        <div className="loading-state">Carregando categorias...</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Categorias</h1>
          <span className="category-count">{categories.length} categorias</span>
        </div>
        
        <Link to="/produtos/categorias/nova" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Categoria
        </Link>
      </div>

      {/* Error Message (genérico - aparece no topo da página) */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Table */}
      {categories.length > 0 ? (
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th className="th-icon">Ícone</th>
                <th className="th-name">Nome</th>
                <th className="th-slug">Slug</th>
                <th className="th-description">Descrição</th>
                <th className="th-order">Ordem</th>
                <th className="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const iconDef = getIconByName(category.icon || 'faFolder');
                
                return (
                  <tr key={category.id}>
                    {/* Ícone */}
                    <td className="td-icon">
                      <div 
                        className="table-category-icon"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      >
                        <FontAwesomeIcon icon={iconDef} />
                      </div>
                    </td>

                    {/* Nome */}
                    <td className="td-name">
                      <span className="category-name-text">{category.name}</span>
                    </td>

                    {/* Slug */}
                    <td className="td-slug">
                      <code className="category-slug-code">/{category.slug}</code>
                    </td>

                    {/* Descrição */}
                    <td className="td-description">
                      <span className="category-description-text">
                        {category.description || '—'}
                      </span>
                    </td>

                    {/* Ordem */}
                    <td className="td-order">
                      <span className="category-order-badge">{category.sort_order}</span>
                    </td>

                    {/* Ações */}
                    <td className="td-actions">
                      <div className="table-actions">
                        <Link 
                          to={`/produtos/categorias/${category.id}/editar`} 
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
                          onClick={() => setDeleteConfirm(category.id)}
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
        /* Empty State */
        <div className="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3>Nenhuma categoria cadastrada</h3>
          <p>Comece criando sua primeira categoria</p>
          <Link to="/produtos/categorias/nova" className="btn btn-primary">
            Nova Categoria
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
              <p>Tem certeza que deseja excluir esta categoria?</p>
              
              {/* ✅ Erro validado pelo apiErrorValidator */}
              {deleteError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <div>{deleteError}</div>
                </div>
              )}

              {/* Aviso apenas se não houver erro */}
              {!deleteError && (
                <div className="modal-warning">
                  ⚠️ Esta ação não pode ser desfeita. Se houver cursos associados a esta categoria, a exclusão será bloqueada.
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

export default PageCategories;