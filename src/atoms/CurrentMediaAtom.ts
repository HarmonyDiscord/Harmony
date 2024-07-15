import { atom } from 'jotai';
import type { Media } from '../types/content/Media';

export const currentMediaAtom = atom<Media | null>(null);
