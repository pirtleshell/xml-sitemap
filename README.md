# xml-sitemap

> Utilities for quickly making custom XML sitemaps

## Install

Add it to a project with `npm`:
```sh
$ npm install xml-sitemap --save
```

Then just `require` it in your project:
```js
var XmlSitemap = require('xml-sitemap');
var sitemap = new XmlSitemap();
```

## Basic Usage

For more info on anything check out the [docs](https://github.com/PirtleShell/xml-sitemap/blob/master/docs/api.md).

### Build a sitemap from scratch

All methods that don't return values return the sitemap, so you can chain them all together.

```js
var sitemap = new XmlSitemap();

// add some urls
sitemap.add('http://domain.com/')

  .add('http://domain.com/another-page', {
    lastmod: 'now',
    priority: 0.8
  })

  .add({
    url: 'http://domain.com/sitemapz-rule',
    changefreq: 'never',
    lastmod: '1999-12-31'
  });
```

We could have made the same sitemap with a single array:

```js
var sitemap = new XmlSitemap()
  .add([
    'http://domain.com/',
    {
      url: 'http://domain.com/another-page',
      lastmod: 'now',
      priority: 0.8
    },
    {
      loc: 'http://domain.com/sitemapz-rule',
      changefreq: 'never',
      lastmod: '1999-12-31'
    }
  ]);
```

Update and read some info from it:

```js
// update some values
sitemap.update('http://domain.com/', new Date())
  .setOptionValue('http://domain.com/sitemapz-rule', 'priority', 1);

// an array of the urls is in sitemap.urls
sitemap.urls
//=> [ 'http://domain.com/', 'http://domain.com/magic', 'http://domain.com/another-page', 'http://domain.com/sitemapz-rule' ]

// and the xml is in sitemap.xml
require('fs').writeFileSync('sitemap.xml', sitemap.xml)

// we can also read info from the sitemap
sitemap.hasUrl('http://domain.com/another-page');
//=> true

sitemap.getOptionValue('http://domain.com/', 'lastmod');
//=> {today's date!}

sitemap.getOptionValue('http://domain.com/magic', 'lastmod');
//=> {today's date!}

sitemap.getOptionValue('http://domain.com/another-page', 'lastmod');
//=> null
```

### Read in an existing sitemap

We can read in an existing sitemap (like the one we made above!) and modify it on the fly.

```js
// get the XML as a string
var xmlString = require('fs').readFileSync('sitemap.xml');
// and pass it to the constructor
var sitemap = new XmlSitemap(xmlString);

sitemap.hasUrl('http://domain.com/magic');
//=> true

// modify it
sitemap.remove('http://domain.com/another-page')
  .setOptionValues('http://domain.com/magic', {
    lastmod: '2012-12-21',
    priority: 0.9
  });

sitemap.hasUrl('http://domain.com/another-page');
//=> false
sitemap.getOptionValue('http://domain.com/magic', 'priority');
//=> '0.9'

// quickly update lastmod vlaues
sitemap.getOptionValue('http://domain.com/magic', 'lastmod');
//=> '2012-12-21'

sitemap.update('http://domain.com/magic');
sitemap.getOptionValue('http://domain.com/magic', 'lastmod');
//=> {today's date}
```

### Lastmod values from Files

For easily updating a url's lastmod, we can link a file to it. Here are a few ways to link the file:

```js
var filename = 'path/to/file.html'; // last modified on '2012-12-21'

// link by adding a filename to the 'file' key to its options when adding it
sitemap.add({
  url: 'http://domain.com/',
  file: filename
});

// or after it is already in the sitemap
sitemap.linkFile('http://domain.com/', filename);

// the lastmod has been updated accordingly in both cases
sitemap.getOptionValue('http://domain.com/', 'lastmod');
//=> '2012-12-21'

// linked files are listed in sitemap.files
sitemap.files
//=> {'http://domain.com/': 'path/to/file.html'}
```

Linked files automatically update the lastmod of their respective urls when `updateAll()` is called. So you can link many files to urls already in the sitemap by assigning the files object and then updating all.

```js
sitemap.files = {
  url1: filename1,
  url2: filename2,
  ...
}
sitemap.updateAll();
```

To update a lastmod from a file without linking it, use `sitemap.updateFromFile(url, filepath)`. Unlink a file with `sitemap.unlinkFile(url)`.

## API
Read the full documentation on the API [here](https://github.com/PirtleShell/xml-sitemap/blob/master/docs/api.md).

## Licence
MIT &copy; 2016 [Robert Pirtle](https://pirtle.xyz)
