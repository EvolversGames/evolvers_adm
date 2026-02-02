// src/pages/courses/useNewCourseController.ts
import { useEffect, useMemo, useState } from "react";
import { repository } from "../../data/courses/repository";
import { createEmptyDraft, type CourseDraft } from "../../domain/courses/model";
import { validateCourseDraft, hasErrors, type CourseDraftErrors } from "../../domain/courses/validation";

type PublishResult =
  | { ok: true; res: unknown }
  | { ok: false; kind: "validation"; fieldErrors: CourseDraftErrors }
  | { ok: false; kind: "api"; apiError: string };

type TouchedMap = Partial<Record<keyof CourseDraft, boolean>>;

export function useNewCourseController() {
  const [draft, setDraft] = useState<CourseDraft>(() => repository.loadDraft());
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Controle de UX
  const [touched, setTouched] = useState<TouchedMap>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ✅ Validação completa (sempre calculada)
  const fieldErrors = useMemo(() => validateCourseDraft(draft), [draft]);

  // ✅ Só exibe erro se: submitAttempted OU campo tocado
  const visibleErrors = useMemo(() => {
    const out: CourseDraftErrors = {};
    for (const [key, msg] of Object.entries(fieldErrors)) {
      const k = key as keyof CourseDraft;
      if (submitAttempted || touched[k]) out[k] = msg;
    }
    return out;
  }, [fieldErrors, submitAttempted, touched]);

  const isValid = !hasErrors(fieldErrors);

  // ✅ Autosave local apenas quando válido
  useEffect(() => {
    if (!isValid) return;
    repository.saveDraft(draft);
  }, [draft, isValid]);

  function setField<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));

    // ✅ Se o usuário digitou/alterou, marca como tocado
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function markTouched<K extends keyof CourseDraft>(key: K) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  

  // ✅ Upload se tiver arquivo e depois publica
  async function publish(): Promise<PublishResult> {
    setSubmitAttempted(true);

    const errors = validateCourseDraft(draft);
    const valid = !hasErrors(errors);

    if (!valid) return { ok: false, kind: "validation", fieldErrors: errors };

    setIsSaving(true);
    try {
      let nextDraft = draft;

      if (draft.image_file) {
        const url = await repository.uploadCourseImage(draft.image_file);
        nextDraft = { ...draft, image_url: url, image_file: undefined };
      }

      const res = await repository.publishDraft(nextDraft);
      return { ok: true, res };
    } catch (e: any) {
      return { ok: false, kind: "api", apiError: e?.message ?? "Erro ao enviar para API" };
    } finally {
      setIsSaving(false);
    }
  }

  function reset() {
    const fresh = createEmptyDraft();
    setDraft(fresh);
    setTouched({});
    setSubmitAttempted(false);
    repository.clearDraft();
  }


const update = async (id: number): Promise<PublishResult> => {
  setSubmitAttempted(true);

  // ✅ Validar usando a mesma lógica do publish
  const errors = validateCourseDraft(draft);
  const valid = !hasErrors(errors);

  if (!valid) return { ok: false, kind: "validation", fieldErrors: errors };

  setIsSaving(true);
  try {
    let nextDraft = draft;

    // ✅ Upload de imagem se necessário
    if (draft.image_file) {
      const url = await repository.uploadCourseImage(draft.image_file);
      nextDraft = { ...draft, image_url: url, image_file: undefined };
    }

    // ✅ Atualizar ao invés de publicar
    const res = await repository.updateDraft(id, nextDraft);
    return { ok: true, res };
  } catch (e: any) {
    return { ok: false, kind: "api", apiError: e?.message ?? "Erro ao atualizar curso" };
  } finally {
    setIsSaving(false);
  }
};

// ============================================================
// NO RETURN DO HOOK, ADICIONAR update:
// ============================================================

return {
  draft,
  setField,
  markTouched,
  isSaving,
  isValid,
  fieldErrors,
  visibleErrors,
  publish,
  update,        // ← ADICIONAR
  reset,
  submitAttempted,
};
}