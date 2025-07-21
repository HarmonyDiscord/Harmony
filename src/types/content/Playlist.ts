import type { ContentType } from './ContentType';
import type { Song } from './Song';

export type Playlist = {
	type: ContentType.Playlist;
	id: string;
	name: string;
	artist: {
		id: string | null;
		name: string;
	};
	songs: Song[];
	thumbnail?: string;
};
