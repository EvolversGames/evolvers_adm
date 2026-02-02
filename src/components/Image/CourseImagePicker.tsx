// src/components/Image/CourseImagePicker.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./CourseImagePicker.css";

type Props = {
  imageUrl: string;
  imageFile?: File;
  error?: string;
  onUrlChange: (url: string) => void;
  onFileChange: (file?: File) => void;
};

export default function CourseImagePicker({
  imageUrl,
  imageFile,
  error,
  onUrlChange,
  onFileChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return imageUrl?.trim() ? imageUrl.trim() : "";
  }, [imageFile, imageUrl]);

  useEffect(() => {
    return () => {
      if (imageFile && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile, previewUrl]);

  const pickFile = () => inputRef.current?.click();

  const handleFile = (file?: File) => {
    if (!file) return;

    // só imagens
    if (!file.type.startsWith("image/")) return;

    // limite opcional (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      // Não faz toast aqui pra não acoplar, só ignora e deixa a validação geral lidar se quiser
      return;
    }

    // quando escolhe arquivo, a fonte vira o arquivo (limpa url)
    onUrlChange("");
    onFileChange(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clearImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onFileChange(undefined);
    onUrlChange("");
  };

  return (
    <div className="form-group full-width">
      <label className="form-label">
        Imagem do Curso <span className="required">*</span>
      </label>

      <div
        className={[
          "evo-dropzone",
          dragOver ? "is-dragover" : "",
          error ? "has-error" : "",
          previewUrl ? "has-preview" : "",
        ].join(" ")}
        onClick={pickFile}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
      >
        {previewUrl ? (
          <div className="evo-preview-wrap">
            <img className="evo-preview-img" src={previewUrl} alt="Preview da imagem do curso" />
            <button
              type="button"
              className="evo-remove-btn"
              onClick={clearImage}
              aria-label="Remover imagem"
              title="Remover imagem"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="evo-dz-card">
            <div className="evo-dz-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M21 16V8a2 2 0 0 0-2-2H5A2 2 0 0 0 3 8v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 14l2.2-2.2a1 1 0 0 1 1.4 0L13 14l1.6-1.6a1 1 0 0 1 1.4 0L19 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.2 10.2h.01"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="evo-dz-title">Arraste e solte sua imagem aqui</div>
            <div className="evo-dz-sub">ou clique para selecionar um arquivo</div>

            <div className="evo-dz-actions">
              <span className="evo-dz-btn">Selecionar arquivo</span>
              <span className="evo-dz-hint">PNG, JPG • até 5MB</span>
            </div>
          </div>
        )}

        {dragOver && (
          <div className="evo-dz-overlay">
            <div className="evo-dz-overlay-inner">
              <div className="evo-dz-overlay-icon">⬇️</div>
              <div className="evo-dz-overlay-text">Solte para enviar</div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* URL opcional */}
      <div className="evo-url-block">
        <div className="evo-url-label">Ou informe uma URL (opcional)</div>

        <div className="evo-url-row">
          <input
            type="url"
            name="image_url"
            className="form-input"
            placeholder="https://exemplo.com/imagem.jpg"
            value={imageUrl}
            onChange={(e) => {
              // ao digitar url, limpa o arquivo
              onFileChange(undefined);
              onUrlChange(e.target.value);
            }}
          />

          {(imageUrl || imageFile) && (
            <button type="button" className="btn btn-secondary" onClick={clearImage}>
              Limpar
            </button>
          )}
        </div>

        {error && <span className="field-error">{error}</span>}
      </div>
    </div>
  );
}
