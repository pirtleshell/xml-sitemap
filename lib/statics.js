'use strict';
module.exports = XmlSitemap => {
  /* ************************
   ***** STATIC METHODS *****
   ************************** */
  /**
   * Format a Date object to W3 standard string.
   * @param {Date} date - the Date to format
   * @throws {TypeError} Argument must be Date object
   * @return {String} Date formatted as year-month-day
   * @example
   * var date = new Date();
   * date.setFullYear(2012);
   * date.setMonth(11);
   * date.setDate(21);
   *
   * XmlSitemap.w3Date(date); // '2012-12-21'
   */
  XmlSitemap.w3Date = date => {
    if (!(date instanceof Date)) {
      throw new TypeError(`XmlSitemap.w3Date expects a Date object, found ${date.constructor}.`);
    }
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  /**
   * Determine what to put in the lastmod field given the input. Will NOT check format of string.
   * @param {String|Date} [date] - The lastmod value as a Date object, the string 'now', or a string (will not confirm format)
   * @return {String} The value of lastmod
   */
  XmlSitemap.handleLastmod = date => {
    let out = date;
    if (typeof date === 'undefined' || date === 'now' || date === null) {
      out = XmlSitemap.w3Date(new Date());
    } else if (date instanceof Date) {
      out = XmlSitemap.w3Date(date);
    } else if (typeof date !== 'string') {
      throw new TypeError(`Expected lastmod value to be a Date or string, found ${typeof date}.`);
    }
    return out;
  };

  /**
   * Check if changfreq value is valid.
   * @param {String} value - The changefreq value to check
   * @throws {Error} The changefreq must be valid. Allowed values are "always", "hourly", "daily", "weekly", "monthly", "yearly", "never".
   * @return {String} A valid changefreq value
   */
  XmlSitemap.handleChangefreq = value => {
    const allowedValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    if (allowedValues.indexOf(value) < 0) {
      throw new Error(`Unrecognized changfreq value ${value}`);
    }
    return value;
  };

  /**
   * Check for valid priority value and return it as a string. Priority must be between 0 and 1.
   * @param {Double} value - The Priority value
   * @throws {Error} Priority must be number between 0 & 1, inclusive.
   * @return {String} The priority value as a string
   */
  XmlSitemap.handlePriority = value => {
    if (value < 0 || value > 1 || typeof value !== 'number') {
      throw new Error(`Priority must be number between 0 and 1, found ${value}`);
    }
    return value.toString();
  };
};
