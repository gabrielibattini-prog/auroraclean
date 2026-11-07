"use client";

import { useEffect, useState } from "react";
import { get, set } from "idb-keyval";
import { novoId } from "./dados/util";
import type { ArquivoRef } from "./dados/tipos";

/**
 * Armazenamento de fotos e documentos do MVP (IndexedDB do navegador).
 * No back-end: buckets privados do Supabase Storage com URLs assinadas.
 */

const LADO_MAX = 1280;

/**
 * Redimensiona e recodifica a foto em JPEG.
 * Recodificar via canvas descarta os metadados EXIF — inclusive o GPS,
 * que revelaria o endereço exato do cliente.
 */
export async function processarFoto(arquivo: File): Promise<string> {
  if (!arquivo.type.startsWith("image/")) throw new Error("Envie uma imagem.");
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((ok, erro) =>
    canvas.toBlob((b) => (b ? ok(b) : erro(new Error("Falha ao processar a foto."))), "image/jpeg", 0.8),
  );
  const id = novoId("foto");
  await set(id, blob);
  return id;
}

/** Documentos do prestador (imagem ou PDF). Imagens também perdem o EXIF. */
export async function salvarDocumento(arquivo: File): Promise<ArquivoRef> {
  if (arquivo.size > 10 * 1024 * 1024) throw new Error("Arquivo maior que 10 MB.");
  if (arquivo.type.startsWith("image/")) {
    const id = await processarFoto(arquivo);
    return { id, nome: arquivo.name, tipo: "image/jpeg" };
  }
  if (arquivo.type !== "application/pdf") throw new Error("Envie uma imagem ou PDF.");
  const id = novoId("doc");
  await set(id, arquivo);
  return { id, nome: arquivo.name, tipo: arquivo.type };
}

/** URL temporária para exibir um arquivo salvo. */
export function useArquivoUrl(id: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id || id === "demo") return;
    let ativo = true;
    let criada: string | null = null;
    get<Blob>(id).then((blob) => {
      if (!ativo || !blob) return;
      criada = URL.createObjectURL(blob);
      setUrl(criada);
    });
    return () => {
      ativo = false;
      if (criada) URL.revokeObjectURL(criada);
    };
  }, [id]);
  return url;
}
