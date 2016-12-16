'use strict';
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../../lib');

describe('for lastmod', () => {
  let sitemap;
  let url;
  beforeEach(() => {
    sitemap = new XmlSitemap();
    url = 'http://domain.com/';
  });

  describe('update', () => {
    it('aliased with updateLastmod', () => {
      sitemap.add(url);

      const lastmod = '2012-12-21';
      sitemap.updateLastmod(url, lastmod);
      sitemap.getOptionValue(url, 'lastmod').should.equal(lastmod);
    });

    it('with value', () => {
      sitemap.add(url);

      should.not.exist(sitemap.getOptionValue(url, 'lastmod'));

      const today = XmlSitemap.w3Date(new Date());
      const endOfWorld = '2012-12-21';
      const endOfWorldDate = new Date();
      endOfWorldDate.setFullYear(2012);
      endOfWorldDate.setMonth(11);
      endOfWorldDate.setDate(21);

      sitemap.update(url);
      sitemap.getOptionValue(url, 'lastmod').should.equal(today);

      sitemap.update(url, endOfWorld);
      sitemap.getOptionValue(url, 'lastmod').should.equal(endOfWorld);

      sitemap.update(url, 'now');
      sitemap.getOptionValue(url, 'lastmod').should.equal(today);

      sitemap.update(url, endOfWorldDate);
      sitemap.getOptionValue(url, 'lastmod').should.equal(endOfWorld);
    });

    it('when linked file', () => {
      sitemap.add(url);

      const filename = 'test/fixtures/test.html';
      const lastmod = XmlSitemap.w3Date(require('fs').statSync(filename).mtime);
      sitemap.files[url] = filename;

      sitemap.update(url);
      sitemap.getOptionValue(url, 'lastmod').should.equal(lastmod);
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add(url + 'magic');
      const today = XmlSitemap.w3Date(new Date());

      sitemap.update('/magic');
      sitemap.getOptionValue(url + 'magic', 'lastmod').should.equal(today);
    });
  });

  describe('updateAll', () => {
    let urls;
    before(() => {
      urls = [url, url + 'magic', url + 'other'];
    });

    describe('no linked files', () => {
      it('with no default value', () => {
        sitemap.add(urls);

        sitemap.updateAll();
        urls.forEach(link => {
          should.not.exist(sitemap.getOptionValue(link, 'lastmod'));
        });
      });

      it('with default value', () => {
        sitemap.add(urls);

        const lastmod = '2012-12-21';
        sitemap.updateAll(lastmod);
        urls.forEach(link => {
          sitemap.getOptionValue(link, 'lastmod').should.equal(lastmod);
        });
      });
    });

    describe('with some linked files', () => {
      const filename = 'test/fixtures/test.html';
      const lastmod = XmlSitemap.w3Date(require('fs').statSync(filename).mtime);

      it('with no default value', () => {
        sitemap.add(urls);
        sitemap.files[urls[0]] = filename;
        sitemap.files[urls[2]] = filename;

        sitemap.updateAll();

        sitemap.getOptionValue(urls[0], 'lastmod').should.equal(lastmod);
        sitemap.getOptionValue(urls[2], 'lastmod').should.equal(lastmod);
        should.not.exist(sitemap.getOptionValue(urls[1], 'lastmod'));
      });

      it('with default value', () => {
        sitemap.add(urls);
        sitemap.files[urls[0]] = filename;
        sitemap.files[urls[2]] = filename;

        sitemap.updateAll('2012-12-21');

        sitemap.getOptionValue(urls[0], 'lastmod').should.equal(lastmod);
        sitemap.getOptionValue(urls[1], 'lastmod').should.equal('2012-12-21');
        sitemap.getOptionValue(urls[2], 'lastmod').should.equal(lastmod);
      });
    });
  });

  describe('updateFromFile', () => {
    const filename = 'test/fixtures/test.html';
    const lastmod = XmlSitemap.w3Date(require('fs').statSync(filename).mtime);

    it('should update lastmod', () => {
      sitemap.add(url);
      sitemap.updateFromFile(url, filename);
      sitemap.getOptionValue(url, 'lastmod').should.equal(lastmod);
    });

    it('should not link file', () => {
      sitemap.add(url);
      sitemap.updateFromFile(url, filename);
      sitemap.files.should.deep.equal({});
    });

    it('throws error with bad path', () => {
      sitemap.add(url);
      const bad = () => {
        sitemap.updateFromFile(url, 'oogaboogabooga/bad/filepath');
      };
      bad.should.throw(Error);
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add(url + 'magic');
      sitemap.updateFromFile('/magic', filename);
      sitemap.getOptionValue(url + 'magic', 'lastmod').should.equal(lastmod);
    });
  });
});
