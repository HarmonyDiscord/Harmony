import type { ContentType } from './ContentType';

export type Song = {
	type: ContentType.Song;
	id: string;
	title: string;
	artist: string;
	album?: string;
	cover?: string;
	duration: number;
};
