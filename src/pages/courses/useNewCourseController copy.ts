// src/pages/courses/useNewCourseController.ts
import { useEffect, useMemo, useState } from "react";
import { repository } from "../../data/courses/repository";
import { createEmptyDraft, type CourseDraft } from "../../domain/courses/model";
import { validateCourseDraft, hasErrors, type CourseDraftErrors } from "../../domain/courses/validation";

type SaveLocalResult =
  | { ok: true }
  | { ok: false; kind: "validation"; fieldErrors: CourseDraftErrors };

type PublishResult =
  | { ok: true; res: unknown }
  | { ok: false; kind: "validation"; fieldErrors: CourseDraftErrors }
  | { ok: false; kind: "api"; apiError: string };

export function useNewCourseController() {
  const [draft, setDraft] = useState<CourseDraft>(() => repository.loadDraft());
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Validação COMPLETA usando o validation.ts correto
  const fieldErrors = useMemo(() => validateCourseDraft(draft), [draft]);
  const isValid = !hasErrors(fieldErrors);

  // Autosave local quando válido
  useEffect(() => {
    if (!isValid) return;
    repository.saveDraft(draft);
  }, [draft, isValid]);

  // ✅ Atualizar campo do draft
  function setField<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  // ✅ Salvar localmente
  function saveLocal(): SaveLocalResult {
    const errors = validateCourseDraft(draft);
    const valid = !hasErrors(errors);

    if (!valid) {
      return { ok: false, kind: "validation", fieldErrors: errors };
    }

    repository.saveDraft(draft);
    return { ok: true };
  }

  // ✅ Publicar (enviar para API)
  async function publish(): Promise<PublishResult> {
    const errors = validateCourseDraft(draft);
    const valid = !hasErrors(errors);

    if (!valid) {
      return { ok: false, kind: "validation", fieldErrors: errors };
    }

    setIsSaving(true);
    try {
      const res = await repository.publishDraft(draft);
      return { ok: true, res };
    } catch (e: any) {
      console.error("Erro ao publicar:", e);
      return { 
        ok: false, 
        kind: "api", 
        apiError: e?.message ?? "Erro ao enviar para API" 
      };
    } finally {
      setIsSaving(false);
    }
  }

  // ✅ Resetar draft
  function reset() {
    const fresh = createEmptyDraft();
    setDraft(fresh);
    repository.clearDraft();
  }

  return { 
    draft, 
    setField, 
    isSaving, 
    isValid, 
    fieldErrors, 
    saveLocal, 
    publish, 
    reset 
  };
}