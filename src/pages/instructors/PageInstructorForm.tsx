// src/pages/instructors/PageInstructorForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { instructorRepository } from '../../data/instructors/instructorRepository';
import { createEmptyInstructor, instructorToFormData } from '../../domain/instructors/instructor';
import type { InstructorFormData } from '../../domain/instructors/instructor';
import { validateInstructorForm, type InstructorFieldErrors } from '../../domain/instructors/InstructorValidator';
import { firstError } from '../../domain/validation/validator';
import './instructors.css';

const PageInstructorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<InstructorFormData>(createEmptyInstructor());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<InstructorFieldErrors>({});

  useEffect(() => {
    if (isEditing && id) {
      loadInstructor(parseInt(id, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadInstructor = async (instructorId: number) => {
    setLoading(true);
    try {
      const instructor = await instructorRepository.getById(instructorId);
      const data = instructorToFormData(instructor);
      setFormData(data);

      if (submitted) {
        setFieldErrors(validateInstructorForm(data).errors);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar instrutor');
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

  const updateForm = (patch: Partial<InstructorFormData>) => {
    const next = { ...formData, ...patch };
    setFormData(next);

    if (submitted) {
      setFieldErrors(validateInstructorForm(next).errors);
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

    const result = validateInstructorForm(formData);
    setFieldErrors(result.errors);

    if (!result.isValid) return;

    setLoading(true);
    try {
      if (isEditing && id) {
        await instructorRepository.update(parseInt(id, 10), formData);
      } else {
        await instructorRepository.create(formData);
      }
      navigate('/usuarios/instrutores');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar instrutor');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: keyof InstructorFormData) => submitted && !!fieldErrors[field];
  const getError = (field: keyof InstructorFormData) => (submitted ? firstError(fieldErrors, field) : null);

  if (loading && isEditing) {
    return (
      <div className="instructor-form-page">
        <div className="loading-state">Carregando instrutor...</div>
      </div>
    );
  }

  return (
    <div className="instructor-form-page">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/usuarios/instrutores" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? 'Editar Instrutor' : 'Novo Instrutor'}</h1>
        </div>

        <div className="header-actions">
          <Link to="/usuarios/instrutores" className="btn btn-secondary">
            Cancelar
          </Link>

          <button className="btn btn-primary" type="submit" form="instructor-form" disabled={loading}>
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

      <form id="instructor-form" onSubmit={handleSubmit} className="instructor-form-container" noValidate>
        {/* Informações Básicas */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">👤</span>
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
                placeholder="Ex: João Silva"
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
                placeholder="joao-silva"
                value={formData.slug}
                onChange={(e) => updateForm({ slug: e.target.value })}
              />
              <small className="form-hint">Gerado automaticamente a partir do nome</small>
              {showError('slug') && <div className="field-error">{getError('slug')}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Bio Curta</label>
              <input
                type="text"
                className={`form-input ${showError('bio_short') ? 'input-error' : ''}`}
                placeholder="Desenvolvedor de jogos com 10 anos de experiência"
                value={formData.bio_short}
                onChange={(e) => updateForm({ bio_short: e.target.value })}
                maxLength={200}
              />
              <small className="form-hint">Até 200 caracteres</small>
              {showError('bio_short') && <div className="field-error">{getError('bio_short')}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Bio Longa</label>
              <textarea
                className={`form-textarea ${showError('bio_long') ? 'input-error' : ''}`}
                placeholder="Conte mais sobre o instrutor..."
                value={formData.bio_long}
                onChange={(e) => updateForm({ bio_long: e.target.value })}
                rows={6}
              />
              {showError('bio_long') && <div className="field-error">{getError('bio_long')}</div>}
            </div>
          </div>
        </section>

        {/* URLs e Redes Sociais */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🌐</span>
            URLs e Redes Sociais
          </h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">URL do Avatar</label>
              <input
                type="url"
                className={`form-input ${showError('avatar_url') ? 'input-error' : ''}`}
                placeholder="https://exemplo.com/avatar.jpg"
                value={formData.avatar_url}
                onChange={(e) => updateForm({ avatar_url: e.target.value })}
              />
              {showError('avatar_url') && <div className="field-error">{getError('avatar_url')}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                className={`form-input ${showError('website_url') ? 'input-error' : ''}`}
                placeholder="https://meusite.com"
                value={formData.website_url}
                onChange={(e) => updateForm({ website_url: e.target.value })}
              />
              {showError('website_url') && <div className="field-error">{getError('website_url')}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">YouTube</label>
              <input
                type="url"
                className={`form-input ${showError('youtube_url') ? 'input-error' : ''}`}
                placeholder="https://youtube.com/@usuario"
                value={formData.youtube_url}
                onChange={(e) => updateForm({ youtube_url: e.target.value })}
              />
              {showError('youtube_url') && <div className="field-error">{getError('youtube_url')}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              <input
                type="url"
                className={`form-input ${showError('linkedin_url') ? 'input-error' : ''}`}
                placeholder="https://linkedin.com/in/usuario"
                value={formData.linkedin_url}
                onChange={(e) => updateForm({ linkedin_url: e.target.value })}
              />
              {showError('linkedin_url') && <div className="field-error">{getError('linkedin_url')}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Twitter/X</label>
              <input
                type="text"
                className={`form-input ${showError('twitter_handle') ? 'input-error' : ''}`}
                placeholder="@usuario"
                value={formData.twitter_handle}
                onChange={(e) => updateForm({ twitter_handle: e.target.value })}
              />
              <small className="form-hint">Ex: @joaosilva</small>
              {showError('twitter_handle') && <div className="field-error">{getError('twitter_handle')}</div>}
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">👁️</span>
            Preview
          </h3>

          <div className="instructor-preview">
            <div className="preview-card">
              <div className="preview-avatar">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt={formData.name} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div className="preview-info">
                <h4 className="preview-name">{formData.name || 'Nome do Instrutor'}</h4>
                <p className="preview-slug">/{formData.slug || 'slug'}</p>
                {formData.bio_short && (
                  <p className="preview-bio">{formData.bio_short}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default PageInstructorForm;