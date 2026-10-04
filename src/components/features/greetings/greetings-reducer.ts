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
  | { type: 'ADD_TEXT_LAYER'; payload: import('@/types/greetings').TextLayer }
  | { type: 'UPDATE_TEXT_LAYER'; payload: { id: string; updates: Partial<import('@/types/greetings').TextLayer> } }
  | { type: 'REMOVE_TEXT_LAYER'; payload: string }
  | { type: 'REORDER_TEXT_LAYERS'; payload: string[] }
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
  textLayers: [
    { id: 'headline', content: 'Happy Birthday', fontFamily: 'font-serif', fontSize: 1.5, color: '#4A3B32', isBold: false, isItalic: false, isUppercase: true, alignment: 'center', region: 'top', background: 'none', zIndex: 1 },
    { id: 'heroName', content: '', fontFamily: 'font-serif', fontSize: 3.5, color: '#4A3B32', isBold: true, isItalic: false, isUppercase: false, alignment: 'center', region: 'top', background: 'none', zIndex: 2 },
    { id: 'dateStr', content: '', fontFamily: 'font-sans', fontSize: 0.8, color: '#4A3B32', isBold: true, isItalic: false, isUppercase: true, alignment: 'center', region: 'top', background: 'none', zIndex: 3 },
    { id: 'message', content: 'Wishing you a beautiful year ahead.', fontFamily: 'font-serif', fontSize: 1.2, color: '#4A3B32', isBold: false, isItalic: true, isUppercase: false, alignment: 'center', region: 'bottom', background: 'plate', zIndex: 4 },
    { id: 'senderName', content: 'Your Family', fontFamily: 'font-sans', fontSize: 0.9, color: '#4A3B32', isBold: true, isItalic: false, isUppercase: true, alignment: 'center', region: 'bottom', background: 'none', zIndex: 5 },
    { id: 'footer', content: 'With love,', fontFamily: 'font-sans', fontSize: 0.7, color: '#4A3B32', isBold: true, isItalic: false, isUppercase: true, alignment: 'center', region: 'bottom', background: 'none', zIndex: 6 }
  ],
  supportingPhotos: [],
  selectedMemberIds: [],
};

// Smart defaults based on occasion
function applyOccasionDefaults(occasion: OccasionType, layers: import('@/types/greetings').TextLayer[]) {
  let headline = '';
  let message = '';
  switch (occasion) {
    case 'BIRTHDAY':
      headline = 'Happy Birthday'; message = 'Wishing you a beautiful year ahead.'; break;
    case 'ANNIVERSARY':
    case 'WEDDING':
      headline = 'Happy Anniversary'; message = 'Celebrating another year of love, memories & togetherness.'; break;
    case 'ENGAGEMENT':
      headline = 'Happy Engagement'; message = 'Wishing you a lifetime of love and happiness.'; break;
    case 'GRADUATION':
      headline = 'Congratulations'; message = 'So proud of your achievement.'; break;
    case 'NEW_BABY':
      headline = 'Welcome Little One'; message = 'A new beautiful chapter begins.'; break;
    case 'FAMILY_CELEBRATION':
      headline = 'Our Family'; message = 'Together is our favorite place to be.'; break;
    case 'THANK_YOU':
      headline = 'Thank You'; message = 'For being a beautiful part of our family.'; break;
    case 'CUSTOM':
    default:
      headline = 'A Special Day'; message = 'Thinking of you today.'; break;
  }
  return layers.map(l => {
    if (l.id === 'headline') return { ...l, content: headline };
    if (l.id === 'message') return { ...l, content: message };
    return l;
  });
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
      let textLayers = applyOccasionDefaults(occasion, state.textLayers);

      if (occasion === 'BIRTHDAY' && member.birthDate) {
        const d = new Date(member.birthDate);
        const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })}`;
        const age = new Date().getFullYear() - d.getFullYear();
        if (age > 0) {
          textLayers = textLayers.map(l => l.id === 'headline' ? { ...l, content: `Happy ${age}th Birthday` } : l);
        }
        textLayers = textLayers.map(l => l.id === 'dateStr' ? { ...l, content: dateStr } : l);
      } else {
        textLayers = textLayers.map(l => l.id === 'dateStr' ? { ...l, content: '' } : l);
      }

      textLayers = textLayers.map(l => l.id === 'heroName' ? { ...l, content: `${member.firstName} ${member.lastName}` } : l);

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
        heroAdjustment: { ...defaultAdjustment, opacity: state.heroMode === 'BACKGROUND' ? 30 : 100 },
        occasion,
        textLayers,
      };
    }
    case 'SET_CUSTOM_HERO': {
      const occasion = action.payload.defaultOccasion || state.occasion;
      let textLayers = applyOccasionDefaults(occasion, state.textLayers);
      textLayers = textLayers.map(l => l.id === 'heroName' ? { ...l, content: 'Our Family' } : l);
      textLayers = textLayers.map(l => l.id === 'dateStr' ? { ...l, content: '' } : l);

      return {
        ...state,
        heroMemberId: 'CUSTOM',
        supportingPhotos: keepPreviousHeroPhoto(state, 'CUSTOM'),
        heroImageUrl: action.payload.imageUrl,
        heroAdjustment: { ...defaultAdjustment, opacity: state.heroMode === 'BACKGROUND' ? 30 : 100 },
        occasion,
        textLayers,
      };
    }
    case 'SET_OCCASION': {
      return { ...state, occasion: action.payload, textLayers: applyOccasionDefaults(action.payload, state.textLayers) };
    }
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload };
    case 'SET_FORMAT':
      return { ...state, format: action.payload };
    case 'ADD_TEXT_LAYER':
      return { ...state, textLayers: [...state.textLayers, action.payload] };
    case 'UPDATE_TEXT_LAYER':
      return {
        ...state,
        textLayers: state.textLayers.map((l) => (l.id === action.payload.id ? { ...l, ...action.payload.updates } : l)),
      };
    case 'REMOVE_TEXT_LAYER':
      return {
        ...state,
        textLayers: state.textLayers.filter((l) => l.id !== action.payload),
      };
    case 'REORDER_TEXT_LAYERS': {
      const idMap = new Map(state.textLayers.map((l) => [l.id, l]));
      const newLayers = action.payload.map((id, index) => ({ ...idMap.get(id)!, zIndex: index }));
      return { ...state, textLayers: newLayers };
    }
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
