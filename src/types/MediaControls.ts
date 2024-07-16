export type MediaControls = {
	volume: number;
	isMuted: boolean;
	isPlaying: boolean;
	isLooping: boolean;
	isLoading: boolean;
	isWaiting: boolean;
	isSidePanelClosed: boolean;
	useVideo: boolean;
	progress: {
		played: number;
		playedSeconds: number;
		loaded: number;
		loadedSeconds: number;
	};
	seekTo: (value: number) => void;
};
