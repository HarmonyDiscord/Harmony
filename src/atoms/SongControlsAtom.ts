import { atom } from 'jotai';
import type { SongControls } from '../types/SongControls';

export const songControlsAtom = atom<SongControls | null>(null);

export const defaultSongControls = {
    volume: 1,
    isPlaying: false,
    isLooping: false,
    isLoading: false
}