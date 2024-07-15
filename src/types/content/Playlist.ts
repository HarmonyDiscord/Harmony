import type { ContentType } from './ContentType';

export type Playlist = {
	type: ContentType.Playlist;
	id: string;
	name: string;
	artist: {
		id: string | null;
		name: string;
	};
	thumbnail: string | null;
};
