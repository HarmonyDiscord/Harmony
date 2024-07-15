import type { Album } from './content/Album';
import type { Artist } from './content/Artist';
import type { Playlist } from './content/Playlist';
import type { Song } from './content/Song';
import type { Video } from './content/Video';

export type SearchResult = Song | Video | Album | Artist | Playlist | null;
