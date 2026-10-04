export type OccasionType =
  | 'BIRTHDAY'
  | 'ANNIVERSARY'
  | 'WEDDING'
  | 'ENGAGEMENT'
  | 'GRADUATION'
  | 'NEW_BABY'
  | 'FAMILY_CELEBRATION'
  | 'THANK_YOU'
  | 'CUSTOM';

export type TemplateType =
  | 'HERITAGE_PORTRAIT'
  | 'FAMILY_COLLAGE'
  | 'MODERN_MINIMAL'
  | 'FESTIVE_HERITAGE'
  | 'MEMORY_ALBUM';

export type CanvasFormat = 'PORTRAIT' | 'SQUARE' | 'LANDSCAPE';

export interface ImageAdjustment {
  zoom: number;
  x: number; // percentage offset
  y: number; // percentage offset
  opacity: number;
}

export interface SupportingPhoto {
  id: string; // unique internal id
  memberId?: string; // if tied to a member
  imageUrl: string;
  adjustment: ImageAdjustment;
  width?: number; // relative or absolute
  height?: number;
  rotation?: number;
}

export type ArrangementType =
  | 'HERO_CIRCLE'
  | 'FAMILY_ORBIT'
  | 'ELEGANT_ARC'
  | 'EDGE_PORTRAITS'
  | 'FAMILY_GRID'
  | 'PHOTO_STRIP'
  | 'MEMORY_COLLAGE'
  | 'POLAROID'
  | 'MAIN_SIDE'
  | 'FLOATING_BACKGROUND';

export interface GreetingState {
  // Selections
  heroMemberId: string | null; // The primary subject (for name/date defaults)
  selectedMemberIds: string[]; // Members whose photos are available for the card
  occasion: OccasionType;
  template: TemplateType;
  format: CanvasFormat;
  arrangement: ArrangementType;

  // Hero Image
  heroImageUrl: string | null;
  heroAdjustment: ImageAdjustment;
  heroMode: 'BACKGROUND' | 'FOREGROUND';

  // Text
  headline: string;
  heroName: string;
  message: string;
  dateStr: string;
  footer: string;
  senderName: string;

  // Supporting Photos
  supportingPhotos: SupportingPhoto[];
}
