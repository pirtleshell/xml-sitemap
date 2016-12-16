'use strict';
const customOptions = require('./custom-options');
const setAndGet = require('./set-and-get');
const lastmod = require('./lastmod');
const fileLinking = require('./file-linking');

module.exports = self => {
  /* *********************************
   ***** OPTION HANDLING METHODS *****
   *********************************** */
  return {
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

    addOption: customOptions(self).addOption,
    removeOption: customOptions(self).removeOption,
    getOptionValue: setAndGet(self).getOptionValue,
    setOptionValue: setAndGet(self).setOptionValue,
    setOptionValues: setAndGet(self).setOptionValues,
    update: lastmod(self).update,
    updateAll: lastmod(self).updateAll,
    updateFromFile: lastmod(self).updateFromFile,
    linkFile: fileLinking(self).linkFile,
    unlinkFile: fileLinking(self).unlinkFile
  };
};
