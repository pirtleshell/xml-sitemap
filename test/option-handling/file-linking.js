'use strict';
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../../lib');

describe('File Linking', () => {
  let sitemap;
  let url;
  beforeEach(() => {
    sitemap = new XmlSitemap();
    url = 'http://domain.com/';
  });

  const filename = 'test/fixtures/test.html';
  const lastmod = XmlSitemap.w3Date(require('fs').statSync(filename).mtime);

  describe('linkFile', () => {
    it('adds to files object', () => {
      sitemap.add(url);
      sitemap.linkFile(url, filename);
      sitemap.files.should.have.property(url);
      sitemap.files[url].should.equal(filename);
    });

    it('updates lastmod', () => {
      sitemap.add(url)
      .linkFile(url, filename);
      sitemap.getOptionValue(url, 'lastmod').should.equal(lastmod);
    });

    it('throws error when path is bad', () => {
      sitemap.add(url);
      const bad = () => {
        sitemap.linkFile(url, 'oogaboogabooga/bad/filename');
      };
      bad.should.throw(Error);
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add(url + 'magic');
      sitemap.linkFile('/magic', filename);
      sitemap.files.should.have.property(url + 'magic');
      sitemap.files[url + 'magic'].should.equal(filename);
    });
  });

  describe('unlinkFile', () => {
    beforeEach(() => {
      sitemap.add({
        url,
        file: filename
      });
    });
    it('should remove file from files object', () => {
      sitemap.unlinkFile(url);
      sitemap.files.should.deep.equal({});
    });

    it('should not change lastmod', () => {
      sitemap.unlinkFile(url);
      sitemap.getOptionValue(url, 'lastmod').should.equal(lastmod);
    });

    it('works with relative links', () => {
      sitemap.setHost(url)
        .add({
          url: url + 'magic',
          file: filename
        });
      sitemap.unlinkFile('/magic');
      sitemap.getOptionValue(url, 'lastmod').should.equal(lastmod);
      const expected = {};
      expected[url] = filename;
      sitemap.files.should.deep.equal(expected);
    });
  });
});
