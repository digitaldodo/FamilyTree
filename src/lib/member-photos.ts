/**
 * Member photo helpers — one place that knows how a member's photos are
 * resolved so greetings, galleries and "Add All" never disagree.
 *
 * A member's photos are:
 *   1. their primary/profile photo (`imageUrl`) — the DEFAULT photo
 *   2. any additional image `media` records attached to the member
 * Photos are referenced by URL; nothing is re-uploaded or duplicated.
 */

export interface PhotoSourceMember {
  id: string;
  imageUrl?: string | null;
  media?: { id?: string; url: string; type?: string | null }[] | null;
}

export interface MemberPhoto {
  url: string;
  /** True for the member's primary/profile photo. */
  isDefault: boolean;
}

function cleanUrl(url: unknown): string | null {
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}

/** The member's primary/profile photo, or null when they have none. */
export function getDefaultMemberPhoto(member: PhotoSourceMember): string | null {
  return cleanUrl(member.imageUrl);
}

/** All distinct image URLs for a member, default photo first. */
export function getMemberPhotos(member: PhotoSourceMember): MemberPhoto[] {
  const photos: MemberPhoto[] = [];
  const seen = new Set<string>();

  const defaultUrl = getDefaultMemberPhoto(member);
  if (defaultUrl) {
    photos.push({ url: defaultUrl, isDefault: true });
    seen.add(defaultUrl);
  }

  for (const media of member.media ?? []) {
    const url = cleanUrl(media?.url);
    if (!url || seen.has(url)) continue;
    if (media.type && media.type !== 'image') continue;
    seen.add(url);
    photos.push({ url, isDefault: false });
  }

  return photos;
}

/** Image URLs from memories a member is tagged in (not already in their own photos). */
export function getMemoryPhotosForMember(
  memberId: string,
  memories: {
    members?: { memberId: string }[] | null;
    media?: { url: string; type?: string | null }[] | null;
  }[],
  exclude: Iterable<string> = []
): string[] {
  const seen = new Set<string>(exclude);
  const urls: string[] = [];
  for (const memory of memories ?? []) {
    if (!memory?.members?.some((m) => m.memberId === memberId)) continue;
    for (const media of memory.media ?? []) {
      const url = cleanUrl(media?.url);
      if (!url || seen.has(url)) continue;
      if (media.type && media.type !== 'image') continue;
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}
