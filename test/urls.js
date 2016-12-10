'use strict';
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../lib');

describe('url methods', () => {
  let sitemap;
  let url;
  beforeEach(() => {
    sitemap = new XmlSitemap();
    url = 'http://domain.com/';
  });

  it('hasUrl', () => {
    sitemap.addUrl(url);
    sitemap.hasUrl(url).should.equal.true;
    sitemap.hasUrl('http://otherdomain.com/').should.equal.false;
  });

  it('getUrlNode', () => {
    sitemap.addUrl(url, {
      lastmod: '2012-12-21',
      changefreq: 'never'
    });
    const urlNode = {
      loc: url,
      lastmod: '2012-12-21',
      changefreq: 'never'
    };
    sitemap.getUrlNode(url).should.deep.equal(urlNode);
  });

  it('removeUrl', () => {
    sitemap.addUrl(url);

    sitemap.hasUrl(url).should.be.true;
    sitemap.urls.should.include(url);

    sitemap.removeUrl(url);
    sitemap.hasUrl(url).should.be.false;
    sitemap.urls.should.not.include(url);
  });
});
