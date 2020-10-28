import { parseData, formatData, toValue } from '../src'
import { isDateString } from 'rule-judgment'
import { ParseData } from '../types'

const customize = {
  add: (a, b) => a + b
}

describe('\nTests', () => {

  describe('\n    Funtion toValue\n', () => {
    test('<String> 123 to <Number> 123', () => {
      let result = toValue('number')('123')
      expect(result).toBe(123)
    })
    test('<String> 14.08% to <Number> 0.1408', () => {
      let result = toValue('number')('14.08%')
      expect(result).toBe(0.1408)
    })
    test('<String> 2020-10-27 to <Timestamp>', () => {
      let result = toValue('number')('2020-10-27')
      expect(typeof result).toBe('number')
    })
    test('<String> 2020-10-27 to <Date>', () => {
      let result = toValue('date')('2020-10-27') as Date
      expect(result.getFullYear()).toBe(2020)
      expect(result.getMonth()).toBe(9)
      expect(result.getDate()).toBe(27)
    })
    test('<Timestamp> 0 to <Date> 1970-01-01T00:00:00.000Z', () => {
      let result = toValue('date')(0) as Date
      expect(result.getFullYear()).toBe(1970)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
    })
    test('<Date> to <DateString>', () => {
      let result = toValue('string')(new Date())
      expect(isDateString(result)).toBe(true)
    })
    test('<Date> to <Timestamp>', () => {
      let result = toValue('number')(new Date())
      expect(typeof result).toBe('number')
    })
    test('<String> to <Map>', () => {
      let result = toValue('map')('{ username: \'thondery\' }')
      expect(result.username).toBe('thondery')
    })
    test('<Map> to <Json>', () => {
      let result = toValue('string')({ username: 'thondery' })
      expect(JSON.parse(result).username).toBe('thondery')
    })
  })

  describe('\n    Funtion formatData\n', () => {
    test('20201027 to 2020-10-27', () => {
      let result = formatData({
        type: 'string',
        regexp: /^(\d{4})(\d{2})(\d{2})$/,
        substr: '$1-$2-$3'
      })('20201027')
      expect(result).toBe('2020-10-27')
    })
    test('<Number> 39554 to <Decimal> 39,554', () => {
      let result = formatData({
        type: 'number',
        func: 'toLocaleString',
        options: [ 'zh', { style: 'decimal' } ]
      })(39554)
      expect(result).toBe('39,554')
    })
    test('<Number> 0.1408 to <Percent> 14.08%', () => {
      let result = formatData({
        type: 'number',
        func: 'toLocaleString',
        options: [ 'en-GB', { style: 'percent', minimumFractionDigits: 2 } ]
      })(0.1408)
      expect(result).toBe('14.08%')
    })
    test('get <Map> value of key', () => {
      let result = formatData({
        maps: { username: 'thondery' }
      })('username')
      expect(result).toBe('thondery')
    })
    test('get <Map> value of key, value is <Map>', () => {
      let result = formatData({
        type: 'map',
        maps: 'username'
      })({ username: 'thondery' })
      expect(result).toBe('thondery')
    })
  })

  describe('\n    Funtion parseData\n', () => {
    test('Parse the string into a <Map>.', () => {
      let options: ParseData.options = {
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
      let result = parseData(options, customize)('20201027;39554;{username:\'thondery\',group:{name:\'管理员\',level:9999}}')
      expect(result.username).toBe('thondery')
      expect(result.group).toBe('管理员')
      expect(result.level).toBe(9999)
      expect(result.money1).toBe(49553)
      expect(result.money2).toBe(49553)
    })
  })
})
