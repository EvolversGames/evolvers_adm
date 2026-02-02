// src/pages/products/PageProducts.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './products.css';
import { useProductsController } from './useProductsController';
import { calculateDiscount } from '../../domain/products/products.mapper';
import type { ProductType } from '../../domain/products/products';

type ProductStatus = 'all' | 'active' | 'inactive';

const ITEMS_PER_PAGE = 10;

const PageProducts = () => {
  const {
    products,
    loading,
    error,
    filters,
    updateFilters,
    deleteProduct,
    reload
  } = useProductsController();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [products.length]);

  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
    
    const success = await deleteProduct(deleteConfirm.id);

    if (success) {
      setDeleteConfirm(null);
      setDeleteError(null);
      showMessage('success', 'Produto deletado com sucesso!');
      // Volta uma página se ficou vazia
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      setDeleteError(error || 'Erro ao deletar produto');
    }
    
    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  // ✅ FUNÇÃO PARA GERAR ROTA DE EDIÇÃO BASEADA NO TIPO
  const getEditRoute = (productType: ProductType, id: number): string => {
    const typeRoutes: Record<ProductType, string> = {
      course: `/produtos/course/${id}/editar`,
      asset: `/produtos/asset/${id}/editar`,
      software: `/produtos/software/${id}/editar`,
      bundle: `/produtos/bundle/${id}/editar`,
      article: `/produtos/artigo/${id}/editar`,
    };
    return typeRoutes[productType];
  };

  // ✅ FUNÇÃO PARA GERAR ROTA DE VISUALIZAÇÃO BASEADA NO TIPO
  const getViewRoute = (productType: ProductType, id: number): string => {
    const typeRoutes: Record<ProductType, string> = {
      course: `/produtos/course/${id}`,
      asset: `/produtos/asset/${id}`,
      software: `/produtos/software/${id}`,
      bundle: `/produtos/bundle/${id}`,
      article: `/produtos/artigo/${id}`,
    };
    return typeRoutes[productType];
  };

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      course: 'Curso',
      asset: 'Asset',
      software: 'Software',
      bundle: 'Bundle',
      article: 'Artigo',
    };
    return labels[type] || type;
  };

  const getProductTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      course: 'badge-primary',
      asset: 'badge-success',
      software: 'badge-warning',
      bundle: 'badge-info',
      article: 'badge-secondary',
    };
    return classes[type] || 'badge-primary';
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="page-header">
          <h1 className="page-title">Carregando produtos...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="page-header">
          <h1 className="page-title">Erro ao carregar produtos</h1>
        </div>
        <div style={{ padding: 20, color: '#ef4444' }}>
          {error}
          <button 
            onClick={reload} 
            style={{ marginLeft: 10, padding: '8px 16px', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Toast */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            padding: '16px 24px',
            borderRadius: 8,
            background: toastType === 'success' ? '#22c55e' : '#ef4444',
            color: 'white',
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Produtos</h1>
          <span className="product-count">{products.length} produtos</span>
        </div>
        
        <Link to="/produtos/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar produtos..."
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        <select 
          className="filter-select"
          value={filters.type || 'all'}
          onChange={(e) => updateFilters({ type: e.target.value as ProductType | 'all' })}
        >
          <option value="all">Todos os tipos</option>
          <option value="course">Cursos</option>
          <option value="asset">Assets</option>
          <option value="software">Software</option>
          <option value="bundle">Bundles</option>
          <option value="article">Artigos</option>
        </select>

        <select
          className="filter-select"
          value={filters.status || 'all'}
          onChange={(e) => updateFilters({ status: e.target.value as ProductStatus })}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        <select
          className="filter-select"
          value={filters.featured === undefined ? 'all' : filters.featured ? 'featured' : 'normal'}
          onChange={(e) => {
            const val = e.target.value;
            updateFilters({ featured: val === 'all' ? undefined : val === 'featured' });
          }}
        >
          <option value="all">Todos os destaques</option>
          <option value="featured">Destaque</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Preço</th>
              <th>Desconto</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="product-thumb"
                    onError={(e) => {
                            e.currentTarget.onerror = null;
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
                      <div className="product-title">{product.title}</div>
                      <div className="product-slug">{product.slug}</div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <span className={`badge ${getProductTypeBadgeClass(product.product_type)}`}>
                    {getProductTypeLabel(product.product_type)}
                  </span>
                </td>
                
                <td>
                  <div className="price-cell">
               <div className="current-price">{formatBRL(Number(product.price))}</div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="original-price">{formatBRL(Number(product.original_price))}</div>
                      )}
                  </div>
                </td>
                
                <td>
                  {product.original_price && product.original_price > product.price ? (
                    <span className="discount-badge">
                      -{calculateDiscount(product.price, product.original_price)}%
                    </span>
                  ) : (
                    <span className="no-discount">—</span>
                  )}
                </td>
                
                <td>
                  <div className="status-badges">
                    <span className={`status-badge ${product.active ? 'active' : 'inactive'}`}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                    {product.featured && (
                      <span className="featured-badge">⭐ Destaque</span>
                    )}
                  </div>
                </td>
                
                <td>
                  <div className="action-buttons">
                    {/* ✅ BOTÃO EDITAR COM ROTA DINÂMICA */}
                    <Link 
                      to={getEditRoute(product.product_type, product.id)} 
                      className="action-btn edit"
                      title="Editar"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    
                    {/* ✅ BOTÃO VER COM ROTA DINÂMICA */}
                    <Link 
                      to={getViewRoute(product.product_type, product.id)} 
                      className="action-btn view"
                      title="Visualizar"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    
                    {/* ✅ BOTÃO DELETAR - AGORA ABRE O MODAL */}
                    <button 
                      className="action-btn delete"
                      onClick={() => setDeleteConfirm({ id: product.id, title: product.title })}
                      title="Deletar"
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

        {products.length === 0 && (
          <div className="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3>Nenhum produto encontrado</h3>
            <p>Tente ajustar os filtros ou criar um novo produto</p>
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
      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir o produto <strong>"{deleteConfirm.title}"</strong>?</p>
              
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
                  ⚠️ Esta ação não pode ser desfeita.
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
                onClick={handleDelete}
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

export default PageProducts;
