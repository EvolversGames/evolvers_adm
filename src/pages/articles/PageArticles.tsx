// src/pages/articles/PageArticles.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useArticlesController } from './useArticlesController';
import './articles.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const PageArticles = () => {
  const { articles, loading, error, deleteArticle } = useArticlesController();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtros
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'featured' | 'normal'>('all');

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const unique = [...new Set(articles.map(a => a.category).filter(Boolean))];
    return unique.sort();
  }, [articles]);

  // Aplicar filtros
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Busca por texto
      if (searchFilter) {
        const search = searchFilter.toLowerCase();
        const matchesSearch =
          article.title.toLowerCase().includes(search) ||
          article.excerpt?.toLowerCase().includes(search) ||
          article.author?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtro de categoria
      if (categoryFilter !== 'all') {
        if (article.category !== categoryFilter) return false;
      }

      // Filtro de status (destaque)
      if (statusFilter === 'featured' && !article.featured) return false;
      if (statusFilter === 'normal' && article.featured) return false;

      return true;
    });
  }, [articles, searchFilter, categoryFilter, statusFilter]);

  // Reset página ao mudar filtros ou quantidade por página
  useMemo(() => {
    setCurrentPage(1);
  }, [searchFilter, categoryFilter, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(start, start + itemsPerPage);
  }, [filteredArticles, currentPage, itemsPerPage]);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    setDeleteError(null);

    const result = await deleteArticle(id);

    if (result.success) {
      setDeleteConfirm(null);
      setDeleteError(null);
      // Volta uma página se ficou vazia
      if (paginatedArticles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      setDeleteError(result.error || 'Erro ao deletar artigo');
    }

    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="articles-page">
        <div className="loading-state">Carregando artigos...</div>
      </div>
    );
  }

  return (
    <div className="articles-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Artigos</h1>
          <span className="article-count">
            {filteredArticles.length === articles.length
              ? `${articles.length} artigos`
              : `${filteredArticles.length} de ${articles.length} artigos`}
          </span>
        </div>

        <Link to="/articles/article/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Artigo
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
            placeholder="Buscar artigos..."
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

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'featured' | 'normal')}
        >
          <option value="all">Todos os status</option>
          <option value="featured">Destaque</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Table */}
      {filteredArticles.length > 0 ? (
        <>
          <div className="table-container">
            <table className="articles-table">
              <thead>
                <tr>
                  <th className="th-image">Imagem</th>
                  <th className="th-title">Título</th>
                  <th className="th-author">Autor</th>
                  <th className="th-category">Categoria</th>
                  <th className="th-date">Publicação</th>
                  <th className="th-read-time">Leitura</th>
                  <th className="th-status">Status</th>
                  <th className="th-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.map((article) => (
                  <tr key={article.id}>
                    {/* Imagem */}
                    <td className="td-image">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="table-article-image"
                      />
                    </td>

                    {/* Título */}
                    <td className="td-title">
                      <div className="article-title-cell">
                        <span className="article-title-text">{article.title}</span>
                        <span className="article-excerpt">{article.excerpt}</span>
                      </div>
                    </td>

                    {/* Autor */}
                    <td className="td-author">
                      <div className="author-cell">
                        {article.authorAvatar && (
                          <img
                            src={article.authorAvatar}
                            alt={article.author}
                            className="author-avatar"
                          />
                        )}
                        <span>{article.author}</span>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="td-category">
                      <span
                        className="category-badge"
                        style={{
                          backgroundColor: `${article.categoryColor}20`,
                          color: article.categoryColor
                        }}
                      >
                        {article.categoryIcon} {article.category}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="td-date">
                      {formatDate(article.publishedDate)}
                    </td>

                    {/* Tempo de Leitura */}
                    <td className="td-read-time">
                      <span className="read-time-badge">
                        {article.readTime} min
                      </span>
                    </td>

                    {/* Status */}
                    <td className="td-status">
                      <span className={`status-badge status-${article.featured ? 'featured' : 'normal'}`}>
                        {article.featured ? '⭐ Destaque' : 'Normal'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="td-actions">
                      <div className="table-actions">
                     <Link
                          to={`/articles/article/${article.id}/editar`}
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
                          onClick={() => setDeleteConfirm(article.id)}
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

          {/* Paginação */}
          <div className="pagination-container">
            <div className="pagination-per-page">
              <label htmlFor="items-per-page">Exibir</label>
              <select
                id="items-per-page"
                className="per-page-select"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>por página</span>
            </div>

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

            <div className="pagination-info">
              {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredArticles.length)} de {filteredArticles.length}
            </div>
          </div>
        </>
      ) : !loading ? (
        /* Empty State */
        <div className="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>Nenhum artigo cadastrado</h3>
          <p>Comece criando seu primeiro artigo</p>
          <Link to="/articles/article/novo" className="btn btn-primary">
            Novo Artigo
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
              <p>Tem certeza que deseja excluir este artigo?</p>

              {deleteError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <div>{deleteError}</div>
                </div>
              )}

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

export default PageArticles;
