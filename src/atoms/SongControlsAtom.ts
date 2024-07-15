import { atom } from 'jotai';
import type { SongControls } from '../types/SongControls';

export const songControlsAtom = atom<SongControls | null>(null);

export const defaultSongControls: SongControls = {
	volume: 1,
	isMuted: false,
	isPlaying: false,
	isLooping: false,
	isLoading: false,
	isSidePanelClosed: false,
	useVideo: false
};
