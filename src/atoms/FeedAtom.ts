import { atom } from 'jotai';
import type { Song } from '../types/Song';

export const feedAtom = atom<Song[] | null>(null);
