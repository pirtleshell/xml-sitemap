'use strict';
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../../lib');

describe('Custom Options', () => {
  let sitemap;
  let url;
  beforeEach(() => {
    sitemap = new XmlSitemap();
    url = 'http://domain.com/';
  });

  describe('addOption', () => {
    const toUpper = str => str.toUpperCase();
    beforeEach(() => {
      sitemap.add(url);
    });

    it('adds option', () => {
      sitemap.addOption('foo');
      sitemap.urlOptions.should.include('foo');

      sitemap.setOptionValue(url, 'foo', 'bar');
      const urlNode = sitemap.getUrlNode(url);
      urlNode.should.have.property('foo');
      urlNode.foo.should.equal('bar');
    });

    it('throws error for invalid option', () => {
      const bad = () => {
        sitemap.setOptionValue(url, 'foo', 'bar');
      };
      bad.should.throw(Error);
    });

    it('throws error when adding existing option', () => {
      sitemap.addOption('foo');
      const bad = () => {
        sitemap.addOption('foo', toUpper);
      };
      bad.should.throw(Error);
    });

    it('overwrites option if overwrite=true', () => {
      sitemap.addOption('foo');
      sitemap.addOption('foo', toUpper, true);
      sitemap.setOptionValue(url, 'foo', 'bar');

      sitemap.urlOptions.should.include('foo');
      sitemap.optionHandlers.should.have.property('foo');
      sitemap.optionHandlers.foo.should.be.a('function');
      sitemap.optionHandlers.foo('bar').should.equal('BAR');

      sitemap.setOptionValue(url, 'foo', 'bar');

      const urlNode = sitemap.getUrlNode(url);
      urlNode.should.have.property('foo');
      urlNode.foo.should.equal('BAR');
    });
  });

  describe('removeOption', () => {
    it('removes option', () => {
      sitemap.addOption('foo', num => num + 1)
      .add(url, {foo: 2});

      sitemap.removeOption('foo');

      sitemap.urlOptions.should.not.include('foo');
      sitemap.optionHandlers.should.not.have.property('foo');

      const urlNode = sitemap.getUrlNode(url);
      urlNode.should.not.have.property('foo');
    });
  });
});
