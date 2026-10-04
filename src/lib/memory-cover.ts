/**
 * A memory's cover is ONLY a photo that belongs to the memory itself:
 * its first attached photo, otherwise its explicit album cover.
 * Member/profile photos are never used. Returns null when there is none.
 */
export function getMemoryCover(memory: {
  media?: { url?: string | null }[] | null;
  albumCoverUrl?: string | null;
} | null | undefined): string | null {
  if (!memory) return null;
  const firstPhoto = Array.isArray(memory.media)
    ? memory.media.find((m) => !!m?.url)?.url
    : null;
  return firstPhoto || memory.albumCoverUrl || null;
}
