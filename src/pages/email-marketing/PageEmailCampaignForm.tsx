// src/pages/email-marketing/PageEmailCampaignForm.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPaperPlane,
  faSave,
  faArrowLeft,
  faUsers,
  faEye,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { emailMarketingApi } from '../../data/email-marketing/emailMarketingApi';
import type { EmailCampaign } from '../../data/email-marketing/emailMarketingApi';
import './email-marketing.css';

export default function PageEmailCampaignForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Form state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterVerified, setFilterVerified] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Recipients count
  const [recipientsCount, setRecipientsCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Campaign data (for viewing)
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);

  // Load campaign if editing/viewing
  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await emailMarketingApi.findById(parseInt(id!));
      setCampaign(data);
      setSubject(data.subject);
      setContent(data.content);
      setFilterRole(data.filter_role || '');
      setFilterVerified(data.filter_verified !== null ? (data.filter_verified ? 'true' : 'false') : '');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar campanha');
    } finally {
      setLoading(false);
    }
  };

  // Count recipients when filters change
  const countRecipients = useCallback(async () => {
    try {
      setCountLoading(true);
      const count = await emailMarketingApi.countRecipients({
        role: filterRole || undefined,
        verified: filterVerified ? filterVerified === 'true' : undefined,
      });
      setRecipientsCount(count);
    } catch (err) {
      console.error('Erro ao contar destinatarios:', err);
    } finally {
      setCountLoading(false);
    }
  }, [filterRole, filterVerified]);

  useEffect(() => {
    countRecipients();
  }, [countRecipients]);

  // Handle preview
  const handlePreview = async () => {
    if (!content.trim()) {
      setError('Digite o conteudo do email para visualizar');
      return;
    }

    try {
      setPreviewLoading(true);
      const html = await emailMarketingApi.preview(content, 'Usuario Exemplo');
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('Preencha o assunto e o conteudo');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await emailMarketingApi.create({
        subject,
        content,
        filter_role: filterRole ? (filterRole as 'admin' | 'user') : null,
        filter_verified: filterVerified ? filterVerified === 'true' : null,
      });

      setSuccess('Campanha salva como rascunho!');
      setTimeout(() => {
        navigate('/email-marketing');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar campanha');
    } finally {
      setSaving(false);
    }
  };

  // Handle send
  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('Preencha o assunto e o conteudo');
      return;
    }

    if (recipientsCount === 0) {
      setError('Nenhum destinatario encontrado com os filtros selecionados');
      return;
    }

    try {
      setSending(true);
      setError('');

      await emailMarketingApi.createAndSend({
        subject,
        content,
        filter_role: filterRole ? (filterRole as 'admin' | 'user') : null,
        filter_verified: filterVerified ? filterVerified === 'true' : null,
      });

      setSuccess('Campanha criada e envio iniciado!');
      setTimeout(() => {
        navigate('/email-marketing');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar campanha');
    } finally {
      setSending(false);
    }
  };

  // Handle send existing campaign
  const handleSendExisting = async () => {
    if (!campaign) return;

    try {
      setSending(true);
      setError('');

      await emailMarketingApi.send(campaign.id);

      setSuccess('Envio iniciado!');
      setTimeout(() => {
        navigate('/email-marketing');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar campanha');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="email-campaign-form-page">
        <div className="loading-state">
          <div className="spinner"></div>
          Carregando campanha...
        </div>
      </div>
    );
  }

  const isViewOnly = !!(isEditing && campaign && campaign.status !== 'draft');

  return (
    <div className="email-campaign-form-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/email-marketing" className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <FontAwesomeIcon icon={faEnvelope} className="page-header-icon" />
          <div>
            <h1 className="page-title">
              {isEditing ? (isViewOnly ? 'Detalhes da Campanha' : 'Editar Campanha') : 'Nova Campanha'}
            </h1>
            <p className="page-subtitle">
              {isEditing ? `Campanha #${id}` : 'Crie e envie emails para seus usuarios'}
            </p>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="form-container">
        <div className="form-main">
          {/* Assunto */}
          <div className="form-group">
            <label htmlFor="subject">Assunto do Email *</label>
            <input
              type="text"
              id="subject"
              className="form-input"
              placeholder="Ex: Novidades da Evolvers Games!"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isViewOnly}
            />
          </div>

          {/* Conteudo */}
          <div className="form-group">
            <label htmlFor="content">
              Conteudo do Email *
              <span className="label-hint">(Suporta HTML)</span>
            </label>
            <textarea
              id="content"
              className="form-textarea"
              placeholder="Digite a mensagem que sera enviada aos usuarios..."
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isViewOnly}
            />
            <div className="form-hint">
              Voce pode usar tags HTML como &lt;b&gt;, &lt;i&gt;, &lt;a href="..."&gt;, &lt;br&gt;, etc.
            </div>
          </div>

          {/* Preview button */}
          <button
            type="button"
            className="btn btn-secondary preview-btn"
            onClick={handlePreview}
            disabled={previewLoading || !content.trim()}
          >
            <FontAwesomeIcon icon={faEye} />
            {previewLoading ? 'Gerando...' : 'Visualizar Email'}
          </button>
        </div>

        <div className="form-sidebar">
          {/* Filtros */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">
              <FontAwesomeIcon icon={faUsers} />
              Destinatarios
            </h3>

            <div className="form-group">
              <label htmlFor="filterRole">Filtrar por Tipo</label>
              <select
                id="filterRole"
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                disabled={isViewOnly}
              >
                <option value="">Todos os usuarios</option>
                <option value="admin">Apenas Admins</option>
                <option value="user">Apenas Usuarios</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filterVerified">Filtrar por Verificacao</label>
              <select
                id="filterVerified"
                className="form-select"
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                disabled={isViewOnly}
              >
                <option value="">Todos</option>
                <option value="true">Apenas Verificados</option>
                <option value="false">Apenas Nao Verificados</option>
              </select>
            </div>

            <div className="recipients-preview">
              {countLoading ? (
                <span className="loading-text">Contando...</span>
              ) : (
                <>
                  <span className="recipients-number">{recipientsCount ?? 0}</span>
                  <span className="recipients-label">destinatario{recipientsCount !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>

          {/* Acoes */}
          {!isViewOnly && (
            <div className="sidebar-card actions-card">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={handleSaveDraft}
                disabled={saving || sending}
              >
                <FontAwesomeIcon icon={faSave} />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </button>

              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleSend}
                disabled={saving || sending || recipientsCount === 0}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {sending ? 'Enviando...' : 'Enviar Agora'}
              </button>
            </div>
          )}

          {/* Acoes para campanha existente em rascunho */}
          {isViewOnly && campaign?.status === 'draft' && (
            <div className="sidebar-card actions-card">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleSendExisting}
                disabled={sending}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {sending ? 'Enviando...' : 'Enviar Campanha'}
              </button>
            </div>
          )}

          {/* Status da campanha */}
          {isEditing && campaign && (
            <div className="sidebar-card status-card">
              <h3 className="sidebar-title">Status</h3>
              <div className={`status-badge large ${campaign.status}`}>
                {campaign.status === 'draft' && 'Rascunho'}
                {campaign.status === 'sending' && 'Enviando...'}
                {campaign.status === 'completed' && 'Concluido'}
                {campaign.status === 'failed' && 'Falhou'}
              </div>

              {(campaign.status === 'completed' || campaign.status === 'sending') && (
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{campaign.sent_count}</span>
                    <span className="stat-label">Enviados</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value error">{campaign.failed_count}</span>
                    <span className="stat-label">Falhas</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Preview */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Preview do Email</h3>
              <button className="modal-close" onClick={() => setShowPreview(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body preview-body">
              <div className="preview-subject">
                <strong>Assunto:</strong> {subject || '(sem assunto)'}
              </div>
              <div className="preview-frame">
                <iframe
                  srcDoc={previewHtml}
                  title="Email Preview"
                  sandbox=""
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
