// src/pages/email-marketing/PageEmailCampaigns.tsx

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPlus,
  faTrash,
  faEye,
  faPaperPlane,
  faSync,
  faExclamationCircle,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { emailMarketingApi } from '../../data/email-marketing/emailMarketingApi';
import type { EmailCampaign } from '../../data/email-marketing/emailMarketingApi';
import './email-marketing.css';

export default function PageEmailCampaigns() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Modal de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<EmailCampaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState('');

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await emailMarketingApi.findAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });

      setCampaigns(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Auto-refresh para campanhas em andamento
  useEffect(() => {
    const hasSending = campaigns.some(c => c.status === 'sending');
    if (hasSending) {
      const interval = setInterval(() => {
        loadCampaigns();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [campaigns, loadCampaigns]);

  const handleDelete = async () => {
    if (!campaignToDelete) return;

    try {
      setDeleting(true);
      await emailMarketingApi.delete(campaignToDelete.id);
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      loadCampaigns();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar campanha');
    } finally {
      setDeleting(false);
    }
  };

  const handleSend = async (campaign: EmailCampaign) => {
    if (campaign.status === 'sending' || campaign.status === 'completed') return;

    try {
      await emailMarketingApi.send(campaign.id);
      loadCampaigns();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar campanha');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FontAwesomeIcon icon={faClock} className="status-icon draft" />;
      case 'sending':
        return <FontAwesomeIcon icon={faSpinner} className="status-icon sending" spin />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon completed" />;
      case 'failed':
        return <FontAwesomeIcon icon={faTimesCircle} className="status-icon failed" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'sending':
        return 'Enviando...';
      case 'completed':
        return 'Concluido';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilterLabel = (campaign: EmailCampaign) => {
    const parts: string[] = [];
    if (campaign.filter_role) {
      parts.push(campaign.filter_role === 'admin' ? 'Admins' : 'Usuarios');
    }
    if (campaign.filter_verified === true) {
      parts.push('Verificados');
    } else if (campaign.filter_verified === false) {
      parts.push('Nao verificados');
    }
    return parts.length > 0 ? parts.join(', ') : 'Todos';
  };

  return (
    <div className="email-campaigns-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <FontAwesomeIcon icon={faEnvelope} className="page-header-icon" />
          <div>
            <h1 className="page-title">Email Marketing</h1>
            <p className="page-subtitle">Envie mensagens para seus usuarios</p>
          </div>
        </div>
        <Link to="/email-marketing/nova" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} />
          Nova Campanha
        </Link>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
        >
          <option value="">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="sending">Enviando</option>
          <option value="completed">Concluido</option>
          <option value="failed">Falhou</option>
        </select>

        <button className="btn btn-secondary" onClick={loadCampaigns}>
          <FontAwesomeIcon icon={faSync} />
          Atualizar
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          Carregando campanhas...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faEnvelope} size="4x" />
          <h3>Nenhuma campanha encontrada</h3>
          <p>Crie sua primeira campanha de email marketing</p>
          <Link to="/email-marketing/nova" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} />
            Nova Campanha
          </Link>
        </div>
      ) : (
        <>
          {/* Tabela */}
          <div className="table-container">
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th className="th-status">Status</th>
                  <th className="th-subject">Assunto</th>
                  <th className="th-filter">Filtro</th>
                  <th className="th-recipients">Destinatarios</th>
                  <th className="th-progress">Progresso</th>
                  <th className="th-date">Data</th>
                  <th className="th-actions">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="td-status">
                      <div className={`status-badge ${campaign.status}`}>
                        {getStatusIcon(campaign.status)}
                        {getStatusLabel(campaign.status)}
                      </div>
                    </td>
                    <td className="td-subject">
                      <span className="campaign-subject">{campaign.subject}</span>
                      {campaign.created_by_name && (
                        <span className="campaign-creator">por {campaign.created_by_name}</span>
                      )}
                    </td>
                    <td className="td-filter">
                      <span className="filter-badge">{getFilterLabel(campaign)}</span>
                    </td>
                    <td className="td-recipients">
                      <span className="recipients-count">{campaign.recipients_count}</span>
                    </td>
                    <td className="td-progress">
                      {campaign.status === 'sending' || campaign.status === 'completed' || campaign.status === 'failed' ? (
                        <div className="progress-info">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar"
                              style={{
                                width: campaign.recipients_count > 0
                                  ? `${((campaign.sent_count + campaign.failed_count) / campaign.recipients_count) * 100}%`
                                  : '0%'
                              }}
                            />
                          </div>
                          <span className="progress-text">
                            {campaign.sent_count}/{campaign.recipients_count}
                            {campaign.failed_count > 0 && (
                              <span className="failed-count"> ({campaign.failed_count} falhas)</span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="no-progress">-</span>
                      )}
                    </td>
                    <td className="td-date">
                      <span className="date-text">{formatDate(campaign.created_at)}</span>
                    </td>
                    <td className="td-actions">
                      <div className="table-actions">
                        <Link
                          to={`/email-marketing/${campaign.id}`}
                          className="action-btn view"
                          title="Ver detalhes"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        {campaign.status === 'draft' && (
                          <button
                            className="action-btn send"
                            title="Enviar"
                            onClick={() => handleSend(campaign)}
                          >
                            <FontAwesomeIcon icon={faPaperPlane} />
                          </button>
                        )}
                        {campaign.status !== 'sending' && (
                          <button
                            className="action-btn delete"
                            title="Deletar"
                            onClick={() => {
                              setCampaignToDelete(campaign);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginacao */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Anterior
              </button>
              <span className="pagination-info">
                Pagina {pagination.page} de {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Proxima
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmacao de exclusao */}
      {showDeleteModal && campaignToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusao</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir a campanha <strong>"{campaignToDelete.subject}"</strong>?
              </p>
              <p className="modal-warning">
                Esta acao nao pode ser desfeita.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
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
}
