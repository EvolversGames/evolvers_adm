// src/pages/users/PageUserForm.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faUserPen,
  faSave,
  faArrowLeft,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { usersApi } from '../../data/users/usersApi';
import type { CreateUserDTO, UpdateUserDTO } from '../../data/users/usersApi';
import './users.css';

const PageUserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoadingUser(true);
      const user = await usersApi.findById(parseInt(id!));
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    } catch (err: any) {
      console.error('Erro ao carregar usuário:', err);
      setError(err?.message || 'Erro ao carregar usuário');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validações
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!isEditing && !password) {
      setError('Senha é obrigatória');
      return;
    }

    if (password && password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Senhas não conferem');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        const updateData: UpdateUserDTO = {
          name: name.trim(),
          email: email.trim(),
          role,
        };

        if (password) {
          updateData.password = password;
        }

        await usersApi.update(parseInt(id!), updateData);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        const createData: CreateUserDTO = {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        };

        await usersApi.create(createData);
        setSuccess('Usuário criado com sucesso!');
      }

      setTimeout(() => {
        navigate('/usuarios');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err?.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="users-page">
        <div className="users-loading">
          <div className="spinner"></div>
          <p>Carregando usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-header-left">
          <FontAwesomeIcon
            icon={isEditing ? faUserPen : faUserPlus}
            className="users-header-icon"
          />
          <div>
            <h1>{isEditing ? 'Editar Usuario' : 'Novo Usuario'}</h1>
            <p className="users-subtitle">
              {isEditing ? 'Atualize os dados do usuario' : 'Preencha os dados do novo usuario'}
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/usuarios')} className="btn btn-secondary">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Voltar</span>
        </button>
      </header>

      <div className="user-form-container">
        <form onSubmit={handleSubmit} className="user-form">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="name">Nome *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do usuario"
              className="form-control"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email do usuario"
              className="form-control"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              className="form-control"
              disabled={loading}
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? 'Digite para alterar' : 'Digite a senha'}
                  className="form-control"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a senha"
                  className="form-control"
                  disabled={loading || !password}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={!password}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
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

export default PageUserForm;
