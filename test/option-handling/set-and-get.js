'use strict';
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../../lib');

describe('for Setting & Getting', () => {
  let sitemap;
  let url;
  beforeEach(() => {
    sitemap = new XmlSitemap();
    url = 'http://domain.com/';
  });

  describe('setOptionValue', () => {
    it('should set option', () => {
      sitemap.add(url);
      sitemap.setOptionValue(url, 'priority', 0.3);
      sitemap.getOptionValue(url, 'priority').should.equal('0.3');
    });

    it('should throw error for invalid option', () => {
      sitemap.add(url);
      const bad = () => {
        sitemap.setOptionValue(url, 'foo', 'bar');
      };
      bad.should.throw(Error);
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add(url + 'magic');
      sitemap.setOptionValue('/magic', 'priority', 0.3);
      sitemap.getOptionValue(url + 'magic', 'priority').should.equal('0.3');
    });
  });

  describe('setOptionValues', () => {
    it('updated options when provided', () => {
      sitemap.add(url, {lastmod: '1900-10-31', priority: 0.7});

      sitemap.getOptionValue(url, 'lastmod').should.equal('1900-10-31');
      sitemap.getOptionValue(url, 'priority').should.equal('0.7');
      should.equal(sitemap.getOptionValue(url, 'changefreq'), null);

      sitemap.setOptionValues(url, {priority: 0.8, changefreq: 'weekly'});

      sitemap.getOptionValue(url, 'lastmod').should.equal('1900-10-31');
      sitemap.getOptionValue(url, 'priority').should.equal('0.8');
      sitemap.getOptionValue(url, 'changefreq').should.equal('weekly');
    });

    it('accepts url object', () => {
      sitemap.add(url);
      sitemap.setOptionValues({
        url,
        lastmod: '1900-10-31',
        priority: 0.8,
        changefreq: 'weekly'
      });
      sitemap.getOptionValue(url, 'lastmod').should.equal('1900-10-31');
      sitemap.getOptionValue(url, 'priority').should.equal('0.8');
      sitemap.getOptionValue(url, 'changefreq').should.equal('weekly');
    });

    it('returns self when url string and no options', () => {
      const urlObj = {
        loc: url,
        lastmod: '1900-10-31',
        priority: 0.8,
        changefreq: 'weekly'
      };
      sitemap.add(urlObj);
      urlObj.priority = '0.8';
      sitemap.setOptionValues(url).xmlObj.urlset.url[0].should.deep.equal(urlObj);
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add(url + 'magic');
      sitemap.setOptionValues({
        url: '/magic',
        lastmod: '1900-10-31',
        priority: 0.8,
        changefreq: 'weekly'
      });
      sitemap.getOptionValue(url + 'magic', 'lastmod').should.equal('1900-10-31');
      sitemap.getOptionValue(url + 'magic', 'priority').should.equal('0.8');
      sitemap.getOptionValue(url + 'magic', 'changefreq').should.equal('weekly');
    });
  });

  describe('getOptionValue', () => {
    it('should throw for url not in tree', () => {
      sitemap.add(url);
      const bad = () => {
        sitemap.getOptionValue('http://notreal.com/', 'lastmod');
      };
      bad.should.throw(Error);
    });

    it('should throw for invalid option', () => {
      sitemap.add(url);
      const bad = () => {
        sitemap.getOptionValue(url, 'foo');
      };
      bad.should.throw(Error);
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add({
          url: url + 'magic',
          lastmod: '1900-10-31',
          priority: 0.8,
          changefreq: 'weekly'
        });
      sitemap.getOptionValue('/magic', 'lastmod').should.equal('1900-10-31');
      sitemap.getOptionValue('magic', 'priority').should.equal('0.8');
      sitemap.getOptionValue('/magic', 'changefreq').should.equal('weekly');
    });
  });
});
