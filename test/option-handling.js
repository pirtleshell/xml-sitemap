'use strict';
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../lib');

describe('option handling methods', () => {
  let sitemap;
  let url;
  beforeEach(() => {
    sitemap = new XmlSitemap();
    url = 'http://domain.com/';
  });

  it('addOption', () => {
    sitemap.addUrl(url);

    const toUpper = str => str.toUpperCase();
    let bad = () => {
      sitemap.setOptionValue(url, 'foo', 'bar');
    };
    bad.should.throw(Error);

    sitemap.addOption('foo');
    sitemap.urlOptions.should.include('foo');
    sitemap.setOptionValue(url, 'foo', 'bar');
    let urlNode = sitemap.getUrlNode(url);
    urlNode.should.have.property('foo');
    urlNode.foo.should.equal('bar');

    bad = () => {
      sitemap.addOption('foo', toUpper);
    };
    bad.should.throw(Error);

    sitemap.addOption('foo', toUpper, true);
    sitemap.setOptionValue(url, 'foo', 'bar');

    sitemap.urlOptions.should.include('foo');
    sitemap.optionHandlers.should.have.property('foo');
    sitemap.optionHandlers.foo.should.be.a('function');
    sitemap.optionHandlers.foo('bar').should.equal('BAR');

    sitemap.setOptionValue(url, 'foo', 'bar');

    urlNode = sitemap.getUrlNode(url);
    urlNode.should.have.property('foo');
    urlNode.foo.should.equal('BAR');
  });

  it('removeOption', () => {
    sitemap.addOption('foo', num => num + 1)
      .addUrl(url, {foo: 2});

    sitemap.urlOptions.should.include('foo');
    sitemap.optionHandlers.should.have.property('foo');
    sitemap.optionHandlers.foo.should.be.a('function');

    let urlNode = sitemap.getUrlNode(url);
    urlNode.should.have.property('foo');
    urlNode.foo.should.equal(3);

    sitemap.removeOption('foo');

    sitemap.urlOptions.should.not.include('foo');
    sitemap.optionHandlers.should.not.have.property('foo');

    urlNode = sitemap.getUrlNode(url);
    urlNode.should.not.have.property('foo');
  });

  it('setOptionValue', () => {
    sitemap.addUrl(url);

    sitemap.setOptionValue(url, 'priority', 0.3);

    const bad = () => {
      sitemap.setOptionValue(url, 'foo', 'bar');
    };
    bad.should.throw(Error);
  });

  it('setOptionValues & getOptionValue', () => {
    sitemap.addUrl(url, {lastmod: '1900-10-31', priority: 0.7});

    sitemap.getOptionValue(url, 'lastmod').should.equal('1900-10-31');
    sitemap.getOptionValue(url, 'priority').should.equal('0.7');
    should.equal(sitemap.getOptionValue(url, 'changefreq'), null);

    sitemap.setOptionValues(url, {priority: 0.8, changefreq: 'weekly'});

    sitemap.getOptionValue(url, 'lastmod').should.equal('1900-10-31');
    sitemap.getOptionValue(url, 'priority').should.equal('0.8');
    sitemap.getOptionValue(url, 'changefreq').should.equal('weekly');
  });

  it('getOptionValue errors', () => {
    sitemap.addUrl(url);

    let bad = () => {
      sitemap.getOptionValue('http://notreal.com/', 'lastmod');
    };
    bad.should.throw(Error);

    bad = () => {
      sitemap.getOptionValue(url, 'foo');
    };
    bad.should.throw(Error);
  });

  it('updateLastmod', () => {
    sitemap.addUrl(url);

    should.not.exist(sitemap.getOptionValue(url, 'lastmod'));

    const today = XmlSitemap.w3Date(new Date());
    const endOfWorld = '2012-12-21';
    const endOfWorldDate = new Date();
    endOfWorldDate.setFullYear(2012);
    endOfWorldDate.setMonth(11);
    endOfWorldDate.setDate(21);

    sitemap.updateLastMod(url);
    sitemap.getOptionValue(url, 'lastmod').should.equal(today);

    sitemap.updateLastMod(url, endOfWorld);
    sitemap.getOptionValue(url, 'lastmod').should.equal(endOfWorld);

    sitemap.updateLastMod(url, 'now');
    sitemap.getOptionValue(url, 'lastmod').should.equal(today);

    sitemap.updateLastMod(url, endOfWorldDate);
    sitemap.getOptionValue(url, 'lastmod').should.equal(endOfWorld);
  });
});
