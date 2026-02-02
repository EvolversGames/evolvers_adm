// src/App.tsx
import "./App.css";
import { useState, useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { PrivateRoute } from "./components/PrivateRoute/PrivateRoute";
import { PageLogin } from "./pages/auth/PageLogin";

import Header from "./components/Header/Header";
import Drawer from "./components/Drawer/Drawer";
import { gameDevMenuConfig } from "./data/menuData";

import PageProducts from "./pages/products/PageProducts";
import PageNewProduct from "./pages/products/PageNewProduct";
import PageNewCourse from "./pages/courses/PageNewCourse";

import PageCategories from "./pages/categories/PageCategories";
import PageCategoryForm from "./pages/categories/PageCategoryForm";

import PageTags from "./pages/tags/PageTags";
import PageTagForm from "./pages/tags/PageTagForm";

import PageSoftwares from "./pages/softwares/PageSoftwares";
import PageSoftwareForm from "./pages/softwares/PageSoftwareForm";

import PageInstructors from "./pages/instructors/PageInstructors";
import PageInstructorForm from "./pages/instructors/PageInstructorForm";

import PageBadges from "./pages/badges/PageBadges";
import PageBadgeForm from "./pages/badges/PageBadgeForm";

import PageCornerBadges from "./pages/corner_badges/PageCornerBadges";
import PageCornerBadgeForm from "./pages/corner_badges/PageCornerBadgeForm";

import PageArticles from "./pages/articles/PageArticles";
import PageArticleForm from "./pages/articles/PageArticleForm";

import { PageBundles } from "./pages/bundles/PageBundles";
import { PageBundleForm } from "./pages/bundles/PageBundleForm";

import PageNewAsset from "./pages/assets/PageNewAsset";
import PageDashboard from "./pages/dashboard/PageDashboard";
import PageUsers from "./pages/users/PageUsers";
import PageUserForm from "./pages/users/PageUserForm";
import PageArticleCategories from "./pages/article-categories/PageArticleCategories";
import PageArticleCategoryForm from "./pages/article-categories/PageArticleCategoryForm";
import PageEmailCampaigns from "./pages/email-marketing/PageEmailCampaigns";
import PageEmailCampaignForm from "./pages/email-marketing/PageEmailCampaignForm";

// ✅ Layout do painel (Drawer + Header + conteúdo via Outlet)
function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { user } = useAuth();

  // Mescla os dados do usuário logado no config do menu
  const menuConfig = useMemo(() => ({
    ...gameDevMenuConfig,
    user: user ? {
      name: user.name,
      role: user.role === 'admin' ? 'Administrador' : 'Usuário',
      initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    } : gameDevMenuConfig.user,
  }), [user]);

  return (
    <div className="app-layout">
      <Drawer
        config={menuConfig}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(!drawerOpen)}
        defaultExpanded={["courses"]}
      />

      <div className="app-main">
        <Header onMenuClick={() => setDrawerOpen(!drawerOpen)} />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ✅ Rota pública */}
          <Route path="/login" element={<PageLogin />} />

          {/* ✅ Tudo que for painel fica aqui dentro */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* ✅ index = "/" - Dashboard */}
            <Route index element={<PageDashboard />} />

            {/* Usuarios */}
            <Route path="usuarios" element={<PageUsers />} />
            <Route path="usuarios/novo" element={<PageUserForm />} />
            <Route path="usuarios/:id/editar" element={<PageUserForm />} />

            {/* Produtos */}
            <Route path="produtos" element={<PageProducts />} />
            <Route path="produtos/novo" element={<PageNewProduct />} />

            {/* Courses (dentro de produtos) */}
            <Route path="produtos/course/novo" element={<PageNewCourse />} />
            <Route path="produtos/course/:id/editar" element={<PageNewCourse />} />

            {/* Categorias */}
            <Route path="produtos/categorias" element={<PageCategories />} />
            <Route path="produtos/categorias/nova" element={<PageCategoryForm />} />
            <Route path="produtos/categorias/:id/editar" element={<PageCategoryForm />} />

            {/* Tags */}
            <Route path="produtos/tags" element={<PageTags />} />
            <Route path="produtos/tags/nova" element={<PageTagForm />} />
            <Route path="produtos/tags/:id/editar" element={<PageTagForm />} />

            {/* Softwares */}
            <Route path="produtos/softwares" element={<PageSoftwares />} />
            <Route path="produtos/softwares/novo" element={<PageSoftwareForm />} />
            <Route path="produtos/softwares/:id/editar" element={<PageSoftwareForm />} />

            {/* Instrutores */}
            <Route path="usuarios/instrutores" element={<PageInstructors />} />
            <Route path="usuarios/instrutores/novo" element={<PageInstructorForm />} />
            <Route path="usuarios/instrutores/:id/editar" element={<PageInstructorForm />} />

            {/* Badges */}
            <Route path="produtos/badges" element={<PageBadges />} />
            <Route path="produtos/badges/novo" element={<PageBadgeForm />} />
            <Route path="produtos/badges/:id/editar" element={<PageBadgeForm />} />

            {/* Corner Badges */}
            <Route path="produtos/corner-badges" element={<PageCornerBadges />} />
            <Route path="produtos/corner-badges/novo" element={<PageCornerBadgeForm />} />
            <Route path="produtos/corner-badges/:id/editar" element={<PageCornerBadgeForm />} />

            {/* Articles */}
            <Route path="articles/article" element={<PageArticles />} />
            <Route path="articles/article/novo" element={<PageArticleForm />} />
            <Route path="articles/article/:id/editar" element={<PageArticleForm />} />

            {/* Categorias de Artigos */}
            <Route path="articles/categorias" element={<PageArticleCategories />} />
            <Route path="articles/categorias/nova" element={<PageArticleCategoryForm />} />
            <Route path="articles/categorias/:id/editar" element={<PageArticleCategoryForm />} />

            {/* Bundles */}
            <Route path="produtos/bundle" element={<PageBundles />} />
            <Route path="produtos/bundle/novo" element={<PageBundleForm />} />
            <Route path="produtos/bundle/:id/editar" element={<PageBundleForm />} />

            {/* Assets */}
            <Route path="produtos/assets" element={<PageNewAsset />} />
            <Route path="produtos/asset/novo" element={<PageNewAsset />} />
            <Route path="produtos/asset/:id/editar" element={<PageNewAsset />} />

            {/* Email Marketing */}
            <Route path="email-marketing" element={<PageEmailCampaigns />} />
            <Route path="email-marketing/nova" element={<PageEmailCampaignForm />} />
            <Route path="email-marketing/:id" element={<PageEmailCampaignForm />} />

            {/* ✅ 404 dentro do painel */}
            <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
          </Route>

          {/* ✅ 404 fora do painel */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
