// src/pages/assets/PageNewAsset.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./asset.css";

import { useNewAssetController } from "./useNewAssetController";
import { generateSlug } from "../../domain/assets/mapper";
import { assetApi } from "../../data/assets/api";
import { assetToDraft } from "../../domain/assets/mapper";

import { assetCategoryRepository } from "../../data/asset-categories/repository";
import { assetLicenseRepository } from "../../data/asset-licenses/repository";
import { assetFileTypeRepository } from "../../data/asset-file-types/repository";
import { softwareRepository } from "../../data/softwares/softwareRepository";
import { http } from "../../services/http/index";
import { uploadAssetCarouselAndReplace } from "../../utils/uploadAssetCarouselAndReplace";

import type { AssetCategory } from "../../domain/asset-categories";
import type { AssetLicense } from "../../domain/asset-licenses";
import type { AssetFileType } from "../../domain/asset-file-types";
import type { Software } from "../../domain/softwares/software";
import type { AssetPreviewItem, AssetFile } from "../../domain/assets/model";

type Step = "basic" | "details" | "files";
type Tag = { id: number; name: string };
type Instructor = { id: number; name: string; role?: string; initials?: string; avatarUrl?: string };
type MediaCarouselType = "image" | "video";

type FieldName =
  | "title" | "slug" | "description" | "image_url" | "asset_category_id" | "license_id"
  | "software_id" | "author_id" | "price" | "original_price" | "subtitle" | "about_asset"
  | "texture_resolution" | "polygon_count" | "file_size_mb";

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const PageNewAsset = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditing = !!id && id !== "novo";
  const isNew = !isEditing;

  console.log("Mode:", isEditing ? "EDIT" : "CREATE", "ID:", id);

  const { draft, setDraft, setField, isSaving, fieldErrors, publish, update, reset } = useNewAssetController();

  const [step, setStep] = useState<Step>("basic");
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [licenses, setLicenses] = useState<AssetLicense[]>([]);
  const [fileTypes, setFileTypes] = useState<AssetFileType[]>([]);
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [authors, setAuthors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showMessage = (type: "success" | "error", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3000);
  };

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const markTouched = (name: FieldName) => setTouched((p) => ({ ...p, [name]: true }));
  const showError = (name: FieldName) => (submitAttempted || touched[name]) && !!(fieldErrors as any)[name];
  const errorText = (name: FieldName) => (showError(name) ? (fieldErrors as any)[name] : "");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const canUpload = useMemo(() => {
    if (!imageFile) return false;
    const okType = ["image/png", "image/jpeg", "image/webp"].includes(imageFile.type);
    const okSize = imageFile.size <= 5 * 1024 * 1024;
    return okType && okSize;
  }, [imageFile]);

  const setPreviewFromFile = (file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setField("image_url", url);
  };

  const clearImage = () => {
    setImageFile(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setField("image_url", "");
    markTouched("image_url");
  };

  const onPickFile = (file: File) => {
    setImageFile(file);
    setPreviewFromFile(file);
    markTouched("image_url");
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Media Carousel State
  const [mediaCarousel, setMediaCarousel] = useState<AssetPreviewItem[]>([]);
  const dragMediaIdRef = useRef<string | null>(null);
  const [mediaDragOverId, setMediaDragOverId] = useState<string | null>(null);
  const mediaImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mediaThumbInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isAllowedImage = (file: File) =>
    ["image/png", "image/jpeg", "image/webp"].includes(file.type);

  const fileToObjectUrl = (file: File) => URL.createObjectURL(file);

  const addMediaItem = (type: MediaCarouselType) => {
    const newItem: AssetPreviewItem = {
      id: uid(),
      type,
      url: "",
      thumbnail_url: "",
      title: "",
      duration: type === "video" ? 0 : null,
      sort_order: mediaCarousel.length + 1,
      _file: null,
      _thumbFile: null,
    };
    setMediaCarousel((prev) => [...prev, newItem]);
  };

  const removeMediaItem = (mediaId: string | number | undefined) => {
    setMediaCarousel((prev) => prev.filter((x) => x.id !== mediaId));
  };

  const updateMediaItem = (mediaId: string | number | undefined, patch: Partial<AssetPreviewItem>) => {
    setMediaCarousel((prev) => prev.map((item) => (item.id === mediaId ? { ...item, ...patch } : item)));
  };

  const reorderMedia = (fromId: string, toId: string) => {
    setMediaCarousel((prev) => {
      const fromIndex = prev.findIndex((x) => x.id === fromId);
      const toIndex = prev.findIndex((x) => x.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;

      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);

      return copy.map((x, idx) => ({ ...x, sort_order: idx + 1 }));
    });
  };

  const onPickMediaFile = (mediaId: string | number | undefined, file: File, kind: "image" | "thumb") => {
    console.log("📎 onPickMediaFile chamado:", { mediaId, fileName: file.name, kind });

    if (!isAllowedImage(file)) {
      showMessage("error", "Envie apenas PNG, JPG ou WEBP");
      return;
    }

    const blobUrl = fileToObjectUrl(file);
    console.log("🔗 Blob URL gerado:", blobUrl);

    setMediaCarousel((prev) =>
      prev.map((m) => {
        if (m.id !== mediaId) return m;

        if (kind === "image") {
          console.log("💾 Salvando File no _file para:", mediaId);
          return {
            ...m,
            type: "image",
            url: blobUrl,
            thumbnail_url: m.thumbnail_url || blobUrl,
            title: m.title || file.name,
            _file: file,
          };
        }

        console.log("💾 Salvando File no _thumbFile para:", mediaId);
        return {
          ...m,
          thumbnail_url: blobUrl,
          _thumbFile: file,
        };
      })
    );

    console.log("✅ State do carrossel atualizado");
  };

  const downloadByUrl = async (url: string, filename?: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage("success", successMsg);
    } catch {
      showMessage("error", "Não consegui copiar.");
    }
  };

  // Asset Files State
  const [assetFiles, setAssetFiles] = useState<AssetFile[]>([]);

  const addAssetFile = () => {
    const newFile: AssetFile = {
      file_type_id: 0,
      file_name: "",
      file_path: "",
      file_size_mb: 0,
      description: "",
    };
    setAssetFiles((prev) => [...prev, newFile]);
  };

  const removeAssetFile = (index: number) => {
    setAssetFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAssetFile = (index: number, patch: Partial<AssetFile>) => {
    setAssetFiles((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const selectedTagIds: number[] = draft.tag_ids ?? [];

  const toggleId = (arr: number[], id: number) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const getJson = async <T,>(path: string): Promise<T> => {
    const res: any = await http.get(path);
    const payload = res?.data ?? res;
    return (payload?.data ?? payload) as T;
  };

  // Load asset for editing
  const loadAsset = async (assetId: number) => {
    try {
      setLoading(true);
      console.log("Loading asset:", assetId);

      const asset = await assetApi.getById(assetId);
      console.log("Asset loaded:", asset);

      if (!asset || !asset.title) {
        throw new Error("Invalid asset data");
      }

      const draftData = assetToDraft(asset);
      console.log("Draft data:", draftData);
      setDraft(draftData);

      // Carregar previews - pode vir como previews ou previewImages
      const previews = draftData.previews || [];
      if (previews.length > 0) {
        console.log("Setting media carousel:", previews);
        setMediaCarousel(previews.map((p, idx) => ({
          ...p,
          id: p.id || Date.now() + idx,
             title: (p as any).caption || "",
        })));
      }

      // Carregar files
      const files = draftData.files || [];
      if (files.length > 0) {
        console.log("Setting asset files:", files);
        setAssetFiles(files);
      }

      console.log("Fields populated!");
    } catch (e: any) {
      console.error("Error:", e);
      setLoadError("Error loading asset");
      showMessage("error", "Error loading asset");
    } finally {
      setLoading(false);
    }
  };

  // Load form data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [categoriesData, licensesData, fileTypesData, softwaresData, tagsData, authorsData] = await Promise.all([
          assetCategoryRepository.list(),
          assetLicenseRepository.list(),
          assetFileTypeRepository.list(),
          softwareRepository.getAll(),
          getJson<Tag[]>("/tags"),
          getJson<Instructor[]>("/instructors"),
        ]);

        setAssetCategories(categoriesData);
        setLicenses(licensesData);
        setFileTypes(fileTypesData);
        setSoftwares(softwaresData);
        setTags(tagsData ?? []);
        setAuthors(authorsData ?? []);
      } catch (e: any) {
        console.error("Error loading data:", e);
        setLoadError(e?.message ?? "Error loading form data");
        showMessage("error", "Error loading form data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Load asset if editing - aguardar dados do formulário carregarem primeiro
  useEffect(() => {
    // Só carregar o asset depois que os dados do form estiverem prontos
    const formDataReady = assetCategories.length > 0 && licenses.length > 0 && authors.length > 0;

    if (isEditing && id && formDataReady) {
      console.log("Form data ready, loading asset...");
      loadAsset(Number(id));
    } else if (isNew) {
      reset();
      setMediaCarousel([]);
      setAssetFiles([]);
    }
  }, [id, isEditing, isNew, assetCategories.length, licenses.length, authors.length]);

  // Handle publish
  const handlePublish = async () => {
    setSubmitAttempted(true);

    try {
      console.log("=== 🚀 INÍCIO DO SALVAMENTO ===");

      // 1️⃣ Upload da imagem principal
      let imageUrlFinal = String(draft.image_url ?? "").trim();
      console.log("🔍 Verificando imagem principal:");
      console.log("  - imageFile:", imageFile ? imageFile.name : "null");
      console.log("  - canUpload:", canUpload);
      console.log("  - isBlob:", imageUrlFinal.startsWith("blob:"));

      if (imageFile && canUpload && imageUrlFinal.startsWith("blob:")) {
        console.log("📤 Fazendo upload da imagem principal...");
        imageUrlFinal = await assetApi.uploadAssetImage(imageFile);
        console.log("✅ Imagem principal enviada:", imageUrlFinal);
        setField("image_url", imageUrlFinal);
      } else if (imageUrlFinal.startsWith("blob:") && !imageFile) {
        showMessage("error", "Por favor, selecione a imagem novamente");
        return;
      }

      // 2️⃣ Upload do carrossel de mídia
      console.log("📤 Iniciando upload do carrossel...");
      console.log("📤 mediaCarousel ANTES do upload:", mediaCarousel.map(m => ({
        id: m.id,
        type: m.type,
        title: m.title,
        url: m.url?.substring(0, 50),
        thumbnail_url: m.thumbnail_url?.substring(0, 50),
        hasFile: !!m._file,
        hasThumbFile: !!m._thumbFile,
      })));

      const carouselReady = await uploadAssetCarouselAndReplace(mediaCarousel);
      console.log("✅ Carrossel processado!");
      setMediaCarousel(carouselReady);

      // 3️⃣ Prepara o carrossel limpo para o payload
      const carouselPayload = carouselReady.map((m, idx) => ({
        type: m.type,
        url: m.url,
        thumbnail_url: m.thumbnail_url || "",
        title: m.title || "",
        caption: m.title || "",
        duration: m.type === "video" ? (m.duration ?? null) : null,
        sort_order: idx + 1,
      }));

      // 4️⃣ Update draft with media and files
      const updatedDraft = {
        ...draft,
        image_url: imageUrlFinal,
        previews: carouselPayload,
        files: assetFiles,
      };

      setDraft(updatedDraft);

      console.log("📦 PAYLOAD FINAL:", JSON.stringify(updatedDraft, null, 2));

      if (isEditing && id) {
       const result = await update(Number(id), updatedDraft);
        if (result.ok) {
          showMessage("success", "Asset atualizado com sucesso!");
          navigate("/produtos");
        } else if (result.kind === "validation") {
          showMessage("error", "Por favor, preencha todos os campos obrigatórios");
        } else {
          showMessage("error", result.apiError);
        }
      } else {
        const result = await publish(updatedDraft);
        if (result.ok) {
          showMessage("success", "Asset criado com sucesso!");
          navigate("/produtos");
        } else if (result.kind === "validation") {
          showMessage("error", "Por favor, preencha todos os campos obrigatórios");
        } else {
          showMessage("error", result.apiError);
        }
      }
    } catch (e: any) {
      console.error("❌ ERRO:", e);
      showMessage("error", e?.message ?? "Erro ao salvar asset");
    }
  };

  if (loading) {
    return (
      <div className="novo-asset-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="novo-asset-page">
        <div className="error-state">
          <p>{loadError}</p>
          <Link to="/produtos/" className="btn btn-secondary">
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="novo-asset-page">
      {/* Toast */}
      {showToast && (
        <div className={`toast toast-${toastType}`}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/assets" className="back-btn">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <h1 className="page-title">{isEditing ? "Editar Asset" : "Novo Asset"}</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/produtos")}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handlePublish} disabled={isSaving}>
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Publicar"}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="form-tabs">
        <button
          className={`tab-btn ${step === "basic" ? "active" : ""}`}
          onClick={() => setStep("basic")}
        >
          <i className="fa-solid fa-info-circle"></i>
          Informações Básicas
        </button>
        <button
          className={`tab-btn ${step === "details" ? "active" : ""}`}
          onClick={() => setStep("details")}
        >
          <i className="fa-solid fa-list"></i>
          Detalhes Técnicos
        </button>
        <button
          className={`tab-btn ${step === "files" ? "active" : ""}`}
          onClick={() => setStep("files")}
        >
          <i className="fa-solid fa-file-archive"></i>
          Arquivos
        </button>
      </div>

      {/* Form Container */}
      <div className="form-container">
        {/* Step: Basic Info */}
        {step === "basic" && (
          <>
            {/* Title & Slug */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-heading section-icon"></i>
                Informações Gerais
              </h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    Título <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${showError("title") ? "input-error" : ""}`}
                    placeholder="Ex: Low Poly Fantasy Character Pack"
                    value={draft.title}
                    onChange={(e) => {
                      setField("title", e.target.value);
                      if (!isEditing) {
                        setField("slug", generateSlug(e.target.value));
                      }
                    }}
                    onBlur={() => markTouched("title")}
                  />
                  {showError("title") && <span className="field-error">{errorText("title")}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="low-poly-fantasy-character-pack"
                    value={draft.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Descrição <span className="required">*</span>
                  </label>
                  <textarea
                    className={`form-textarea ${showError("description") ? "input-error" : ""}`}
                    placeholder="Descreva brevemente o asset..."
                    value={draft.description}
                    onChange={(e) => setField("description", e.target.value)}
                    onBlur={() => markTouched("description")}
                  />
                  {showError("description") && <span className="field-error">{errorText("description")}</span>}
                </div>
              </div>
            </section>

            {/* Image Upload */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-image section-icon"></i>
                Imagem de Capa
              </h2>
              <div
                className={`image-dropzone ${dragOver ? "drag-over" : ""} ${draft.image_url ? "has-image" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) onPickFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {draft.image_url ? (
                  <div className="image-preview">
                    <img src={draft.image_url} alt="Preview" />
                    <div className="image-overlay">
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <i className="fa-solid fa-cloud-upload-alt"></i>
                    <p>Arraste uma imagem ou clique para selecionar</p>
                    <span>PNG, JPG ou WEBP (máx. 5MB)</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onPickFile(file);
                  }}
                />
              </div>
              {showError("image_url") && <span className="field-error">{errorText("image_url")}</span>}
            </section>

            {/* Category, License, Author */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-tags section-icon"></i>
                Classificação
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Categoria <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${showError("asset_category_id") ? "input-error" : ""}`}
                    value={draft.asset_category_id ?? ""}
                    onChange={(e) => setField("asset_category_id", Number(e.target.value) || null)}
                    onBlur={() => markTouched("asset_category_id")}
                  >
                    <option value="">Selecione...</option>
                    {assetCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {showError("asset_category_id") && <span className="field-error">{errorText("asset_category_id")}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Licença <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${showError("license_id") ? "input-error" : ""}`}
                    value={draft.license_id ?? ""}
                    onChange={(e) => setField("license_id", Number(e.target.value) || null)}
                    onBlur={() => markTouched("license_id")}
                  >
                    <option value="">Selecione...</option>
                    {licenses.map((lic) => (
                      <option key={lic.id} value={lic.id}>
                        {lic.name}
                      </option>
                    ))}
                  </select>
                  {showError("license_id") && <span className="field-error">{errorText("license_id")}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Autor <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${showError("author_id") ? "input-error" : ""}`}
                    value={draft.author_id ?? ""}
                    onChange={(e) => setField("author_id", Number(e.target.value) || null)}
                    onBlur={() => markTouched("author_id")}
                  >
                    <option value="">Selecione...</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                  {showError("author_id") && <span className="field-error">{errorText("author_id")}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Software</label>
                  <select
                    className="form-select"
                    value={draft.software_id ?? ""}
                    onChange={(e) => setField("software_id", Number(e.target.value) || null)}
                  >
                    <option value="">Selecione...</option>
                    {softwares.map((sw) => (
                      <option key={sw.id} value={sw.id}>
                        {sw.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-dollar-sign section-icon"></i>
                Preço
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Preço (R$)</label>
                  <div className="price-input">
                    <span className="currency">R$</span>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      value={draft.price || ""}
                      onChange={(e) => setField("price", Number(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Preço Original (R$)</label>
                  <div className="price-input">
                    <span className="currency">R$</span>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      value={draft.original_price || ""}
                      onChange={(e) => setField("original_price", Number(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Tags */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-hashtag section-icon"></i>
                Tags
              </h2>
              <div className="tags-selector">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`tag-chip ${selectedTagIds.includes(tag.id) ? "selected" : ""}`}
                    onClick={() => setField("tag_ids", toggleId(selectedTagIds, tag.id))}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Status */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-toggle-on section-icon"></i>
                Status
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(e) => setField("active", e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Ativo
                  </label>
                </div>
                <div className="form-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(e) => setField("featured", e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Destaque
                  </label>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Step: Technical Details */}
        {step === "details" && (
          <>
            {/* 3D Specific */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-cube section-icon"></i>
                Detalhes Técnicos
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Contagem de Polígonos</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ex: 15000"
                    value={draft.polygon_count ?? ""}
                    onChange={(e) => setField("polygon_count", Number(e.target.value) || null)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resolução de Textura</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 4096x4096"
                    value={draft.texture_resolution}
                    onChange={(e) => setField("texture_resolution", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Engine de Renderização</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Cycles, EEVEE, Arnold"
                    value={draft.render_engine}
                    onChange={(e) => setField("render_engine", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Versão</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 1.0.0"
                    value={draft.version}
                    onChange={(e) => setField("version", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tamanho do Arquivo (MB)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ex: 150"
                    value={draft.file_size_mb ?? ""}
                    onChange={(e) => setField("file_size_mb", Number(e.target.value) || null)}
                    step="0.01"
                  />
                </div>
              </div>
            </section>

            {/* Checkboxes */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-check-square section-icon"></i>
                Características
              </h2>
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.is_rigged}
                    onChange={(e) => setField("is_rigged", e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Rigged (Com esqueleto)
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.is_animated}
                    onChange={(e) => setField("is_animated", e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Animado
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.is_game_ready}
                    onChange={(e) => setField("is_game_ready", e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Game Ready
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.is_pbr}
                    onChange={(e) => setField("is_pbr", e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  PBR (Physically Based Rendering)
                </label>
              </div>
            </section>

            {/* About */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-file-alt section-icon"></i>
                Descrição Detalhada
              </h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Subtítulo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Um subtítulo para o asset"
                    value={draft.subtitle}
                    onChange={(e) => setField("subtitle", e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Sobre o Asset</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Descreva em detalhes o asset, suas características, como usar, etc."
                    value={draft.about_asset}
                    onChange={(e) => setField("about_asset", e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Detalhes Técnicos</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Informações técnicas adicionais"
                    value={draft.technical_details}
                    onChange={(e) => setField("technical_details", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">O que está incluso</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Liste o que está incluso no pacote"
                    value={draft.whats_included}
                    onChange={(e) => setField("whats_included", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Termos de Uso</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Termos e condições de uso"
                    value={draft.terms_of_use}
                    onChange={(e) => setField("terms_of_use", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </section>

            {/* Media Carousel */}
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-images section-icon"></i>
                Galeria de Mídia
              </h2>

              <div className="media-list">
                {mediaCarousel.map((m, index) => (
                  <div
                    key={m.id || index}
                    className="media-item"
                    draggable
                    onDragStart={() => { dragMediaIdRef.current = String(m.id); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromId = dragMediaIdRef.current;
                      if (fromId && fromId !== String(m.id)) reorderMedia(fromId, String(m.id));
                      dragMediaIdRef.current = null;
                    }}
                  >
                    <div className="media-item-header">
                      <span className="media-type-badge">
                        <i className={`fa-solid fa-${m.type === "image" ? "image" : "video"}`}></i>
                        #{index + 1} - {m.type === "image" ? "Imagem" : "Vídeo"}
                      </span>

                      <select
                        className="form-select"
                        style={{ width: 140 }}
                        value={m.type}
                        onChange={(e) => {
                          const nextType = e.target.value as "image" | "video";
                          if (nextType === "image") {
                            updateMediaItem(m.id, { type: "image", duration: null });
                          } else {
                            updateMediaItem(m.id, { type: "video", duration: m.duration ?? 0 });
                          }
                        }}
                      >
                        <option value="image">Imagem</option>
                        <option value="video">Vídeo</option>
                      </select>

                      <button
                        type="button"
                        className="btn-icon btn-danger"
                        onClick={() => removeMediaItem(m.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>

                    <div className="media-item-content">
                      <div className="form-group">
                        <label className="form-label">Título</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Título (ex: Preview do modelo)"
                          value={m.title || ""}
                          onChange={(e) => updateMediaItem(m.id, { title: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          {m.type === "video" ? "URL do vídeo (YouTube/Vimeo)" : "URL da imagem (ou use upload abaixo)"}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={m.type === "video" ? "https://www.youtube.com/embed/..." : "https://..."}
                          value={m.url || ""}
                          onChange={(e) => updateMediaItem(m.id, { url: e.target.value })}
                        />
                      </div>

                      {m.type === "video" && (
                        <div className="form-group">
                          <label className="form-label">Duração (segundos ou mm:ss)</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Ex: 2:45 ou 165"
                            value={m.duration ?? ""}
                            onChange={(e) => updateMediaItem(m.id, { duration: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Thumbnail URL (obrigatório)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="URL da thumbnail ou faça upload abaixo"
                          value={m.thumbnail_url || ""}
                          onChange={(e) => updateMediaItem(m.id, { thumbnail_url: e.target.value })}
                        />
                      </div>

                      {/* Previews */}
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
                        {m.thumbnail_url && (
                          <img
                            src={m.thumbnail_url}
                            alt="thumb"
                            style={{ width: 84, height: 48, objectFit: "cover", borderRadius: 8 }}
                          />
                        )}

                        {m.type === "image" && m.url && (
                          <img
                            src={m.url}
                            alt="preview"
                            style={{ width: 84, height: 48, objectFit: "cover", borderRadius: 8 }}
                          />
                        )}

                        {/* Ações */}
                        {m.type === "video" && m.url && (
                          <a className="btn btn-secondary btn-sm" href={m.url} target="_blank" rel="noreferrer">
                            Abrir vídeo
                          </a>
                        )}

                        {m.type === "image" && m.url && !m.url.startsWith("blob:") && (
                          <>
                            <a className="btn btn-secondary btn-sm" href={m.url} target="_blank" rel="noreferrer">
                              Abrir imagem
                            </a>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => downloadByUrl(m.url, (m.title || "imagem") + ".jpg")}
                            >
                              Baixar
                            </button>
                          </>
                        )}

                        {m.thumbnail_url && !m.thumbnail_url.startsWith("blob:") && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => downloadByUrl(m.thumbnail_url!, (m.title || "thumb") + "-thumb.jpg")}
                          >
                            Baixar thumb
                          </button>
                        )}

                        {m.type === "video" && m.url && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => copyToClipboard(m.url, "Link copiado!")}
                          >
                            Copiar link
                          </button>
                        )}
                      </div>

                      {/* Inputs de upload escondidos */}
                      <input
                        ref={(el) => { mediaImageInputRefs.current[String(m.id)] = el; }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onPickMediaFile(m.id, file, "image");
                          e.currentTarget.value = "";
                        }}
                      />
                      <input
                        ref={(el) => { mediaThumbInputRefs.current[String(m.id)] = el; }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onPickMediaFile(m.id, file, "thumb");
                          e.currentTarget.value = "";
                        }}
                      />

                      {/* Botões de upload */}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                        {m.type === "image" ? (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => mediaImageInputRefs.current[String(m.id)]?.click()}
                          >
                            <i className="fa-solid fa-upload"></i> Upload imagem
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => mediaThumbInputRefs.current[String(m.id)]?.click()}
                          >
                            <i className="fa-solid fa-upload"></i> Upload thumbnail
                          </button>
                        )}

                        {m.type === "image" && m._file?.name && (
                          <span style={{ opacity: 0.85, fontSize: "0.875rem" }}>
                            <i className="fa-solid fa-check" style={{ color: "#22c55e" }}></i> {m._file.name}
                          </span>
                        )}
                        {m.type === "video" && m._thumbFile?.name && (
                          <span style={{ opacity: 0.85, fontSize: "0.875rem" }}>
                            <i className="fa-solid fa-check" style={{ color: "#22c55e" }}></i> {m._thumbFile.name}
                          </span>
                        )}
                      </div>

                      {/* Dropzone */}
                      <div
                        className={`image-dropzone small ${mediaDragOverId === String(m.id) ? "drag-over" : ""}`}
                        style={{ marginTop: 10 }}
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setMediaDragOverId(String(m.id)); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setMediaDragOverId(String(m.id)); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setMediaDragOverId(null); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMediaDragOverId(null);

                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;

                          if (m.type === "image") onPickMediaFile(m.id, file, "image");
                          else onPickMediaFile(m.id, file, "thumb");
                        }}
                      >
                        <div className="dropzone-content">
                          <i className="fa-solid fa-cloud-upload-alt"></i>
                          <p>{m.type === "image" ? "Arraste a imagem aqui" : "Arraste a thumbnail aqui"}</p>
                          <span>PNG, JPG ou WEBP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="media-carousel-controls" style={{ marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => addMediaItem("image")}>
                  <i className="fa-solid fa-plus"></i> Adicionar Imagem
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => addMediaItem("video")}>
                  <i className="fa-solid fa-plus"></i> Adicionar Vídeo
                </button>
              </div>

              {mediaCarousel.length === 0 && (
                <div className="empty-state" style={{ marginTop: 16 }}>
                  <i className="fa-solid fa-images"></i>
                  <p>Nenhuma mídia adicionada</p>
                  <span>Clique nos botões acima para adicionar imagens ou vídeos</span>
                </div>
              )}
            </section>
          </>
        )}

        {/* Step: Files */}
        {step === "files" && (
          <>
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-file-archive section-icon"></i>
                Arquivos do Asset
              </h2>

              <div className="files-controls">
                <button type="button" className="btn btn-secondary" onClick={addAssetFile}>
                  <i className="fa-solid fa-plus"></i> Adicionar Arquivo
                </button>
              </div>

              {assetFiles.length > 0 && (
                <div className="files-list">
                  {assetFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-item-header">
                        <span className="file-badge">
                          <i className="fa-solid fa-file"></i>
                          Arquivo #{index + 1}
                        </span>
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          onClick={() => removeAssetFile(index)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>

                      <div className="file-item-content">
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Tipo de Arquivo</label>
                            <select
                              className="form-select"
                              value={file.file_type_id || ""}
                              onChange={(e) => updateAssetFile(index, { file_type_id: Number(e.target.value) })}
                            >
                              <option value="">Selecione...</option>
                              {fileTypes.map((ft) => (
                                <option key={ft.id} value={ft.id}>
                                  {ft.name} (.{ft.extension})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Nome do Arquivo</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Ex: character_model.fbx"
                              value={file.file_name}
                              onChange={(e) => updateAssetFile(index, { file_name: e.target.value })}
                            />
                          </div>

                          <div className="form-group full-width">
                            <label className="form-label">Caminho/URL do Arquivo</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Caminho ou URL do arquivo"
                              value={file.file_path}
                              onChange={(e) => updateAssetFile(index, { file_path: e.target.value })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Tamanho (MB)</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="0.00"
                              value={file.file_size_mb || ""}
                              onChange={(e) => updateAssetFile(index, { file_size_mb: Number(e.target.value) })}
                              step="0.01"
                            />
                          </div>

                          <div className="form-group full-width">
                            <label className="form-label">Descrição</label>
                            <textarea
                              className="form-textarea"
                              placeholder="Descrição do arquivo"
                              value={file.description || ""}
                              onChange={(e) => updateAssetFile(index, { description: e.target.value })}
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {assetFiles.length === 0 && (
                <div className="empty-state">
                  <i className="fa-solid fa-folder-open"></i>
                  <p>Nenhum arquivo adicionado</p>
                  <span>Clique em "Adicionar Arquivo" para incluir arquivos do asset</span>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PageNewAsset;
