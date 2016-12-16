'use strict';
const fs = require('fs');
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../lib');

const testSitemapString = fs.readFileSync('test/fixtures/test_sitemap.xml').toString();
const testSitemapUrls = [
  'http://domain.com/',
  'http://domain.com/another-page',
  'http://domain.com/magic'
];

const emptySitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>';

describe('XmlSitemap', () => {

  describe('empty instance', () => {
    let sitemap;
    before(() => {
      sitemap = new XmlSitemap();
    });

    it('has xmlObj', () => {
      const defaultXmlObj = {
        urlset: {
          $: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
          }
        }
      };
      sitemap.should.have.property('xmlObj');
      sitemap.xmlObj.should.deep.equal(defaultXmlObj);
    });
    it('has null host', () => {
      sitemap.should.have.property('host');
      sitemap.host.should.equal('');
    });
    it('has empty urls array', () => {
      sitemap.should.have.property('urls');
      sitemap.urls.should.be.a('array');
      sitemap.urls.should.be.empty;
    });
    it('has empty files object', () => {
      sitemap.should.have.property('files');
      sitemap.files.should.deep.equal({});
    });
    it('has defaul xmlObj', () => {
      const defaultObj = {
        urlset: {
          $: {xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        }
      };
      sitemap.xmlObj.should.deep.equal(defaultObj);
    });
    it('has default urlOptions', () => {
      const defaultOpts = ['lastmod', 'changefreq', 'priority'];
      sitemap.should.have.property('urlOptions');
      sitemap.urlOptions.should.be.a('array');
      sitemap.urlOptions.should.deep.equal(defaultOpts);
    });
    it('has default optionHandlers', () => {
      const defaultHandlers = {
        lastmod: XmlSitemap.handleLastmod,
        priority: XmlSitemap.handlePriority,
        changefreq: XmlSitemap.handleChangefreq
      };
      sitemap.should.have.property('optionHandlers');
      sitemap.optionHandlers.should.deep.equal(defaultHandlers);
    });
    it('should generate empty xml', () => {
      sitemap.xml.should.equal(emptySitemap);
    });
  });

  describe('from existing sitemap', () => {
    let sitemap;
    before(() => {
      sitemap = new XmlSitemap(testSitemapString);
    });

    it('loads urls', () => {
      sitemap.urls.should.deep.equal(testSitemapUrls);
    });
    it('returns proper xml', () => {
      const beforeNoSpace = testSitemapString.replace(/\s/g, '');
      sitemap.xml.replace(/\s/g, '').should.equal(beforeNoSpace);
    });
  });

  describe('static methods', () => {
    require('./statics.js');
  });

  require('./urls');
  require('./option-handling');
});
