/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://rosaritoresorts.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 1.0,
  exclude: ['/admin/*', '/api/*', '/functions/*'],
};

export default config;
