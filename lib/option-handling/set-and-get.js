'use strict';
// const urlUtil = require('url');
const chalk = require('chalk');

module.exports = self => {
  return {
    /**
     * Get an option value from the XML object tree's url. Valid options that are unset return null. Invalid options or requesting options for urls not in the sitemap throw errors.
     *
     * @name XmlSitemap#getOptionValue
     * @function
     * @param  {String} url - The url to get the option for
     * @param  {String} option - The desired option
     * @throws {Error} Url must be in sitemap
     * @throws {Error} Option must be valid, add options with {@link XmlSitemap#addOption}
     * @return {String|null} The option value or null if option not assigned or url isn't in tree.
     * @example
     * var sitemap = new XmlSitemap()
     * .add('http://domain.com/', {priority: 0.7});
     *
     * sitemap.getOptionValue('http://domain.com/', 'priority'); // '0.7'
     * sitemap.getOptionValue('http://domain.com/', 'lastmod'); // null
     * sitemap.getOptionValue('http://notreal.com/', 'lastmod'); // throws error
     */
    getOptionValue: (url, option) => {
      if (!self.hasUrl(url)) {
        throw new Error(`${url} not in sitemap, can't get value.`);
      }
      if (self.urlOptions.indexOf(option) < 0) {
        throw new Error(`Option ${option} is not valid. To add options, use addOption.`);
      }
      const urlNode = self.getUrlNode(url);
      if (typeof urlNode[option] !== 'undefined') {
        return urlNode[option];
      }
      return null;
    },

    /**
     * Set an option on a url node. Set multiple options using {@link XmlSitemap#updateUrl}. To remove an option, set its value to null or use {@link XmlSitemap#removeOptionValue}.
     * @name XmlSitemap#setOptionValue
     * @function
     * @param {string} url - Url in Sitemap to update
     * @param {string} option - The name of the option
     * @param {*} value - The object from which to derive the XML value
     * @example
     * var sitemap = new XmlSitemap()
     *   .add('http://domain.com/');
     * sitemap.setOptionValue('http://domain.com/', 'priority', 0.3);
     *
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //     <priority>0.3</priority>
     * //   </url>
     * // </urlset>
     * @return {XmlSitemap} The updated XmlSitemap
     */
    setOptionValue: (url, option, value) => {
      if (option === 'file') {
        return self.linkFile(url, value);
      }
      value = self.handleOption(option, value);
      if (!self.hasUrl(url)) {
        console.log(chalk.yellow(url, `not in sitemap, can't update its ${option}.`));
        return self;
      }
      const urlNode = self.getUrlNode(url);
      if (value === null) {
        delete urlNode[option];
      } else {
        urlNode[option] = value;
      }

      return self;
    },

    /**
    * Update a url's options. Options must be in the sitemap's allowable {@link XmlSitemap#urlOptions}. Not to be confused with {@link XmlSitemap#setOptionValue} To remove an existing option, set its value to null.
    * @name XmlSitemap setOptionValues
    * @function
    * @param {String|Object} url - The url to add
    * @param {Object} options - Options for setting various information about the url
    * @throws {Error} Url object has no 'url' or 'loc' key
    * @return {XmlSitemap} The updated sitemap object
    * @example
    * var url = 'http://domain.com/'
    * var sitemap = new XmlSitemap()
    * .add(url, {lastmod:'1900-10-31', priority: 0.7});
    *
    * sitemap.getOptionValue(url, 'lastmod'); // '1900-10-31'
    * sitemap.getOptionValue(url, 'priority'); // '0.7'
    * sitemap.getOptionValue(url, 'changefreq'); // null
    *
    * sitemap.setOptionValues(url, {priority: 0.8, changefreq: 'weekly'});
    *
    * sitemap.getOptionValue(url, 'lastmod'); // '1900-10-31'
    * sitemap.getOptionValue(url, 'priority'); // '0.8'
    * sitemap.getOptionValue(url, 'changefreq'); // 'weekly'
    */
    setOptionValues: (url, options) => {
      if (typeof url === 'object') {
        const parsed = self.constructor.parseUrlObject(url);
        url = parsed.url;
        options = parsed.options;
      } else if (typeof options !== 'object') {
        return self;
      }
      const urlNode = self.getUrlNode(url);
      Object.keys(options).forEach(opt => {
        if (opt === 'file') {
          self.linkFile(url, options[opt]);
        } else {
          const value = self.handleOption(opt, options[opt]);
          if (value === null) {
            delete urlNode[opt];
          } else {
            urlNode[opt] = value;
          }
        }
      });
      return self;
    }
  };
};
