// frontend/src/pages/admin/Bundles/PageBundleForm.tsx

import React, { useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBundleFormController } from './useBundleFormController';
import { categoryRepository } from '../../data/categories/categoryRepository';
import type { Category } from '../../domain/categories/category';
import './bundles.css';

export const PageBundleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const bundleId = id && id !== 'novo' ? Number(id) : undefined;

  const {
    formData,
    bundleItems,
    availableProducts,
    selectedProductType,
    loading,
    loadingBundle,
    loadingProducts,
    errors,
    apiError,
    isEditMode,
    handleFieldChange,
    handleImageChange, // ✅ IMPORTANTE: AGORA USAMOS ISSO
    handleAddItem,
    handleRemoveItem,
    handleMoveItem,
    handleSubmit,
    setSelectedProductType,
    calculateDiscount,
    calculateSavings,
    calculateTotalItemsPrice
  } = useBundleFormController(bundleId);

  // Local UI state (apenas o que NÃO está no controller)
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  const [selectedProductId, setSelectedProductId] = React.useState<string>('');
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  // Toast (UI feedback)
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');

  // Image upload (UI local)
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Carrega categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryRepository.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Cleanup de imagens blob (revoga o objectURL)
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // Debug: verificar category_id
  useEffect(() => {
    console.log('📊 FormData.category_id:', formData.category_id, typeof formData.category_id);
    console.log('📊 Categorias carregadas:', categories.length);
    if (categories.length > 0 && formData.category_id) {
      const found = categories.find(c => String(c.id) === formData.category_id);
      console.log('📊 Categoria encontrada:', found);
    }
  }, [formData.category_id, categories]);

  const showMessage = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const markTouched = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const showError = (name: string) => {
    return (submitAttempted || touched[name]) && !!(errors as any)[name];
  };

  const errorText = (name: string) => {
    return showError(name) ? (errors as any)[name] : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      handleFieldChange(name as any, checked);
      return;
    }

    // ✅ Se o usuário DIGITAR uma URL no campo image,
    // precisamos garantir que não vamos tentar upload de file antigo:
    if (name === 'image') {
      // URL manual => não tem arquivo, zera o File no controller
      handleImageChange(null, value);
      markTouched('image');
      return;
    }

    handleFieldChange(name as any, value);
  };

  // ✅ Agora manda o FILE pro controller + usa blob somente para preview
  const handleFileSelect = (file: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    // ✅ AQUI está a diferença: salva o File no controller
    handleImageChange(file, url);

    markTouched('image');
  };

  const clearImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    // ✅ limpa file + image
    handleImageChange(null, '');
    markTouched('image');
  };

  const onAddItem = () => {
    if (!selectedProductId) {
      showMessage('error', 'Selecione um produto');
      return;
    }

    const success = handleAddItem(Number(selectedProductId));

    if (success) {
      setSelectedProductId('');
      showMessage('success', 'Produto adicionado ao bundle');
    } else {
      showMessage('error', 'Este produto já está no bundle');
    }
  };

  const onRemoveItem = (itemId: string) => {
    handleRemoveItem(itemId);
    showMessage('success', 'Produto removido do bundle');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const success = await handleSubmit();

    if (success) {
      showMessage('success', isEditMode ? 'Bundle atualizado!' : 'Bundle criado!');
      setTimeout(() => navigate('/produtos/bundle'), 1000);
    } else {
      showMessage('error', 'Por favor, corrija os erros no formulário');
    }
  };

  const handleCancel = () => {
    navigate('/produtos/bundle');
  };

  if (loadingBundle) {
    return (
      <div className="bundle-form-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando bundle...</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="bundle-form-page">
      
      {/* Toast */}
      {showToast && (
        <div className={`toast toast-${toastType}`}>
          {toastType === 'success' ? '✓' : '✕'} {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/bundle" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">{isEditMode ? 'Editar Bundle' : 'Novo Bundle'}</h1>
        </div>
        <div className="header-actions">
          <button type="button" onClick={handleCancel} className="btn btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" onClick={onSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Salvando...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEditMode ? 'Salvar Alterações' : 'Criar Bundle'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {apiError && (
        <div className="error-banner">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {apiError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="bundle-form-container">
        {/* Informações Básicas */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">📦</span>
            Informações Básicas
          </h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                Título <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="Ex: Pacote Completo de Unity"
                value={formData.title}
                onChange={handleChange}
                onBlur={() => markTouched('title')}
              />
              {showError('title') && <span className="field-error">{errorText('title')}</span>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Subtítulo</label>
              <input
                type="text"
                name="subtitle"
                className="form-input"
                placeholder="Ex: Tudo que você precisa para dominar Unity"
                value={formData.subtitle}
                onChange={handleChange}
                onBlur={() => markTouched('subtitle')}
              />
              {showError('subtitle') && <span className="field-error">{errorText('subtitle')}</span>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Descrição</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Descreva o que está incluído neste bundle..."
                value={formData.description}
                onChange={handleChange}
                onBlur={() => markTouched('description')}
                rows={5}
              />
              {showError('description') && <span className="field-error">{errorText('description')}</span>}
            </div>
          </div>
        </section>

        {/* Imagem */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🖼️</span>
            Imagem Principal
          </h3>

          <div className="image-upload-area">
            {formData.image ? (
              <div className="image-preview-container">
                <img src={formData.image} alt="Preview" className="image-preview" />
                <button type="button" onClick={clearImage} className="btn-remove-image">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remover
                </button>
              </div>
            ) : (
              <div
                className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    handleFileSelect(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="upload-text">Clique ou arraste uma imagem</p>
                <p className="upload-hint">PNG, JPG ou WEBP até 2MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">
              Ou insira a URL da imagem <span className="required">*</span>
            </label>
            <input
              type="url"
              name="image"
              className="form-input"
              placeholder="https://exemplo.com/imagem.jpg"
              value={formData.image}
              onChange={handleChange}
              onBlur={() => markTouched('image')}
            />
            {showError('image') && <span className="field-error">{errorText('image')}</span>}
          </div>
        </section>

        {/* Items do Bundle */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">📚</span>
            Produtos Incluídos ({bundleItems.length} {bundleItems.length === 1 ? 'item' : 'itens'})
          </h3>

          <div className="add-item-section">
            <div className="add-item-row">
              <select
                className="form-select"
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value as any)}
                style={{ flex: '0 0 150px' }}
              >
                <option value="course">Curso</option>
                <option value="asset">Asset</option>
                <option value="software">Software</option>
                <option value="bundle">Bundle</option>
              </select>

              <select
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={loadingProducts}
                style={{ flex: 1 }}
              >
                <option value="">
                  {loadingProducts ? 'Carregando...' : 'Selecione um produto'}
                </option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} {product.price && `- R$ ${Number(product.price).toFixed(2)}`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onAddItem}
                className="btn btn-primary"
                disabled={!selectedProductId || loadingProducts}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
              </button>
            </div>
          </div>

          {bundleItems.length === 0 ? (
            <div className="empty-items">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>Nenhum produto adicionado ainda</p>
              <small>Selecione produtos acima para incluir no bundle</small>
            </div>
          ) : (
            <div className="items-list">
              {bundleItems.map((item, index) => (
                <div key={item.id} className="item-card">
                  <div className="item-number">{index + 1}</div>
                  {item.image && (
                    <img src={item.image} alt={item.title} className="item-image" />
                  )}
                  <div className="item-info">
                    <div className="item-title">{item.title}</div>
                    <div className="item-meta">
                      <span className="item-type">{item.product_type}</span>
                     {item.price && <span className="item-price">R$ {Number(item.price).toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, 'up')}
                      disabled={index === 0}
                      className="action-btn"
                      title="Mover para cima"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, 'down')}
                      disabled={index === bundleItems.length - 1}
                      className="action-btn"
                      title="Mover para baixo"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="action-btn delete"
                      title="Remover"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {bundleItems.length > 0 && (
            <div className="items-summary">
              <div className="summary-row">
                <span>Valor total dos itens:</span>
                <span className="summary-value">R$ {calculateTotalItemsPrice().toFixed(2)}</span>
              </div>
            </div>
          )}
        </section>

        {/* Categorização */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🏷️</span>
            Categorização
          </h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                Categoria <span className="required">*</span>
              </label>
              {loadingCategories ? (
                <div className="loading-small">Carregando categorias...</div>
              ) : (
                <select
                  name="category_id"
                  className="form-select"
                  value={formData.category_id}
                  onChange={handleChange}
                  onBlur={() => markTouched('category_id')}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
              {showError('category_id') && <span className="field-error">{errorText('category_id')}</span>}
            </div>
          </div>
        </section>

        {/* Preços */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">💰</span>
            Preços
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Preço Original <span className="required">*</span>
              </label>
              <div className="price-input">
                <span>R$</span>
                <input
                  type="number"
                  name="original_price"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.original_price}
                  onChange={handleChange}
                  onBlur={() => markTouched('original_price')}
                />
              </div>
              {showError('original_price') && <span className="field-error">{errorText('original_price')}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Preço Atual <span className="required">*</span>
              </label>
              <div className="price-input">
                <span>R$</span>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={() => markTouched('price')}
                />
              </div>
              {showError('price') && <span className="field-error">{errorText('price')}</span>}
            </div>
          </div>

          {formData.price && formData.original_price && Number(formData.original_price) > Number(formData.price) && (
            <div className="price-preview">
              <div className="preview-item">
                <span className="preview-label">Desconto:</span>
                <span className="preview-value discount">{calculateDiscount()}% OFF</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Economia:</span>
                <span className="preview-value">R$ {calculateSavings().toFixed(2)}</span>
              </div>
            </div>
          )}
        </section>

        {/* URL de Compra */}
<section className="form-section">
  <h3 className="form-section-title">
    <span className="section-icon">🔗</span>
    URL de Compra
  </h3>

  <div className="form-grid">
    <div className="form-group full-width">
      <label className="form-label">
        Link Externo de Compra
        <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: 4 }}>
          Opcional — use se o bundle for vendido fora da plataforma
        </small>
      </label>

      <input
        type="url"
        name="purchase_url"
        className="form-input"
        placeholder="https://checkout.externo.com/bundle-unity"
        value={formData.purchase_url || ''}
        onChange={handleChange}
        onBlur={() => markTouched('purchase_url')}
      />

      {showError('purchase_url') && (
        <span className="field-error">{errorText('purchase_url')}</span>
      )}
    </div>
  </div>
</section>


        {/* Configurações */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">⚙️</span>
            Configurações
          </h3>

          <div className="checkbox-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="featured"
                 checked={!!(formData as any).featured}
                onChange={handleChange}
              />
              <span className="checkbox-text">
                <strong>Bundle em Destaque</strong>
                <small>Aparecerá em posição de destaque na plataforma</small>
              </span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={!!(formData as any).active}
                onChange={handleChange}
              />
              <span className="checkbox-text">
                <strong>Bundle Ativo</strong>
                <small>O bundle estará visível para os usuários</small>
              </span>
            </label>
          </div>
        </section>
      </form>
    </div>
  );
};