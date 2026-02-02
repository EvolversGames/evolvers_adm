// src/pages/dashboard/PageDashboard.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faCube,
  faBoxOpen,
  faUsers,
  faDownload,
  faFolder,
  faChartLine,
  faChartPie,
  faCircleCheck,
  faUserPlus,
  faBook,
  faPen,
  faImage,
  faArrowDown,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { dashboardApi } from '../../data/dashboard/dashboardApi';
import type { DashboardData } from '../../data/dashboard/dashboardApi';
import './dashboard.css';

const PageDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await dashboardApi.getAll();
        setData(result);
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err?.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recent, charts } = data;

  // Calcula o maior valor para normalizar as barras do gráfico
  const maxUsersPerDay = Math.max(...(charts.usersPerDay?.map(d => d.count) || [1]), 1);
  const maxCoursesByCategory = Math.max(...(charts.coursesByCategory?.map(d => d.count) || [1]), 1);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Visao geral do sistema</p>
      </header>

      {/* Cards de Estatísticas */}
      <section className="stats-section">
        <div className="stats-grid">
          {/* Cursos */}
          <div className="stat-card stat-courses">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <div className="stat-content">
              <h3>Cursos</h3>
              <div className="stat-value">{stats.courses.total}</div>
              <div className="stat-details">
                <span className="stat-detail success">{stats.courses.published} publicados</span>
                <span className="stat-detail warning">{stats.courses.draft} rascunhos</span>
              </div>
            </div>
            <Link to="/produtos" className="stat-link">Ver todos</Link>
          </div>

          {/* Assets */}
          <div className="stat-card stat-assets">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faCube} />
            </div>
            <div className="stat-content">
              <h3>Assets</h3>
              <div className="stat-value">{stats.assets.total}</div>
              <div className="stat-details">
                <span className="stat-detail success">{stats.assets.active} ativos</span>
                <span className="stat-detail muted">{stats.assets.inactive} inativos</span>
              </div>
            </div>
            <Link to="/produtos" className="stat-link">Ver todos</Link>
          </div>

          {/* Bundles */}
          <div className="stat-card stat-bundles">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="stat-content">
              <h3>Bundles</h3>
              <div className="stat-value">{stats.bundles.total}</div>
            </div>
            <Link to="/produtos/bundle" className="stat-link">Ver todos</Link>
          </div>

          {/* Usuários */}
          <div className="stat-card stat-users">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="stat-content">
              <h3>Usuarios</h3>
              <div className="stat-value">{stats.users.total}</div>
              <div className="stat-details">
                <span className="stat-detail success">{stats.users.verified} verificados</span>
                <span className="stat-detail warning">{stats.users.pending} pendentes</span>
              </div>
            </div>
          </div>

          {/* Downloads */}
          <div className="stat-card stat-downloads">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faDownload} />
            </div>
            <div className="stat-content">
              <h3>Downloads</h3>
              <div className="stat-value">{stats.downloads}</div>
              <div className="stat-details">
                <span className="stat-detail">Assets gratuitos</span>
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="stat-card stat-categories">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faFolder} />
            </div>
            <div className="stat-content">
              <h3>Categorias</h3>
              <div className="stat-value">{stats.categories}</div>
            </div>
            <Link to="/produtos/categorias" className="stat-link">Ver todas</Link>
          </div>
        </div>
      </section>

      {/* Gráficos */}
      <section className="charts-section">
        <div className="charts-grid">
          {/* Novos usuários por dia */}
          <div className="chart-card">
            <h3 className="chart-title">
              <FontAwesomeIcon icon={faChartLine} />
              Novos Usuarios (ultimos 7 dias)
            </h3>
            <div className="chart-bar-container">
              {charts.usersPerDay && charts.usersPerDay.length > 0 ? (
                charts.usersPerDay.map((item, index) => (
                  <div key={index} className="chart-bar-item">
                    <div
                      className="chart-bar"
                      style={{ height: `${(item.count / maxUsersPerDay) * 100}%` }}
                    >
                      <span className="chart-bar-value">{item.count}</span>
                    </div>
                    <span className="chart-bar-label">{formatShortDate(item.date!)}</span>
                  </div>
                ))
              ) : (
                <div className="chart-empty">Sem dados</div>
              )}
            </div>
          </div>

          {/* Cursos por categoria */}
          <div className="chart-card">
            <h3 className="chart-title">
              <FontAwesomeIcon icon={faChartPie} />
              Cursos por Categoria
            </h3>
            <div className="chart-horizontal-bars">
              {charts.coursesByCategory && charts.coursesByCategory.length > 0 ? (
                charts.coursesByCategory.map((item, index) => (
                  <div key={index} className="chart-h-bar-item">
                    <span className="chart-h-bar-label">{item.category}</span>
                    <div className="chart-h-bar-track">
                      <div
                        className="chart-h-bar"
                        style={{ width: `${(item.count / maxCoursesByCategory) * 100}%` }}
                      ></div>
                    </div>
                    <span className="chart-h-bar-value">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="chart-empty">Sem dados</div>
              )}
            </div>
          </div>

          {/* Status dos cursos */}
          <div className="chart-card chart-small">
            <h3 className="chart-title">
              <FontAwesomeIcon icon={faCircleCheck} />
              Status dos Cursos
            </h3>
            <div className="status-list">
              {charts.coursesStatus && charts.coursesStatus.length > 0 ? (
                charts.coursesStatus.map((item, index) => (
                  <div key={index} className="status-item">
                    <span className={`status-dot ${item.status}`}></span>
                    <span className="status-label">{item.status || 'Sem status'}</span>
                    <span className="status-count">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="chart-empty">Sem dados</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Listas Recentes */}
      <section className="recent-section">
        <div className="recent-grid">
          {/* Últimos Usuários */}
          <div className="recent-card">
            <h3 className="recent-title">
              <FontAwesomeIcon icon={faUserPlus} />
              Ultimos Usuarios
            </h3>
            <div className="recent-list">
              {recent.users && recent.users.length > 0 ? (
                recent.users.map((user) => (
                  <div key={user.id} className="recent-item">
                    <div className="recent-avatar">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{user.name}</span>
                      <span className="recent-meta">{user.email}</span>
                    </div>
                    <div className="recent-status">
                      {user.email_verified_at ? (
                        <span className="badge badge-success">Verificado</span>
                      ) : (
                        <span className="badge badge-warning">Pendente</span>
                      )}
                    </div>
                    <span className="recent-date">{formatDate(user.created_at)}</span>
                  </div>
                ))
              ) : (
                <div className="recent-empty">Nenhum usuario recente</div>
              )}
            </div>
          </div>

          {/* Últimos Cursos */}
          <div className="recent-card">
            <h3 className="recent-title">
              <FontAwesomeIcon icon={faBook} />
              Ultimos Cursos
            </h3>
            <div className="recent-list">
              {recent.courses && recent.courses.length > 0 ? (
                recent.courses.map((course) => (
                  <div key={course.id} className="recent-item">
                    <div className="recent-thumb">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} />
                      ) : (
                        <FontAwesomeIcon icon={faImage} />
                      )}
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{course.title}</span>
                      <span className="recent-meta">ID: {course.id}</span>
                    </div>
                    <div className="recent-status">
                      <span className={`badge badge-${course.status === 'published' ? 'success' : 'warning'}`}>
                        {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <Link to={`/produtos/course/${course.id}/editar`} className="recent-action">
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="recent-empty">Nenhum curso recente</div>
              )}
            </div>
          </div>

          {/* Últimos Assets */}
          <div className="recent-card">
            <h3 className="recent-title">
              <FontAwesomeIcon icon={faCube} />
              Ultimos Assets
            </h3>
            <div className="recent-list">
              {recent.assets && recent.assets.length > 0 ? (
                recent.assets.map((asset) => (
                  <div key={asset.id} className="recent-item">
                    <div className="recent-thumb">
                      {asset.image_url ? (
                        <img src={asset.image_url} alt={asset.title} />
                      ) : (
                        <FontAwesomeIcon icon={faCube} />
                      )}
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{asset.title}</span>
                      <span className="recent-meta">ID: {asset.id}</span>
                    </div>
                    <div className="recent-status">
                      <span className={`badge badge-${asset.active ? 'success' : 'muted'}`}>
                        {asset.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <Link to={`/produtos/asset/${asset.id}/editar`} className="recent-action">
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="recent-empty">Nenhum asset recente</div>
              )}
            </div>
          </div>

          {/* Últimos Downloads */}
          <div className="recent-card">
            <h3 className="recent-title">
              <FontAwesomeIcon icon={faDownload} />
              Ultimos Downloads
            </h3>
            <div className="recent-list">
              {recent.downloads && recent.downloads.length > 0 ? (
                recent.downloads.map((download) => (
                  <div key={download.id} className="recent-item">
                    <div className="recent-avatar download">
                      <FontAwesomeIcon icon={faArrowDown} />
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{download.asset_title}</span>
                      <span className="recent-meta">{download.user_name} ({download.user_email})</span>
                    </div>
                    <span className="recent-date">{formatDate(download.downloaded_at)}</span>
                  </div>
                ))
              ) : (
                <div className="recent-empty">Nenhum download recente</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageDashboard;
