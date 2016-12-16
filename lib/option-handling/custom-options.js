'use strict';

module.exports = self => {
  return {
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
    }
  };
};
