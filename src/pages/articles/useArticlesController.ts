// src/pages/articles/useArticlesController.ts
import { useState, useEffect } from 'react';
import { repository } from '../../data/articles/articles_repository';
import type { Article, ArticleDraft } from '../../domain/articles/articles_model';

export const useArticlesController = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.listArticles();
      setArticles(data);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar artigos');
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (draft: ArticleDraft): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await repository.publishDraft(draft);
      await loadArticles(); // Recarrega a lista
      return true;
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar artigo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (id: number, draft: ArticleDraft): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await repository.updateDraft(id, draft);
      await loadArticles(); // Recarrega a lista
      return true;
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar artigo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      await repository.deleteArticle(id);
      setArticles(articles.filter((art) => art.id !== id));
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao deletar artigo';
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const getArticleById = async (id: number): Promise<any | null> => {
    setLoading(true);
    setError(null);
    try {
      const article = await repository.getArticle(id);
      return article;
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar artigo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    loadArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
  };
};
