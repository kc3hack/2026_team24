import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Horizontal Constants (Keeping for reference or fallback)
export const CARD_WIDTH = width * 0.72;
export const SPACER_WIDTH = (width - CARD_WIDTH) / 2;

// Vertical Constants
export const CARD_HEIGHT = 320; // Fixed height from TaskCard
export const ITEM_HEIGHT = CARD_HEIGHT; // Snap interval
export const VISUAL_OFFSET = 60; // Overlap offset
export const SPACER_HEIGHT = (height - CARD_HEIGHT) / 2; // Center vertically
