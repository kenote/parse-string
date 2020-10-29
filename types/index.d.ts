
export declare namespace ParseData {

  interface parse extends options {
    key               : string
    orderBy          ?: orderBy
  }

  interface options {
    separator         : string | RegExp
    collection        : collection[]
    filter           ?: number[]
    omits            ?: string[]
  }

  interface collection {
    key               : string
    type             ?: 'string' | 'number' | 'date' | 'map'
    format           ?: format | format[]
    result           ?: result
    
  }

  interface format {
    type             ?: 'string' | 'number' | 'date' | 'map'
    regexp           ?: RegExp | string
    substr           ?: string
    func             ?: string
    options          ?: any[]
    maps             ?: Record<string, any> | string | number
  }

  interface result {
    defaultValue      : any
    formula          ?: formula
  }

  interface formula {
    exec              : Function | string
    opts             ?: any[]
  }

  interface orderBy {
    iteratees         : string[]
    orders            : Array<'asc' | 'desc'>
  }
}

export function parseData (options: ParseData.options): (data: string) => Record<string, any> | string
export function parseData (options: ParseData.options, customize: Record<string, Function>): (data: string) => Record<string, any> | string

export function parseBody (options: ParseData.parse[]): (msgbody: Record<string, any>) => Record<string, any>
export function parseBody (options: ParseData.parse[], customize: Record<string, Function>): (msgbody: Record<string, any>) => Record<string, any>

export function formatData (): (value: any) => any
export function formatData (formats: ParseData.format | ParseData.format[]): (value: any) => any
export function formatData (formats: ParseData.format | ParseData.format[], customize: Record<string, Function>): (value: any) => any

export function toValue (): (value: any) => any
export function toValue (type: 'string' | 'number' | 'date' | 'map'): (value: any) => any