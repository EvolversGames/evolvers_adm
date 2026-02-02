import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './course.css';

interface Modulo {
  id: string;
  titulo: string;
  aulas: Aula[];
}

interface Aula {
  id: string;
  titulo: string;
  duracao: string;
}

interface Instrutor {
  id: string;
  nome: string;
  cargo: string;
  iniciais: string;
}

const instrutoresDisponiveis: Instrutor[] = [
  { id: '1', nome: 'Rick Prata', cargo: 'Game Developer & Educator', iniciais: 'RP' },
  { id: '2', nome: 'Gary Wilson', cargo: '3D Artist & Blender Expert', iniciais: 'GW' },
  { id: '3', nome: 'Stephen Ulibarri', cargo: 'Unreal Engine Specialist', iniciais: 'SU' },
  { id: '4', nome: 'Mark Stanley', cargo: 'Game Designer', iniciais: 'MS' },
];

const PageNewCourse = () => {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nivel, setNivel] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tags, setTags] = useState<string[]>(['C#', '2D Games', 'Platformer']);
  const [tagInput, setTagInput] = useState('');
  const [precoOriginal, setPrecoOriginal] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [instrutoresSelecionados, setInstrutoresSelecionados] = useState<string[]>(['1']);
  const [publicarImediatamente, setPublicarImediatamente] = useState(false);
  
  const [modulos, setModulos] = useState<Modulo[]>([
    {
      id: '1',
      titulo: 'Introdução ao Unity',
      aulas: [
        { id: '1', titulo: 'Bem-vindo ao curso', duracao: '05:30' },
        { id: '2', titulo: 'Instalando o Unity Hub', duracao: '12:45' },
        { id: '3', titulo: 'Conhecendo a Interface', duracao: '18:20' },
      ],
    },
    {
      id: '2',
      titulo: 'Fundamentos de C#',
      aulas: [
        { id: '1', titulo: 'Variáveis e Tipos de Dados', duracao: '22:10' },
      ],
    },
  ]);

  const [requisitos, setRequisitos] = useState([
    'Computador com Windows, Mac ou Linux',
    'Nenhum conhecimento prévio necessário',
    'Vontade de aprender!',
  ]);

  const [objetivos, setObjetivos] = useState([
    'Criar jogos 2D completos do zero',
    'Dominar C# para desenvolvimento de jogos',
    'Implementar física, colisões e movimento',
    'Criar sistemas de UI responsivos',
  ]);

  const [publicoAlvo, setPublicoAlvo] = useState([
    'Iniciantes que querem aprender a criar jogos',
    'Programadores que desejam migrar para gamedev',
    'Artistas que querem trazer seus assets para jogos',
  ]);

  // Handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleInstrutor = (id: string) => {
    setInstrutoresSelecionados(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleAddModulo = () => {
    const novoModulo: Modulo = {
      id: Date.now().toString(),
      titulo: '',
      aulas: [],
    };
    setModulos([...modulos, novoModulo]);
  };

  const handleRemoveModulo = (moduloId: string) => {
    setModulos(modulos.filter(m => m.id !== moduloId));
  };

  const handleUpdateModuloTitulo = (moduloId: string, titulo: string) => {
    setModulos(modulos.map(m =>
      m.id === moduloId ? { ...m, titulo } : m
    ));
  };

  const handleAddAula = (moduloId: string) => {
    const novaAula: Aula = {
      id: Date.now().toString(),
      titulo: '',
      duracao: '00:00',
    };
    setModulos(modulos.map(m =>
      m.id === moduloId ? { ...m, aulas: [...m.aulas, novaAula] } : m
    ));
  };

  const handleRemoveAula = (moduloId: string, aulaId: string) => {
    setModulos(modulos.map(m =>
      m.id === moduloId
        ? { ...m, aulas: m.aulas.filter(a => a.id !== aulaId) }
        : m
    ));
  };

  const handleUpdateAula = (moduloId: string, aulaId: string, titulo: string) => {
    setModulos(modulos.map(m =>
      m.id === moduloId
        ? { ...m, aulas: m.aulas.map(a => a.id === aulaId ? { ...a, titulo } : a) }
        : m
    ));
  };

  const handleAddListItem = (list: string[], setList: (items: string[]) => void) => {
    setList([...list, '']);
  };

  const handleUpdateListItem = (list: string[], setList: (items: string[]) => void, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const handleRemoveListItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = (rascunho: boolean = false) => {
    const curso = {
      titulo,
      subtitulo,
      categoria,
      nivel,
      descricao,
      tags,
      precoOriginal,
      precoPromocional,
      instrutores: instrutoresSelecionados,
      modulos,
      requisitos,
      objetivos,
      publicoAlvo,
      status: rascunho ? 'rascunho' : publicarImediatamente ? 'publicado' : 'revisao',
    };
    console.log('Curso salvo:', curso);
    // Aqui você faria a chamada para a API
    navigate('/cursos');
  };

  return (
    <div className="novo-curso-page">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-left">
          <Link to="/cursos" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 className="page-title">Novo Curso</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => handleSubmit(true)}>
            Salvar Rascunho
          </button>
          <button className="btn btn-primary" onClick={() => handleSubmit(false)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            Salvar Curso
          </button>
        </div>
      </header>

      {/* Formulário */}
      <div className="form-container">
        {/* Informações Básicas */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">📋</span>
            Informações Básicas
          </h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                Título do Curso <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Complete Unity 2D Developer - Aprenda C# criando jogos"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Subtítulo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Breve descrição para aparecer nos cards"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Categoria <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Selecione a categoria</option>
                <option value="unity">Unity</option>
                <option value="unreal">Unreal Engine</option>
                <option value="blender">Blender</option>
                <option value="godot">Godot</option>
                <option value="art">Arte 2D/3D</option>
                <option value="audio">Áudio para Games</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Nível <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
              >
                <option value="">Selecione o nível</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
                <option value="all">Todos os níveis</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">
                Descrição Completa <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Descreva detalhadamente o que o aluno vai aprender neste curso..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Tags</label>
              <div className="tags-container">
                {tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                    <span className="tag-remove" onClick={() => handleRemoveTag(tag)}>×</span>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input"
                  placeholder="Digite e pressione Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mídia */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🖼️</span>
            Mídia
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Imagem de Capa <span className="required">*</span>
              </label>
              <div className="upload-area">
                <div className="upload-icon">🖼️</div>
                <div className="upload-text">
                  Arraste uma imagem ou <strong>clique para selecionar</strong>
                  <small>Recomendado: 1280x720px (16:9)</small>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Vídeo de Preview</label>
              <div className="upload-area">
                <div className="upload-icon">🎬</div>
                <div className="upload-text">
                  Arraste um vídeo ou <strong>clique para selecionar</strong>
                  <small>MP4, máximo 2 minutos</small>
                </div>
              </div>
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
                  placeholder="199.90"
                  value={precoOriginal}
                  onChange={(e) => setPrecoOriginal(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Preço Promocional</label>
              <div className="price-input">
                <span>R$</span>
                <input
                  type="number"
                  placeholder="89.90"
                  value={precoPromocional}
                  onChange={(e) => setPrecoPromocional(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Instrutores */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">👨‍🏫</span>
            Instrutores
          </h3>
          <div className="instructors-grid">
            {instrutoresDisponiveis.map((instrutor) => (
              <div
                key={instrutor.id}
                className={`instructor-card ${instrutoresSelecionados.includes(instrutor.id) ? 'selected' : ''}`}
                onClick={() => toggleInstrutor(instrutor.id)}
              >
                <div className="instructor-avatar">{instrutor.iniciais}</div>
                <div className="instructor-info">
                  <h4>{instrutor.nome}</h4>
                  <p>{instrutor.cargo}</p>
                </div>
                <div className="instructor-check">✓</div>
              </div>
            ))}
          </div>
        </section>

        {/* Módulos e Aulas */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">📚</span>
            Módulos e Aulas
          </h3>
          <div className="modules-list">
            {modulos.map((modulo, moduloIndex) => (
              <div key={modulo.id} className="module-item">
                <div className="module-header">
                  <span className="module-drag">⋮⋮</span>
                  <span className="module-number">{moduloIndex + 1}</span>
                  <input
                    type="text"
                    className="module-title-input"
                    placeholder="Nome do módulo"
                    value={modulo.titulo}
                    onChange={(e) => handleUpdateModuloTitulo(modulo.id, e.target.value)}
                  />
                  <div className="module-actions">
                    <button
                      className="action-btn delete"
                      title="Remover"
                      onClick={() => handleRemoveModulo(modulo.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="module-lessons">
                  {modulo.aulas.map((aula) => (
                    <div key={aula.id} className="lesson-item">
                      <span className="module-drag">⋮⋮</span>
                      <div className="lesson-icon">▶</div>
                      <div className="lesson-info">
                        <input
                          type="text"
                          className="lesson-title-input"
                          placeholder="Título da aula"
                          value={aula.titulo}
                          onChange={(e) => handleUpdateAula(modulo.id, aula.id, e.target.value)}
                        />
                        <span className="lesson-duration">{aula.duracao}</span>
                      </div>
                      <button
                        className="action-btn delete"
                        title="Remover"
                        onClick={() => handleRemoveAula(modulo.id, aula.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button className="add-lesson-btn" onClick={() => handleAddAula(modulo.id)}>
                    <span>+</span> Adicionar Aula
                  </button>
                </div>
              </div>
            ))}
            <button className="add-module-btn" onClick={handleAddModulo}>
              <span>+</span> Adicionar Módulo
            </button>
          </div>
        </section>

        {/* Requisitos */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">📝</span>
            Requisitos do Curso
          </h3>
          <div className="list-input-container">
            {requisitos.map((req, index) => (
              <div key={index} className="list-item">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleUpdateListItem(requisitos, setRequisitos, index, e.target.value)}
                  placeholder="Digite um requisito..."
                />
                <button
                  className="list-item-remove"
                  onClick={() => handleRemoveListItem(requisitos, setRequisitos, index)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="add-list-item"
              onClick={() => handleAddListItem(requisitos, setRequisitos)}
            >
              <span>+</span> Adicionar Requisito
            </button>
          </div>
        </section>

        {/* O que você vai aprender */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">🎯</span>
            O que você vai aprender
          </h3>
          <div className="list-input-container">
            {objetivos.map((obj, index) => (
              <div key={index} className="list-item">
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => handleUpdateListItem(objetivos, setObjetivos, index, e.target.value)}
                  placeholder="Digite um objetivo..."
                />
                <button
                  className="list-item-remove"
                  onClick={() => handleRemoveListItem(objetivos, setObjetivos, index)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="add-list-item"
              onClick={() => handleAddListItem(objetivos, setObjetivos)}
            >
              <span>+</span> Adicionar Objetivo
            </button>
          </div>
        </section>

        {/* Público-alvo */}
        <section className="form-section">
          <h3 className="form-section-title">
            <span className="section-icon">👥</span>
            Público-alvo
          </h3>
          <div className="list-input-container">
            {publicoAlvo.map((pub, index) => (
              <div key={index} className="list-item">
                <input
                  type="text"
                  value={pub}
                  onChange={(e) => handleUpdateListItem(publicoAlvo, setPublicoAlvo, index, e.target.value)}
                  placeholder="Digite um público..."
                />
                <button
                  className="list-item-remove"
                  onClick={() => handleRemoveListItem(publicoAlvo, setPublicoAlvo, index)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="add-list-item"
              onClick={() => handleAddListItem(publicoAlvo, setPublicoAlvo)}
            >
              <span>+</span> Adicionar Público
            </button>
          </div>
        </section>

        {/* Footer com toggle */}
        <div className="form-footer">
          <div className="toggle-container">
            <div
              className={`toggle ${publicarImediatamente ? 'active' : ''}`}
              onClick={() => setPublicarImediatamente(!publicarImediatamente)}
            />
            <span className="toggle-label">Publicar imediatamente</span>
          </div>
          <div className="footer-actions">
            <Link to="/cursos" className="btn btn-secondary">Cancelar</Link>
            <button className="btn btn-secondary" onClick={() => handleSubmit(true)}>
              Salvar Rascunho
            </button>
            <button className="btn btn-primary" onClick={() => handleSubmit(false)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
              Salvar Curso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNewCourse