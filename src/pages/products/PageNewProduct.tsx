// src/pages/products/PageNewProduct.tsx
import { Link, useNavigate } from 'react-router-dom';
import './product-form.css';

const PageNewProduct = () => {
  const navigate = useNavigate();

  const handleTypeSelection = (type: 'course' | 'asset' | 'bundle') => {
    // ✅ Redirecionar para a página específica
    navigate(`/produtos/${type}/novo`);
  };

  return (
    <div className="product-form-page">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">Novo Produto</h1>
        </div>
      </div>

      <div className="type-selector-container">
        <h2 className="type-selector-title">Selecione o tipo de produto</h2>
        <p className="type-selector-subtitle">Escolha qual tipo de produto você deseja cadastrar</p>

        <div className="type-cards-grid">
          {/* Curso */}
          <button className="type-card" onClick={() => handleTypeSelection('course')}>
            <div className="type-icon">🎓</div>
            <h3 className="type-name">Curso</h3>
            <p className="type-description">
              Cursos online com vídeo aulas, módulos e certificado
            </p>
            <div className="type-features">
              <span>✓ Vídeo aulas</span>
              <span>✓ Módulos</span>
              <span>✓ Certificado</span>
            </div>
          </button>

          {/* Asset */}
          <button className="type-card" onClick={() => handleTypeSelection('asset')}>
            <div className="type-icon">🎨</div>
            <h3 className="type-name">Asset</h3>
            <p className="type-description">
              Recursos digitais como sprites, modelos 3D, sons e mais
            </p>
            <div className="type-features">
              <span>✓ Arquivos</span>
              <span>✓ Formatos</span>
              <span>✓ Preview</span>
            </div>
          </button>

          {/* Bundle */}
          <button className="type-card" onClick={() => handleTypeSelection('bundle')}>
            <div className="type-icon">📦</div>
            <h3 className="type-name">Bundle</h3>
            <p className="type-description">
              Pacotes com múltiplos produtos por preço promocional
            </p>
            <div className="type-features">
              <span>✓ Cursos</span>
              <span>✓ Assets</span>
              <span>✓ Desconto</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNewProduct;