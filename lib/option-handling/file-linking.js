'use strict';
const fs = require('fs');
const urlUtil = require('url');
const chalk = require('chalk');

module.exports = self => {
  return {
    /**
     * Link a file to a url. Their lastmod dates will sync. Update lastmod values that have linked files by calling {@link XmlSitemap#updateAll}. To unlink files use {@link XmlSitemap#unlinkFile}. Update lastmod from a file without linking the file using {@link XmlSitemap#updateFromFile}.
     * @name XmlSitemap#linkFile
     * @function
     * @param {String} url - The url to link a file to
     * @param {String} filepath - The path to the file
     * @throws {Error} Unable to resolve filepath
     * @return {XmlSitemap} The updated XmlSitemap
     * @example
     * // suppose 'file.html' was last modified 2016-01-01
     * var url = 'http://domain.com/';
     * var sitemap = new XmlSitemap()
     *   .add(url);
     *
     * sitemap.getOptionValue(url, 'lastmod');
     * //=> null
     *
     * sitemap.linkFile(url, 'file.html');
     * sitemap.getOptionValue(url, 'lastmod');
     * //=> 2016-01-01
     *
     * // the file has been linked and the lastmod for the url will be updated
     * // everytime sitemap.updateAll() is called.
     * sitemap.files
     * //=> {'http://domain.com/': 'file.html'}
     */
    linkFile: (url, filepath) => {
      if (!self.hasUrl(url)) {
        console.log(chalk.yellow(url, 'not in sitemap, can\'t link file.'));
        return self;
      } else if (!fs.existsSync(filepath)) {
        throw new Error('Unable to resolve file ' + filepath);
      }
      const urlStr = urlUtil.resolve(self.host, url);
      self.files[urlStr] = filepath;
      self.update(url);
    },

    /**
     * Unlink a linked file. Does not affect url's lastmod value.
     * @param {String} - The url you want to unlink from a file
     * @return {XmlSitemap} The updated sitemap
     * @example
     * var sitemap = new XmlSitemap()
     *  .add({
     *     url: 'http://domain.com/'
     *     file: 'file.html'
     *   });
     *
     * sitemap.files
     * //=> {'http://domain.com/': 'file.html'}
     *
     * sitemap.unlinkFile('http://domain.com/');
     *
     * sitemap.files
     * //=> {}
     */
    unlinkFile: url => {
      const urlStr = urlUtil.resolve(self.host, url);
      delete self.files[urlStr];
      return self;
    }
  };
};
