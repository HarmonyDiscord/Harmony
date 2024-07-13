import { atom } from 'jotai';
import type { Song } from '../types/Song';

export const currentSongAtom = atom<Song | null>(null);
