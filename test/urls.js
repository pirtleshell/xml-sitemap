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

  describe('hasUrl', () => {
    it('returns true when in tree', () => {
      sitemap.add(url);
      sitemap.hasUrl(url).should.equal.true;
    });

    it('returns false when not in tree', () => {
      sitemap.add(url);
      sitemap.hasUrl('http://otherdomain.com/').should.equal.false;
    });

    it('works with relative links', () => {
      sitemap.setHost('http://domain.com')
        .add(url + 'magic');
      sitemap.hasUrl('magic').should.be.true;
      // sitemap.hasUrl('/magic').should.be.true;
    });
  });

  it('getUrlNode', () => {
    sitemap.add(url, {
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

  describe('add', () => {
    it('aliased with addUrl & addUrls', () => {
      sitemap.addUrl(url)
        .addUrls(url + 'magic');

      sitemap.hasUrl(url).should.be.true;
      sitemap.hasUrl(url + 'magic').should.be.true;
    });

    it('string input', () => {
      sitemap.add(url);

      sitemap.urls.should.include(url);
      sitemap.xmlObj.urlset.url[0].loc.should.equal(url);
    });

    it('string with options', () => {
      sitemap.add(url, {changefreq: 'never', lastmod: '2012-12-21'});

      const urlNode = {
        loc: url,
        changefreq: 'never',
        lastmod: '2012-12-21'
      };
      sitemap.urls.should.include(url);
      sitemap.xmlObj.urlset.url[0].should.deep.equal(urlNode);
    });

    it('urlObject with url', () => {
      const urlObj = {
        url,
        changefreq: 'never',
        priority: 0.6,
        lastmod: '2012-12-21'
      };
      sitemap.add(urlObj);
      const urlNode = {
        loc: url,
        changefreq: 'never',
        priority: '0.6',
        lastmod: '2012-12-21'
      };
      sitemap.urls.should.include(url);
      sitemap.xmlObj.urlset.url[0].should.deep.equal(urlNode);
    });

    it('urlObject with loc', () => {
      const urlNode = {
        loc: url,
        changefreq: 'never',
        priority: 0.6,
        lastmod: '2012-12-21'
      };
      sitemap.add(urlNode);
      urlNode.priority = '0.6';
      sitemap.urls.should.include(url);
      sitemap.xmlObj.urlset.url[0].should.deep.equal(urlNode);
    });

    it('array of all of them', () => {
      const urls = [url, url + 'magic', url + 'another-page'];
      sitemap.add([
        urls[0],
        {
          url: urls[1],
          changefreq: 'always'
        },
        {
          loc: urls[2],
          priority: 0.2
        }
      ]);
      sitemap.urls.should.deep.equal(urls);
      sitemap.xmlObj.urlset.url.should.have.length(3);
    });

    it('urlObject with linked file', () => {
      const filename = 'test/fixtures/test.html';
      const urlNode = {
        url,
        file: filename
      };
      const lastmod = require('fs').statSync(filename).mtime;
      sitemap.add(urlNode);

      sitemap.files.should.have.property(url);
      sitemap.files[url].should.equal(filename);
      sitemap.getUrlNode(url).should.have.property('lastmod');
      sitemap.getUrlNode(url).lastmod.should.equal(XmlSitemap.w3Date(lastmod));
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add('/magic');
      sitemap.urls.should.deep.equal([url, url + 'magic']);
    });
  });

  describe('remove', () => {
    it('is aliased with removeUrl', () => {
      sitemap.add(url);

      sitemap.hasUrl(url).should.be.true;
      sitemap.urls.should.include(url);

      sitemap.removeUrl(url);
      sitemap.hasUrl(url).should.be.false;
      sitemap.urls.should.not.include(url);
    });

    it('properly removes url', () => {
      sitemap.add(url);
      sitemap.remove(url);
      sitemap.urls.should.not.include(url);
      sitemap.xmlObj.urlset.url.should.have.length(0);
    });

    it('works with relative links', () => {
      sitemap.setHost(url);
      sitemap.add(url + 'magic');
      sitemap.remove('/magic');
      sitemap.urls.should.not.include(url + 'magic');
      sitemap.xmlObj.urlset.url.should.have.length(1);
    });
  });

  describe('setHost', () => {
    it('string, no options', () => {
      sitemap.setHost(url);
      sitemap.host.should.equal(url);
      sitemap.urls.should.deep.equal([url]);
    });

    it('string, with options', () => {
      sitemap.setHost(url, {lastmod: '2012-12-21'});
      sitemap.host.should.equal(url);
      sitemap.getOptionValue(url, 'lastmod').should.equal('2012-12-21');
    });

    it('url object', () => {
      sitemap.setHost({url, lastmod: '2012-12-21'});
      sitemap.host.should.equal(url);
      sitemap.getOptionValue(url, 'lastmod').should.equal('2012-12-21');
    });

    it('works when host is already in map', () => {
      sitemap.add(url)
        .setHost(url);
      sitemap.host.should.equal(url);
      sitemap.urls.should.deep.equal([url]);
    });
  });
});
