// src/pages/articles/PageArticleForm.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './articles.css';

import { repository } from '../../data/articles/articles_repository';
import { createEmptyDraft } from '../../domain/articles/articles_model';
import type { ArticleDraft, ArticleSectionDraft } from '../../domain/articles/articles_model';
import { validateArticleDraft, type ArticleDraftErrors } from '../../domain/articles/articles_validation';
import { generateSlug } from '../../domain/articles/articles_mapper';

import { articleCategoryRepository } from '../../data/articles/article_category_repository';
import type { ArticleCategory } from '../../data/articles/article_category_repository';
import { tagRepository } from '../../data/tags/tagRepository';
import { instructorRepository } from '../../data/instructors/instructorRepository';

import type { Tag } from '../../domain/tags/tag';
import type { Instructor } from '../../domain/instructors/instructor';

type Step = 'basic' | 'content' | 'metadata';

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const PageArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isEditing = !!id && id !== "novo";
  const isNew = !isEditing;

  console.log("🔍 Modo:", isEditing ? "EDITAR" : "CRIAR", "ID:", id);

  const [formData, setFormData] = useState<ArticleDraft>(createEmptyDraft());
  const [step, setStep] = useState<Step>('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ArticleDraftErrors>({});

  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showMessage = (type: "success" | "error", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ✅ 1) Carregar listas do formulário
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Carregando dados dos combos...');

        const [categoriesData, tagsData, instructorsData] = await Promise.all([
          articleCategoryRepository.getAll(),
          tagRepository.getAll(),
          instructorRepository.getAll(),
        ]);

        console.log('✅ Categories:', categoriesData.length);
        console.log('✅ Tags:', tagsData.length);
        console.log('✅ Instructors:', instructorsData.length);

        setCategories(categoriesData);
        setTags(tagsData);
        setInstructors(instructorsData);

      } catch (e: any) {
        console.error("❌ Erro ao carregar dados:", e);
        setError(e?.message ?? "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ✅ 2) Reset ao entrar em novo
  useEffect(() => {
    if (isNew) {
      console.log("🧹 Entrou em NOVO → reset geral");
      setFormData(createEmptyDraft());
      setSubmitted(false);
      setFieldErrors({});
      setError(null);
      setStep('basic');
    }
  }, [isNew]);

  // ✅ 3) Carregar artigo ao editar
  useEffect(() => {
    console.log("🔄 useEffect - isEditing:", isEditing, "id:", id);

    if (isEditing && id) {
      console.log("📥 Carregando artigo ID:", id);
      loadArticle(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id]);

  const loadArticle = async (articleId: number) => {
    try {
      setLoading(true);
      console.log('📡 Buscando artigo:', articleId);
      
      const article = await repository.getArticle(articleId);
      console.log('📥 Artigo carregado:', article);
      
      const draft: ArticleDraft = {
        draftId: article.id.toString(),
        title: article.title || '',
        slug: article.slug || '',
        description: article.excerpt || '',
        image_url: article.image || '',
        image_file: undefined,
        price: 0,
        original_price: 0,
        active: true,
        featured: article.featured || false,
        instructor_id: article.instructor_id || 0,
        article_category_id: article.article_category_id || 0,
        read_time: article.readTime || article.read_time || 5,
        published_date: (article.publishedDate || article.published_date)?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: 'published',
        tag_ids: article.tags?.map((t: any) => t.id) || [],
        sections: (article.sections || []).map((s: any, index: number) => ({
          id: s.id?.toString() || `section-${index}`,
          heading: s.heading || '',
          content: s.content || '',
          image: s.image || '',
          order_index: s.order_index ?? index,
        })),
        related_article_ids: [],
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Draft montado:', {
        instructor_id: draft.instructor_id,
        article_category_id: draft.article_category_id,
        tag_ids: draft.tag_ids,
        sections: draft.sections.length
      });

      setFormData(draft);

      if (submitted) {
        setFieldErrors(validateArticleDraft(draft));
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar artigo:', err);
      setError(err?.message ?? 'Erro ao carregar artigo');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (patch: Partial<ArticleDraft>) => {
    const next = { ...formData, ...patch };
    setFormData(next);

    if (submitted) {
      setFieldErrors(validateArticleDraft(next));
    }
  };

  const handleTitleChange = (value: string) => {
    updateForm({
      title: value,
      slug: generateSlug(value),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    // ✅ Atualizar TUDO de uma vez
    updateForm({ 
      image_file: file,
      image_url: preview 
    });
  };

  const handleAddSection = () => {
    const newSection: ArticleSectionDraft = {
      id: uid(),
      heading: "",
      content: "",
      image: "",
      order_index: formData.sections.length,
    };
    updateForm({ sections: [...formData.sections, newSection] });
  };

  const handleUpdateSection = (index: number, field: keyof ArticleSectionDraft, value: any) => {
    const updated = [...formData.sections];
    updated[index] = { ...updated[index], [field]: value };
    updateForm({ sections: updated });
  };

  const handleRemoveSection = (index: number) => {
    const updated = formData.sections.filter((_, i) => i !== index);
    updateForm({ sections: updated });
  };

  const handleSectionImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const sections = [...formData.sections];
    sections[index] = {
      ...sections[index],
      image_file: file,
      image: preview
    };
    updateForm({ sections });
  };

  const handleToggleTag = (tagId: number) => {
    const current = formData.tag_ids || [];
    if (current.includes(tagId)) {
      updateForm({ tag_ids: current.filter(id => id !== tagId) });
    } else {
      updateForm({ tag_ids: [...current, tagId] });
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setError(null);

    const errors = validateArticleDraft(formData);
    setFieldErrors(errors);

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      console.log('❌ Erros de validação:', errors);
      showMessage('error', 'Por favor, corrija os erros no formulário');
      return;
    }

    setSaving(true);
    try {
      console.log('🔍 [1] FormData ANTES do upload:', {
        image_url: formData.image_url,
        image_file: formData.image_file?.name,
        sections: formData.sections.map(s => ({
          heading: s.heading,
          image: s.image,
          image_file: (s as any).image_file?.name
        }))
      });

      let nextData = formData;
      
      // Upload da imagem principal se tiver arquivo
      if (formData.image_file) {
        console.log('📤 [2] Fazendo upload da imagem principal...');
        const url = await repository.uploadArticleImage(formData.image_file);
        console.log('✅ [3] URL recebida:', url);
        nextData = { ...nextData, image_url: url, image_file: undefined };
      }

      // Upload das imagens das seções
      console.log('📤 [4] Processando seções...');
      const sectionsWithUrls = await Promise.all(
        nextData.sections.map(async (section, idx) => {
          if ((section as any).image_file) {
            console.log(`📤 [5.${idx}] Upload seção "${section.heading}"...`);
            const url = await repository.uploadSectionImage((section as any).image_file);
            console.log(`✅ [6.${idx}] URL recebida:`, url);
            return { ...section, image: url, image_file: undefined };
          }
          return section;
        })
      );

      nextData = { ...nextData, sections: sectionsWithUrls };

      console.log('🔍 [7] NextData DEPOIS do upload:', {
        image_url: nextData.image_url,
        sections: nextData.sections.map(s => ({
          heading: s.heading,
          image: s.image
        }))
      });

      // Salvar
      if (isEditing && id) {
        console.log('💾 [8] Atualizando artigo ID:', id);
        await repository.updateDraft(Number(id), nextData);
        console.log('✅ Artigo atualizado');
        showMessage('success', 'Artigo atualizado com sucesso!');
      } else {
        console.log('💾 [8] Criando novo artigo');
        await repository.publishDraft(nextData);
        console.log('✅ Artigo criado');
        showMessage('success', 'Artigo criado com sucesso!');
      }

      setTimeout(() => navigate('/articles/article'), 1000);
    } catch (err: any) {
      console.error('❌ Erro ao salvar:', err);
      setError(err?.message ?? 'Erro ao salvar artigo');
      showMessage('error', err?.message ?? 'Erro ao salvar artigo');
    } finally {
      setSaving(false);
    }
  };

  const showError = (field: keyof ArticleDraft) => submitted && !!fieldErrors[field];
  const getError = (field: keyof ArticleDraft) => (submitted ? fieldErrors[field] : null);

  if (loading && !categories.length) {
    return (
      <div className="article-form-page">
        <div className="loading-state">Carregando...</div>
      </div>
    );
  }

  if (error && !categories.length) {
    return (
      <div className="article-form-page">
        <div className="page-header">
          <div className="page-header-left">
            <Link to="/articles/article" className="back-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="page-title">Erro ao carregar</h1>
          </div>
        </div>
        <div className="error-state">
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="article-form-page">
      {showToast && (
        <div className={`toast toast-${toastType}`}>
          {toastMessage}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <Link to="/articles/article" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">
            {isEditing ? (formData.title || `Editar Artigo #${id}`) : "Novo Artigo"}
          </h1>
        </div>

        <div className="header-actions">
          <Link to="/articles/article" className="btn btn-secondary">Cancelar</Link>
          <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saving ? "Salvando..." : isEditing ? "Atualizar Artigo" : "Salvar Artigo"}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="asset-form-container">
        {/* Steps/Tabs */}
        <div className="article-steps">
          <button
            type="button"
            className={`article-step ${step === 'basic' ? 'active' : ''}`}
            onClick={() => setStep('basic')}
          >
            <span className="dot" />Informações Básicas
          </button>
          <button
            type="button"
            className={`article-step ${step === 'content' ? 'active' : ''}`}
            onClick={() => setStep('content')}
          >
            <span className="dot" />Conteúdo
          </button>
          <button
            type="button"
            className={`article-step ${step === 'metadata' ? 'active' : ''}`}
            onClick={() => setStep('metadata')}
          >
            <span className="dot" />Metadados
          </button>
        </div>

        {/* Step: Basic */}
        {step === 'basic' && (
          <div className="step-content">
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="section-icon">📝</span>
                Dados Principais
              </h3>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    Título <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${showError('title') ? 'input-error' : ''}`}
                    placeholder="Ex: Understanding Design Patterns in Game Development"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                  {showError('title') && <div className="field-error">{getError('title')}</div>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Slug (URL)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="understanding-design-patterns"
                    value={formData.slug || ""}
                    onChange={(e) => updateForm({ slug: e.target.value })}
                  />
                  <small className="form-hint">Gerado automaticamente a partir do título</small>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Descrição/Excerpt <span className="required">*</span>
                  </label>
                  <textarea
                    className={`form-textarea ${showError('description') ? 'input-error' : ''}`}
                    placeholder="Breve descrição do artigo..."
                    value={formData.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    rows={3}
                  />
                  {showError('description') && <div className="field-error">{getError('description')}</div>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Imagem Principal <span className="required">*</span>
                  </label>
                  {!formData.image_url ? (
                    <div className="image-upload-area" onClick={() => document.getElementById('image-input')?.click()}>
                      <div className="upload-icon">🖼️</div>
                      <div className="upload-text">Clique para fazer upload</div>
                      <div className="upload-hint">PNG, JPG ou WEBP até 2MB</div>
                    </div>
                  ) : (
                    <div className="image-preview-container">
                      <div className="image-upload-area has-image">
                        <img src={formData.image_url} alt="Preview" className="image-preview" />
                      </div>
                      <button
                        type="button"
                        onClick={() => document.getElementById('image-input')?.click()}
                        className="btn btn-secondary"
                        style={{ marginTop: '8px' }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Trocar Imagem
                      </button>
                    </div>
                  )}
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {showError('image_url') && <div className="field-error">{getError('image_url')}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Content */}
        {step === 'content' && (
          <div className="step-content">
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="section-icon">📄</span>
                Seções do Artigo
              </h3>

              {showError('sections') && (
                <div className="field-error" style={{ marginBottom: '1rem' }}>
                  {getError('sections')}
                </div>
              )}

              <div className="sections-list">
                {formData.sections.map((section, index) => (
                  <div key={section.id} className="section-item">
                    <div className="section-header">
                      <h4>Seção {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(index)}
                        className="btn-icon-delete"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Título da Seção</label>
                      <input
                        type="text"
                        className="form-input"
                        value={section.heading}
                        onChange={(e) => handleUpdateSection(index, "heading", e.target.value)}
                        placeholder="Ex: Why Design Patterns Matter"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Conteúdo</label>
                      <textarea
                        className="form-textarea"
                        value={section.content}
                        onChange={(e) => handleUpdateSection(index, "content", e.target.value)}
                        placeholder="Escreva o conteúdo desta seção..."
                        rows={6}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Imagem (Opcional)</label>
                      {!section.image ? (
                        <div className="image-upload-area" onClick={() => document.getElementById(`section-${index}`)?.click()}>
                          <div className="upload-icon">🖼️</div>
                          <div className="upload-text">Adicionar imagem</div>
                        </div>
                      ) : (
                        <div className="image-preview-container">
                          <div className="image-upload-area has-image">
                            <img src={section.image} alt="Preview" style={{ maxHeight: '200px', width: 'auto' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                              type="button"
                              onClick={() => document.getElementById(`section-${index}`)?.click()}
                              className="btn btn-secondary"
                              style={{ flex: 1 }}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Trocar Imagem
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateSection(index, "image", "")}
                              className="btn btn-danger"
                              style={{ flex: 1 }}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remover
                            </button>
                          </div>
                        </div>
                      )}
                      <input
                        id={`section-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSectionImageUpload(index, e)}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={handleAddSection} className="btn btn-secondary" style={{ marginTop: '16px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Seção
              </button>
            </div>
          </div>
        )}

        {/* Step: Metadata */}
        {step === 'metadata' && (
          <div className="step-content">
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="section-icon">📋</span>
                Informações do Artigo
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Autor <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${showError('instructor_id') ? 'input-error' : ''}`}
                    value={formData.instructor_id || 0}
                    onChange={(e) => updateForm({ instructor_id: parseInt(e.target.value) })}
                  >
                    <option value={0}>Selecione...</option>
                    {instructors.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                  {showError('instructor_id') && <div className="field-error">{getError('instructor_id')}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Categoria <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${showError('article_category_id') ? 'input-error' : ''}`}
                    value={formData.article_category_id || 0}
                    onChange={(e) => updateForm({ article_category_id: parseInt(e.target.value) })}
                  >
                    <option value={0}>Selecione...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                  {showError('article_category_id') && <div className="field-error">{getError('article_category_id')}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tempo de Leitura (min) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-input ${showError('read_time') ? 'input-error' : ''}`}
                    value={formData.read_time}
                    onChange={(e) => updateForm({ read_time: parseInt(e.target.value) || 0 })}
                    min={1}
                  />
                  {showError('read_time') && <div className="field-error">{getError('read_time')}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Data de Publicação <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-input ${showError('published_date') ? 'input-error' : ''}`}
                    value={formData.published_date}
                    onChange={(e) => updateForm({ published_date: e.target.value })}
                  />
                  {showError('published_date') && <div className="field-error">{getError('published_date')}</div>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => updateForm({ featured: e.target.checked })}
                    />
                    Artigo em Destaque
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <span className="section-icon">🏷️</span>
                Tags
              </h3>
              <div className="tags-picker">
                {tags.map(tag => {
                  const active = formData.tag_ids?.includes(tag.id) || false;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`tag-chip ${active ? 'active' : ''}`}
                      onClick={() => handleToggleTag(tag.id)}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageArticleForm;