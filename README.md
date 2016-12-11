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

For more info on anything check out the [docs](#api).

### Build a sitemap from scratch

```js
var sitemap = new XmlSitemap();

// add a url
sitemap.add('http://domain.com/');

// we can also add options, add multiple urls at once, and chain together methods
sitemap.add('http://domain.com/magic', {lastmod: 'now', priority: 0.8})
  .add([
    'http://domain.com/another-page',
    {
      url: 'http://domain.com/sitemapz-rule',
      changefreq: 'never',
      lastmod: '1999-12-31'
    }
  ])
  .update('http://domain.com/', new Date())
  .setOptionValue('http://domain.com/sitemapz-rule', 'priority', 1);


// an array of the urls is in sitemap.urls
console.log(sitemap.urls);
// [ 'http://domain.com/', 'http://domain.com/magic', 'http://domain.com/another-page', 'http://domain.com/sitemapz-rule' ]

// and the xml is in sitemap.xml
require('fs').writeFileSync('sitemap.xml', sitemap.xml)

// we can also get individual attributes
sitemap.hasUrl('http://domain.com/another-page'); // true
sitemap.getOptionValue('http://domain.com/', 'lastmod'); // {today's date!}
sitemap.getOptionValue('http://domain.com/magic', 'lastmod'); // {today's date!}
sitemap.getOptionValue('http://domain.com/another-page', 'lastmod'); // null
```

### Read in an existing sitemap

(Like the one we made above!)

```js
// get the XML as a string
var xmlString = require('fs').readFileSync('sitemap.xml');

// and pass it to the constructor
var sitemap = new XmlSitemap(xmlString);

sitemap.hasUrl('http://domain.com/magic'); // true

sitemap.remove('http://domain.com/another-page')
  .setOptionValues('http://domain.com/magic', {lastmod: '2012-12-21', priority: 0.9});

sitemap.hasUrl('http://domain.com/another-page'); // false
sitemap.getOptionValue('http://domain.com/magic', 'priority'); // '0.9'
sitemap.getOptionValue('http://domain.com/magic', 'lastmod'); // '2012-12-21'

sitemap.update('http://domain.com/magic');
sitemap.getOptionValue('http://domain.com/magic', 'lastmod'); // {today's date}
```

## API
An object representation of XML sitemaps and methods for editing them.

**Kind**: global class  

* [XmlSitemap](#XmlSitemap)
    * [new XmlSitemap([xmlAsString])](#new_XmlSitemap_new)
    * _instance_
        * [.xmlObj](#XmlSitemap+xmlObj) : <code>Object</code>
        * [.urls](#XmlSitemap+urls) : <code>Array.&lt;String&gt;</code>
        * [.files](#XmlSitemap+files) : <code>Object</code>
        * [.urlOptions](#XmlSitemap+urlOptions) : <code>Array.&lt;String&gt;</code>
        * [.optionHandlers](#XmlSitemap+optionHandlers) : <code>Object</code>
        * [.xml](#XmlSitemap+xml) ⇒ <code>String</code>
        * [.handleOption(option, value)](#XmlSitemap+handleOption) ⇒ <code>String</code> &#124; <code>null</code>
        * [.addOption(optionName, [handler], [overwrite])](#XmlSitemap+addOption) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.removeOption(optionName)](#XmlSitemap+removeOption) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.getOptionValue(url, option)](#XmlSitemap+getOptionValue) ⇒ <code>String</code> &#124; <code>null</code>
        * [.setOptionValue(url, option, value)](#XmlSitemap+setOptionValue) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.setOptionValues(url, options)](#XmlSitemap+setOptionValues) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.update(url, [date])](#XmlSitemap+update) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.updateFromFile(url, filepath)](#XmlSitemap+updateFromFile) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.linkFile(url, filepath)](#XmlSitemap+linkFile) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.hasUrl(url)](#XmlSitemap+hasUrl) ⇒ <code>Bool</code>
        * [.add(url, [urlOptions])](#XmlSitemap+add) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.remove(url)](#XmlSitemap+remove) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
        * [.getUrlNode(url)](#XmlSitemap+getUrlNode) ⇒ <code>Object</code>
        * [.buildUrlNode(url, [options])](#XmlSitemap+buildUrlNode) ⇒ <code>Object</code>
    * _static_
        * [.w3Date(date)](#XmlSitemap.w3Date) ⇒ <code>String</code>
        * [.handleLastmod([date])](#XmlSitemap.handleLastmod) ⇒ <code>String</code>
        * [.handleChangefreq(value)](#XmlSitemap.handleChangefreq) ⇒ <code>String</code>
        * [.handlePriority(value)](#XmlSitemap.handlePriority) ⇒ <code>String</code>
        * [.getLastmodFromFile(filepath)](#XmlSitemap.getLastmodFromFile) ⇒ <code>String</code>

<a name="new_XmlSitemap_new"></a>

### new XmlSitemap([xmlAsString])
Create a new sitemap or create a sitemap object from an XML string.


| Param | Type | Description |
| --- | --- | --- |
| [xmlAsString] | <code>String</code> &#124; <code>Buffer</code> | Optional, the sitemap XML as a string or Buffer. Must be a valid sitemap. |

**Example**  
```js
See Basic Usage above
```
<a name="XmlSitemap+xmlObj"></a>

### xmlSitemap.xmlObj : <code>Object</code>
XML object tree of sitemap, as generated by [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js). Automatically created and udated as the sitemap is modified.

**Kind**: instance property of <code>[XmlSitemap](#XmlSitemap)</code>  
**Example**  
```js
{
  urlset: {
    '$': { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' },
    url: [
      { loc: 'http://domain.com/',
         lastmod: '1985-12-25',
         priority: '0.9' },
      { loc: 'http://domain.com/magic',
         lastmod: '2012-12-21',
         changefreq: 'never' }
    ]
  }
}
```
<a name="XmlSitemap+urls"></a>

### xmlSitemap.urls : <code>Array.&lt;String&gt;</code>
Array of urls in the sitemap. Add urls by using [add](#XmlSitemap+add).

**Kind**: instance property of <code>[XmlSitemap](#XmlSitemap)</code>  
**Example**  
```js
var sitemap = new XmlSitemap()
  .add('http://domain.com/')
  .add('http://domain.com/magic');

console.log(sitemap.urls);
// [ 'http://domain.com/', 'http://domain.com/magic' ]
```
<a name="XmlSitemap+files"></a>

### xmlSitemap.files : <code>Object</code>
Object of files linked to a url, for determining lastmod. To link a file use [linkFile](#XmlSitemap+linkFile) or pass the filename under the key `file` in the initial options.

**Kind**: instance property of <code>[XmlSitemap](#XmlSitemap)</code>  
<a name="XmlSitemap+urlOptions"></a>

### xmlSitemap.urlOptions : <code>Array.&lt;String&gt;</code>
Allowable option tags for urls in sitemap. Add options with or without handlers by using [addOption](#XmlSitemap+addOption).

**Kind**: instance property of <code>[XmlSitemap](#XmlSitemap)</code>  
**Default**: <code>[&#x27;lastmod&#x27;, &#x27;changefreq&#x27;, &#x27;priority&#x27;]</code>  
**Example**  
```js
var sitemap = new XmlSitemap();

console.log(sitemap.urlOptions);
// [ 'lastmod', 'changefreq', 'priority' ]

sitemap.addOption('foo');
console.log(sitemap.urlOptions);
// [ 'lastmod', 'changefreq', 'priority', 'foo' ]
```
<a name="XmlSitemap+optionHandlers"></a>

### xmlSitemap.optionHandlers : <code>Object</code>
Optional handlers for custom option settings. Handler functions are listed under the option name key. Add options with [addOption](#XmlSitemap+addOption).

**Kind**: instance property of <code>[XmlSitemap](#XmlSitemap)</code>  
**Default**: <code>{
  lastmod: XmlSitemap.handleLastmod,
  changefreq: XmlSitemap.handleChangefreq,
  priority: XmlSitemap.handlePriority
}</code>  
<a name="XmlSitemap+xml"></a>

### xmlSitemap.xml ⇒ <code>String</code>
Output the sitemap as XML.

**Kind**: instance property of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> - The sitemap XML  
<a name="XmlSitemap+handleOption"></a>

### xmlSitemap.handleOption(option, value) ⇒ <code>String</code> &#124; <code>null</code>
Determine if and how to set an options given it's value. Will process option through handler if set in [optionHandlers](#XmlSitemap+optionHandlers). Add options with [addOption](#XmlSitemap+addOption).

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> &#124; <code>null</code> - How the option will appear in the XML  
**Throws**:

- <code>Error</code> Unavailable options throw an error


| Param | Type | Description |
| --- | --- | --- |
| option | <code>String</code> | The name of the option |
| value | <code>\*</code> | The object from which to derive the XML value |

<a name="XmlSitemap+addOption"></a>

### xmlSitemap.addOption(optionName, [handler], [overwrite]) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Add a custom option tag to the allowed url tags. Adds the option and handler to [urlOptions](#XmlSitemap+urlOptions) and [optionHandlers](#XmlSitemap+optionHandlers).

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The updated sitemap  
**Throws**:

- <code>Error</code> Cannot add options that already exist without setting overwrite to true. They must be removed with [removeOption](#XmlSitemap+removeOption).


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| optionName | <code>String</code> |  | The name of the option |
| [handler] | <code>function</code> |  | An optional function to process option values for XML representation. Must return string. |
| [overwrite] | <code>Bool</code> | <code>false</code> | Acknowledge that you are overwriting the option if it already exists. This will remove all instances of the option in the sitemap. |

**Example**  
```js
var sitemap = new XmlSitemap()
.add('http://domain.com.');

// before adding option
sitemap.setOptionValue('http://domain.com/', 'foo', 'bar');
// Error: Unrecognized option foo. Expected one of lastmod, changefreq, priority.

// adding option without handler
sitemap.addOption('foo');
sitemap.setOptionValue('http://domain.com/', 'foo', 'bar');

console.log(sitemap.xml);
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//  <url>
//    <loc>http://domain.com/</loc>
//    <foo>bar</foo>
//  </url>
// </urlset>

// adding option with handler
sitemap.addOption('foo', function(str) {return str.toUpperCase();});
// Error: Option 'foo' already exists.

// using overwrite
sitemap.addOption('foo', function(str) {return str.toUpperCase();}, true);
sitemap.setOptionValue('http://domain.com/', 'foo', 'bar');

console.log(sitemap.xml);
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <url>
//     <loc>http://domain.com/</loc>
//     <foo>BAR</foo>
//   </url>
// </urlset>
```
<a name="XmlSitemap+removeOption"></a>

### xmlSitemap.removeOption(optionName) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Remove an existing available option. Removes its handler if applicable and **removes all instances of it in the sitemap's urls**.

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - - The updated sitemap  

| Param | Type | Description |
| --- | --- | --- |
| optionName | <code>String</code> | The option to remove |

**Example**  
```js
var sitemap = new XmlSitemap()
  .addOption('foo')
  .add('http://domain.com/', {'foo': 'bar'});

// BEFORE
console.log(sitemap.urlOptions); // [ 'lastmod', 'changefreq', 'priority', 'foo' ]
console.log(sitemap.xml);
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <url>
//     <loc>http://domain.com/</loc>
//     <foo>bar</foo>
//   </url>
// </urlset>

sitemap.removeOption('foo');

// AFTER
console.log(sitemap.urlOptions); // [ 'lastmod', 'changefreq', 'priority' ]
console.log(sitemap.xml);
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <url>
//     <loc>http://domain.com/</loc>
//   </url>
// </urlset>
```
<a name="XmlSitemap+getOptionValue"></a>

### xmlSitemap.getOptionValue(url, option) ⇒ <code>String</code> &#124; <code>null</code>
Get an option value from the XML object tree's url. Valid options that are unset return null. Invalid options or requesting options for urls not in the sitemap throw errors.

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> &#124; <code>null</code> - The option value or null if option not assigned or url isn't in tree.  
**Throws**:

- <code>Error</code> Url must be in sitemap
- <code>Error</code> Option must be valid, add options with [addOption](#XmlSitemap+addOption)


| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url to get the option for |
| option | <code>String</code> | The desired option |

**Example**  
```js
var sitemap = new XmlSitemap()
.add('http://domain.com/', {priority: 0.7});

sitemap.getOptionValue('http://domain.com/', 'priority'); // '0.7'
sitemap.getOptionValue('http://domain.com/', 'lastmod'); // null
sitemap.getOptionValue('http://notreal.com/', 'lastmod'); // throws error
```
<a name="XmlSitemap+setOptionValue"></a>

### xmlSitemap.setOptionValue(url, option, value) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Set an option on a url node. Set multiple options using [XmlSitemap#updateUrl](XmlSitemap#updateUrl). To remove an option, set its value to null or use [XmlSitemap#removeOptionValue](XmlSitemap#removeOptionValue).

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The updated XmlSitemap  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Url in Sitemap to update |
| option | <code>string</code> | The name of the option |
| value | <code>\*</code> | The object from which to derive the XML value |

**Example**  
```js
var sitemap = new XmlSitemap()
  .add('http://domain.com/');
sitemap.setOptionValue('http://domain.com/', 'priority', 0.3);

console.log(sitemap.xml);
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <url>
//     <loc>http://domain.com/</loc>
//     <priority>0.3</priority>
//   </url>
// </urlset>
```
<a name="XmlSitemap+setOptionValues"></a>

### xmlSitemap.setOptionValues(url, options) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Update a url's options. Options must be in the sitemap's allowable [urlOptions](#XmlSitemap+urlOptions). Not to be confused with [setOptionValue](#XmlSitemap+setOptionValue) To remove an existing option, set its value to null.

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The updated sitemap object  
**Throws**:

- <code>Error</code> Options object is required


| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url to add |
| options | <code>Object</code> | Options for setting various information about the url |

**Example**  
```js
var url = 'http://domain.com/'
var sitemap = new XmlSitemap()
.add(url, {lastmod:'1900-10-31', priority: 0.7});

sitemap.getOptionValue(url, 'lastmod'); // '1900-10-31'
sitemap.getOptionValue(url, 'priority'); // '0.7'
sitemap.getOptionValue(url, 'changefreq'); // null

sitemap.setOptionValues(url, {priority: 0.8, changefreq: 'weekly'});

sitemap.getOptionValue(url, 'lastmod'); // '1900-10-31'
sitemap.getOptionValue(url, 'priority'); // '0.8'
sitemap.getOptionValue(url, 'changefreq'); // 'weekly'
```
<a name="XmlSitemap+update"></a>

### xmlSitemap.update(url, [date]) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Update when a url was last modified.  Aliased with `updateLastmod`. Updates lastmod date to today if no date is passed unless there's a linked file. If there's a linked file, it will use that date regardless. To link a file, use [linkFile](#XmlSitemap+linkFile).

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The sitemap object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>String</code> |  | Url in Sitemap to update |
| [date] | <code>String</code> &#124; <code>Date</code> | <code>today</code> | Date to update the lastmod value to. |

**Example**  
```js
var url = 'http://domain.com/'
var sitemap = new XmlSitemap()
  .add(url);

sitemap.getOptionValue(url, 'lastmod'); // null

// no date
sitemap.update(url);
sitemap.getOptionValue(url, 'lastmod'); // {today's date}

// string date
sitemap.update(url, '2012-12-21');
sitemap.getOptionValue(url, 'lastmod'); // '2012-12-21'

// 'now'
sitemap.update(url, 'now');
sitemap.getOptionValue(url, 'lastmod'); // {today's date}

// Date object
var date = new Date();
date.setFullYear(2012);
date.setMonth(11);
date.setDate(21);
sitemap.update(url, date);
sitemap.getOptionValue(url, 'lastmod'); // '2012-12-21'
```
<a name="XmlSitemap+updateFromFile"></a>

### xmlSitemap.updateFromFile(url, filepath) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Update the lastmod of a url from a file's lastmod **without** linking the file.

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The updated sitemap  
**Throws**:

- <code>Error</code> Unable to resolve filepath


| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url to link a file to |
| filepath | <code>String</code> | The path to the file |

<a name="XmlSitemap+linkFile"></a>

### xmlSitemap.linkFile(url, filepath) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Link a file for the url to get the lastmod value from. Update all lastmod values that have linked files by calling [XmlSitemap#updateAll](XmlSitemap#updateAll). To unlink files use [XmlSitemap#unlinkFile](XmlSitemap#unlinkFile). Update lastmod from file without linking the file using [updateFromFile](#XmlSitemap+updateFromFile).

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The u  
**Throws**:

- <code>Error</code> Unable to resolve filepath


| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url to link a file to |
| filepath | <code>String</code> | The path to the file |

<a name="XmlSitemap+hasUrl"></a>

### xmlSitemap.hasUrl(url) ⇒ <code>Bool</code>
Check if sitemap contains a url.

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>Bool</code> - Whether the url is in the sitemap  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url to look for |

**Example**  
```js
var sitemap = new XmlSitemap()
  .add('http://domain.com/');

sitemap.hasUrl('http://domain.com/'); // true
sitemap.hasUrl('http://otherdomain.com/'); // false
```
<a name="XmlSitemap+add"></a>

### xmlSitemap.add(url, [urlOptions]) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
There are a few ways to add a urls:

1. Pass a single url as a string
2. Pass a single url as a string with an options object
3. Pass a single object with either a `url` or `loc` attribute and options
4. Pass an array with any of the above as elements

Aliased with `addUrl` or `addUrls`

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The sitemap object  
**Throws**:

- <code>Error</code> Url object must contain a `url` or `loc` property
- <code>Error</code> Url is already in sitemap
- <code>TypeError</code> Url must be object, string, or array


| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> &#124; <code>Object</code> &#124; <code>Array</code> | The url(s) to add |
| [urlOptions] | <code>Object</code> | Options for setting various information about the url. Options must be in the objects [urlOptions](#XmlSitemap+urlOptions). |

**Example**  
```js
var sitemap = new XmlSitemap();
  .add('http://domain.com/')
  .add('http://domain.com/other', {lastmod: '2012-11-21'})
  .add({
    url: 'http://domain.com/magic',
    priority: 0.7
  })
  .add({
    loc: 'http://domain.com/another-page',
    changefreq: 'never'
  });

// which makes the same sitemap as:
var sitemap = new XmlSitemap()
  .add([
  'http://domain.com/',
  {
    url: 'http://domain.com/other',
    lastmod: '2012-11-21'
  },
  {
    url: 'http://domain.com/magic'
    priority: 0.7
  },
  {
    loc: 'http://domain.com/another-page',
    changefreq: 'never'
  }
];

console.log(sitemap.xml);
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <url>
//     <loc>http://domain.com/</loc>
//   </url>
//   <url>
//     <loc>http://domain.com/other</loc>
//     <lastmod>2012-11-21</lastmod>
//   </url>
//   <url>
//     <loc>http://domain.com/magic</loc>
//     <priority>0.7</priority>
//   </url>
//   <url>
//     <loc>http://domain.com/another-page</loc>
//     <changefreq>never</changefreq>
//   </url>
// </urlset>
```
<a name="XmlSitemap+remove"></a>

### xmlSitemap.remove(url) ⇒ <code>[XmlSitemap](#XmlSitemap)</code>
Remove url from the Sitemap. Aliased with `removeUrl`.

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>[XmlSitemap](#XmlSitemap)</code> - The sitemap object  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url to remove |

**Example**  
```js
var sitemap = new XmlSitemap()
  .add('http://domain.com/')
  .add('http://domain.com/other');

// BEFORE
console.log(sitemap.urls); // ['http://domain.com/', 'http://domain.com/other']
sitemap.hasUrl('http://domain.com/other'); // true

sitemap.remove('http://domain.com/other');

// AFTER
console.log(sitemap.urls); // ['http://domain.com/']
console.log(sitemap.xml);
// <?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <url>
//     <loc>http://domain.com/</loc>
//   </url>
// </urlset>
```
<a name="XmlSitemap+getUrlNode"></a>

### xmlSitemap.getUrlNode(url) ⇒ <code>Object</code>
Get node of the XML object tree for a url.

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>Object</code> - The XML element of the url  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url of the desired XML node |

**Example**  
```js
var sitemap = new XmlSitemap()
  .add('http://domain.com/', {lastmod: '2012-12-21', changefreq: 'never'});

sitemap.getUrlNode('http://domain.com/');
// { loc: 'http://domain.com/',
// lastmod: '2012-12-21',
// changefreq: 'never' }
```
<a name="XmlSitemap+buildUrlNode"></a>

### xmlSitemap.buildUrlNode(url, [options]) ⇒ <code>Object</code>
Create a url node XML object

**Kind**: instance method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>Object</code> - The url XML node  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The url to add |
| [options] | <code>Object</code> | Options for setting various information about the url, must be one of [urlOptions](#XmlSitemap+urlOptions). Add options with [addOption](#XmlSitemap+addOption). |

<a name="XmlSitemap.w3Date"></a>

### XmlSitemap.w3Date(date) ⇒ <code>String</code>
Format a Date object to W3 standard string.

**Kind**: static method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> - Date formatted as year-month-day  
**Throws**:

- <code>TypeError</code> Argument must be Date object


| Param | Type | Description |
| --- | --- | --- |
| date | <code>Date</code> | the Date to format |

**Example**  
```js
var date = new Date();
date.setFullYear(2012);
date.setMonth(11);
date.setDate(21);

XmlSitemap.w3Date(date); // '2012-12-21'
```
<a name="XmlSitemap.handleLastmod"></a>

### XmlSitemap.handleLastmod([date]) ⇒ <code>String</code>
Determine what to put in the lastmod field given the input. Will NOT check format of string.

**Kind**: static method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> - The value of lastmod  

| Param | Type | Description |
| --- | --- | --- |
| [date] | <code>String</code> &#124; <code>Date</code> | The lastmod value as a Date object, the string 'now', or a string (will not confirm format) |

<a name="XmlSitemap.handleChangefreq"></a>

### XmlSitemap.handleChangefreq(value) ⇒ <code>String</code>
Check if changfreq value is valid.

**Kind**: static method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> - A valid changefreq value  
**Throws**:

- <code>Error</code> The changefreq must be valid. Allowed values are "always", "hourly", "daily", "weekly", "monthly", "yearly", "never".


| Param | Type | Description |
| --- | --- | --- |
| value | <code>String</code> | The changefreq value to check |

<a name="XmlSitemap.handlePriority"></a>

### XmlSitemap.handlePriority(value) ⇒ <code>String</code>
Check for valid priority value and return it as a string. Priority must be between 0 and 1.

**Kind**: static method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> - The priority value as a string  
**Throws**:

- <code>Error</code> Priority must be number between 0 & 1, inclusive.


| Param | Type | Description |
| --- | --- | --- |
| value | <code>Double</code> | The Priority value |

<a name="XmlSitemap.getLastmodFromFile"></a>

### XmlSitemap.getLastmodFromFile(filepath) ⇒ <code>String</code>
Get W3-standard formatted date string from file's last modified time.

**Kind**: static method of <code>[XmlSitemap](#XmlSitemap)</code>  
**Returns**: <code>String</code> - W3-standard formatted date string  
**Throws**:

- <code>Error</code> Unable to resolve filepath


| Param | Type | Description |
| --- | --- | --- |
| filepath | <code>String</code> | The path to the file |


## Licence
MIT &copy; 2016 [Robert Pirtle](https://pirtle.xyz)
