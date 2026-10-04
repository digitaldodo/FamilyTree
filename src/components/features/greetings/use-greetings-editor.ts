import { useReducer, useCallback } from 'react';
import {
  GreetingState,
  OccasionType,
  TemplateType,
  CanvasFormat,
  ImageAdjustment,
  SupportingPhoto,
} from '@/types/greetings';
import {
  greetingsReducer,
  initialGreetingState,
  type GreetingMember,
} from './greetings-reducer';

export function useGreetingsEditor() {
  const [state, dispatch] = useReducer(greetingsReducer, initialGreetingState);

  return {
    state,
    setHeroMember: useCallback((member: GreetingMember, defaultOccasion?: OccasionType) => dispatch({ type: 'SET_HERO_MEMBER', payload: { member, defaultOccasion } }), []),
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
    /** Adds members (deduplicated); each new member's default photo is auto-selected. */
    addMembers: useCallback((members: GreetingMember[]) => dispatch({ type: 'ADD_MEMBERS', payload: members }), []),
    removeMember: useCallback((memberId: string) => dispatch({ type: 'REMOVE_MEMBER', payload: memberId }), []),
    toggleMemberPhoto: useCallback((memberId: string, url: string) => dispatch({ type: 'TOGGLE_MEMBER_PHOTO', payload: { memberId, url } }), []),
    addMemberPhotos: useCallback((memberId: string, urls: string[]) => dispatch({ type: 'ADD_MEMBER_PHOTOS', payload: { memberId, urls } }), []),
    makeMemberPhotoMain: useCallback((memberId: string, url: string) => dispatch({ type: 'MAKE_MEMBER_PHOTO_MAIN', payload: { memberId, url } }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };
}

export type GreetingsEditor = ReturnType<typeof useGreetingsEditor>;
