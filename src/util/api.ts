let isDiscordActivity = false;

export function setIsDiscordActivity(isActive: boolean) {
	isDiscordActivity = isActive;
}

const getPrefix = () => (isDiscordActivity ? '/.proxy' : '');

export const api = {
	getStreamURL: (songId: string) => {
		return `${isDiscordActivity ? `${getPrefix()}/streaming` : 'https://harmony-streaming.tnfangel.com'}/stream?videoURL=https://www.youtube.com/watch?v=${encodeURIComponent(songId)}`;
	},
	getMediaStream: async (songId: string) => {
		const response = await fetch(api.getStreamURL(songId));
		return response;
	},
	content: {
		search: async (query: string) => {
			if (!query) return null;
			const res = await fetch(`${getPrefix()}/api/content/search?q=${encodeURIComponent(query)}`);
			if (!res.ok) return null;
			return res.json();
		},
		mediaSearch: async (query: string) => {
			if (!query) return null;
			const res = await fetch(`${getPrefix()}/api/content/media/search?q=${encodeURIComponent(query)}`);
			if (!res.ok) return null;
			return res.json();
		},
		lyrics: async (
			mediaId: string,
			name?: string,
			artist?: string,
			album?: string
		): Promise<{ lyrics: string[]; type: 'synced' | 'plain' } | null> => {
			if (!mediaId) return null;
			const res = await fetch(
				`${getPrefix()}/api/content/media/lyrics?id=${encodeURIComponent(mediaId)}&name=${encodeURIComponent(name ?? '')}&artist=${encodeURIComponent(artist ?? '')}&album=${encodeURIComponent(album ?? '')}`
			);
			if (!res.ok) return null;
			return res.json();
		},
		album: async (albumId: string) => {
			if (!albumId) return null;
			const res = await fetch(`${getPrefix()}/api/content/album?id=${encodeURIComponent(albumId)}`);
			if (!res.ok) return null;
			return res.json();
		},
		playlist: async (playlistId: string) => {
			if (!playlistId) return null;
			const res = await fetch(`${getPrefix()}/api/content/playlist?id=${encodeURIComponent(playlistId)}`);
			if (!res.ok) return null;
			return res.json();
		},
		artist: async (artistId: string) => {
			if (!artistId) return null;
			const res = await fetch(`${getPrefix()}/api/content/artist?id=${encodeURIComponent(artistId)}`);
			if (!res.ok) return null;
			return res.json();
		},
		song: async (songId: string) => {
			if (!songId) return null;
			const res = await fetch(`${getPrefix()}/api/content/song?id=${encodeURIComponent(songId)}`);
			if (!res.ok) return null;
			return res.json();
		},
		video: async (videoId: string) => {
			if (!videoId) return null;
			const res = await fetch(`${getPrefix()}/api/content/video?id=${encodeURIComponent(videoId)}`);
			if (!res.ok) return null;
			return res.json();
		}
	}
};
