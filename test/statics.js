'use strict';
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const XmlSitemap = require('../lib');

describe('handling default options', () => {

  describe('lastmod', () => {
    const today = XmlSitemap.w3Date(new Date());

    it('with bad value', () => {
      const bad = () => {
        XmlSitemap.handleLastmod({});
      };
      bad.should.throw(TypeError);
    });

    it('with no/null value', () => {
      XmlSitemap.handleLastmod().should.equal(today);
      XmlSitemap.handleLastmod(null).should.equal(today);
    });

    it('with "now"', () => {
      XmlSitemap.handleLastmod('now').should.equal(today);
    });

    it('with string', () => {
      XmlSitemap.handleLastmod('2012-12-21').should.equal('2012-12-21');
    });

    it('with Date', () => {
      const date = new Date();
      date.setFullYear(2012);
      date.setMonth(11);
      date.setDate(21);

      XmlSitemap.handleLastmod(date).should.equal('2012-12-21');
      XmlSitemap.handleLastmod(new Date()).should.equal(today);
    });
  });

  describe('changefreq', () => {
    it('allowed values return themselves', () => {
      const allowed = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      for (let i = 0; i < allowed.length; i++) {
        XmlSitemap.handleChangefreq(allowed[i]).should.equal(allowed[i]);
      }
    });
    it('bad values throw error', () => {
      const bad = () => {
        XmlSitemap.handleChangefreq('notAllowed!');
      };
      bad.should.throw(Error);
    });
  });

  describe('priority', () => {
    it('allowed return string', () => {
      XmlSitemap.handlePriority(0.5).should.equal('0.5');
      XmlSitemap.handlePriority(0).should.equal('0');
      XmlSitemap.handlePriority(1).should.equal('1');
    });
    it('outside range throws error', () => {
      const bad = value => {
        return () => {
          XmlSitemap.handlePriority(value);
        };
      };
      bad(1.1).should.throw(Error);
      bad(-0.1).should.throw(Error);
      bad('a string').should.throw(Error);
    });
  });
});

describe('parseUrlObject', () => {
  const url = 'http://domain.com/';
  it('throws error when no url found', () => {
    const obj = {
      lastmod: '2012-12-21',
      priority: 0.7
    };
    const bad = () => {
      XmlSitemap.parseUrlObject(obj);
    };
    bad.should.throw(TypeError);
  });

  it('extracts with loc', () => {
    const obj = {
      loc: url,
      lastmod: '2012-12-21',
      priority: 0.7
    };
    const result = XmlSitemap.parseUrlObject(obj);
    delete obj.loc;
    result.should.have.property('url');
    result.should.have.property('options');
    result.url.should.equal(url);
    result.options.should.deep.equal(obj);
  });

  it('extracts with url', () => {
    const obj = {
      url,
      lastmod: '2012-12-21',
      priority: 0.7
    };
    const result = XmlSitemap.parseUrlObject(obj);
    delete obj.url;
    result.should.have.property('url');
    result.should.have.property('options');
    result.url.should.equal(url);
    result.options.should.deep.equal(obj);
  });
});
