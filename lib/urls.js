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
     * There are a few ways to add a urls:
     * 1. Pass a single url as a string
     * 2. Pass a single url as a string with an options object
     * 3. Pass a single object with either a `url` or `loc` attribute and options
     * 4. Pass an array with any of the above as elements
     * Aliased with `addUrl` or `addUrls`
     * @name XmlSitemap#add
     * @function
     * @param {String|Object|Array} url - The url(s) to add
     * @param {Object} [urlOptions] - Options for setting various information about the url. Options must be in the objects {@link XmlSitemap#urlOptions}.
     * @throws {Error} Url object must contain a `url` or `loc` property
     * @throws {Error} Url is already in sitemap
     * @throws {TypeError} Url must be object, string, or array
     * @return {XmlSitemap} The sitemap object
     * @example
     * var sitemap = new XmlSitemap();
     *   .add('http://domain.com/')
     *   .add('http://domain.com/other', {lastmod: '2012-11-21'})
     *   .add({
     *     url: 'http://domain.com/magic',
     *     priority: 0.7
     *   })
     *   .add({
     *     loc: 'http://domain.com/another-page',
     *     changefreq: 'never'
     *   });
     *
     * // which makes the same sitemap as:
     * var sitemap = new XmlSitemap()
     *   .add([
     *   'http://domain.com/',
     *   {
     *     url: 'http://domain.com/other',
     *     lastmod: '2012-11-21'
     *   },
     *   {
     *     url: 'http://domain.com/magic'
     *     priority: 0.7
     *   },
     *   {
     *     loc: 'http://domain.com/another-page',
     *     changefreq: 'never'
     *   }
     * ];
     *
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //   </url>
     * //   <url>
     * //     <loc>http://domain.com/other</loc>
     * //     <lastmod>2012-11-21</lastmod>
     * //   </url>
     * //   <url>
     * //     <loc>http://domain.com/magic</loc>
     * //     <priority>0.7</priority>
     * //   </url>
     * //   <url>
     * //     <loc>http://domain.com/another-page</loc>
     * //     <changefreq>never</changefreq>
     * //   </url>
     * // </urlset>
     */
    add: (url, urlOptions) => {
      // copy the object to avoid chagning it
      const urlObj = JSON.parse(JSON.stringify(url));
      let urlStr;
      if (typeof url === 'string') {
        urlStr = urlObj;
      } else if (Array.isArray(url)) {
        urlObj.forEach(url => self.add(url));
        return self;
      } else if (typeof url === 'object') {
        if (typeof urlObj.url === 'string') {
          urlStr = urlObj.url;
          delete urlObj.url;
        } else if (typeof urlObj.loc === 'string') {
          urlStr = urlObj.loc;
          delete urlObj.loc;
        } else {
          throw new Error('Url not found in object. Does it have a `url` or `loc` attribute?');
        }
        urlOptions = urlObj;
      } else {
        throw new TypeError(`url must be an object or a string, found ${typeof url}`);
      }

      if (self.hasUrl(urlStr)) {
        throw new Error(urlStr + ' is already in tree. To update options use the setOptionValue or setOptionValues methods.');
      }
      self.urls.push(urlStr);
      const urlNode = self.buildUrlNode(urlStr, urlOptions);

      if (self.xmlObj.urlset.url instanceof Array) {
        self.xmlObj.urlset.url.push(urlNode);
      } else {
        self.xmlObj.urlset.url = [urlNode];
      }

      return self;
    },

    /**
     * Remove url from the Sitemap. Aliased with `removeUrl`.
     * @name XmlSitemap#remove
     * @function
     * @param {String} url - The url to remove
     * @return {XmlSitemap} The sitemap object
     * @example
     * var sitemap = new XmlSitemap()
     *   .add('http://domain.com/')
     *   .add('http://domain.com/other');
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
     * sitemap.remove('http://domain.com/other');
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
    remove: url => {
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
        throw new TypeError(`Expected url to be string, found ${typeof url}: ${url}`);
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
