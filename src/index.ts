import { isString, isPlainObject, isNumber, isRegExp, isArray, compact, get, zipObject, map, omit, set } from 'lodash'
import { ParseData } from '../types'
import runJudgment, { emit, isDateString } from 'rule-judgment'

/**
 * 解析字符串
 * @param options 
 * @param customize 
 */
export function parseData (options: ParseData.options, customize?: Record<string, Function>): (data: string) => Record<string, any> {
  return (data: string) => {
    let { separator, collection, omits } = options
    let list = data.split(separator)
    let values: any[] = list.map( (v: string, i: number) => {
      let { type, format } = collection[i] || {}
      let value = formatData(format, customize)(toValue(type)(v))
      return value
    })
    let obj = zipObject(map(collection, 'key'), values)
    let results = collection.filter( runJudgment({ result: { $exists: true } }) )
    for (let item of results) {
      set( obj, item.key, formatData(item.format, customize)(getResultValue(item.result!, customize)(obj)) )
    }
    return omit(obj, omits || [])
  }
}

/**
 * 格式化数据
 * @param formats 
 * @param customize 
 */
export function formatData (formats?: ParseData.format | ParseData.format[], customize?: Record<string, Function>): (value: any) => any {
  return (value: any) => {
    formats = isArray(formats) ? formats : compact([ formats ])
    if (formats.length === 0) return value
    for (let format of formats) {
      value = formatUtil(format, customize)(value)
    }
    return value
  }
}

/**
 * 格式化数据单元
 * @param format 
 * @param customize 
 */
function formatUtil (format?: ParseData.format, customize?: Record<string, Function>): (value: any) => any {
  return (value: any) => {
    if (!format) return value
    let val = toValue(format.type)(value)
    if (format.regexp && isString(val)) {
      val = formatUtilRegexp(format.regexp, format.substr || '')(val)
    }
    else if (format.maps) {
      val = formatUtilMap(format.maps)(val)
    }
    else if (format.func) {
      val = formatUtilFunc(format.func, format.options, customize)(val)
    }
    return val
  }
}

/**
 * 通过正则替换
 * @param regexp 
 * @param substr 
 */
function formatUtilRegexp (regexp: RegExp | string, substr: string): (value: string) => string {
  return (value: string) => value.replace(getRegexp(regexp), substr)
}

/**
 * 通过Map转换
 * @param options 
 */
function formatUtilMap (options: Record<string, any> | string | number): (value: any) => any {
  return (value: any) => {
    if (isString(options) && isPlainObject(value)) {
      return get(value, options)
    }
    if (isNumber(options) && isArray(value)) {
      return value[options] || value
    }
    if (isPlainObject(options) && ['string', 'number'].includes(typeof value)) {
      return options[value] || value
    }
    return value
  }
}

/**
 * 通过函数转换
 * @param name 
 * @param options 
 * @param customize 
 */
function formatUtilFunc (name: string, options?: any[] | null, customize?: Record<string, Function>): (value: any) => any {
  return (value: any) => {
    try {
      value = value[name || 'toLocaleString'](...options || [])
    } catch (error) {
      if (customize && Object.keys(customize).includes(name)) {
        value = customize[name](value, ...options || [])
      }
    }
    return value
  }
}

function getResultValue (options: ParseData.result, customize?: Record<string, Function>): (data: Record<string, any>) => any {
  return (data: Record<string, any>) => {
    let { defaultValue, formula } = options
    if (formula) {
      let { exec } = formula
      let opts = (formula.opts || []).map( getValue(data, customize) )
      if (typeof exec === 'function') {
        return exec(...opts)
      }
      if (customize && Object.keys(customize).includes(exec)) {
        return customize[exec](...opts)
      }
    }
    return getValue(data, customize)(defaultValue)
  }
}

function getValue (data: Record<string, any>, customize?: Record<string, Function>): (value: any) => any {
  return (value: any) => {
    if (isString(value) && /^\$(\_){2}/.test(value)) {
      let [,, key ] = value.match(/^\$(\_){2}([a-zA-Z0-9\_\-\.]+)/) || []
      return get(data, key)
    }
    if (isArray(value)) {
      let [ exec, ...opts ] = value
      if (customize && Object.keys(customize).includes(exec)) {
        return customize[exec](...opts)
      }
    }
    return value
  }
}

/**
 * 获取正则表达式
 * @param regexp 
 */
function getRegexp (regexp: RegExp | string): RegExp {
  if (isRegExp(regexp)) return regexp
  try {
    return new RegExp(regexp)
  } catch (error) {
    throw Error(`This is not a regular expression.`)
  }
}

/**
 * 转换指定类型值
 * @param type 'string' | 'number' | 'date' | 'map', 默认值 'string'
 */
export function toValue (type: 'string' | 'number' | 'date' | 'map' = 'string'): (value: any) => any {
  return (value: any) => {
    let val = value
    if (isString(value)) {
      if (/^([\d\.]+)\%$/.test(value)) {
        val = Number(value.replace(/\%$/i, '')) / 100
        val = String(val)
      }
      else if (type === 'date') {
        val = new Date(isDateString(value) ? value : 0)
      }
      else if (type === 'map') {
        try {
          val = emit(value)
        } catch (error) {
          val = undefined
        }
      }
    }
    else {
      if (type === 'string') {
        val = isPlainObject(value) ? JSON.stringify(value) : String(value)
      }
      else if (type === 'date' && isNumber(value)) {
        val = new Date(value)
      }
    }
    if (type === 'number') {
      if (isString(val) && !/^\d+$/.test(val) && isDateString(val)) {
        val = new Date(val)
      }
      val = Number(val)
    }
    return val
  }
}