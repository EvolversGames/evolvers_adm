import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCube,
  faGamepad,
  faWrench,
  faCode,
  faPalette,
  faLayerGroup,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';

import { softwareRepository } from '../../data/softwares/softwareRepository';
import { createEmptySoftware, softwareToFormData } from '../../domain/softwares/software';
import type { SoftwareFormData } from '../../domain/softwares/software';
import { validateSoftwareForm, type SoftwareFieldErrors } from '../../domain/softwares/softwareValidator';
import { firstError } from '../../domain/validation/validator';
import '../categories/categories.css';

const ICON_OPTIONS = [
  { value: 'faCube', label: 'Cubo 3D' },
  { value: 'faGamepad', label: 'Gamepad' },
  { value: 'faWrench', label: 'Ferramenta' },
  { value: 'faCode', label: 'Código' },
  { value: 'faPalette', label: 'Paleta' },
  { value: 'faLayerGroup', label: 'Camadas' },
  { value: 'faFolder', label: 'Pasta' },
];

const ICON_MAP: Record<string, any> = {
  faCube,
  faGamepad,
  faWrench,
  faCode,
  faPalette,
  faLayerGroup,
  faFolder,
};

const PageSoftwareForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<SoftwareFormData>(createEmptySoftware());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SoftwareFieldErrors>({});

  useEffect(() => {
    if (isEditing && id) loadSoftware(parseInt(id, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadSoftware = async (softwareId: number) => {
    setLoading(true);
    try {
      const software = await softwareRepository.getById(softwareId);
      const data = softwareToFormData(software);
      setFormData(data);

      if (submitted) setFieldErrors(validateSoftwareForm(data).errors);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar software');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const updateForm = (patch: Partial<SoftwareFormData>) => {
    const next = { ...formData, ...patch };
    setFormData(next);

    if (submitted) setFieldErrors(validateSoftwareForm(next).errors);
  };

  const handleNameChange = (name: string) => {
    updateForm({ name, slug: generateSlug(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    const result = validateSoftwareForm(formData);
    setFieldErrors(result.errors);
    if (!result.isValid) return;

    setLoading(true);
    try {
      if (isEditing && id) {
        await softwareRepository.update(parseInt(id, 10), formData);
      } else {
        await softwareRepository.create(formData);
      }
      navigate('/produtos/softwares');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar software');
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: keyof SoftwareFormData) => submitted && !!fieldErrors[field];
  const getError = (field: keyof SoftwareFormData) => (submitted ? firstError(fieldErrors, field) : null);

  const iconKey = (formData.icon || 'faCube').trim();
  const iconDef = ICON_MAP[iconKey] || faCube;
  const previewColor = (formData.color || '#6366f1').trim();

  if (loading && isEditing) {
    return (
      <div className="category-form-page">
        <div className="loading-state">Carregando software...</div>
      </div>
    );
  }

  return (
    <div className="category-form-page">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/softwares" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditing ? 'Editar Software' : 'Novo Software'}</h1>
        </div>

        <div className="header-actions">
          <Link to="/produtos/softwares" className="btn btn-secondary">
            Cancelar
          </Link>

          <button className="btn btn-primary" type="submit" form="software-form" disabled={loading}>
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

      <form id="software-form" onSubmit={handleSubmit} className="form-container" noValidate>
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

        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🎨</span>
            Aparência
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Ícone</label>
              <select className="form-select" value={formData.icon} onChange={(e) => updateForm({ icon: e.target.value })}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Cor <span className="required">*</span>
              </label>
              <div className="color-input-wrapper">
                <input type="color" className="color-input" value={formData.color} onChange={(e) => updateForm({ color: e.target.value })} />
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

          {/* Preview (mesma ideia de Categoria: cor no ícone, sem quadradinho colorido) */}
          <div className="category-preview">
            <div className="preview-label">Preview:</div>

            <div className="category-card preview">
              <div className="category-header">
                <div>
                  <FontAwesomeIcon icon={iconDef} style={{ color: previewColor, fontSize: 22 }} />
                </div>
              </div>

              <div className="category-body">
                <h3 className="category-name">{formData.name || 'Nome do Software'}</h3>
                <p className="category-slug">/{formData.slug || 'slug'}</p>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default PageSoftwareForm;
