// src/pages/instructors/PageInstructors.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInstructorsController } from './useInstructorsController';
import './instructors.css';

const PageInstructors = () => {
  const { instructors, loading, error, deleteInstructor } = useInstructorsController();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    setDeleteError(null);
    
    const result = await deleteInstructor(id);
    
    if (result.success) {
      setDeleteConfirm(null);
      setDeleteError(null);
    } else {
      setDeleteError(result.error || 'Erro ao deletar instrutor');
    }
    
    setDeleting(false);
  };

  const closeModal = () => {
    setDeleteConfirm(null);
    setDeleteError(null);
  };

  if (loading && instructors.length === 0) {
    return (
      <div className="instructors-page">
        <div className="loading-state">Carregando instrutores...</div>
      </div>
    );
  }

  return (
    <div className="instructors-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Instrutores</h1>
          <span className="instructor-count">{instructors.length} instrutores</span>
        </div>
        
        <Link to="/usuarios/instrutores/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Instrutor
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
      {instructors.length > 0 ? (
        <div className="table-container">
          <table className="instructors-table">
            <thead>
              <tr>
                <th className="th-avatar">Avatar</th>
                <th className="th-name">Nome</th>
                <th className="th-slug">Slug</th>
                <th className="th-stats">Estatísticas</th>
                <th className="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor) => (
                <tr key={instructor.id}>
                  {/* Avatar */}
                  <td className="td-avatar">
                    <div className="instructor-avatar">
                      {instructor.avatar_url ? (
                        <img src={instructor.avatar_url} alt={instructor.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {instructor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nome */}
                  <td className="td-name">
                    <div className="instructor-info">
                      <span className="instructor-name-text">{instructor.name}</span>
                      {instructor.bio_short && (
                        <span className="instructor-bio-short">{instructor.bio_short}</span>
                      )}
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="td-slug">
                    <code className="instructor-slug-code">/{instructor.slug}</code>
                  </td>

                  {/* Estatísticas */}
                  <td className="td-stats">
                    <div className="instructor-stats">
                      {instructor.total_courses !== null && (
                        <span className="stat-badge courses">
                          📚 {instructor.total_courses} {instructor.total_courses === 1 ? 'curso' : 'cursos'}
                        </span>
                      )}
                      {instructor.total_students !== null && (
                        <span className="stat-badge students">
                          👥 {instructor.total_students} {instructor.total_students === 1 ? 'aluno' : 'alunos'}
                        </span>
                      )}
                      {instructor.avg_rating !== null && (
                        <span className="stat-badge rating">
                          ⭐ {instructor.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="td-actions">
                    <div className="table-actions">
                      <Link 
                        to={`/usuarios/instrutores/${instructor.id}/editar`} 
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
                        onClick={() => setDeleteConfirm(instructor.id)}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3>Nenhum instrutor cadastrado</h3>
          <p>Comece adicionando seu primeiro instrutor</p>
          <Link to="/produtos/instrutores/novo" className="btn btn-primary">
            Novo Instrutor
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
              <p>Tem certeza que deseja excluir este instrutor?</p>
              
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
                  ⚠️ Esta ação não pode ser desfeita. Se houver cursos associados a este instrutor, a exclusão será bloqueada.
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

export default PageInstructors;