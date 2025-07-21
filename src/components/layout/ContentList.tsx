import { Flex, Heading, SlideFade } from '@chakra-ui/react';
import type { SearchResult } from '../../types/SearchResult';
import { ContentType } from '../../types/content/ContentType';
import ContentItem from '../general/content/ContentItem';

export default function ContentList({ items, hideHeadings }: { items: SearchResult[]; hideHeadings?: boolean }) {
	const entries = Object.entries(Object.groupBy(items, ({ type }) => type));

	return (
		<Flex direction='column' w='100%' h='fit-content' maxH='100%' gap='0px'>
			{entries.map(([type, results], i) => (
				<SlideFade in delay={i * 0.05} key={'results-' + type + i}>
					<Flex direction='column' w='100%' h='fit-content' gap='10px' pb='20px'>
						{!hideHeadings && (
							<Heading size='md'>
								{(type as any as ContentType) == ContentType.Song
									? 'Featured'
									: ContentType[type as any as ContentType] + 's'}
							</Heading>
						)}
						<Flex w='100%' h='fit-content' maxH='100%' gap='20px' zIndex={1} direction='column'>
							{results?.map((result, i) => (
								<ContentItem item={result} key={result.id + i} />
							))}
						</Flex>
					</Flex>
				</SlideFade>
			))}
		</Flex>
	);
}
