import type { SearchResult } from '../SearchResult';
import type { ContentType } from './ContentType';

export type Album = {
	type: ContentType.Album;
	id: string;
	name: string;
	artist: {
		id: string | null;
		name: string;
	};
	thumbnail: string | null;
	playlistId: string;
	year: number | null;
	songs: SearchResult[];
};
