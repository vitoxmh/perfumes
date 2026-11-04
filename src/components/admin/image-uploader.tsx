"use client";

import { useState, type ChangeEvent } from "react";

type Status = "idle" | "uploading" | "done" | "error" | "toobig";

export function ImageUploader({ defaultUrl }: { defaultUrl?: string | null }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [status, setStatus] = useState<Status>("idle");

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1_500_000) {
      setStatus("toobig");
      return;
    }

    setStatus("uploading");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as { url: string };
      setUrl(data.url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="imgup">
      <input
        type="text"
        name="imageUrl"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setStatus("idle");
        }}
        placeholder="URL de la imagen o súbelo desde tu compu"
        className="imgup__input"
        readOnly={status === "uploading"}
      />

      <div className="imgup__pick">
        <label className="imgup__btn">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="imgup__file"
            onChange={onPick}
          />
          {status === "uploading" ? "Subiendo…" : "📎 Elegir imagen"}
        </label>
        <span className="imgup__hint">JPG, PNG o WEBP · máx. 1.5 MB</span>
      </div>

      {status === "toobig" ? (
        <p className="imgup__error">La imagen supera 1.5 MB. Comprímela e inténtalo de nuevo.</p>
      ) : null}
      {status === "error" ? <p className="imgup__error">No se pudo subir la imagen.</p> : null}
      {status === "done" ? <p className="imgup__ok">✓ Imagen subida</p> : null}

      {url && status !== "error" ? (
        <img src={url} alt="Vista previa" className="imgup__preview" />
      ) : null}
    </div>
  );
}
