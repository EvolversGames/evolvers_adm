// src/pages/badges/PageBadgeForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { badgeRepository } from '../../data/badges/badgeRepository';
import { createEmptyBadge, badgeToFormData } from '../../domain/badges/badge';
import type { BadgeFormData } from '../../domain/badges/badge';
import { validateBadgeForm, type BadgeFieldErrors } from '../../domain/badges/badgeValidator';
import { firstError } from '../../domain/validation/validator';
import './badges.css';

// Badges predefinidos com cores das tecnologias
const PRESET_BADGES = [
  { name: 'UNITY', bg_color: '#000000', text_color: '#ffffff' },
  { name: 'UNREAL', bg_color: '#0e1128', text_color: '#00d9ff' },
  { name: 'BLENDER', bg_color: '#ea7600', text_color: '#ffffff' },
  { name: 'GODOT', bg_color: '#478cbf', text_color: '#ffffff' },
  { name: 'GAMEMAKER', bg_color: '#8bc34a', text_color: '#ffffff' },
];

const PageBadgeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<BadgeFormData>(createEmptyBadge());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<BadgeFieldErrors>({});

  useEffect(() => {
    if (isEditing && id) {
      loadBadge(parseInt(id, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBadge = async (badgeId: number) => {
    setLoading(true);
    try {
      const badge = await badgeRepository.getById(badgeId);
      const data = badgeToFormData(badge);
      setFormData(data);

      if (submitted) {
        setFieldErrors(validateBadgeForm(data).errors);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar badge');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (patch: Partial<BadgeFormData>) => {
    const next = { ...formData, ...patch };
    setFormData(next);

    if (submitted) {
      setFieldErrors(validateBadgeForm(next).errors);
    }
  };

  const applyPreset = (preset: typeof PRESET_BADGES[0]) => {
    updateForm({
      name: preset.name,
      bg_color: preset.bg_color,
      text_color: preset.text_color,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    const result = validateBadgeForm(formData);
    setFieldErrors(result.errors);

    if (!result.isValid) return;

    setLoading(true);
    try {
      if (isEditing && id) {
        await badgeRepository.update(parseInt(id, 10), formData);
      } else {
        await badgeRepository.create(formData);
      }
      navigate('/produtos/badges');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar badge');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: keyof BadgeFormData) => submitted && !!fieldErrors[field];
  const getError = (field: keyof BadgeFormData) => (submitted ? firstError(fieldErrors, field) : null);

  if (loading && isEditing) {
    return (
      <div className="badge-form-page">
        <div className="loading-state">Carregando badge...</div>
      </div>
    );
  }

  return (
    <div className="badge-form-page">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/badges" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? 'Editar Badge' : 'Novo Badge'}</h1>
        </div>

        <div className="header-actions">
          <Link to="/produtos/badges" className="btn btn-secondary">
            Cancelar
          </Link>

          <button className="btn btn-primary" type="submit" form="badge-form" disabled={loading}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form id="badge-form" onSubmit={handleSubmit} className="form-container" noValidate>
        {/* Presets - apenas para novo badge */}
        {!isEditing && (
          <section className="form-section">
            <h3 className="form-section-title">
              <span className="section-icon">⚡</span>
              Presets Rápidos
            </h3>
            <p className="form-hint" style={{ marginBottom: '16px' }}>
              Clique em um preset para preencher automaticamente o formulário
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {PRESET_BADGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="badge-preview-inline"
                  style={{ 
                    backgroundColor: preset.bg_color,
                    color: preset.text_color,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => applyPreset(preset)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">📝</span>
            Informações Básicas
          </h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                Nome <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${showError('name') ? 'input-error' : ''}`}
                placeholder="Ex: UNITY"
                value={formData.name}
                onChange={(e) => updateForm({ name: e.target.value.toUpperCase() })}
              />
              <small className="form-hint">O nome será convertido automaticamente para maiúsculas</small>
              {showError('name') && <div className="field-error">{getError('name')}</div>}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🎨</span>
            Cores
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Cor de Fundo <span className="required">*</span>
              </label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  className="color-input"
                  value={formData.bg_color}
                  onChange={(e) => updateForm({ bg_color: e.target.value })}
                />
                <input
                  type="text"
                  className={`form-input ${showError('bg_color') ? 'input-error' : ''}`}
                  placeholder="#000000"
                  value={formData.bg_color}
                  onChange={(e) => updateForm({ bg_color: e.target.value })}
                />
              </div>
              {showError('bg_color') && <div className="field-error">{getError('bg_color')}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Cor do Texto <span className="required">*</span>
              </label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  className="color-input"
                  value={formData.text_color}
                  onChange={(e) => updateForm({ text_color: e.target.value })}
                />
                <input
                  type="text"
                  className={`form-input ${showError('text_color') ? 'input-error' : ''}`}
                  placeholder="#ffffff"
                  value={formData.text_color}
                  onChange={(e) => updateForm({ text_color: e.target.value })}
                />
              </div>
              {showError('text_color') && <div className="field-error">{getError('text_color')}</div>}
            </div>
          </div>

          {/* Preview */}
          <div className="badge-preview-section">
            <div className="preview-label">Preview:</div>
            <span 
              className="badge-preview-large"
              style={{ 
                backgroundColor: formData.bg_color || '#000000',
                color: formData.text_color || '#ffffff'
              }}
            >
              {formData.name || 'BADGE'}
            </span>
          </div>
        </section>
      </form>
    </div>
  );
};

export default PageBadgeForm;
