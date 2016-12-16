'use strict';
const fs = require('fs');
const urlUtil = require('url');
const chalk = require('chalk');

module.exports = self => {
  return {
    /**
     * Update when a url was last modified.  Aliased with `updateLastmod`. Updates lastmod date to today if no date is passed unless there's a linked file. If there's a linked file, it will use that date regardless. To link a file, use {@link XmlSitemap#linkFile}.
     * @name XmlSitemap#update
     * @function
     * @param {String} url - Url in Sitemap to update
     * @param {String|Date} [date=today] - Date to update the lastmod value to.
     * @return {XmlSitemap} The sitemap object
     * @example
     * var url = 'http://domain.com/'
     * var sitemap = new XmlSitemap()
     *   .add(url);
     *
     * sitemap.getOptionValue(url, 'lastmod'); // null
     *
     * // no date
     * sitemap.update(url);
     * sitemap.getOptionValue(url, 'lastmod'); // {today's date}
     *
     * // string date
     * sitemap.update(url, '2012-12-21');
     * sitemap.getOptionValue(url, 'lastmod'); // '2012-12-21'
     *
     * // 'now'
     * sitemap.update(url, 'now');
     * sitemap.getOptionValue(url, 'lastmod'); // {today's date}
     *
     * // Date object
     * var date = new Date();
     * date.setFullYear(2012);
     * date.setMonth(11);
     * date.setDate(21);
     * sitemap.update(url, date);
     * sitemap.getOptionValue(url, 'lastmod'); // '2012-12-21'
     *
     */
    update: (url, date) => {
      const urlStr = urlUtil.resolve(self.host, url);
      if (!self.hasUrl(urlStr)) {
        console.log(chalk.yellow(url, 'not in sitemap, can\'t update lastmod.'));
        return self;
      }
      if (typeof self.files[urlStr] !== 'undefined') {
        date = self.constructor.getLastmodFromFile(self.files[urlStr]);
      }
      date = date === null ? new Date() : date;

      const urlNode = self.getUrlNode(urlStr);
      urlNode.lastmod = self.handleOption('lastmod', date);
      return self;
    },

    /**
     * Updates all the lastmod values of all urls that have linked files. If a value is passed, it will update all the urls to their linked file's modified date and all unlinked urls to the default value  passed.
     * @param {Date|String} [defaultValue] - An optional value to update all unlinked urls' lastmod values
     * @return {XmlSitemap} The updated sitemap
     * @example
     * // update ONLY the lastmod values of urls linked to files
     * sitemap.updateAll();
     *
     * // update linked files to file lastmod and set lastmod for all others to today
     * sitemap.updateAll('now');
     *
     * // or
     * sitemap.updateAll(new Date());
     *
     * // update linked files to their lastmods, set all others to string
     * sitemap.updateAll('2012-12-21');
     */
    updateAll: defaultValue => {
      if (defaultValue == undefined) { // eslint-disable-line eqeqeq
        self.urls.forEach(url => {
          if (typeof self.files[url] !== 'undefined') {
            self.update(url);
          }
        });
      } else {
        self.urls.forEach(url => self.update(url, defaultValue));
      }
      return self;
    },

    /**
     * Update the lastmod of a url from a file's lastmod **without** linking the file.
     * @name XmlSitemap#updateFromFile
     * @function
     * @param {String} url - The url to link a file to
     * @param {String} filepath - The path to the file
     * @throws {Error} Unable to resolve filepath
     * @return {XmlSitemap} The updated sitemap
     * @example
     * // suppose 'file.html' was last modified 2016-01-01
     * var url = 'http://domain.com/';
     * var sitemap = new XmlSitemap()
     *   .add(url);
     *
     * sitemap.getOptionValue(url, 'lastmod');
     * //=> null
     *
     * sitemap.updateFromFile(url, 'file.html');
     * sitemap.getOptionValue(url, 'lastmod');
     * //=> 2016-01-01
     *
     * // there are still no linked files in the files object
     * sitemap.files
     * //=> {}
     */
    updateFromFile: (url, filepath) => {
      const urlStr = urlUtil.resolve(self.host, url);
      if (!self.hasUrl(urlStr)) {
        console.log(chalk.yellow(urlStr, 'not in sitemap, can\'t link file.'));
        return self;
      } else if (!fs.existsSync(filepath)) {
        throw new Error('Unable to resolve file ' + filepath);
      }
      const date = self.constructor.getLastmodFromFile(filepath);
      return self.update(urlStr, date);
    }
  };
};
