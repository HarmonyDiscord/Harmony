import { atom } from 'jotai';
import type { Media } from '../types/content/Media';

export const currentPlaylistAtom = atom<Record<string, Media>>({});
