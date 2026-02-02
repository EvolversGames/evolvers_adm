// src/pages/assets/PageNewAsset.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./asset.css";

import { useNewAssetController } from "./useNewAssetController";
import { generateSlug, assetToDraft } from "../../domain/assets/mapper";
import { assetApi } from "../../data/assets/api";

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
import type { AssetPreviewItem, AssetFile, AssetDraft } from "../../domain/assets/model";

type Step = "basic" | "details" | "files";
type Tag = { id: number; name: string };
type Instructor = { id: number; name: string; role?: string; initials?: string; avatarUrl?: string };
type MediaCarouselType = "image" | "video";

type FieldName =
  | "title"
  | "slug"
  | "description"
  | "image_url"
  | "asset_category_id"
  | "license_id"
  | "software_id"
  | "author_id"
  | "price"
  | "original_price"
  | "subtitle"
  | "about_asset"
  | "texture_resolution"
  | "polygon_count"
  | "file_size_mb";

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
const isAllowedImage = (file: File) => ["image/png", "image/jpeg", "image/webp"].includes(file.type);
const fileToObjectUrl = (file: File) => URL.createObjectURL(file);

const normalizeDuration = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const s = String(value).trim();
  if (!s) return null;

  // mm:ss
  if (s.includes(":")) {
    const [mm, ss] = s.split(":").map((x) => x.trim());
    const m = Number(mm);
    const sec = Number(ss);
    if (Number.isFinite(m) && Number.isFinite(sec)) return m * 60 + sec;
    return null;
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const PageNewAsset = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditing = !!id && id !== "novo";
  const isNew = !isEditing;

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

  // ---------- helpers ----------
  const sameId = (a: any, b: any) => String(a) === String(b);

  const revokeIfBlob = (url?: string | null) => {
    if (url && typeof url === "string" && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
  };

  // ---------- cover image ----------
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

  // ---------- Media Carousel ----------
  const [mediaCarousel, setMediaCarousel] = useState<AssetPreviewItem[]>([]);
  const dragMediaIdRef = useRef<string | null>(null);
  const [mediaDragOverId, setMediaDragOverId] = useState<string | null>(null);
  const mediaImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mediaThumbInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ✅ “tem mídia adicionada nesse item?” (isso controla o botão Remover)
  const hasMediaForItem = (m: AssetPreviewItem) => {
    if (m.type === "image") return !!(m.url || (m as any)._file);
    // vídeo: a “mídia adicionada” é a THUMB (ou pelo menos uma URL de thumb / arquivo)
    return !!(m.thumbnail_url || (m as any)._thumbFile || m.url);
  };

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

  // ✅ REMOVE O ITEM INTEIRO DA LISTA (e reordena visual + sort_order)
  const removeMediaItem = (mediaId: string | number | undefined) => {
    if (mediaId === undefined) return;

    setMediaCarousel((prev) => {
      const target = prev.find((x) => sameId(x.id, mediaId));
      if (target) {
        revokeIfBlob(target.url);
        revokeIfBlob(target.thumbnail_url);
      }

      const next = prev.filter((x) => !sameId(x.id, mediaId));
      return next.map((x, idx) => ({ ...x, sort_order: idx + 1 }));
    });
  };

  const updateMediaItem = (mediaId: string | number | undefined, patch: Partial<AssetPreviewItem>) => {
    if (mediaId === undefined) return;
    setMediaCarousel((prev) => prev.map((item) => (sameId(item.id, mediaId) ? { ...item, ...patch } : item)));
  };

  const reorderMedia = (fromId: string, toId: string) => {
    setMediaCarousel((prev) => {
      const fromIndex = prev.findIndex((x) => sameId(x.id, fromId));
      const toIndex = prev.findIndex((x) => sameId(x.id, toId));
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;

      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);

      return copy.map((x, idx) => ({ ...x, sort_order: idx + 1 }));
    });
  };

  // ✅ Upload de arquivo por item (imagem ou thumbnail) — sem “limpar inputs” errado
  const onPickMediaFile = (mediaId: string | number | undefined, file: File, kind: "image" | "thumb") => {
    if (mediaId === undefined) return;

    setMediaCarousel((prev) => {
      const target = prev.find((m) => sameId(m.id, mediaId));
      if (!target) return prev;

      if (!isAllowedImage(file)) {
        showMessage("error", "Envie apenas PNG, JPG ou WEBP");
        return prev;
      }

      // THUMB
      if (kind === "thumb") {
        revokeIfBlob(target.thumbnail_url);
        const blobUrl = fileToObjectUrl(file);

        return prev.map((m) =>
          sameId(m.id, mediaId)
            ? {
                ...m,
                thumbnail_url: blobUrl,
                _thumbFile: file,
              }
            : m
        );
      }

      // IMAGE (só quando o item é image)
      if (target.type !== "image") {
        showMessage("error", "Esse item está como VÍDEO. Para vídeo, adicione a THUMBNAIL.");
        return prev;
      }

      revokeIfBlob(target.url);
      const blobUrl = fileToObjectUrl(file);

      return prev.map((m) =>
        sameId(m.id, mediaId)
          ? {
              ...m,
              url: blobUrl,
              // se não tem thumb ainda, usa a própria imagem (opcional)
              thumbnail_url: m.thumbnail_url || blobUrl,
              title: m.title || file.name,
              _file: file,
            }
          : m
      );
    });
  };

  // cleanup blobs (carousel)
  useEffect(() => {
    return () => {
      try {
        mediaCarousel.forEach((m) => {
          revokeIfBlob(m.url);
          revokeIfBlob(m.thumbnail_url);
        });
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ---------- Asset Files ----------
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
  const toggleId = (arr: number[], idv: number) => (arr.includes(idv) ? arr.filter((x) => x !== idv) : [...arr, idv]);

  const getJson = async <T,>(path: string): Promise<T> => {
    const res: any = await http.get(path);
    const payload = res?.data ?? res;
    return (payload?.data ?? payload) as T;
  };

  // ---------- Load asset for editing ----------
  const loadAsset = async (assetId: number) => {
    try {
      setLoading(true);

      const asset = await assetApi.getById(assetId);
      if (!asset || !asset.title) throw new Error("Invalid asset data");

      const draftData = assetToDraft(asset);
      setDraft(draftData);

      const previews = draftData.previews || [];
      if (previews.length > 0) {
        setMediaCarousel(
          previews.map((p, idx) => ({
            ...p,
            id: p.id ? String(p.id) : String(Date.now() + idx),
          }))
        );
      } else {
        setMediaCarousel([]);
      }

      const files = draftData.files || [];
      setAssetFiles(files.length > 0 ? files : []);
    } catch (e: any) {
      console.error("Error:", e);
      setLoadError("Error loading asset");
      showMessage("error", "Error loading asset");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Load form data ----------
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

  // ---------- Load asset if editing ----------
  useEffect(() => {
    const formDataReady = assetCategories.length > 0 && licenses.length > 0 && authors.length > 0;

    if (isEditing && id && formDataReady) {
      loadAsset(Number(id));
    } else if (isNew) {
      reset();
      setMediaCarousel([]);
      setAssetFiles([]);
      setImageFile(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing, isNew, assetCategories.length, licenses.length, authors.length]);

  // ---------- Publish / Update ----------
  const handlePublish = async () => {
    setSubmitAttempted(true);

    try {
      // 1) upload cover
      let imageUrlFinal = String(draft.image_url ?? "").trim();

      if (imageFile && canUpload && imageUrlFinal.startsWith("blob:")) {
        imageUrlFinal = await assetApi.uploadAssetImage(imageFile);
        setField("image_url", imageUrlFinal);
      } else if (imageUrlFinal.startsWith("blob:") && !imageFile) {
        showMessage("error", "Por favor, selecione a imagem novamente");
        return;
      }

      // 2) upload carousel (imagens + thumbs)
      const carouselReady = await uploadAssetCarouselAndReplace(mediaCarousel);
      setMediaCarousel(carouselReady);

      // 3) payload
      const carouselPayload = carouselReady.map((m, idx) => ({
        type: m.type,
        url: m.url,
        thumbnail_url: m.thumbnail_url || "",
        title: m.title || "",
        caption: (m as any).caption || "",
        duration: m.type === "video" ? normalizeDuration(m.duration) : null,
        sort_order: idx + 1,
      }));

      const updatedDraft: AssetDraft = {
        ...draft,
        image_url: imageUrlFinal,
        previews: carouselPayload,
        files: assetFiles,
      };

      setDraft(updatedDraft);

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

  // ---------- UI ----------
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
          <Link to="/produtos/assets" className="btn btn-secondary">
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="novo-asset-page">
      {showToast && <div className={`toast toast-${toastType}`}>{toastMessage}</div>}

      <header className="page-header">
        <div className="page-header-left">
          <Link to="/produtos/assets" className="back-btn">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <h1 className="page-title">{isEditing ? "Editar Asset" : "Novo Asset"}</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/produtos")} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handlePublish} disabled={isSaving} type="button">
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Publicar"}
          </button>
        </div>
      </header>

      <div className="form-tabs">
        <button className={`tab-btn ${step === "basic" ? "active" : ""}`} onClick={() => setStep("basic")} type="button">
          <i className="fa-solid fa-info-circle"></i>
          Informações Básicas
        </button>
        <button className={`tab-btn ${step === "details" ? "active" : ""}`} onClick={() => setStep("details")} type="button">
          <i className="fa-solid fa-list"></i>
          Detalhes Técnicos
        </button>
        <button className={`tab-btn ${step === "files" ? "active" : ""}`} onClick={() => setStep("files")} type="button">
          <i className="fa-solid fa-file-archive"></i>
          Arquivos
        </button>
      </div>

      <div className="asset-form-container">
        {/* ======================== BASIC ======================== */}
        {step === "basic" && (
          <>
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
                      if (!isEditing) setField("slug", generateSlug(e.target.value));
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

            
              </div>
            </section>

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
                        title="Remover imagem"
                        type="button"
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

            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-toggle-on section-icon"></i>
                Status
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="toggle-label">
                    <input type="checkbox" checked={draft.active} onChange={(e) => setField("active", e.target.checked)} />
                    <span className="toggle-switch"></span>
                    Ativo
                  </label>
                </div>
                <div className="form-group">
                  <label className="toggle-label">
                    <input type="checkbox" checked={draft.featured} onChange={(e) => setField("featured", e.target.checked)} />
                    <span className="toggle-switch"></span>
                    Destaque
                  </label>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ======================== DETAILS ======================== */}
        {step === "details" && (
          <>
            <section className="form-section">
              <h2 className="form-section-title">
                <i className="fa-solid fa-images section-icon"></i>
                Galeria de Mídia
              </h2>

              <div className="media-list">
                {mediaCarousel.map((m, index) => {
                  const hasAdded = hasMediaForItem(m);

                  return (
                    <div
                      key={String(m.id) || String(index)}
                      className="media-item"
                      draggable
                      onDragStart={() => {
                        dragMediaIdRef.current = String(m.id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromId = dragMediaIdRef.current;
                        if (fromId && !sameId(fromId, m.id)) reorderMedia(String(fromId), String(m.id));
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
                            if (nextType === "image") updateMediaItem(m.id, { type: "image", duration: null });
                            else updateMediaItem(m.id, { type: "video", duration: normalizeDuration(m.duration) ?? 0 });
                          }}
                        >
                          <option value="image">Imagem</option>
                          <option value="video">Vídeo</option>
                        </select>

                        {/* botão remover o ITEM inteiro sempre disponível (se você quiser “só depois de adicionar”, remova esse botão e use o de baixo) */}
                        <button type="button" className="btn-icon btn-danger" onClick={() => removeMediaItem(m.id)} title="Remover item">
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
                            value={m.caption || ""}
                            onChange={(e) => updateMediaItem(m.id, { caption: e.target.value })}
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
                              value={(m.duration ?? "") as any}
                              onChange={(e) => updateMediaItem(m.id, { duration: e.target.value as any })}
                            />
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label">Thumbnail URL (obrigatório para vídeo)</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="URL da thumbnail ou faça upload abaixo"
                            value={m.thumbnail_url || ""}
                            onChange={(e) => updateMediaItem(m.id, { thumbnail_url: e.target.value })}
                          />
                        </div>

                        {/* previews */}
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
                          {m.thumbnail_url && (
                            <img src={m.thumbnail_url} alt="thumb" style={{ width: 84, height: 48, objectFit: "cover", borderRadius: 8 }} />
                          )}

                          {m.type === "image" && m.url && (
                            <img src={m.url} alt="preview" style={{ width: 84, height: 48, objectFit: "cover", borderRadius: 8 }} />
                          )}

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
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadByUrl(m.url, (m.caption || "imagem") + ".jpg")}>
                                Baixar
                              </button>
                            </>
                          )}

                          {m.thumbnail_url && !m.thumbnail_url.startsWith("blob:") && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => downloadByUrl(m.thumbnail_url!, (m.caption || "thumb") + "-thumb.jpg")}
                            >
                              Baixar thumb
                            </button>
                          )}

                          {m.type === "video" && m.url && (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(m.url, "Link copiado!")}>
                              Copiar link
                            </button>
                          )}
                        </div>

                        {/* inputs ocultos */}
                        <input
                          ref={(el) => {
                            mediaImageInputRefs.current[String(m.id)] = el;
                          }}
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
                          ref={(el) => {
                            mediaThumbInputRefs.current[String(m.id)] = el;
                          }}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onPickMediaFile(m.id, file, "thumb");
                            e.currentTarget.value = "";
                          }}
                        />

                        {/* ✅ BOTÕES: um único “Remover” que REMOVE O ITEM (e só aparece depois de adicionar algo) */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
                          {m.type === "image" ? (
                            <button type="button" className="btn btn-secondary" onClick={() => mediaImageInputRefs.current[String(m.id)]?.click()}>
                              <i className="fa-solid fa-upload"></i> {hasAdded ? "Trocar imagem" : "Adicionar imagem"}
                            </button>
                          ) : (
                            <button type="button" className="btn btn-secondary" onClick={() => mediaThumbInputRefs.current[String(m.id)]?.click()}>
                              <i className="fa-solid fa-upload"></i> {hasAdded ? "Trocar thumbnail" : "Adicionar thumbnail"}
                            </button>
                          )}

                          {hasAdded && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeMediaItem(m.id); // ✅ remove o item visual inteiro
                              }}
                              title="Remover item"
                            >
                              <i className="fa-solid fa-trash"></i> Remover
                            </button>
                          )}
                        </div>

                        {/* dropzone por item */}
                        <div
                          className={`image-dropzone small ${mediaDragOverId === String(m.id) ? "drag-over" : ""}`}
                          style={{ marginTop: 10 }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMediaDragOverId(String(m.id));
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMediaDragOverId(String(m.id));
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMediaDragOverId(null);
                          }}
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
                  );
                })}
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

        {/* ======================== FILES ======================== */}
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
                        <button type="button" className="btn-icon btn-danger" onClick={() => removeAssetFile(index)} title="Remover arquivo">
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
