
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
    it('has empty urls array', () => {
      sitemap.should.have.property('urls');
      sitemap.urls.should.be.a('array');
      sitemap.urls.should.be.empty;
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

  describe('static option handlers', () => {

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

  describe('method examples', () => {
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

    it('removeUrl', () => {
      sitemap.addUrl(url);

      sitemap.hasUrl(url).should.be.true;
      sitemap.urls.should.include(url);

      sitemap.removeUrl(url);
      sitemap.hasUrl(url).should.be.false;
      sitemap.urls.should.not.include(url);
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
  });
});

// var sitemap = new XmlSitemap()
//   .addUrl('http://domain.com/');
// sitemap.setOption('http://domain.com/', 'priority', 0.3);
// console.log(sitemap.xml);

// const xml = fs.readFileSync('testing.xml');
// let sitemap = new XmlSitemap(xml);
// // const sitemap = new XmlSitemap();
//
// // sitemap.addUrl('http://laniakean.com/', {lastmod: '2015-6-30'})
// // .addUrl('http://laniakean.com/ahh');
// //
// // module.exports = sitemap;
//
// console.log(sitemap.xml);
//
// sitemap.updateLastmod('http://laniakean.com/');
// sitemap.updateLastmod(sitemap.urls[1], '2015-9-20');
//
// sitemap = new XmlSitemap()
//   .addUrl('http://domain.com/', {lastmod: 'now'})
//   .addUrl('http://domain.com/a-page')
//   .addUrl('http://domain.com/another-page', {lastmod: '1999-10-31', changefreq: 'never'})
//   .addUrl('http://domain.com/magic', {lastmod: new Date(), priority: 0.9});
//
// fs.writeFileSync('sitemap.xml', sitemap.xml);
//
// console.log(sitemap.xml);
// console.log(sitemap.urls);
//
// const xmlString = fs.readFileSync('sitemap.xml');
//
// // create the sitemap
// sitemap = new XmlSitemap(xmlString);
//
// // let's remove 'a page' and update the lastmod of 'another page' to today
// sitemap.removeUrl('http://domain.com/a-page')
//   .updateLastmod('http://domain.com/another-page');
//
// fs.writeFileSync('updated-sitemap.xml', sitemap.xml);
