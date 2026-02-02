// src/pages/article-categories/PageArticleCategoryForm.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderPlus,
  faFolderOpen,
  faSave,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { articleCategoryRepository } from '../../data/articles/article_category_repository';
import './article-categories.css';

const PageArticleCategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#727cf5');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (isEditing) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoadingCategory(true);
      const category = await articleCategoryRepository.getById(parseInt(id!));
      setName(category.name);
      setSlug(category.slug);
      setIcon(category.icon || '');
      setColor(category.color || '#727cf5');
      setDescription(category.description || '');
      setSortOrder(category.sort_order || 0);
    } catch (err: any) {
      console.error('Erro ao carregar categoria:', err);
      setError(err?.message || 'Erro ao carregar categoria');
    } finally {
      setLoadingCategory(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing || !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Nome e obrigatorio');
      return;
    }

    try {
      setLoading(true);

      const data = {
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        icon: icon.trim(),
        color: color,
        description: description.trim(),
        sort_order: sortOrder,
      };

      if (isEditing) {
        await articleCategoryRepository.update(parseInt(id!), data);
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await articleCategoryRepository.create(data);
        setSuccess('Categoria criada com sucesso!');
      }

      setTimeout(() => {
        navigate('/articles/categorias');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar categoria:', err);
      setError(err?.message || 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategory) {
    return (
      <div className="article-categories-page">
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Carregando categoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="article-categories-page">
      <header className="page-header">
        <div className="page-header-left">
          <FontAwesomeIcon
            icon={isEditing ? faFolderOpen : faFolderPlus}
            className="page-header-icon"
          />
          <div>
            <h1>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Atualize os dados da categoria' : 'Preencha os dados da nova categoria'}
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/articles/categorias')} className="btn btn-secondary">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Voltar</span>
        </button>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="category-form">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Tutoriais"
                className="form-control"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug</label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ex: tutoriais"
                className="form-control"
                disabled={loading}
              />
              <small className="form-hint">Gerado automaticamente a partir do nome</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="icon">Icone (emoji ou texto)</label>
              <input
                type="text"
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ex: 📚"
                className="form-control"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Cor</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="form-control-color"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#727cf5"
                  className="form-control"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sortOrder">Ordem</label>
              <input
                type="number"
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                min={0}
                className="form-control"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descricao</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descricao opcional da categoria..."
              className="form-control"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Preview */}
          <div className="category-preview">
            <h4>Preview</h4>
            <div className="preview-card">
              <span className="preview-icon" style={{ color: color }}>
                {icon || '📁'}
              </span>
              <span className="preview-name">{name || 'Nome da categoria'}</span>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/articles/categorias')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FontAwesomeIcon icon={faSave} />
              <span>{loading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageArticleCategoryForm;
