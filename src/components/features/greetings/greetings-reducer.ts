import {
  GreetingState,
  OccasionType,
  TemplateType,
  CanvasFormat,
  ImageAdjustment,
  SupportingPhoto,
  ArrangementType,
} from '@/types/greetings';
import { getDefaultMemberPhoto, type PhotoSourceMember } from '@/lib/member-photos';

/** The slice of a member the greeting needs. */
export interface GreetingMember extends PhotoSourceMember {
  firstName: string;
  lastName: string;
  birthDate?: string | null;
}

export type GreetingsAction =
  | { type: 'SET_HERO_MEMBER'; payload: { member: GreetingMember; defaultOccasion?: OccasionType } }
  | { type: 'SET_CUSTOM_HERO'; payload: { imageUrl: string; defaultOccasion?: OccasionType } }
  | { type: 'SET_OCCASION'; payload: OccasionType }
  | { type: 'SET_TEMPLATE'; payload: TemplateType }
  | { type: 'SET_FORMAT'; payload: CanvasFormat }
  | { type: 'UPDATE_TEXT'; payload: Partial<Pick<GreetingState, 'headline' | 'heroName' | 'message' | 'dateStr' | 'footer' | 'senderName'>> }
  | { type: 'SET_HERO_IMAGE'; payload: string }
  | { type: 'UPDATE_HERO_ADJUSTMENT'; payload: Partial<ImageAdjustment> }
  | { type: 'ADD_SUPPORTING_PHOTO'; payload: SupportingPhoto }
  | { type: 'UPDATE_SUPPORTING_PHOTO'; payload: { id: string; updates: Partial<SupportingPhoto> } }
  | { type: 'REMOVE_SUPPORTING_PHOTO'; payload: string }
  | { type: 'SET_HERO_MODE'; payload: 'BACKGROUND' | 'FOREGROUND' }
  | { type: 'ADD_MEMBERS'; payload: GreetingMember[] }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'TOGGLE_MEMBER_PHOTO'; payload: { memberId: string; url: string } }
  | { type: 'ADD_MEMBER_PHOTOS'; payload: { memberId: string; urls: string[] } }
  | { type: 'MAKE_MEMBER_PHOTO_MAIN'; payload: { memberId: string; url: string } }
  | { type: 'SET_ARRANGEMENT'; payload: ArrangementType }
  | { type: 'RESET' };

export const defaultAdjustment: ImageAdjustment = { zoom: 1, x: 0, y: 0, opacity: 100 };

export const initialGreetingState: GreetingState = {
  heroMemberId: null,
  occasion: 'BIRTHDAY',
  template: 'HERITAGE_PORTRAIT',
  format: 'PORTRAIT',
  arrangement: 'FLOATING_BACKGROUND',
  heroImageUrl: null,
  heroAdjustment: { ...defaultAdjustment, opacity: 30 }, // Defaulting to low opacity for background mode
  heroMode: 'BACKGROUND',
  headline: 'Happy Birthday',
  heroName: '',
  message: 'Wishing you a beautiful year ahead.',
  dateStr: '',
  footer: 'With love,',
  senderName: 'Your Family',
  supportingPhotos: [],
  selectedMemberIds: [],
};

// Smart defaults based on occasion
function getOccasionDefaults(occasion: OccasionType) {
  switch (occasion) {
    case 'BIRTHDAY':
      return { headline: 'Happy Birthday', message: 'Wishing you a beautiful year ahead.' };
    case 'ANNIVERSARY':
    case 'WEDDING':
      return { headline: 'Happy Anniversary', message: 'Celebrating another year of love, memories & togetherness.' };
    case 'ENGAGEMENT':
      return { headline: 'Happy Engagement', message: 'Wishing you a lifetime of love and happiness.' };
    case 'GRADUATION':
      return { headline: 'Congratulations', message: 'So proud of your achievement.' };
    case 'NEW_BABY':
      return { headline: 'Welcome Little One', message: 'A new beautiful chapter begins.' };
    case 'FAMILY_CELEBRATION':
      return { headline: 'Our Family', message: 'Together is our favorite place to be.' };
    case 'THANK_YOU':
      return { headline: 'Thank You', message: 'For being a beautiful part of our family.' };
    case 'CUSTOM':
    default:
      return { headline: 'A Special Day', message: 'Thinking of you today.' };
  }
}

// ─── photo helpers ──────────────────────────────────────────────────────────

/** Deterministic id so the same (member, photo) pair can never be added twice. */
export function memberPhotoId(memberId: string, url: string) {
  return `${memberId}|${url}`;
}

function hasMemberPhoto(photos: SupportingPhoto[], memberId: string, url: string) {
  return photos.some((p) => p.memberId === memberId && p.imageUrl === url);
}

function withMemberPhoto(photos: SupportingPhoto[], memberId: string, url: string): SupportingPhoto[] {
  if (hasMemberPhoto(photos, memberId, url)) return photos;
  return [
    ...photos,
    { id: memberPhotoId(memberId, url), memberId, imageUrl: url, adjustment: { ...defaultAdjustment } },
  ];
}

function withoutMemberPhoto(photos: SupportingPhoto[], memberId: string, url: string) {
  return photos.filter((p) => !(p.memberId === memberId && p.imageUrl === url));
}

/** Photos of the previous hero are kept (as supporting photos) when the hero changes. */
function keepPreviousHeroPhoto(state: GreetingState, nextHeroId: string | null): SupportingPhoto[] {
  const prev = state.heroMemberId;
  if (prev && prev !== 'CUSTOM' && prev !== nextHeroId && state.heroImageUrl) {
    return withMemberPhoto(state.supportingPhotos, prev, state.heroImageUrl);
  }
  return state.supportingPhotos;
}

/** URLs currently selected for a member (the hero's main photo counts too). */
export function getSelectedPhotoUrls(state: GreetingState, memberId: string): string[] {
  const urls = state.supportingPhotos.filter((p) => p.memberId === memberId).map((p) => p.imageUrl);
  if (state.heroMemberId === memberId && state.heroImageUrl) {
    return [state.heroImageUrl, ...urls.filter((u) => u !== state.heroImageUrl)];
  }
  return urls;
}

export function greetingsReducer(state: GreetingState, action: GreetingsAction): GreetingState {
  switch (action.type) {
    case 'SET_HERO_MEMBER': {
      const { member, defaultOccasion } = action.payload;
      const occasion = defaultOccasion || state.occasion;
      const defaults = getOccasionDefaults(occasion);

      let dateStr = '';
      if (occasion === 'BIRTHDAY' && member.birthDate) {
        const d = new Date(member.birthDate);
        dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })}`;
        const age = new Date().getFullYear() - d.getFullYear();
        if (age > 0) {
          defaults.headline = `Happy ${age}th Birthday`; // very naive suffix, but works as placeholder
        }
      }

      // Hero's default photo is selected automatically (referenced, never re-uploaded).
      const heroUrl = getDefaultMemberPhoto(member);
      const supportingPhotos = heroUrl
        ? withoutMemberPhoto(keepPreviousHeroPhoto(state, member.id), member.id, heroUrl)
        : keepPreviousHeroPhoto(state, member.id);

      return {
        ...state,
        heroMemberId: member.id,
        selectedMemberIds: Array.from(new Set([...state.selectedMemberIds, member.id])),
        supportingPhotos,
        heroImageUrl: heroUrl,
        heroName: `${member.firstName} ${member.lastName}`,
        heroAdjustment: { ...defaultAdjustment, opacity: state.heroMode === 'BACKGROUND' ? 30 : 100 },
        occasion,
        ...defaults,
        dateStr,
      };
    }
    case 'SET_CUSTOM_HERO': {
      const occasion = action.payload.defaultOccasion || state.occasion;
      const defaults = getOccasionDefaults(occasion);
      return {
        ...state,
        heroMemberId: 'CUSTOM',
        supportingPhotos: keepPreviousHeroPhoto(state, 'CUSTOM'),
        heroImageUrl: action.payload.imageUrl,
        heroName: 'Our Family',
        heroAdjustment: { ...defaultAdjustment, opacity: state.heroMode === 'BACKGROUND' ? 30 : 100 },
        occasion,
        ...defaults,
        dateStr: '',
      };
    }
    case 'SET_OCCASION': {
      const defaults = getOccasionDefaults(action.payload);
      return { ...state, occasion: action.payload, ...defaults };
    }
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload };
    case 'SET_FORMAT':
      return { ...state, format: action.payload };
    case 'UPDATE_TEXT':
      return { ...state, ...action.payload };
    case 'SET_HERO_IMAGE':
      return { ...state, heroImageUrl: action.payload, heroAdjustment: { ...defaultAdjustment } };
    case 'UPDATE_HERO_ADJUSTMENT':
      return { ...state, heroAdjustment: { ...state.heroAdjustment, ...action.payload } };
    case 'ADD_SUPPORTING_PHOTO':
      return { ...state, supportingPhotos: [...state.supportingPhotos, action.payload] };
    case 'UPDATE_SUPPORTING_PHOTO':
      return {
        ...state,
        supportingPhotos: state.supportingPhotos.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };
    case 'REMOVE_SUPPORTING_PHOTO':
      return {
        ...state,
        supportingPhotos: state.supportingPhotos.filter((p) => p.id !== action.payload),
      };
    case 'SET_HERO_MODE':
      return {
        ...state,
        heroMode: action.payload,
        heroAdjustment: {
          ...state.heroAdjustment,
          opacity: action.payload === 'BACKGROUND' ? 30 : 100,
        },
      };

    // Add one or many members. Existing members (and their photos) are untouched;
    // each NEW member gets their default photo selected automatically.
    case 'ADD_MEMBERS': {
      const known = new Set(state.selectedMemberIds);
      const selectedMemberIds = [...state.selectedMemberIds];
      let supportingPhotos = state.supportingPhotos;
      for (const member of action.payload) {
        if (known.has(member.id)) continue;
        known.add(member.id);
        selectedMemberIds.push(member.id);
        const url = getDefaultMemberPhoto(member);
        if (url) supportingPhotos = withMemberPhoto(supportingPhotos, member.id, url);
      }
      return { ...state, selectedMemberIds, supportingPhotos };
    }
    case 'REMOVE_MEMBER': {
      const memberId = action.payload;
      if (memberId === state.heroMemberId) return state; // hero is changed, not removed
      return {
        ...state,
        selectedMemberIds: state.selectedMemberIds.filter((id) => id !== memberId),
        supportingPhotos: state.supportingPhotos.filter((p) => p.memberId !== memberId),
      };
    }
    case 'TOGGLE_MEMBER_PHOTO': {
      const { memberId, url } = action.payload;
      const isHero = state.heroMemberId === memberId;
      if (isHero && state.heroImageUrl === url) {
        return { ...state, heroImageUrl: null };
      }
      if (isHero && !state.heroImageUrl) {
        return {
          ...state,
          supportingPhotos: withoutMemberPhoto(state.supportingPhotos, memberId, url),
          heroImageUrl: url,
          heroAdjustment: { ...defaultAdjustment, opacity: state.heroMode === 'BACKGROUND' ? 30 : 100 },
        };
      }
      return {
        ...state,
        supportingPhotos: hasMemberPhoto(state.supportingPhotos, memberId, url)
          ? withoutMemberPhoto(state.supportingPhotos, memberId, url)
          : withMemberPhoto(state.supportingPhotos, memberId, url),
      };
    }
    case 'ADD_MEMBER_PHOTOS': {
      const { memberId, urls } = action.payload;
      let next = state;
      for (const url of urls) {
        if (getSelectedPhotoUrls(next, memberId).includes(url)) continue;
        next = greetingsReducer(next, { type: 'TOGGLE_MEMBER_PHOTO', payload: { memberId, url } });
      }
      // Uploading to someone not on the card yet adds them (no auto default photo).
      if (!next.selectedMemberIds.includes(memberId)) {
        next = { ...next, selectedMemberIds: [...next.selectedMemberIds, memberId] };
      }
      return next;
    }
    case 'MAKE_MEMBER_PHOTO_MAIN': {
      const { memberId, url } = action.payload;
      if (state.heroMemberId !== memberId || state.heroImageUrl === url) return state;
      let supportingPhotos = withoutMemberPhoto(state.supportingPhotos, memberId, url);
      if (state.heroImageUrl) supportingPhotos = withMemberPhoto(supportingPhotos, memberId, state.heroImageUrl);
      return {
        ...state,
        supportingPhotos,
        heroImageUrl: url,
        heroAdjustment: { ...defaultAdjustment, opacity: state.heroAdjustment.opacity },
      };
    }
    case 'SET_ARRANGEMENT':
      return { ...state, arrangement: action.payload };
    case 'RESET':
      return initialGreetingState;
    default:
      return state;
  }
}
