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
    sitemap.add(url);

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
      .add(url, {foo: 2});

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
    sitemap.add(url);

    sitemap.setOptionValue(url, 'priority', 0.3);

    const bad = () => {
      sitemap.setOptionValue(url, 'foo', 'bar');
    };
    bad.should.throw(Error);
  });

  it('setOptionValues & getOptionValue', () => {
    sitemap.add(url, {lastmod: '1900-10-31', priority: 0.7});

    sitemap.getOptionValue(url, 'lastmod').should.equal('1900-10-31');
    sitemap.getOptionValue(url, 'priority').should.equal('0.7');
    should.equal(sitemap.getOptionValue(url, 'changefreq'), null);

    sitemap.setOptionValues(url, {priority: 0.8, changefreq: 'weekly'});

    sitemap.getOptionValue(url, 'lastmod').should.equal('1900-10-31');
    sitemap.getOptionValue(url, 'priority').should.equal('0.8');
    sitemap.getOptionValue(url, 'changefreq').should.equal('weekly');
  });

  it('getOptionValue errors', () => {
    sitemap.add(url);

    let bad = () => {
      sitemap.getOptionValue('http://notreal.com/', 'lastmod');
    };
    bad.should.throw(Error);

    bad = () => {
      sitemap.getOptionValue(url, 'foo');
    };
    bad.should.throw(Error);
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
  });

  describe('File Linking', () => {
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
    });
  });
});
