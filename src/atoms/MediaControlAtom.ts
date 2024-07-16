import { atom } from 'jotai';
import type { MediaControls } from '../types/MediaControls';

export const mediaControlsAtom = atom<MediaControls | null>(null);

export const defaultMediaControls: MediaControls = {
	volume: 1,
	isMuted: false,
	isPlaying: false,
	isLooping: false,
	isLoading: false,
	isWaiting: false,
	isVideoMode: false,
	isSidePanelClosed: false
};
