import type { ContentType } from './ContentType';

export type Video = {
	type: ContentType.Video;
	id: string;
	name: string;
	artist: {
		id: string | null;
		name: string;
	};
	album: null;
	duration: number;
	thumbnail: string | null;
};
