import { useReducer, useCallback } from 'react';
import {
  GreetingState,
  OccasionType,
  TemplateType,
  CanvasFormat,
  ImageAdjustment,
  SupportingPhoto,
} from '@/types/greetings';
import { MemberWithRelations } from '@/types/member';

type Action =
  | { type: 'SET_HERO_MEMBER'; payload: { member: MemberWithRelations; defaultOccasion?: OccasionType } }
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
  | { type: 'TOGGLE_SELECTED_MEMBER'; payload: string }
  | { type: 'RESET' };

const defaultAdjustment: ImageAdjustment = { zoom: 1, x: 0, y: 0, opacity: 100 };

const initialState: GreetingState = {
  heroMemberId: null,
  occasion: 'BIRTHDAY',
  template: 'HERITAGE_PORTRAIT',
  format: 'PORTRAIT',
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

function reducer(state: GreetingState, action: Action): GreetingState {
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

      return {
        ...state,
        heroMemberId: member.id,
        selectedMemberIds: Array.from(new Set([...state.selectedMemberIds, member.id])),
        heroImageUrl: member.imageUrl || null,
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
           opacity: action.payload === 'BACKGROUND' ? 30 : 100
        }
      };
    case 'TOGGLE_SELECTED_MEMBER': {
      const isSelected = state.selectedMemberIds.includes(action.payload);
      return {
        ...state,
        selectedMemberIds: isSelected 
          ? state.selectedMemberIds.filter(id => id !== action.payload)
          : [...state.selectedMemberIds, action.payload]
      };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useGreetingsEditor() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    setHeroMember: useCallback((member: MemberWithRelations, defaultOccasion?: OccasionType) => dispatch({ type: 'SET_HERO_MEMBER', payload: { member, defaultOccasion } }), []),
    setCustomHero: useCallback((imageUrl: string, defaultOccasion?: OccasionType) => dispatch({ type: 'SET_CUSTOM_HERO', payload: { imageUrl, defaultOccasion } }), []),
    setOccasion: useCallback((occasion: OccasionType) => dispatch({ type: 'SET_OCCASION', payload: occasion }), []),
    setTemplate: useCallback((template: TemplateType) => dispatch({ type: 'SET_TEMPLATE', payload: template }), []),
    setFormat: useCallback((format: CanvasFormat) => dispatch({ type: 'SET_FORMAT', payload: format }), []),
    updateText: useCallback((updates: Partial<Pick<GreetingState, 'headline' | 'heroName' | 'message' | 'dateStr' | 'footer' | 'senderName'>>) => dispatch({ type: 'UPDATE_TEXT', payload: updates }), []),
    setHeroImage: useCallback((url: string) => dispatch({ type: 'SET_HERO_IMAGE', payload: url }), []),
    updateHeroAdjustment: useCallback((adj: Partial<ImageAdjustment>) => dispatch({ type: 'UPDATE_HERO_ADJUSTMENT', payload: adj }), []),
    addSupportingPhoto: useCallback((photo: SupportingPhoto) => dispatch({ type: 'ADD_SUPPORTING_PHOTO', payload: photo }), []),
    updateSupportingPhoto: useCallback((id: string, updates: Partial<SupportingPhoto>) => dispatch({ type: 'UPDATE_SUPPORTING_PHOTO', payload: { id, updates } }), []),
    removeSupportingPhoto: useCallback((id: string) => dispatch({ type: 'REMOVE_SUPPORTING_PHOTO', payload: id }), []),
    setHeroMode: useCallback((mode: 'BACKGROUND' | 'FOREGROUND') => dispatch({ type: 'SET_HERO_MODE', payload: mode }), []),
    toggleSelectedMember: useCallback((memberId: string) => dispatch({ type: 'TOGGLE_SELECTED_MEMBER', payload: memberId }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };
}
