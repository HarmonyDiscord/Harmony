import million from 'million/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: process.env.NEXT_OUTPUT,
	reactStrictMode: true,
	devIndicators: false,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.googleusercontent.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.ytimg.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.ggpht.com',
				port: '',
				pathname: '/**',
			}
		]

	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'false' },
					{
						key: 'Access-Control-Allow-Origin',
						value: '*'
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET,DELETE,PATCH,POST,PUT'
					},
					{
						key: 'Access-Control-Allow-Headers',
						value: 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date'
					}
				]
			}
		];
	}
};

let configExport = nextConfig;

if (process.env.NODE_ENV === 'production') {
	console.log('Loaded production config');
	configExport = million.next(nextConfig, { auto: true });
}

export default configExport;
