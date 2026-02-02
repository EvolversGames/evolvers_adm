// src/pages/corner_badges/PageCornerBadgeForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { cornerBadgeRepository } from '../../data/corner_badges/cornerBadgeRepository';
import { createEmptyCornerBadge, cornerBadgeToFormData } from '../../domain/corner_badges/corner_badge';
import type { CornerBadgeFormData } from '../../domain/corner_badges/corner_badge';
import { validateCornerBadgeForm, type CornerBadgeFieldErrors } from '../../domain/corner_badges/cornerBadgeValidator';
import { firstError } from '../../domain/validation/validator';
import './corner_badges.css';

// Corner badges predefinidos com gradientes reais
const PRESET_CORNER_BADGES = [
  { 
    name: 'BEST SELLER', 
    bg_gradient: 'linear-gradient(135deg, #FFA31F, #FF9700)' 
  },
  { 
    name: 'NEW', 
    bg_gradient: 'linear-gradient(135deg, #3FAFCB, #2D9AB8)' 
  },
  { 
    name: 'HOT', 
    bg_gradient: 'linear-gradient(135deg, #fa5c7c, #d63447)' 
  },
  { 
    name: 'LIMITED', 
    bg_gradient: 'linear-gradient(135deg, #667eea, #764ba2)' 
  },
  { 
    name: 'TRENDING', 
    bg_gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' 
  },
  { 
    name: 'EXCLUSIVE', 
    bg_gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' 
  },
];

const PageCornerBadgeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CornerBadgeFormData>(createEmptyCornerBadge());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CornerBadgeFieldErrors>({});

  useEffect(() => {
    if (isEditing && id) {
      loadCornerBadge(parseInt(id, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCornerBadge = async (cornerBadgeId: number) => {
    setLoading(true);
    try {
      const cornerBadge = await cornerBadgeRepository.getById(cornerBadgeId);
      const data = cornerBadgeToFormData(cornerBadge);
      setFormData(data);

      if (submitted) {
        setFieldErrors(validateCornerBadgeForm(data).errors);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar corner badge');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (patch: Partial<CornerBadgeFormData>) => {
    const next = { ...formData, ...patch };
    setFormData(next);

    if (submitted) {
      setFieldErrors(validateCornerBadgeForm(next).errors);
    }
  };

  const applyPreset = (preset: typeof PRESET_CORNER_BADGES[0]) => {
    updateForm({
      name: preset.name,
      bg_gradient: preset.bg_gradient,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    const result = validateCornerBadgeForm(formData);
    setFieldErrors(result.errors);

    if (!result.isValid) return;

    setLoading(true);
    try {
      if (isEditing && id) {
        await cornerBadgeRepository.update(parseInt(id, 10), formData);
      } else {
        await cornerBadgeRepository.create(formData);
      }
      navigate('/produtos/corner-badges');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar corner badge');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: keyof CornerBadgeFormData) => submitted && !!fieldErrors[field];
  const getError = (field: keyof CornerBadgeFormData) => (submitted ? firstError(fieldErrors, field) : null);

  if (loading && isEditing) {
    return (
      <div className="corner-badge-form-page">
        <div className="loading-state">Carregando corner badge...</div>
      </div>
    );
  }

  return (
    <div className="corner-badge-form-page">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/corner-badges" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? 'Editar Corner Badge' : 'Novo Corner Badge'}</h1>
        </div>

        <div className="header-actions">
          <Link to="/produtos/corner-badges" className="btn btn-secondary">
            Cancelar
          </Link>

          <button className="btn btn-primary" type="submit" form="corner-badge-form" disabled={loading}>
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

      <form id="corner-badge-form" onSubmit={handleSubmit} className="form-container" noValidate>
        {/* Presets - apenas para novo corner badge */}
        {!isEditing && (
          <section className="form-section">
            <h3 className="form-section-title">
              <span className="section-icon">⚡</span>
              Presets Rápidos
            </h3>
            <p className="form-hint" style={{ marginBottom: '16px' }}>
              Clique em um preset para preencher automaticamente o formulário
            </p>
            <div className="preset-grid">
              {PRESET_CORNER_BADGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="preset-button"
                  style={{ 
                    background: preset.bg_gradient
                  }}
                  onClick={() => applyPreset(preset)}
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
                placeholder="Ex: BEST SELLER"
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
            Gradiente CSS
          </h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                Gradiente <span className="required">*</span>
              </label>
              <textarea
                className={`form-input gradient-input ${showError('bg_gradient') ? 'input-error' : ''}`}
                placeholder="linear-gradient(135deg, #color1, #color2)"
                value={formData.bg_gradient}
                onChange={(e) => updateForm({ bg_gradient: e.target.value })}
                rows={3}
              />
              <small className="form-hint">
                Use o formato CSS: <code>linear-gradient(135deg, #FFA31F, #FF9700)</code>
              </small>
              {showError('bg_gradient') && <div className="field-error">{getError('bg_gradient')}</div>}
            </div>
          </div>

          {/* Preview */}
          <div className="corner-badge-preview-section">
            <div className="preview-label">Preview:</div>
            <span 
              className="corner-badge-preview-large"
              style={{ 
                background: formData.bg_gradient || 'linear-gradient(135deg, #667eea, #764ba2)'
              }}
            >
              {formData.name || 'CORNER BADGE'}
            </span>
          </div>
        </section>
      </form>
    </div>
  );
};

export default PageCornerBadgeForm;
