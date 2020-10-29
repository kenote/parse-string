# parse-string

Parse the string into a Map.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Gratipay][licensed-image]][licensed-url]

## Installation

```bash
$ npm install parse-string
#
$ yarn add parse-string
```

## Features

- parse string into Map
- format data

## API

### toValue (type: 'string' | 'number' | 'date' | 'map' = 'string'): (value: any) => any

Convert specified type value.

- `type` - target type
- `value` - value of need convert

### formatData (formats?: ParseData.format | ParseData.format[], customize?: Record<string, Function>): (value: any) => any

Format Data.

- `formats` - formatting options
- `customize` - map of custom function
- `value` - value of need format

### parseData (options: ParseData.options, customize?: Record<string, Function>): (data: string) => Record<string, any>

Parse the string to the specified result.

- `options` - parsing options
- `customize` - map of custom function
- `data` - data of need parse

### parseBody (options: ParseData.parse[], customize?: Record<string, Function>): (msgbody: Record<string, any>) => Record<string, any>

Parse the msbody to the specified result.

- `options` - parsing options
- `customize` - map of custom function
- `msbody` - msbody of need parse

## Usages

Example:

```js
import { parseData } from 'parse-string'

const customize = {
  add: (a, b) => a + b
}

const options = {
  separator: /\;/,
  collection: [
    {
      key: 'date',
      type: 'string',
      format: [
        {
          type: 'string',
          regexp: /^(\d{4})(\d{2})(\d{2})$/,
          substr: '$1-$2-$3'
        },
        {
          type: 'date'
        }
      ]
    },
    {
      key: 'amount',
      type: 'number'
    },
    {
      key: 'user',
      type: 'map'
    },
    {
      key: 'username',
      result: {
        defaultValue: '$__user'
      },
      format: {
        type: 'map',
        maps: 'username'
      }
    },
    {
      key: 'group',
      result: {
        defaultValue: '$__user'
      },
      format: {
        type: 'map',
        maps: 'group.name'
      }
    },
    {
      key: 'level',
      result: {
        defaultValue: '$__user'
      },
      format: {
        type: 'map',
        maps: 'group.level'
      }
    },
    {
      key: 'money1',
      result: {
        defaultValue: '$__amount',
        formula: {
          exec: (a, b) => a + b,
          opts: [ '$__amount', '$__level' ]
        }
      }
    },
    {
      key: 'money2',
      result: {
        defaultValue: '$__amount',
        formula: {
          exec: 'add',
          opts: [ '$__amount', '$__level' ]
        }
      }
    }
  ],
  omits: [ 'user' ]
}

const data = '20201027;39554;{username:\'thondery\',group:{name:\'管理员\',level:9999}}'

parseData(options, customize)(data)
// { 
//   date: 2020-10-27T00:00:00.000Z,
//   amount: 39554,
//   username: 'thondery',
//   group: '管理员',
//   level: 9999,
//   money1: 49553,
//   money2: 49553 
// }
```


## License

this repo is released under the [MIT License](https://github.com/kenote/parse-string/blob/main/LICENSE).

[npm-image]: https://img.shields.io/npm/v/parse-string.svg
[npm-url]: https://www.npmjs.com/package/parse-string
[downloads-image]: https://img.shields.io/npm/dm/parse-string.svg
[downloads-url]: https://www.npmjs.com/package/parse-string
[travis-image]: https://travis-ci.com/kenote/parse-string.svg?branch=main
[travis-url]: https://travis-ci.com/kenote/parse-string
[licensed-image]: https://img.shields.io/badge/license-MIT-blue.svg
[licensed-url]: https://github.com/kenote/parse-string/blob/master/LICENSE