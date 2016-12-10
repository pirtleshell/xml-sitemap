'use strict';
const chalk = require('chalk');

module.exports = self => {
  return {
    /* *********************
     ***** URL METHODS *****
     *********************** */
    /**
     * Check if sitemap contains a url.
     * @name XmlSitemap#hasUrl
     * @function
     * @param {String} url - The url to look for
     * @return {Bool} Whether the url is in the sitemap
     * @example
     * var sitemap = new XmlSitemap()
     *   .addUrl('http://domain.com/');
     *
     * sitemap.hasUrl('http://domain.com/'); // true
     * sitemap.hasUrl('http://otherdomain.com/'); // false
     */
    hasUrl: url => {
      return self.urls.indexOf(url) >= 0;
    },

    /**
     * Add url to sitemap
     * @name XmlSitemap#addUrl
     * @function
     * @param {String} url - The url to add
     * @param {Object} [options] - Options for setting various information about the url. Options must be in the objects {@link XmlSitemap#urlOptions}.
     * @return {XmlSitemap} The sitemap object
     * @example
     * var sitemap = new XmlSitemap();
     *
     * sitemap.addUrl('http://domain.com/').
     *        .addUrl('http://domain.com/other', {lastmod: '2012-11-21'});
     *
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //   </url>
     * //   <url>
     * //     <loc>http://domain.com/other</loc>
     * //     <lastmod>2012-12-21</lastmod>
     * //   </url>
     * // </urlset>
     */
    addUrl: (url, options) => {
      if (self.hasUrl(url)) {
        throw new Error(url + ' is already in tree. To update options use the setOptionValue or setOptionValues methods.');
      }
      self.urls.push(url);
      const urlNode = self.buildUrlNode(url, options);

      if (self.xmlObj.urlset.url instanceof Array) {
        self.xmlObj.urlset.url.push(urlNode);
      } else {
        self.xmlObj.urlset.url = [urlNode];
      }

      return self;
    },

    /**
     * Remove url from the Sitemap
     * @name XmlSitemap#removeUrl
     * @function
     * @param {String} url - The url to remove
     * @return {XmlSitemap} The sitemap object
     * @example
     * var sitemap = new XmlSitemap()
     *   .addUrl('http://domain.com/')
     *   .addUrl('http://domain.com/other');
     *
     * // BEFORE
     * console.log(sitemap.urls); // ['http://domain.com/', 'http://domain.com/other']
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //   </url>
     * //   <url>
     * //     <loc>http://domain.com/other</loc>
     * //   </url>
     * // </urlset>
     *
     * sitemap.removeUrl('http://domain.com/other');
     *
     * // AFTER
     * console.log(sitemap.urls); // ['http://domain.com/']
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //   </url>
     * // </urlset>
     */
    removeUrl: url => {
      const index = self.urls.indexOf(url);
      if (index === -1) {
        console.log(chalk.yellow(url, 'is not in sitemap.'));
        return;
      }

      self.xmlObj.urlset.url.splice(index, 1);
      self.urls.splice(index, 1);
      return self;
    },

    /**
     * Get node of the XML object tree for a url.
     * @name XmlSitemap#getUrlNode
     * @function
     * @param {String} url - The url of the desired XML node
     * @return {Object} The XML element of the url
     * @example
     * var sitemap = new XmlSitemap()
     *   .addUrl('http://domain.com/', {lastmod: '2012-12-21', changefreq: 'never'});
     *
     * sitemap.getUrlNode('http://domain.com/');
     * // { loc: 'http://domain.com/',
     * // lastmod: '2012-12-21',
     * // changefreq: 'never' }
     *
     */
    getUrlNode: url => {
      if (!self.hasUrl(url)) {
        throw new Error(url + ' not in sitemap, can\'t get node.');
      }

      const index = self.urls.indexOf(url);
      return self.xmlObj.urlset.url[index];
    },

    /**
    * Create a url node XML object
    * @name XmlSitemap#buildUrlNode
    * @function
    * @param {String} url - The url to add
    * @param {Object} [options] - Options for setting various information about the url, must be one of {@link XmlSitemap#urlOptions}. Add options with {@link XmlSitemap#addOption}.
    * @return {Object} The url XML node
    */
    buildUrlNode: (url, options) => {
      if (typeof url !== 'string') {
        throw new TypeError('Expected url to be string.');
      }
      const urlNode = {
        loc: url
      };

      if (typeof options === 'object') {
        Object.keys(options).forEach(opt => {
          urlNode[opt] = self.handleOption(opt, options[opt]);
        });
      }
      return urlNode;
    }
  };
};
