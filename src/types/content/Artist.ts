import type { Album } from './Album';
import type { ContentType } from './ContentType';
import type { Playlist } from './Playlist';
import type { Song } from './Song';

export type Artist = {
	type: ContentType.Artist;
	id: string;
	name: string;
	thumbnail: string | null;
	topSongs?: Song[];
	topAlbums?: Album[];
	topVideos?: any[];
	topSingles?: Album[];
	featuredOn?: Playlist[];
	similarArtists?: Artist[];
};
