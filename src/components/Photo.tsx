// v2: real food photos where the tested versions showed "photo" placeholders.
import type { CSSProperties } from 'react';
import { findFood } from '../state/foods';

const FILES = import.meta.glob('../assets/food/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const BY_NAME: Record<string, string> = {};
for (const [path, url] of Object.entries(FILES)) BY_NAME[path.replace(/^.*\//, '').replace('.jpg', '')] = url;

/** Food table name → photo file, where the file name differs. */
const ALIAS: Record<string, string> = {
  onion: 'onions', 'cherry tomatoes': 'tomatoes-close', tomatoes: 'tomatoes-close', 'frozen peas': 'peas', 'frozen spinach': 'spinach',
  'bell pepper': 'peppers', lemon: 'lemon-slices', lime: 'lemon-slices', apples: 'apples-basket', cucumber: 'cucumbers',
};

/** Recipe id → photo of its hero ingredient. */
const RECIPE_PHOTO: Record<string, string> = {
  frittata: 'eggs', quesadilla: 'cheddar', chickenrice: 'garlic', friedrice: 'peas', pasta: 'tomatoes-close', smoothie: 'bananas',
  orzo: 'lemon-slices', tacos: 'chilies', skillet: 'spinach', wrap: 'cheddar',
};

export function foodPhoto(name: string): string | undefined {
  const key = (findFood(name)?.name ?? name).toLowerCase();
  return BY_NAME[ALIAS[key] ?? key] ?? BY_NAME[key.replace(/s$/, '')] ?? BY_NAME[key + 's'];
}

export const recipePhoto = (id: string, firstIng?: string) => BY_NAME[RECIPE_PHOTO[id] ?? ''] ?? (firstIng ? foodPhoto(firstIng) : undefined) ?? BY_NAME.basil;

/** A photo filling a placeholder box, or the plain placeholder when there is no photo. */
export function Photo({ src, style, label = '' }: { src?: string; style?: CSSProperties; label?: string }) {
  if (!src) return <div className="ph" style={style}>{label}</div>;
  return <div className="ph photo" style={style}><img src={src} alt="" loading="lazy" /></div>;
}
