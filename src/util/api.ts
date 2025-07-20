export const api = {
	getMediaStream: async (songId: string, isActivity: boolean) => {
		const response = await fetch(
			`https://harmony-streaming.tnfangel.com/stream?videoURL=https://www.youtube.com/watch?v=${encodeURIComponent(songId)}`
		);
		return response;
	},
	content: {
		search: async (query: string) => {
			if (!query) return null;
			const res = await fetch(`/api/content/search?q=${encodeURIComponent(query)}`);
			if (!res.ok) return null;
			return res.json();
		},
		mediaSearch: async (query: string) => {
			if (!query) return null;
			const res = await fetch(`/api/content/media/search?q=${encodeURIComponent(query)}`);
			if (!res.ok) return null;
			return res.json();
		},
		lyrics: async (mediaId: string) => {
			if (!mediaId) return null;
			const res = await fetch(`/api/content/media/lyrics?id=${encodeURIComponent(mediaId)}`);
			if (!res.ok) return null;
			return res.json();
		}
	}
};
