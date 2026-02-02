export type MediaCarouselType = "image" | "video";



// ✅ item no estado da tela (pode ter File e blob)
export type MediaCarouselItem = {
  id: string;

  type: MediaCarouselType;
  title: string;

  // pode ser blob: ou http(s) enquanto edita
  url: string;
  thumbnail_url: string;

  // vídeo: segundos (number). imagem: null/undefined
  duration?: number | null;

  // ✅ precisa existir pq você usa no front
  sort_order: number;

  // campos internos do front para upload
  _file?: File | null;
  _thumbFile?: File | null;
};

// ✅ item que vai para API (não pode ter blob nem File)
export type MediaCarouselPayloadItem = {
  type: MediaCarouselType;
  title: string;
  url: string;            // http(s)
  thumbnail_url: string;  // http(s)
  duration: number | null;
  sort_order: number;
};