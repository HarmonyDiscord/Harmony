import { atom } from 'jotai';
import type { Song } from '../types/Song';

export const currentPlaylistAtom = atom<Song[]>([]);
