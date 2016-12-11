'use strict';
const fs = require('fs');
const chalk = require('chalk');

module.exports = self => {
  return {
    /* *********************************
     ***** OPTION HANDLING METHODS *****
     *********************************** */
    /**
     * Determine if and how to set an options given it's value. Will process option through handler if set in {@link XmlSitemap#optionHandlers}. Add options with {@link XmlSitemap#addOption}.
     * @name XmlSitemap#handleOption
     * @function
     * @param {String} option -The name of the option
     * @param {*} value - The object from which to derive the XML value
     * @throws {Error} Unavailable options throw an error
     * @return {String|null} How the option will appear in the XML
     */
    handleOption: (option, value) => {
      if (value === null) {
        return null;
      }
      let out;
      if (self.urlOptions.indexOf(option) >= 0) {
        if (typeof self.optionHandlers[option] === 'function') {
          out = self.optionHandlers[option](value);
        } else {
          out = value;
        }
      } else {
        throw new Error(`Unrecognized option ${option}. Expected one of ${self.urlOptions.join(', ')}.`);
      }
      return out;
    },

    /**
     * Add a custom option tag to the allowed url tags. Adds the option and handler to {@link XmlSitemap#urlOptions} and {@link XmlSitemap#optionHandlers}.
     * @name XmlSitemap#addOption
     * @function
     * @param {String} optionName - The name of the option
     * @param {Function} [handler] - An optional function to process option values for XML representation. Must return string.
     * @param {Bool} [overwrite=false] Acknowledge that you are overwriting the option if it already exists. This will remove all instances of the option in the sitemap.
     * @throws {Error} Cannot add options that already exist without setting overwrite to true. They must be removed with {@link XmlSitemap#removeOption}.
     * @return {XmlSitemap} The updated sitemap
     * @example
     * var sitemap = new XmlSitemap()
     * .add('http://domain.com.');
     *
     * // before adding option
     * sitemap.setOptionValue('http://domain.com/', 'foo', 'bar');
     * // Error: Unrecognized option foo. Expected one of lastmod, changefreq, priority.
     *
     * // adding option without handler
     * sitemap.addOption('foo');
     * sitemap.setOptionValue('http://domain.com/', 'foo', 'bar');
     *
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //  <url>
     * //    <loc>http://domain.com/</loc>
     * //    <foo>bar</foo>
     * //  </url>
     * // </urlset>
     *
     * // adding option with handler
     * sitemap.addOption('foo', function(str) {return str.toUpperCase();});
     * // Error: Option 'foo' already exists.
     *
     * // using overwrite
     * sitemap.addOption('foo', function(str) {return str.toUpperCase();}, true);
     * sitemap.setOptionValue('http://domain.com/', 'foo', 'bar');
     *
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //     <foo>BAR</foo>
     * //   </url>
     * // </urlset>
     */
    addOption: (optionName, handler, overwrite) => {
      if (typeof optionName !== 'string') {
        throw new TypeError('optionName must be a string.');
      }
      if (self.urlOptions.indexOf(optionName) >= 0) {
        if (overwrite === true || handler === true) {
          self.removeOption(optionName);
        } else {
          throw new Error(`Option '${optionName}' already exists. Set overwrite to true or call removeOption first.'`);
        }
      }
      self.urlOptions.push(optionName);
      if (typeof handler === 'function') {
        self.optionHandlers[optionName] = handler;
      }
      return self;
    },

    /**
     * Remove an existing available option. Removes its handler if applicable and **removes all instances of it in the sitemap's urls**.
     * @name XmlSitemap#removeOption
     * @function
     * @param  {String} optionName - The option to remove
     * @return {XmlSitemap} - The updated sitemap
     * @example
     * var sitemap = new XmlSitemap()
     *   .addOption('foo')
     *   .add('http://domain.com/', {'foo': 'bar'});
     *
     * // BEFORE
     * console.log(sitemap.urlOptions); // [ 'lastmod', 'changefreq', 'priority', 'foo' ]
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //     <foo>bar</foo>
     * //   </url>
     * // </urlset>
     *
     * sitemap.removeOption('foo');
     *
     * // AFTER
     * console.log(sitemap.urlOptions); // [ 'lastmod', 'changefreq', 'priority' ]
     * console.log(sitemap.xml);
     * // <?xml version="1.0" encoding="UTF-8"?>
     * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     * //   <url>
     * //     <loc>http://domain.com/</loc>
     * //   </url>
     * // </urlset>
     */
    removeOption: optionName => {
      const index = self.urlOptions.indexOf(optionName);
      if (index < 0) {
        return self;
      }
      delete self.optionHandlers[optionName];
      self.urlOptions.splice(index, 1);

      self.urls.forEach(url => {
        const urlNode = self.getUrlNode(url);
        if (typeof urlNode[optionName] !== 'undefined') {
          delete urlNode[optionName];
        }
      });

      return self;
    },

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
    * @name XmlSitemap#setOptionValues
    * @function
    * @param {String} url - The url to add
    * @param {Object} options - Options for setting various information about the url
    * @throws {Error} Options object is required
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
      if (typeof options !== 'object') {
        throw new Error('Options object required for setOptionValues.');
      }
      const urlNode = self.getUrlNode(url);
      Object.keys(options).forEach(opt => {
        const value = self.handleOption(opt, options[opt]);
        if (value === null) {
          delete urlNode[opt];
        } else {
          urlNode[opt] = value;
        }
      });
      return self;
    },

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
      if (!self.hasUrl(url)) {
        console.log(chalk.yellow(url, 'not in sitemap, can\'t update lastmod.'));
        return self;
      }
      if (typeof self.files[url] !== 'undefined') {
        console.log(chalk.green(`Setting ${url} lastmod from linked file.`));
        date = self.constructor.getLastmodFromFile(self.files[url]);
      }
      date = date === null ? new Date() : date;

      const urlNode = self.getUrlNode(url);
      urlNode.lastmod = self.handleOption('lastmod', date);
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
     */
    updateFromFile: (url, filepath) => {
      if (!self.hasUrl(url)) {
        console.log(chalk.yellow(url, 'not in sitemap, can\'t link file.'));
        return self;
      } else if (!fs.existsSync(filepath)) {
        throw new Error('Unable to resolve file ' + filepath);
      }
      const date = self.constructor.getLastmodFromFile(filepath);
      return self.update(url, date);
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
     * Link a file for the url to get the lastmod value from. Update all lastmod values that have linked files by calling {@link XmlSitemap#updateAll}. To unlink files use {@link XmlSitemap#unlinkFile}. Update lastmod from file without linking the file using {@link XmlSitemap#updateFromFile}.
     * @name XmlSitemap#linkFile
     * @function
     * @param {String} url - The url to link a file to
     * @param {String} filepath - The path to the file
     * @throws {Error} Unable to resolve filepath
     * @return {XmlSitemap} The u
     */
    linkFile: (url, filepath) => {
      if (!self.hasUrl(url)) {
        console.log(chalk.yellow(url, 'not in sitemap, can\'t link file.'));
        return self;
      } else if (!fs.existsSync(filepath)) {
        throw new Error('Unable to resolve file ' + filepath);
      }
      self.files[url] = filepath;
      self.update(url);
    },

    /**
     * Unlink a linked file.
     * @param {String} - The url you want to unlink from a file
     * @return {XmlSitemap} The updated sitemap
     */
    unlinkFile: url => {
      delete self.files[url];
      return self;
    }
  };
};
