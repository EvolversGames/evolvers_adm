// src/pages/categories/PageCategoryForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faGamepad,
  faPalette,
  faCube,
  faMusic,
  faWrench,
  faLayerGroup,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';

import { categoryRepository } from '../../data/categories/categoryRepository';
import { createEmptyCategory, categoryToFormData } from '../../domain/categories/category';
import type { CategoryFormData } from '../../domain/categories/category';
import { validateCategoryForm, type CategoryFieldErrors } from '../../domain/categories/categoryValidator';
import { firstError } from '../../domain/validation/validator';
import './categories.css';

const ICON_OPTIONS = [
  { value: 'faCode', label: 'Código' },
  { value: 'faGamepad', label: 'Gamepad' },
  { value: 'faPalette', label: 'Paleta' },
  { value: 'faCube', label: 'Cubo 3D' },
  { value: 'faMusic', label: 'Música' },
  { value: 'faWrench', label: 'Ferramenta' },
  { value: 'faLayerGroup', label: 'Camadas' },
  { value: 'faFolder', label: 'Pasta' },
];

const ICON_MAP: Record<string, any> = {
  faCode,
  faGamepad,
  faPalette,
  faCube,
  faMusic,
  faWrench,
  faLayerGroup,
  faFolder,
};

const PageCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CategoryFormData>(createEmptyCategory());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>({});

  useEffect(() => {
    if (isEditing && id) {
      loadCategory(parseInt(id, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCategory = async (categoryId: number) => {
    setLoading(true);
    try {
      const category = await categoryRepository.getById(categoryId);
      const data = categoryToFormData(category);
      setFormData(data);

      if (submitted) {
        setFieldErrors(validateCategoryForm(data).errors);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar categoria');
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

  const updateForm = (patch: Partial<CategoryFormData>) => {
    const next = { ...formData, ...patch };
    setFormData(next);

    if (submitted) {
      setFieldErrors(validateCategoryForm(next).errors);
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

    const result = validateCategoryForm(formData);
    setFieldErrors(result.errors);

    if (!result.isValid) return;

    setLoading(true);
    try {
      if (isEditing && id) {
        await categoryRepository.update(parseInt(id, 10), formData);
      } else {
        await categoryRepository.create(formData);
      }
      navigate('/produtos/categorias');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: keyof CategoryFormData) => submitted && !!fieldErrors[field];
  const getError = (field: keyof CategoryFormData) => (submitted ? firstError(fieldErrors, field) : null);

  // ✅ preview derivado do estado
  const iconKey = (formData.icon || 'faFolder').trim();
  const iconDef = ICON_MAP[iconKey] || faFolder;
  const previewColor = (formData.color || '#6366f1').trim();

  if (loading && isEditing) {
    return (
      <div className="category-form-page">
        <div className="loading-state">Carregando categoria...</div>
      </div>
    );
  }

  return (
    <div className="category-form-page">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/categorias" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h1>
        </div>

        <div className="header-actions">
          <Link to="/produtos/categorias" className="btn btn-secondary">
            Cancelar
          </Link>

          <button className="btn btn-primary" type="submit" form="category-form" disabled={loading}>
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

      <form id="category-form" onSubmit={handleSubmit} className="form-container" noValidate>
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
                placeholder="Ex: Coding"
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
                placeholder="coding"
                value={formData.slug}
                onChange={(e) => updateForm({ slug: e.target.value })}
              />
              <small className="form-hint">Gerado automaticamente a partir do nome</small>
              {showError('slug') && <div className="field-error">{getError('slug')}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-textarea"
                placeholder="Descreva a categoria..."
                value={formData.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🎨</span>
            Aparência
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Ícone</label>
              <select
                className="form-select"
                value={formData.icon}
                onChange={(e) => updateForm({ icon: e.target.value })}
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Cor <span className="required">*</span>
              </label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  className="color-input"
                  value={formData.color}
                  onChange={(e) => updateForm({ color: e.target.value })}
                />
                <input
                  type="text"
                  className={`form-input ${showError('color') ? 'input-error' : ''}`}
                  placeholder="#6366f1"
                  value={formData.color}
                  onChange={(e) => updateForm({ color: e.target.value })}
                />
              </div>
              {showError('color') && <div className="field-error">{getError('color')}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Ordem de Exibição</label>
              <input
                type="number"
                className={`form-input ${showError('sort_order') ? 'input-error' : ''}`}
                min="1"
                value={formData.sort_order}
                onChange={(e) => updateForm({ sort_order: parseInt(e.target.value || '0', 10) })}
              />
              {showError('sort_order') && <div className="field-error">{getError('sort_order')}</div>}
            </div>
          </div>

          {/* ✅ PREVIEW */}
         {/* Preview */}
<div className="category-preview">
  <div className="preview-label">Preview:</div>

  <div className="category-card preview">
    <div className="category-header">
      <div>
        <FontAwesomeIcon
          icon={iconDef}
          style={{
            color: previewColor,      // ✅ cor no ÍCONE
            fontSize: 22,
          }}
        />
      </div>
    </div>

    <div className="category-body">
      <h3 className="category-name">{formData.name || 'Nome da Categoria'}</h3>
      <p className="category-slug">/{formData.slug || 'slug'}</p>
      {formData.description && <p className="category-description">{formData.description}</p>}
    </div>
  </div>
</div>

        </section>
      </form>
    </div>
  );
};

export default PageCategoryForm;
