import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Vertical Constants for Rolodex UI
export const CARD_HEIGHT = height * 0.3; // 30% of screen height
export const CARD_WIDTH = width * 0.85;   // Slightly wider for vertical view
export const ITEM_HEIGHT = CARD_HEIGHT;
// Center visibly in the available space below header (~100px offset)
// (Screen Height - Card Height - Header Offset) / 2
export const SPACER_HEIGHT = (height - CARD_HEIGHT - 100) / 2;

// Keep horizontal constants just in case, but they might be unused now
export const SPACER_WIDTH = (width - CARD_WIDTH) / 2;
export const ITEM_SIZE = CARD_WIDTH;
