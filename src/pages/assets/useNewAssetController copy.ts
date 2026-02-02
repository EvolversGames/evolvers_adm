// src/pages/assets/useNewAssetController.ts

import { useEffect, useMemo, useState } from "react";
import { assetRepository } from "../../data/assets/repository";
import { createEmptyAssetDraft, type AssetDraft, type AssetDraftErrors } from "../../domain/assets/model";
import { validateAssetDraft, hasErrors } from "../../domain/assets/validation";

type PublishResult =
  | { ok: true; res: unknown }
  | { ok: false; kind: "validation"; fieldErrors: AssetDraftErrors }
  | { ok: false; kind: "api"; apiError: string };

type TouchedMap = Partial<Record<keyof AssetDraft, boolean>>;

export function useNewAssetController() {
  const [draft, setDraft] = useState<AssetDraft>(() => assetRepository.loadDraft());
  const [isSaving, setIsSaving] = useState(false);

  // Controle de UX
  const [touched, setTouched] = useState<TouchedMap>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validação completa (sempre calculada)
  const fieldErrors = useMemo(() => validateAssetDraft(draft), [draft]);

  // Só exibe erro se: submitAttempted OU campo tocado
  const visibleErrors = useMemo(() => {
    const out: AssetDraftErrors = {};
    for (const [key, msg] of Object.entries(fieldErrors)) {
      const k = key as keyof AssetDraft;
      if (submitAttempted || touched[k]) (out as any)[k] = msg;
    }
    return out;
  }, [fieldErrors, submitAttempted, touched]);

  const isValid = !hasErrors(fieldErrors);

  // Autosave local apenas quando válido
  useEffect(() => {
    if (!isValid) return;
    assetRepository.saveDraft(draft);
  }, [draft, isValid]);

  function setField<K extends keyof AssetDraft>(key: K, value: AssetDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function markTouched<K extends keyof AssetDraft>(key: K) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function setDraftFull(newDraft: AssetDraft) {
    setDraft(newDraft);
  }

  // Publicar novo asset
  async function publish(): Promise<PublishResult> {
    setSubmitAttempted(true);

    const errors = validateAssetDraft(draft);
    const valid = !hasErrors(errors);

    if (!valid) return { ok: false, kind: "validation", fieldErrors: errors };

    setIsSaving(true);
    try {
      const res = await assetRepository.publishDraft(draft);
      return { ok: true, res };
    } catch (e: any) {
      return { ok: false, kind: "api", apiError: e?.message ?? "Erro ao enviar para API" };
    } finally {
      setIsSaving(false);
    }
  }

  // Atualizar asset existente
  async function update(id: number): Promise<PublishResult> {
    setSubmitAttempted(true);

    const errors = validateAssetDraft(draft);
    const valid = !hasErrors(errors);

    if (!valid) return { ok: false, kind: "validation", fieldErrors: errors };

    setIsSaving(true);
    try {
      const res = await assetRepository.updateAsset(id, draft);
      return { ok: true, res };
    } catch (e: any) {
      return { ok: false, kind: "api", apiError: e?.message ?? "Erro ao atualizar asset" };
    } finally {
      setIsSaving(false);
    }
  }

  function reset() {
    const fresh = createEmptyAssetDraft();
    setDraft(fresh);
    setTouched({});
    setSubmitAttempted(false);
    assetRepository.clearDraft();
  }

  return {
    draft,
    setDraft: setDraftFull,
    setField,
    markTouched,
    isSaving,
    isValid,
    fieldErrors,
    visibleErrors,
    publish,
    update,
    reset,
    submitAttempted,
  };
}
