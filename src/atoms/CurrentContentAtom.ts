import { atom } from 'jotai';
import type { Album } from '../types/content/Album';
import type { Artist } from '../types/content/Artist';
import type { Playlist } from '../types/content/Playlist';

export const currentContentAtom = atom<Album | Playlist | Artist | null>(null);
