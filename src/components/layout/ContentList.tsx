import { Flex, Heading, SlideFade, useBreakpointValue } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { mediaControlsAtom } from '../../atoms/MediaControlAtom';
import type { SearchResult } from '../../types/SearchResult';
import { ContentType } from '../../types/content/ContentType';
import ContentItem from '../general/content/ContentItem';

export default function ContentList({ items }: { items: SearchResult[] }) {
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia] = useAtom(currentMediaAtom);

	const isMd = useBreakpointValue([false, false, true]);

	const entries = Object.entries(Object.groupBy(items, ({ type }) => type));

	return (
		(!currentMedia || isMd || mediaControls?.isSidePanelClosed) && (
			<Flex
				direction='column'
				w='100%'
				h='fit-content'
				maxH='100%'
				overflowY='auto'
				style={{
					mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
					maskMode: 'alpha'
				}}
			>
				{entries.map(([type, results], i) => (
					<SlideFade in delay={i * 0.05} key={'results-' + type + i}>
						<Flex direction='column' w='100%' h='fit-content' p='20px' gap='10px'>
							<Heading size='md'>
								{(type as any as ContentType) == ContentType.Song
									? 'Featured'
									: ContentType[type as any as ContentType] + 's'}
							</Heading>
							<Flex w='100%' h='fit-content' maxH='100%' gap='20px' zIndex={1} direction='column'>
								{results?.map((result, i) => (
									<ContentItem item={result} key={result.id + i} />
								))}
							</Flex>
						</Flex>
					</SlideFade>
				))}
			</Flex>
		)
	);
}
