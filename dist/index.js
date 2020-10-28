"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toValue = exports.formatData = exports.parseData = void 0;
var lodash_1 = require("lodash");
var rule_judgment_1 = require("rule-judgment");
function parseData(options, customize) {
    return function (data) {
        var e_1, _a;
        var separator = options.separator, collection = options.collection, omits = options.omits;
        var list = data.split(separator);
        var values = list.map(function (v, i) {
            var _a = collection[i] || {}, type = _a.type, format = _a.format;
            var value = formatData(format, customize)(toValue(type)(v));
            return value;
        });
        var obj = lodash_1.zipObject(lodash_1.map(collection, 'key'), values);
        var results = collection.filter(rule_judgment_1.default({ result: { $exists: true } }));
        try {
            for (var results_1 = __values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                var item = results_1_1.value;
                lodash_1.set(obj, item.key, formatData(item.format, customize)(getResultValue(item.result, customize)(obj)));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return lodash_1.omit(obj, omits || []);
    };
}
exports.parseData = parseData;
function formatData(formats, customize) {
    return function (value) {
        var e_2, _a;
        formats = lodash_1.isArray(formats) ? formats : lodash_1.compact([formats]);
        if (formats.length === 0)
            return value;
        try {
            for (var formats_1 = __values(formats), formats_1_1 = formats_1.next(); !formats_1_1.done; formats_1_1 = formats_1.next()) {
                var format = formats_1_1.value;
                value = formatUtil(format, customize)(value);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (formats_1_1 && !formats_1_1.done && (_a = formats_1.return)) _a.call(formats_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return value;
    };
}
exports.formatData = formatData;
function formatUtil(format, customize) {
    return function (value) {
        if (!format)
            return value;
        var val = toValue(format.type)(value);
        if (format.regexp && lodash_1.isString(val)) {
            val = formatUtilRegexp(format.regexp, format.substr || '')(val);
        }
        else if (format.maps) {
            val = formatUtilMap(format.maps)(val);
        }
        else if (format.func) {
            val = formatUtilFunc(format.func, format.options, customize)(val);
        }
        return val;
    };
}
function formatUtilRegexp(regexp, substr) {
    return function (value) { return value.replace(getRegexp(regexp), substr); };
}
function formatUtilMap(options) {
    return function (value) {
        if (lodash_1.isString(options) && lodash_1.isPlainObject(value)) {
            return lodash_1.get(value, options);
        }
        if (lodash_1.isNumber(options) && lodash_1.isArray(value)) {
            return value[options] || value;
        }
        if (lodash_1.isPlainObject(options) && ['string', 'number'].includes(typeof value)) {
            return options[value] || value;
        }
        return value;
    };
}
function formatUtilFunc(name, options, customize) {
    return function (value) {
        try {
            value = value[name || 'toLocaleString'].apply(value, __spread(options || []));
        }
        catch (error) {
            if (customize && Object.keys(customize).includes(name)) {
                value = customize[name].apply(customize, __spread([value], options || []));
            }
        }
        return value;
    };
}
function getResultValue(options, customize) {
    return function (data) {
        var defaultValue = options.defaultValue, formula = options.formula;
        if (formula) {
            var exec = formula.exec;
            var opts = (formula.opts || []).map(getValue(data, customize));
            if (typeof exec === 'function') {
                return exec.apply(void 0, __spread(opts));
            }
            if (customize && Object.keys(customize).includes(exec)) {
                return customize[exec].apply(customize, __spread(opts));
            }
        }
        return getValue(data, customize)(defaultValue);
    };
}
function getValue(data, customize) {
    return function (value) {
        if (lodash_1.isString(value) && /^\$(\_){2}/.test(value)) {
            var _a = __read(value.match(/^\$(\_){2}([a-zA-Z0-9\_\-\.]+)/) || [], 3), key = _a[2];
            return lodash_1.get(data, key);
        }
        if (lodash_1.isArray(value)) {
            var _b = __read(value), exec = _b[0], opts = _b.slice(1);
            if (customize && Object.keys(customize).includes(exec)) {
                return customize[exec].apply(customize, __spread(opts));
            }
        }
        return value;
    };
}
function getRegexp(regexp) {
    if (lodash_1.isRegExp(regexp))
        return regexp;
    try {
        return new RegExp(regexp);
    }
    catch (error) {
        throw Error("This is not a regular expression.");
    }
}
function toValue(type) {
    if (type === void 0) { type = 'string'; }
    return function (value) {
        var val = value;
        if (lodash_1.isString(value)) {
            if (/^([\d\.]+)\%$/.test(value)) {
                val = Number(value.replace(/\%$/i, '')) / 100;
                val = String(val);
            }
            else if (type === 'date') {
                val = new Date(rule_judgment_1.isDateString(value) ? value : 0);
            }
            else if (type === 'map') {
                try {
                    val = rule_judgment_1.emit(value);
                }
                catch (error) {
                    val = undefined;
                }
            }
        }
        else {
            if (type === 'string') {
                val = lodash_1.isPlainObject(value) ? JSON.stringify(value) : String(value);
            }
            else if (type === 'date' && lodash_1.isNumber(value)) {
                val = new Date(value);
            }
        }
        if (type === 'number') {
            if (lodash_1.isString(val) && !/^\d+$/.test(val) && rule_judgment_1.isDateString(val)) {
                val = new Date(val);
            }
            val = Number(val);
        }
        return val;
    };
}
exports.toValue = toValue;
