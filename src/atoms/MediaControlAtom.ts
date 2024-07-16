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
	isSidePanelClosed: false,
	useVideo: false,
	progress: {
		played: 0,
		playedSeconds: 0,
		loaded: 0,
		loadedSeconds: 0
	},
	seekTo: () => {}
};
