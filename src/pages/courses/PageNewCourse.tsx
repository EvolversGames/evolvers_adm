// src/pages/courses/PageNewCourse.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./course.css";

import { useNewCourseController } from "./useNewCourseController";
import { generateSlug } from "../../domain/courses/mapper";
import { api as courseApi } from "../../data/courses/api";

import { categoryRepository } from "../../data/categories/categoryRepository";
import { levelRepository } from "../../data/levels/levelRepository "; // ✅ tirado espaço do path
import { softwareRepository } from "../../data/softwares/softwareRepository";
import { http } from "../../services/http/index";

import type { Category } from "../../domain/categories/category";
import type { Level } from "../../domain/levels/level";
import type { Software } from "../../domain/softwares/software";
import { draftToPayload } from "../../domain/courses/mapper"; // ✅ garantir import
import { uploadCarouselAndReplace } from "../../utils/uploadCarouselAndReplace";
import type { MediaCarouselItem } from "../../domain/courses/courseCarousel.types";


import { badgeRepository } from "../../data/badges/badgeRepository";

type Step = "basic" | "details";
type Tag = { id: number; name: string };
type Instructor = { id: number; name: string; role?: string; initials?: string; avatarUrl?: string };
type Badge = { id: number; name: string };
type CornerBadge = { id: number; name: string };
type Lesson = { id: string; title: string; duration: string };
type Module = { id: string; title: string; lessons: Lesson[] };
type MediaCarouselType = "image" | "video";




const mmssToSeconds = (v: string): number => {
  const [mmRaw, ssRaw] = v.split(":");
  const mm = Number(mmRaw ?? 0);
  const ss = Number(ssRaw ?? 0);
  if (!Number.isFinite(mm) || !Number.isFinite(ss)) return 0;
  return Math.max(0, mm * 60 + ss);
};

type FieldName =
  | "title" | "slug" | "description" | "image_url" | "category_id" | "level_id"
  | "software_id" | "duration_text" | "duration_minutes" | "price" | "original_price"
  | "subtitle" | "badge_id" | "corner_badge_id" | "tags" | "instructors"
  | "requirements" | "objectives" | "target_audience";

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const PageNewCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ✅ se id === "novo", NÃO é edição
  const isEditing = !!id && id !== "novo";
  const isNew = !isEditing;

  console.log("🔍 Modo:", isEditing ? "EDITAR" : "CRIAR", "ID:", id);

  const { draft, setField, isSaving, fieldErrors, reset } = useNewCourseController();

  const [step, setStep] = useState<Step>("basic");
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [cornerBadges, setCornerBadges] = useState<CornerBadge[]>([]);
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
    const okSize = imageFile.size <= 5 * 1024 * 1024; // Aumentado de 2MB para 5MB

    console.log("🔍 canUpload - Validando arquivo:");
    console.log("  - Nome:", imageFile.name);
    console.log("  - Tipo:", imageFile.type);
    console.log("  - Tamanho:", (imageFile.size / 1024 / 1024).toFixed(2), "MB");
    console.log("  - okType:", okType);
    console.log("  - okSize:", okSize, "(limite: 5MB)");
    console.log("  - Resultado:", okType && okSize);

    return okType && okSize;
  }, [imageFile]);

  const setPreviewFromFile = (file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setField("image_url" as any, url);
  };

  const clearImage = () => {
    setImageFile(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setField("image_url" as any, "");
    markTouched("image_url");
  };

  const onPickFile = (file: File) => {
    console.log("📁 onPickFile - Arquivo selecionado:");
    console.log("  - Nome:", file.name);
    console.log("  - Tipo:", file.type);
    console.log("  - Tamanho:", (file.size / 1024 / 1024).toFixed(2), "MB");

    setImageFile(file);
    setPreviewFromFile(file);
    markTouched("image_url");
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Debug: logar sempre que imageFile mudar
  useEffect(() => {
    console.log("🔄 imageFile mudou:", imageFile ? imageFile.name : "null");
    if (imageFile) {
      console.log("  - Tipo:", imageFile.type);
      console.log("  - Tamanho:", (imageFile.size / 1024 / 1024).toFixed(2), "MB");
    }
  }, [imageFile]);

  const [originalPriceText, setOriginalPriceText] = useState<string>("");
  const [durationMinutesText, setDurationMinutesText] = useState<string>("");

  useEffect(() => {
    setOriginalPriceText(draft.original_price != null ? String(draft.original_price) : "");
    setDurationMinutesText((draft as any).duration_minutes != null ? String((draft as any).duration_minutes) : "");
  }, [draft.original_price, (draft as any).duration_minutes]);

  const [modules, setModules] = useState<Module[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);



  const selectedTagIds: number[] = (draft as any).tag_ids ?? [];
  const selectedInstructorIds: number[] = (draft as any).instructor_ids ?? [];



// =========================================================
// 🎞️ CARROSSEL - HELPERS (organizado)
// =========================================================

const [mediaCarousel, setMediaCarousel] = useState<MediaCarouselItem[]>([]);
const dragMediaIdRef = useRef<string | null>(null);
const [mediaDragOverId, setMediaDragOverId] = useState<string | null>(null);

// refs por item (pra abrir o seletor de arquivo do item certo)
const mediaImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
const mediaThumbInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

const addMediaItem = (type: MediaCarouselType) => {
  setMediaCarousel((prev) => {
    const next: MediaCarouselItem = {
      id: uid(),
      type,
      url: "",
      thumbnail_url: "",
      title: "",
      duration: type === "video" ? 0 : null,
      sort_order: prev.length + 1,
      _file: null,
      _thumbFile: null,
    };
    return [...prev, next];
  });
};


const removeMediaItem = (mediaId: string) => {
  setMediaCarousel((prev) => prev.filter((x) => x.id !== mediaId));
};

const updateMediaItem = (mediaId: string, patch: Partial<MediaCarouselItem>) => {
  setMediaCarousel((prev) => prev.map((x) => (x.id === mediaId ? { ...x, ...patch } : x)));
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

const isAllowedImage = (file: File) =>
  ["image/png", "image/jpeg", "image/webp"].includes(file.type);

const fileToObjectUrl = (file: File) => URL.createObjectURL(file);

// ✅ upload local (preview) por item
// PageNewCourse.tsx - função onPickMediaFile

const onPickMediaFile = (mediaId: string, file: File, kind: "image" | "thumb") => {
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
          _file: file, // ✅ CRÍTICO: salvar o File aqui
        };
      }

      console.log("💾 Salvando File no _thumbFile para:", mediaId);
      return {
        ...m,
        thumbnail_url: blobUrl,
        _thumbFile: file, // ✅ CRÍTICO: salvar o File aqui
      };
    })
  );

  console.log("✅ State do carrossel atualizado");
};


// download por url (imagem/thumb)
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


// =========================================================
// 🎞️ CARROSSEL - FIM (organizado)
// =========================================================







  const toggleId = (arr: number[], id: number) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const getJson = async <T,>(path: string): Promise<T> => {
    const res: any = await http.get(path);
    const payload = res?.data ?? res;
    return (payload?.data ?? payload) as T;
  };

  // ✅ FUNÇÃO loadCourse (fica ANTES do useEffect que chama)
  const loadCourse = async (courseId: number) => {
    try {
      setLoading(true);
      console.log("📡 Buscando curso:", courseId);

      const course = await courseApi.getById(courseId);
      console.log("✅ Curso retornado:", course);

      if (!course || !course.title) {
        throw new Error("Dados do curso inválidos");
      }

      setField("title" as any, course.title);
      setField("slug" as any, course.slug);
      setField("description" as any, course.description);
      setField("image_url" as any, course.image_url || "");
      setField("subtitle" as any, course.subtitle || "");
      setField("category_id" as any, course.category_id);
      setField("level_id" as any, course.level_id);
      setField("software_id" as any, course.software_id || null);
      setField("duration_text" as any, course.duration_text || "");
      setField("duration_minutes" as any, course.duration_minutes || null);
      setField("price" as any, course.price);
      setField("original_price" as any, course.original_price || null);
      setField("status" as any, course.status || "draft");
      setField("active" as any, course.active !== undefined ? course.active : true);
      setField("featured" as any, course.featured !== undefined ? course.featured : false);
      setField("badge_id" as any, course.badge_id || null);
      setField("corner_badge_id" as any, course.corner_badge_id || null);
      setField("tag_ids" as any, course.tag_ids || []);
      setField("instructor_ids" as any, course.instructor_ids || []);
      setField("purchase_url" as any, (course as any).purchase_url || null);

      if (course.modules) setModules(course.modules);
      if (course.requirements) setRequirements(course.requirements);
      if (course.objectives) setObjectives(course.objectives);
      if (course.target_audience) setTargetAudience(course.target_audience);
      if (course.original_price) setOriginalPriceText(String(course.original_price));
      if (course.duration_minutes) setDurationMinutesText(String(course.duration_minutes));
      if ((course as any).media_carousel?.length) {
        const normalized = (course as any).media_carousel.map((x: any, idx: number) => ({
          id: x.id ? String(x.id) : uid(),              // id local pro React
          type: x.type as MediaCarouselType,            // 'image' | 'video'
          url: x.url ?? "",
          thumbnail_url: x.thumbnail_url ?? "",
          title: x.title ?? "",
          duration: x.duration ?? (x.type === "video" ? "00:00" : undefined),
          sort_order: x.sort_order ?? idx + 1,

          // ❗ campos APENAS do front (upload / preview)
          _file: null,
          _thumbFile: null,
        }));

  setMediaCarousel(normalized);
} else {
  // evita “vazar” mídia de outro curso ao trocar de rota
  setMediaCarousel([]);
}
      console.log("✅ Campos preenchidos!");
    } catch (e: any) {
      console.error("❌ Erro:", e);
      setLoadError("Erro ao carregar curso");
      showMessage("error", "Erro ao carregar curso");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1) Carregar listas do formulário
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [categoriesData, levelsData, softwaresData, tagsData, instructorsData, badgesData] = await Promise.all([
          categoryRepository.getAll(),
          levelRepository.getAll(),
          softwareRepository.getAll(),
          getJson<Tag[]>("/tags"),
          getJson<Instructor[]>("/instructors"),
          badgeRepository.getAll()
        ]);

        setCategories(categoriesData);
        setLevels(levelsData);
        setSoftwares(softwaresData);
        setTags(tagsData ?? []);
        setInstructors(instructorsData ?? []);
        setBadges(badgesData);



      const fakeCornerBadges: CornerBadge[] = [
        { id: 1, name: "Nenhum" },
        { id: 2, name: "Hot" },
        { id: 3, name: "New" },
      ];
      setCornerBadges(fakeCornerBadges);



        // ⚠️ badges/cornerBadges: você tem state mas não carrega em lugar nenhum.
        // Se tiver endpoint, descomente:
        // setBadges(await getJson<Badge[]>("/badges"));
        // setCornerBadges(await getJson<CornerBadge[]>("/corner-badges"));
      } catch (e: any) {
        console.error("Erro ao carregar dados:", e);
        setLoadError(e?.message ?? "Erro ao carregar dados");
        showMessage("error", "Erro ao carregar dados do formulário");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ✅ 2) SEMPRE que entrar em /novo, limpar geral
  useEffect(() => {
    if (isNew) {
      console.log("🧹 Entrou em NOVO → reset geral");
      reset();
      setModules([]);
      setRequirements([]);
      setObjectives([]);
      setTargetAudience([]);
      clearImage();
      setStep("basic");
      setMediaCarousel([]);
      setLoadError(null);
      setSubmitAttempted(false);
      setTouched({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  // ✅ 3) Se estiver editando, carregar curso
  useEffect(() => {
    console.log("🔄 useEffect - isEditing:", isEditing, "id:", id);

    if (isEditing && id) {
      console.log("📥 Carregando curso ID:", id);
      loadCourse(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id]);

// ✅ helpers (coloque fora do componente ou acima do handlePublish)
const isBlobUrl = (v: any) => typeof v === "string" && v.trim().startsWith("blob:");

const assertNoBlob = (payload: any) => {
  const problems: string[] = [];

  if (isBlobUrl(payload?.image_url)) problems.push("image_url ainda é blob:");

  const mc = payload?.media_carousel;
  if (Array.isArray(mc)) {
    mc.forEach((it: any, i: number) => {
      if (isBlobUrl(it?.url)) problems.push(`media_carousel[${i}].url ainda é blob:`);
      if (isBlobUrl(it?.thumbnail_url)) problems.push(`media_carousel[${i}].thumbnail_url ainda é blob:`);
    });
  }

  if (problems.length) {
    console.error("🚫 BLOBS DETECTADOS NO PAYLOAD:", problems, payload);
    throw new Error("Ainda existe blob no payload. Falta fazer upload antes de salvar.");
  }
};


const handlePublish = async () => {
  setSubmitAttempted(true);

  try {
    console.log("=== 🚀 INÍCIO DO SALVAMENTO ===");
    console.log("🔍 States atuais:");
    console.log("  - modules:", modules);
    console.log("  - requirements:", requirements);
    console.log("  - objectives:", objectives);
    console.log("  - targetAudience:", targetAudience);
    console.log("  - draft.instructor_ids:", (draft as any).instructor_ids);

    // 1️⃣ Upload da imagem principal
    let imageUrlFinal = String(draft.image_url ?? "").trim();
    console.log("🔍 Verificando imagem principal:");
    console.log("  - imageFile:", imageFile ? imageFile.name : "null");
    console.log("  - canUpload:", canUpload);
    console.log("  - imageUrlFinal:", imageUrlFinal.substring(0, 50));
    console.log("  - isBlob:", imageUrlFinal.startsWith("blob:"));

    if (imageFile && canUpload && imageUrlFinal.startsWith("blob:")) {
      console.log("📤 Fazendo upload da imagem principal...");
      imageUrlFinal = await courseApi.uploadCourseImage(imageFile);
      console.log("✅ Imagem principal enviada:", imageUrlFinal);
    } else {
      console.warn("⚠️ Upload da imagem principal PULADO!");
      console.warn("  Motivo: imageFile =", !!imageFile, "canUpload =", canUpload, "isBlob =", imageUrlFinal.startsWith("blob:"));
    }

    // 2️⃣ Upload do carrossel
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

    const carouselReady = await uploadCarouselAndReplace(mediaCarousel);
    console.log("✅ Carrossel processado!");
    setMediaCarousel(carouselReady);

    // 3️⃣ Monta o carrossel LIMPO
    const carouselPayload = carouselReady.map((m, idx) => ({
      type: m.type,
      url: m.url,
      thumbnail_url: m.thumbnail_url,
      title: m.title,
      duration: m.type === "video" ? (m.duration ?? null) : null,
      sort_order: idx + 1,
    }));

    // 4️⃣ Prepara dados para draftToPayload
    const dataForPayload = {
      ...(draft as any),
      image_url: imageUrlFinal,
      badge_id: (draft as any).badge_id ?? 1,
      corner_badge_id: (draft as any).corner_badge_id ?? 1,
      subtitle: (draft as any).subtitle ?? "",
      
      // ✅ Incluir os states separados
      modules: modules ?? [],
      requirements: requirements ?? [],
      objectives: objectives ?? [],
      target_audience: targetAudience ?? [],
    };

    console.log("📦 Dados ANTES de draftToPayload:");
    console.log("  - modules:", dataForPayload.modules?.length);
    console.log("  - requirements:", dataForPayload.requirements?.length);
    console.log("  - objectives:", dataForPayload.objectives?.length);
    console.log("  - target_audience:", dataForPayload.target_audience?.length);
    console.log("  - instructor_ids:", dataForPayload.instructor_ids);

    // 5️⃣ Passa por draftToPayload
    const payload = draftToPayload(dataForPayload);

    console.log("📦 Dados DEPOIS de draftToPayload:");
    console.log("  - modules:", payload.modules?.length);
    console.log("  - requirements:", payload.requirements?.length);
    console.log("  - objectives:", payload.objectives?.length);
    console.log("  - target_audience:", payload.target_audience?.length);
    console.log("  - instructor_ids:", payload.instructor_ids);

    // 6️⃣ Adiciona media_carousel
    const finalPayload = {
      ...payload,
      media_carousel: carouselPayload ?? [],
    };

    console.log("📦 PAYLOAD FINAL sendo enviado:");
    console.log(JSON.stringify(finalPayload, null, 2));

    // 7️⃣ Validação
    assertNoBlob(finalPayload);
    console.log("✅ Nenhum blob detectado!");

    // 8️⃣ Envia
    console.log(isEditing ? "📤 Atualizando curso ID:" + id : "📤 Criando curso...");
    const course = isEditing
      ? await courseApi.update(Number(id), finalPayload as any)
      : await courseApi.create(finalPayload as any);

    console.log("✅ Curso salvo!");
    showMessage("success", isEditing ? "Curso atualizado!" : "Curso criado!");

    // ✅ Redireciona para a lista de produtos após salvar
    setTimeout(() => navigate("/produtos"), 1000);

    return course;

  } catch (e: any) {
    console.error("❌ ERRO:", e);
    console.error("Stack:", e.stack);
    showMessage("error", e?.message ?? "Erro ao salvar curso");
  }
};





  const ImageIcon = () => (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 10.5a1.5 1.5 0 1 0 0-.01V10.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 16.5 9.2 12.1a1 1 0 0 1 1.3.05l2.2 2.1a1 1 0 0 0 1.3.05L20 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (loading) {
    return (
      <div className="novo-curso-page">
        <div className="page-header">
          <h1 className="page-title">Carregando dados...</h1>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="novo-curso-page">
        <div className="page-header">
          <div className="page-header-left">
            <Link to="/produtos" className="back-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="page-title">Erro ao carregar</h1>
          </div>
        </div>
        <div style={{ padding: 20, color: "#ef4444" }}>{loadError}</div>
      </div>
    );
  }

  return (
    <div className="novo-curso-page">
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "16px 24px",
            borderRadius: 8,
            background: toastType === "success" ? "#22c55e" : "#ef4444",
            color: "white",
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toastMessage}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <Link to="/produtos" className="back-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="page-title">
            {isEditing ? (draft.title || `Editar Curso #${id}`) : "Novo Curso"}
          </h1>
        </div>

        <div className="header-actions">
          <Link to="/produtos" className="btn btn-secondary">Cancelar</Link>
          <button className="btn btn-primary" disabled={isSaving} onClick={handlePublish}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSaving ? "Salvando..." : isEditing ? "Atualizar Curso" : "Salvar Curso"}
          </button>
        </div>
      </div>

      <div className="course-form-container">
        <div className="course-steps">
          <button
            type="button"
            className={`course-step ${step === "basic" ? "active" : ""}`}
            onClick={() => setStep("basic")}
          >
            <span className="dot" />Informações básicas
          </button>
          <button
            type="button"
            className={`course-step ${step === "details" ? "active" : ""}`}
            onClick={() => setStep("details")}
          >
            <span className="dot" />Detalhes do curso
          </button>
        </div>

        {step === "basic" && (
          <>
            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">📝</span>Informações Básicas</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Título do Curso <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="Ex: Complete Unity 2D Developer"
                    value={draft.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setField("title" as any, title);
                      const prevAuto = generateSlug(draft.title);
                      const nextAuto = generateSlug(title);
                      if (!draft.slug || draft.slug === prevAuto) setField("slug" as any, nextAuto);
                    }}
                    onBlur={() => markTouched("title")}
                  />
                  {showError("title") && <span className="field-error">{errorText("title")}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    className="form-input"
                    placeholder="complete-unity-2d-developer"
                    value={draft.slug}
                    onChange={(e) => setField("slug" as any, e.target.value)}
                    onBlur={() => markTouched("slug")}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Descrição <span className="required">*</span></label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="Descreva o curso..."
                    value={draft.description}
                    onChange={(e) => setField("description" as any, e.target.value)}
                    onBlur={() => markTouched("description")}
                  />
                  {showError("description") && <span className="field-error">{errorText("description")}</span>}
                </div>

                <div className="form-group full-width course-image-card">
                  <label className="form-label">Imagem do Curso <span className="required">*</span></label>
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
                  <div
                    className={[
                      "course-image-dropzone",
                      dragOver ? "is-drag-over" : "",
                      showError("image_url") ? "is-error" : "",
                    ].join(" ")}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation(); setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) onPickFile(file);
                    }}
                    onBlur={() => markTouched("image_url")}
                  >
                    {draft.image_url ? (
                      <img className="course-image-preview" src={draft.image_url} alt="Preview do curso" />
                    ) : (
                      <div className="course-image-dropzone-inner">
                        <div className="course-image-dropzone-icon"><ImageIcon /></div>
                        <div className="course-image-dropzone-title">Arraste e solte uma imagem aqui</div>
                        <div className="course-image-dropzone-sub">ou clique para selecionar</div>
                        <div className="course-image-dropzone-hint">PNG, JPG ou WEBP (máx. 5MB)</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Subtítulo</label>
                  <input
                    type="text"
                    name="subtitle"
                    className="form-input"
                    placeholder="Breve texto para o card"
                    value={(draft as any).subtitle ?? ""}
                    onChange={(e) => setField("subtitle" as any, e.target.value)}
                    onBlur={() => markTouched("subtitle")}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoria <span className="required">*</span></label>
                  <select
                    name="category_id"
                    className="form-select"
                    value={draft.category_id || ""}
                    onChange={(e) => { setField("category_id" as any, Number(e.target.value)); markTouched("category_id"); }}
                    onBlur={() => markTouched("category_id")}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                  {showError("category_id") && <span className="field-error">{errorText("category_id")}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Nível <span className="required">*</span></label>
                  <select
                    name="level_id"
                    className="form-select"
                    value={draft.level_id || ""}
                    onChange={(e) => { setField("level_id" as any, Number(e.target.value)); markTouched("level_id"); }}
                    onBlur={() => markTouched("level_id")}
                  >
                    <option value="">Selecione um nível</option>
                    {levels.map((lvl) => (<option key={lvl.id} value={lvl.id}>{lvl.name}</option>))}
                  </select>
                  {showError("level_id") && <span className="field-error">{errorText("level_id")}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Software (Opcional)</label>
                  <select
                    name="software_id"
                    className="form-select"
                    value={draft.software_id || ""}
                    onChange={(e) => setField("software_id" as any, e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Nenhum</option>
                    {softwares.map((sw) => (<option key={sw.id} value={sw.id}>{sw.name}</option>))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duração (texto)</label>
                  <input
                    type="text"
                    name="duration_text"
                    className="form-input"
                    placeholder="Ex: 40 horas"
                    value={draft.duration_text}
                    onChange={(e) => setField("duration_text" as any, e.target.value)}
                    onBlur={() => markTouched("duration_text")}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duração (minutos)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    className="form-input"
                    placeholder="Ex: 1020"
                    value={durationMinutesText}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDurationMinutesText(v);
                      if (v === "") { setField("duration_minutes" as any, null); }
                      else { setField("duration_minutes" as any, Number(v)); }
                    }}
                    onBlur={() => markTouched("duration_minutes")}
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">💰</span>Preços</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Preço Atual <span className="required">*</span></label>
                  <div className="price-input">
                    <span>R$</span>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      placeholder="89.90"
                      value={draft.price || ""}
                      onChange={(e) => setField("price" as any, Number(e.target.value))}
                      onBlur={() => markTouched("price")}
                    />
                  </div>
                  {showError("price") && <span className="field-error">{errorText("price")}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Preço Original (Opcional)</label>
                  <div className="price-input">
                    <span>R$</span>
                    <input
                      type="number"
                      name="original_price"
                      step="0.01"
                      placeholder="199.90"
                      value={originalPriceText}
                      onChange={(e) => {
                        const v = e.target.value;
                        setOriginalPriceText(v);
                        if (v === "") { setField("original_price" as any, null); }
                        else { setField("original_price" as any, Number(v)); }
                      }}
                      onBlur={() => markTouched("original_price")}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group full-width">
      <label className="form-label">
        Link de Compra Externo
        <span style={{ color: '#6b7280', fontWeight: 400 }}> (opcional)</span>
      </label>
              <input
                type="url"
                name="purchase_url"
                className="form-input"
                placeholder="https://www.udemy.com/course/seu-curso"
                value={(draft as any).purchase_url || ''}
                onChange={(e) => setField('purchase_url' as any, e.target.value || null)}
                onBlur={() => markTouched('purchase_url' as any)}
              />
              <small style={{ 
                display: 'block', 
                marginTop: '8px', 
                fontSize: '0.875rem', 
                color: '#6b7280' 
              }}>
                Se preenchido, o botão "Comprar" irá redirecionar para este link externo. Deixe em branco para venda interna.
              </small>
            </div>
            </section>

            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">⚙️</span>Configurações</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={draft.status}
                    onChange={(e) => setField("status" as any, e.target.value)}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(e) => setField("active" as any, e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    Ativo
                  </label>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(e) => setField("featured" as any, e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    Destaque
                  </label>
                </div>
              </div>
            </section>

            <div className="form-navigation">
              <button type="button" className="btn btn-primary btn-next" onClick={() => setStep("details")}>
                Próximo: Detalhes do curso
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">🏷️</span>Badges e Etiquetas</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Badge</label>
                  <select
                    name="badge_id"
                    className="form-select"
                    value={(draft as any).badge_id ?? ""}
                    onChange={(e) => setField("badge_id" as any, e.target.value ? Number(e.target.value) : null)}
                    onBlur={() => markTouched("badge_id")}
                  >
                    <option value="">Nenhum</option>
                    {badges.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Corner Badge</label>
                  <select
                    name="corner_badge_id"
                    className="form-select"
                    value={(draft as any).corner_badge_id ?? ""}
                    onChange={(e) => setField("corner_badge_id" as any, e.target.value ? Number(e.target.value) : null)}
                    onBlur={() => markTouched("corner_badge_id")}
                  >
                    <option value="">Nenhum</option>
                    {cornerBadges.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                  </select>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">🏷️</span>Tags (API)</h3>
              <div className="tags-picker">
                {tags.map((t) => {
                  const active = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`tag-chip ${active ? "active" : ""}`}
                      onClick={() => {
                        const next = toggleId(selectedTagIds, t.id);
                        setField("tag_ids" as any, next);
                        markTouched("tags");
                      }}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
              {showError("tags") && <span className="field-error">{errorText("tags")}</span>}
            </section>

            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">👨‍🏫</span>Instrutores</h3>
              <div className="form-group full-width">
                <label className="form-label">Selecionar Instrutores</label>
                <div className="instructor-select-wrapper">
                  <select
                    className="instructor-select"
                    value=""
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      if (id && !selectedInstructorIds.includes(id)) {
                        const next = [...selectedInstructorIds, id];
                        setField("instructor_ids" as any, next);
                        markTouched("instructors");
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">+ Adicionar instrutor</option>
                    {instructors
                      .filter(inst => !selectedInstructorIds.includes(inst.id))
                      .map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name}{inst.role ? ` - ${inst.role}` : ""}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="selected-instructors">
                  {selectedInstructorIds.map((id) => {
                    const inst = instructors.find((i) => i.id === id);
                    if (!inst) return null;
                    return (
                      <div key={id} className="selected-instructor-badge">
                        <span>{inst.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = selectedInstructorIds.filter((x) => x !== id);
                            setField("instructor_ids" as any, next);
                            markTouched("instructors");
                          }}
                          aria-label={`Remover ${inst.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="instructor-combo-hint">
                  {selectedInstructorIds.length === 0
                    ? "Selecione um ou mais instrutores para o curso"
                    : `${selectedInstructorIds.length} ${selectedInstructorIds.length === 1 ? "instrutor selecionado" : "instrutores selecionados"}`
                  }
                </div>
                {showError("instructors") && <span className="field-error">{errorText("instructors")}</span>}
              </div>
            </section>

            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">📚</span>Módulos e Aulas</h3>
              <div className="modules-list">
                {modules.map((m, mIndex) => (
                  <div key={m.id} className="module-item">
                    <div className="module-header">
                      <span className="module-number">{mIndex + 1}</span>
                      <input
                        type="text"
                        className="module-title-input"
                        placeholder="Nome do módulo"
                        value={m.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setModules((prev) => prev.map((x) => (x.id === m.id ? { ...x, title } : x)));
                        }}
                      />
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => setModules((prev) => prev.filter((x) => x.id !== m.id))}
                      >
                        ×
                      </button>
                    </div>

                    <div className="module-lessons">
                      {m.lessons.map((l) => (
                        <div key={l.id} className="lesson-item">
                          <div className="lesson-icon">▶</div>
                          <div className="lesson-info">
                            <input
                              type="text"
                              className="lesson-title-input"
                              placeholder="Título da aula"
                              value={l.title}
                              onChange={(e) => {
                                const title = e.target.value;
                                setModules((prev) =>
                                  prev.map((x) =>
                                    x.id !== m.id ? x : {
                                      ...x,
                                      lessons: x.lessons.map((y) => (y.id === l.id ? { ...y, title } : y)),
                                    }
                                  )
                                );
                              }}
                            />
                            <input
                              type="text"
                              className="lesson-duration-input"
                              placeholder="00:00"
                              value={l.duration}
                              onChange={(e) => {
                                const duration = e.target.value;
                                setModules((prev) =>
                                  prev.map((x) =>
                                    x.id !== m.id ? x : {
                                      ...x,
                                      lessons: x.lessons.map((y) => (y.id === l.id ? { ...y, duration } : y)),
                                    }
                                  )
                                );
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => {
                              setModules((prev) =>
                                prev.map((x) =>
                                  x.id !== m.id ? x : { ...x, lessons: x.lessons.filter((y) => y.id !== l.id) }
                                )
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="add-lesson-btn"
                        onClick={() => {
                          const lesson: Lesson = { id: uid(), title: "", duration: "00:00" };
                          setModules((prev) =>
                            prev.map((x) => (x.id === m.id ? { ...x, lessons: [...x.lessons, lesson] } : x))
                          );
                        }}
                      >
                        <span>+</span> Adicionar Aula
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-module-btn"
                  onClick={() => setModules((prev) => [...prev, { id: uid(), title: "", lessons: [] }])}
                >
                  <span>+</span> Adicionar Módulo
                </button>
              </div>
            </section>

                  <section className="form-section">
  <h3 className="form-section-title">
    <span className="section-icon">🎞️</span>Carrossel de Mídia
  </h3>

  <div className="modules-list">
    {mediaCarousel.map((m, index) => (
      <div
        key={m.id}
        className="module-item"
        draggable
        onDragStart={() => { dragMediaIdRef.current = m.id; }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          const fromId = dragMediaIdRef.current;
          if (fromId && fromId !== m.id) reorderMedia(fromId, m.id);
          dragMediaIdRef.current = null;
        }}
      >
        <div className="module-header">
          <span className="module-number">{index + 1}</span>

          <select
            className="form-select"
            style={{ width: 160 }}
            value={m.type}
            onChange={(e) => {
              const nextType = e.target.value as MediaCarouselType;

              // se mudar pra imagem, duration some
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

          <input
            type="text"
            className="module-title-input"
            placeholder="Título (ex: Unity em 100 segundos)"
            value={m.title}
            onChange={(e) => updateMediaItem(m.id, { title: e.target.value })}
          />

          <button type="button" className="action-btn delete" onClick={() => removeMediaItem(m.id)}>
            ×
          </button>
        </div>

        <div className="module-lessons">
          <div className="lesson-item">
            <div className="lesson-icon">{m.type === "video" ? "▶" : "🖼️"}</div>

            <div className="lesson-info">
              {/* URL principal */}
              <input
                type="text"
                className="lesson-title-input"
                placeholder={m.type === "video" ? "URL do vídeo (YouTube/Vimeo)" : "URL da imagem (ou use upload abaixo)"}
                value={m.url}
                onChange={(e) => updateMediaItem(m.id, { url: e.target.value })}
              />

              {/* duração */}
              {m.type === "video" && (
                <input
                  type="text"
                  className="lesson-duration-input"
                  placeholder="Duração (ex: 2:45)"
                  value={m.duration ?? ""}
                  onChange={(e) => updateMediaItem(m.id, { duration: mmssToSeconds(e.target.value) })}
                />
              )}

              {/* thumb url */}
              <input
                type="text"
                className="lesson-title-input"
                placeholder="Thumbnail URL (obrigatório) ou faça upload abaixo"
                value={m.thumbnail_url}
                onChange={(e) => updateMediaItem(m.id, { thumbnail_url: e.target.value })}
              />

              {/* PREVIEW + AÇÕES */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {m.thumbnail_url ? (
                  <img
                    src={m.thumbnail_url}
                    alt="thumb"
                    style={{ width: 84, height: 48, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : null}

                {m.type === "image" && m.url ? (
                  <img
                    src={m.url}
                    alt="preview"
                    style={{ width: 84, height: 48, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : null}

                {/* abrir */}
                {m.type === "video" && m.url ? (
                  <a className="btn btn-secondary" href={m.url} target="_blank" rel="noreferrer">
                    Abrir vídeo
                  </a>
                ) : null}

                {m.type === "image" && m.url ? (
                  <a className="btn btn-secondary" href={m.url} target="_blank" rel="noreferrer">
                    Abrir imagem
                  </a>
                ) : null}

                {/* baixar / copiar */}
                {m.type === "image" && m.url ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => downloadByUrl(m.url, (m.title || "imagem") + ".jpg")}
                  >
                    Baixar imagem
                  </button>
                ) : null}

                {m.thumbnail_url ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => downloadByUrl(m.thumbnail_url, (m.title || "thumb") + "-thumb.jpg")}
                  >
                    Baixar thumb
                  </button>
                ) : null}

                {m.type === "video" && m.url ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(m.url, "Link do vídeo copiado!")}
                  >
                    Copiar link
                  </button>
                ) : null}
              </div>

              {/* ========= UPLOADS (PROCURAR + DRAG/DROP) ========= */}
              {/* input escondido - imagem */}
              <input
                ref={(el) => { mediaImageInputRefs.current[m.id] = el; }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onPickMediaFile(m.id, file, "image");
                  e.currentTarget.value = "";
                }}
              />

              {/* input escondido - thumb */}
              <input
                ref={(el) => { mediaThumbInputRefs.current[m.id] = el; }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onPickMediaFile(m.id, file, "thumb");
                  e.currentTarget.value = "";
                }}
              />

              {/* botões */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {m.type === "image" ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => mediaImageInputRefs.current[m.id]?.click()}
                  >
                    Upload imagem
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => mediaThumbInputRefs.current[m.id]?.click()}
                  >
                    Upload thumbnail
                  </button>
                )}

                {m.type === "image" && m._file?.name ? <span style={{ opacity: 0.85 }}>{m._file.name}</span> : null}
                {m.type === "video" && m._thumbFile?.name ? <span style={{ opacity: 0.85 }}>{m._thumbFile.name}</span> : null}
              </div>

              {/* dropzone no padrão (usa a mesma classe da imagem do curso) */}
              <div
                className={[
                  "course-image-dropzone",
                  mediaDragOverId === m.id ? "is-drag-over" : "",
                ].join(" ")}
                style={{ marginTop: 10 }}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setMediaDragOverId(m.id); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setMediaDragOverId(m.id); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setMediaDragOverId(null); }}
                onDrop={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  setMediaDragOverId(null);

                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;

                  if (m.type === "image") onPickMediaFile(m.id, file, "image");
                  else onPickMediaFile(m.id, file, "thumb");
                }}
              >
                <div className="course-image-dropzone-inner">
                  <div className="course-image-dropzone-title">
                    {m.type === "image"
                      ? "Arraste e solte a imagem aqui"
                      : "Arraste e solte a thumbnail aqui"}
                  </div>
                  <div className="course-image-dropzone-sub">ou use o botão de upload acima</div>
                  <div className="course-image-dropzone-hint">PNG, JPG ou WEBP</div>
                </div>
              </div>
              {/* ========= /UPLOADS ========= */}
            </div>
          </div>
        </div>
      </div>
    ))}

    <button type="button" className="add-module-btn" onClick={() => addMediaItem("image")}>
      <span>+</span> Adicionar Imagem
    </button>

    <button type="button" className="add-module-btn" onClick={() => addMediaItem("video")} style={{ marginTop: 10 }}>
      <span>+</span> Adicionar Vídeo
    </button>
  </div>
</section>



            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">🧩</span>Requisitos</h3>
              <div className="list-input-container">
                {requirements.map((item, idx) => (
                  <div key={idx} className="list-item">
                    <input
                      type="text"
                      value={item}
                      placeholder="Digite um requisito..."
                      onChange={(e) => {
                        const v = e.target.value;
                        setRequirements((prev) => prev.map((x, i) => (i === idx ? v : x)));
                        markTouched("requirements");
                      }}
                      onBlur={() => markTouched("requirements")}
                    />
                    <button
                      type="button"
                      className="list-item-remove"
                      onClick={() => setRequirements((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="add-list-item" onClick={() => setRequirements((p) => [...p, ""])}>
                  <span>+</span> Adicionar Requisito
                </button>
              </div>
            </section>

            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">🎯</span>O que você vai aprender</h3>
              <div className="list-input-container">
                {objectives.map((item, idx) => (
                  <div key={idx} className="list-item">
                    <input
                      type="text"
                      value={item}
                      placeholder="Digite um objetivo..."
                      onChange={(e) => {
                        const v = e.target.value;
                        setObjectives((prev) => prev.map((x, i) => (i === idx ? v : x)));
                        markTouched("objectives");
                      }}
                      onBlur={() => markTouched("objectives")}
                    />
                    <button
                      type="button"
                      className="list-item-remove"
                      onClick={() => setObjectives((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="add-list-item" onClick={() => setObjectives((p) => [...p, ""])}>
                  <span>+</span> Adicionar Objetivo
                </button>
              </div>
            </section>

            <section className="form-section">
              <h3 className="form-section-title"><span className="section-icon">👥</span>Público-alvo</h3>
              <div className="list-input-container">
                {targetAudience.map((item, idx) => (
                  <div key={idx} className="list-item">
                    <input
                      type="text"
                      value={item}
                      placeholder="Digite um público..."
                      onChange={(e) => {
                        const v = e.target.value;
                        setTargetAudience((prev) => prev.map((x, i) => (i === idx ? v : x)));
                        markTouched("target_audience");
                      }}
                      onBlur={() => markTouched("target_audience")}
                    />
                    <button
                      type="button"
                      className="list-item-remove"
                      onClick={() => setTargetAudience((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="add-list-item" onClick={() => setTargetAudience((p) => [...p, ""])}>
                  <span>+</span> Adicionar Público
                </button>
              </div>
            </section>

            <div className="form-navigation">
              <button type="button" className="btn btn-secondary" onClick={() => setStep("basic")}>Voltar</button>
              <button type="button" className="btn btn-primary btn-next" onClick={handlePublish} disabled={isSaving}>
                {isSaving ? "Salvando..." : isEditing ? "Atualizar Curso" : "Salvar Curso"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PageNewCourse;
