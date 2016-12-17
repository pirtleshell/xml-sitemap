'use strict';
const urlUtil = require('url');
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
     *   .add('http://domain.com/');
     *
     * sitemap.hasUrl('http://domain.com/'); // true
     * sitemap.hasUrl('http://otherdomain.com/'); // false
     */
    hasUrl: url => {
      if (self.host) {
        return self.urls.indexOf(urlUtil.resolve(self.host, url)) >= 0;
      }
      return self.urls.indexOf(url) >= 0;
    },

    /**
     * There are a few ways to add a urls:
     *
     * 1. Pass a single url as a string
     * 2. Pass a single url as a string with an options object
     * 3. Pass a single object with either a `url` or `loc` attribute and options
     * 4. Pass an array with any of the above as elements
     *
     * Aliased with `addUrl` or `addUrls`
     * @name XmlSitemap#add
     * @function
     * @param {String|Object|Array} url - The url(s) to add
     * @param {Object} [urlOptions] - Options for setting various information about the url. Options must be in the objects {@link XmlSitemap#urlOptions}.
     * @throws {TypeError} Url object must contain a `url` or `loc` property
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
     * sitemap.urls
     * //=> [ 'http://domain.com/', 'http://domain.com/other', ....s
     *
     * sitemap.xml
     * //=> <?xml version="1.0"....
     */
    add: (url, urlOptions) => {
      // copy the object to avoid changing it
      const urlObj = JSON.parse(JSON.stringify(url));
      let urlStr;
      // a string is just the url
      if (typeof url === 'string') {
        urlStr = urlObj;

      // an array is many urls
      } else if (Array.isArray(url)) {
        urlObj.forEach(href => self.add(href));
        return self;

      // an object means options
      } else if (typeof url === 'object') {
        const parsed = self.constructor.parseUrlObject(urlObj);
        urlStr = parsed.url;
        urlOptions = parsed.options;

      // the url is invalid or nonexistent
      } else {
        throw new TypeError(`url must be an object or a string, found ${typeof url}`);
      }

      urlStr = urlUtil.resolve(self.host, urlStr);

      if (self.hasUrl(urlStr)) {
        if (urlStr === self.host) {
          return self.setOptionValues(url, urlOptions);
        }
        throw new Error(urlStr + ' is already in tree. To update options use the setOptionValue or setOptionValues methods.');
      }
      self.urls.push(urlStr);
      if (typeof urlOptions !== 'undefined') {
        if ({}.hasOwnProperty.call(urlOptions, 'file')) {
          urlOptions.lastmod = self.constructor.getLastmodFromFile(urlOptions.file);
          self.files[urlStr] = urlOptions.file;
          delete urlOptions.file;
        }
      }
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
     * sitemap.hasUrl('http://domain.com/other'); // true
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
      const urlStr = urlUtil.resolve(self.host, url);
      const index = self.urls.indexOf(urlStr);
      if (index === -1) {
        console.log(chalk.yellow(urlStr, 'is not in sitemap.'));
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
     *   .add('http://domain.com/', {lastmod: '2012-12-21', changefreq: 'never'});
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
      const urlStr = urlUtil.resolve(self.host, url);
      const index = self.urls.indexOf(urlStr);
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
    },

    /**
    * Sets the host of the webpage. All relative links added after this will added relative to the host. Automatically adds the host to the tree with the provided options.
    * @name XmlSitemap#setHost
    * @function
    * @param {String|Object} url - The url to set as host, or urlObject
    * @param {Object} [urlOptions] - Options for setting various information about the url. Options must valid options in the {@link XmlSitemap#urlOptions}.
    * @throws {Error} Url object must contain a `url` or `loc` property
    * @return {XmlSitemap} The updated sitemap object
    */
    setHost: (url, options) => {
      if (typeof url === 'object') {
        const parsed = self.constructor.parseUrlObject(url);
        options = parsed.options;
        url = parsed.url;
      }
      url = urlUtil.resolve(url, '');
      self.host = url;
      try {
        self.addUrl(url, options);
      } catch (err) {
        // add throws Error if not in tree, but TypeErrors if bad data
        if (err instanceof TypeError) {
          throw err;
        } else {
          self.setOptionValues(url, options);
        }
      }

      return self;
    }
  };
};
