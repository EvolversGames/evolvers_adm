// frontend/src/pages/admin/Bundles/PageBundles.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBundlesController } from './useBundlesController';
import './bundles_new.css';

const ITEMS_PER_PAGE = 10;

export const PageBundles: React.FC = () => {
  const { bundles, counts, loading, error, statusFilter, setStatusFilter, deleteBundle } =
    useBundlesController();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros adicionais
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const unique = [...new Set(
      bundles.map((b: any) => b.category_name ?? b.category).filter(Boolean)
    )];
    return unique.sort();
  }, [bundles]);

  // Aplicar filtros de busca e categoria sobre bundles (já filtrado por status)
  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle: any) => {
      if (searchFilter) {
        const search = searchFilter.toLowerCase();
        const matchesSearch =
          bundle.title?.toLowerCase().includes(search) ||
          bundle.subtitle?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (categoryFilter !== 'all') {
        const cat = bundle.category_name ?? bundle.category;
        if (cat !== categoryFilter) return false;
      }

      return true;
    });
  }, [bundles, searchFilter, categoryFilter]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchFilter, categoryFilter, bundles.length]);

  const totalPages = Math.ceil(filteredBundles.length / ITEMS_PER_PAGE);

  const paginatedBundles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBundles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBundles, currentPage]);

  const showMessage = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteBundle(deleteConfirm.id);
      setDeleteConfirm(null);
      setDeleteError(null);
      showMessage('success', 'Bundle deletado com sucesso!');
      // Volta uma página se ficou vazia
      if (paginatedBundles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao deletar bundle');
    }

    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  if (loading) {
    return (
      <div className="bundles-page">
        <div className="page-header">
          <h1 className="page-title">Carregando bundles...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bundles-page">
        <div className="page-header">
          <h1 className="page-title">Erro ao carregar bundles</h1>
        </div>
        <div style={{ padding: 20, color: '#ef4444' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="bundles-page">
      {/* Toast */}
      {showToast && (
        <div className="toast">
          {toastType === 'success' ? '✓' : '✕'} {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Bundles</h1>
          <span className="product-count">
            {filteredBundles.length === bundles.length
              ? `${bundles.length} exibidos | ${counts.total} total`
              : `${filteredBundles.length} de ${bundles.length} exibidos | ${counts.total} total`}
          </span>

          <div className="bundle-filters" role="group" aria-label="Filtro de status">
            <button
              type="button"
              className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Ativos ({counts.active})
            </button>
            <button
              type="button"
              className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setStatusFilter('inactive')}
            >
              Inativos ({counts.inactive})
            </button>
            <button
              type="button"
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Todos ({counts.total})
            </button>
          </div>
        </div>

        <Link to="/produtos/bundle/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Bundle
        </Link>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="search-box">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar bundles..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Bundles Table */}
      <div className="bundles-table-container">
        <table className="bundles-table">
          <thead>
            <tr>
              <th>Bundle</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Desconto</th>
              <th>Items</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {paginatedBundles.map((bundle: any) => {
              console.log('BUNDLE OBJ:', bundle);
              // ✅ AQUI É O PONTO: vem do MySQL como tinyint(1) => 0/1
             const isActive = Number((bundle.is_active ?? bundle.active) ?? 0) === 1;
             const isFeatured = Number((bundle.is_featured ?? bundle.featured) ?? 0) === 1;

              return (
                <tr key={bundle.id}>
                  <td>
                    <div className="product-cell">
                      <img
                        src={bundle.image}
                        alt={bundle.title}
                        className="product-thumb"
                        onError={(e) => {
                        e.currentTarget.onerror = null; // evita loop infinito
                        e.currentTarget.src =
                          'data:image/svg+xml;utf8,' +
                          encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="120">
                              <rect width="100%" height="100%" fill="#111827"/>
                              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                                fill="#9CA3AF" font-family="Arial" font-size="14">
                                Sem imagem
                              </text>
                            </svg>
                          `);
                      }}

                      />
                      <div className="product-info">
                        <div className="product-title">{bundle.title}</div>
                        {bundle.subtitle && <div className="product-slug">{bundle.subtitle}</div>}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="category-name">  {bundle.category_name ?? bundle.category ?? 'N/A'}</span>
                  </td>

                  <td>
                    <div className="price-cell">
                      <div className="current-price">R$ {Number(bundle.price).toFixed(2)}</div>
                      {bundle.original_price && Number(bundle.original_price) > Number(bundle.price) && (
                        <div className="original-price">R$ {Number(bundle.original_price).toFixed(2)}</div>
                      )}
                    </div>
                  </td>

                  <td>
                    {bundle.original_price && Number(bundle.original_price) > Number(bundle.price) ? (
                      <span className="discount-badge">
                        -{Math.round((1 - Number(bundle.price) / Number(bundle.original_price)) * 100)}%
                      </span>
                    ) : (
                      <span className="no-discount">—</span>
                    )}
                  </td>

                  <td>
                <span className="items-count">
                      {Number(
                        bundle.items_count ??
                        bundle.itemsCount ??
                        bundle.items?.length ??
                        0
                      )} produtos
                    </span>
                  </td>

                  <td>
                    <div className="status-badges">
                      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Ativo' : 'Inativo'}
                      </span>

                      {isFeatured && <span className="featured-badge">⭐ Destaque</span>}
                    </div>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/produtos/bundle/${bundle.id}/editar`}
                        className="action-btn edit"
                        title="Editar"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>

                      <button
                        className="action-btn delete"
                        onClick={() => setDeleteConfirm({ id: bundle.id, title: bundle.title })}
                        title="Deletar"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredBundles.length === 0 && (
          <div className="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3>Nenhum bundle encontrado</h3>
            <p>Comece criando seu primeiro bundle</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir o bundle <strong>"{deleteConfirm.title}"</strong>?
              </p>

              {deleteError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <div>{deleteError}</div>
                </div>
              )}

              {!deleteError && <div className="modal-warning">⚠️ Esta ação não pode ser desfeita.</div>}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
