/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://rosaritoresorts.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin/*', '/api/*', '/functions/*'],
};

export default config;
