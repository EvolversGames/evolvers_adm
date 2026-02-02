// src/pages/tags/PageTagForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { tagRepository } from '../../data/tags/tagRepository';
import { createEmptyTag, tagToFormData } from '../../domain/tags/tag';
import type { TagFormData } from '../../domain/tags/tag';
import { validateTagForm, type TagFieldErrors } from '../../domain/tags/tagValidator';
import { firstError } from '../../domain/validation/validator';
import './tags.css';

const PageTagForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<TagFormData>(createEmptyTag());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<TagFieldErrors>({});

  useEffect(() => {
    if (isEditing && id) {
      loadTag(parseInt(id, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTag = async (tagId: number) => {
    setLoading(true);
    try {
      const tag = await tagRepository.getById(tagId);
      const data = tagToFormData(tag);
      setFormData(data);

      if (submitted) {
        setFieldErrors(validateTagForm(data).errors);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar tag');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const updateForm = (patch: Partial<TagFormData>) => {
    const next = { ...formData, ...patch };
    setFormData(next);

    if (submitted) {
      setFieldErrors(validateTagForm(next).errors);
    }
  };

  const handleNameChange = (name: string) => {
    updateForm({
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    const result = validateTagForm(formData);
    setFieldErrors(result.errors);

    if (!result.isValid) return;

    setLoading(true);
    try {
      if (isEditing && id) {
        await tagRepository.update(parseInt(id, 10), formData);
      } else {
        await tagRepository.create(formData);
      }
      navigate('/produtos/tags');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar tag');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: keyof TagFormData) => submitted && !!fieldErrors[field];
  const getError = (field: keyof TagFormData) => (submitted ? firstError(fieldErrors, field) : null);

  if (loading && isEditing) {
    return (
      <div className="tag-form-page">
        <div className="loading-state">Carregando tag...</div>
      </div>
    );
  }

  return (
    <div className="tag-form-page">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/tags" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? 'Editar Tag' : 'Nova Tag'}</h1>
        </div>

        <div className="header-actions">
          <Link to="/produtos/tags" className="btn btn-secondary">
            Cancelar
          </Link>

          <button className="btn btn-primary" type="submit" form="tag-form" disabled={loading}>
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

      <form id="tag-form" onSubmit={handleSubmit} className="form-container" noValidate>
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🏷️</span>
            Informações da Tag
          </h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                Nome <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${showError('name') ? 'input-error' : ''}`}
                placeholder="Ex: Unity"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {showError('name') && <div className="field-error">{getError('name')}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Slug (URL) <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${showError('slug') ? 'input-error' : ''}`}
                placeholder="unity"
                value={formData.slug}
                onChange={(e) => updateForm({ slug: e.target.value })}
              />
              <small className="form-hint">Gerado automaticamente a partir do nome</small>
              {showError('slug') && <div className="field-error">{getError('slug')}</div>}
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">👁️</span>
            Preview
          </h3>

          <div className="tag-preview">
            <div className="preview-label">Como a tag aparecerá:</div>
            <div className="tag-badge-preview">
              {formData.name || 'Nome da Tag'}
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default PageTagForm;
