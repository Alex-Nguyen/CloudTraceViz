(function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var underscore = createCommonjsModule(function (module, exports) {
	//     Underscore.js 1.9.1
	//     http://underscorejs.org
	//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` (`self`) in the browser, `global`
	  // on the server, or `this` in some virtual machines. We use `self`
	  // instead of `window` for `WebWorker` support.
	  var root = typeof self == 'object' && self.self === self && self ||
	            typeof commonjsGlobal == 'object' && commonjsGlobal.global === commonjsGlobal && commonjsGlobal ||
	            this ||
	            {};

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
	  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

	  // Create quick reference variables for speed access to core prototypes.
	  var push = ArrayProto.push,
	      slice = ArrayProto.slice,
	      toString = ObjProto.toString,
	      hasOwnProperty = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var nativeIsArray = Array.isArray,
	      nativeKeys = Object.keys,
	      nativeCreate = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for their old module API. If we're in
	  // the browser, add `_` as a global object.
	  // (`nodeType` is checked to ensure that `module`
	  // and `exports` are not HTML elements.)
	  if ( !exports.nodeType) {
	    if ( !module.nodeType && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.9.1';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      // The 2-argument case is omitted because we’re not using it.
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  var builtinIteratee;

	  // An internal function to generate callbacks that can be applied to each
	  // element in a collection, returning the desired result — either `identity`,
	  // an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
	    return _.property(value);
	  };

	  // External wrapper for our callback generator. Users may customize
	  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
	  // This abstraction hides the internal-only argCount argument.
	  _.iteratee = builtinIteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // Some functions take a variable number of arguments, or a few expected
	  // arguments at the beginning and then a variable number of values to operate
	  // on. This helper accumulates all remaining arguments past the function’s
	  // argument length (or an explicit `startIndex`), into an array that becomes
	  // the last argument. Similar to ES6’s "rest parameter".
	  var restArguments = function(func, startIndex) {
	    startIndex = startIndex == null ? func.length - 1 : +startIndex;
	    return function() {
	      var length = Math.max(arguments.length - startIndex, 0),
	          rest = Array(length),
	          index = 0;
	      for (; index < length; index++) {
	        rest[index] = arguments[index + startIndex];
	      }
	      switch (startIndex) {
	        case 0: return func.call(this, rest);
	        case 1: return func.call(this, arguments[0], rest);
	        case 2: return func.call(this, arguments[0], arguments[1], rest);
	      }
	      var args = Array(startIndex + 1);
	      for (index = 0; index < startIndex; index++) {
	        args[index] = arguments[index];
	      }
	      args[startIndex] = rest;
	      return func.apply(this, args);
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var shallowProperty = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  var has = function(obj, path) {
	    return obj != null && hasOwnProperty.call(obj, path);
	  };

	  var deepGet = function(obj, path) {
	    var length = path.length;
	    for (var i = 0; i < length; i++) {
	      if (obj == null) return void 0;
	      obj = obj[path[i]];
	    }
	    return length ? obj : void 0;
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object.
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = shallowProperty('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  var createReduce = function(dir) {
	    // Wrap code that reassigns argument variables in a separate function than
	    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
	    var reducer = function(obj, iteratee, memo, initial) {
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      if (!initial) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    };

	    return function(obj, iteratee, memo, context) {
	      var initial = arguments.length >= 3;
	      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
	    };
	  };

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
	    var key = keyFinder(obj, predicate, context);
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = restArguments(function(obj, path, args) {
	    var contextPath, func;
	    if (_.isFunction(path)) {
	      func = path;
	    } else if (_.isArray(path)) {
	      contextPath = path.slice(0, -1);
	      path = path[path.length - 1];
	    }
	    return _.map(obj, function(context) {
	      var method = func;
	      if (!method) {
	        if (contextPath && contextPath.length) {
	          context = deepGet(context, contextPath);
	        }
	        if (context == null) return void 0;
	        method = context[path];
	      }
	      return method == null ? method : method.apply(context, args);
	    });
	  });

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value != null && value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(v, index, list) {
	        computed = iteratee(v, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = v;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value != null && value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(v, index, list) {
	        computed = iteratee(v, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = v;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection.
	  _.shuffle = function(obj) {
	    return _.sample(obj, Infinity);
	  };

	  // Sample **n** random values from a collection using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
	    var length = getLength(sample);
	    n = Math.max(Math.min(n, length), 0);
	    var last = length - 1;
	    for (var index = 0; index < n; index++) {
	      var rand = _.random(index, last);
	      var temp = sample[index];
	      sample[index] = sample[rand];
	      sample[rand] = temp;
	    }
	    return sample.slice(0, n);
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    var index = 0;
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, key, list) {
	      return {
	        value: value,
	        index: index++,
	        criteria: iteratee(value, key, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior, partition) {
	    return function(obj, iteratee, context) {
	      var result = partition ? [[], []] : {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (has(result, key)) result[key]++; else result[key] = 1;
	  });

	  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (_.isString(obj)) {
	      // Keep surrogate pair characters together
	      return obj.match(reStrSymbol);
	    }
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = group(function(result, value, pass) {
	    result[pass ? 0 : 1].push(value);
	  }, true);

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null || array.length < 1) return n == null ? void 0 : [];
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null || array.length < 1) return n == null ? void 0 : [];
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, Boolean);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, output) {
	    output = output || [];
	    var idx = output.length;
	    for (var i = 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        // Flatten current level of array or arguments object.
	        if (shallow) {
	          var j = 0, len = value.length;
	          while (j < len) output[idx++] = value[j++];
	        } else {
	          flatten(value, shallow, strict, output);
	          idx = output.length;
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = restArguments(function(array, otherArrays) {
	    return _.difference(array, otherArrays);
	  });

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // The faster algorithm will not work with an iteratee if the iteratee
	  // is not a one-to-one function, so providing an iteratee will disable
	  // the faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted && !iteratee) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = restArguments(function(arrays) {
	    return _.uniq(flatten(arrays, true, true));
	  });

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      var j;
	      for (j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = restArguments(function(array, rest) {
	    rest = flatten(rest, true, true);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  });

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices.
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = restArguments(_.unzip);

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values. Passing by pairs is the reverse of _.pairs.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions.
	  var createPredicateIndexFinder = function(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  };

	  // Returns the first index on an array-like that passes a predicate test.
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions.
	  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	          i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  };

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    if (!step) {
	      step = stop < start ? -1 : 1;
	    }

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Chunk a single array into multiple arrays, each containing `count` or fewer
	  // items.
	  _.chunk = function(array, count) {
	    if (count == null || count < 1) return [];
	    var result = [];
	    var i = 0, length = array.length;
	    while (i < length) {
	      result.push(slice.call(array, i, i += count));
	    }
	    return result;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments.
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = restArguments(function(func, context, args) {
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var bound = restArguments(function(callArgs) {
	      return executeBound(func, bound, context, this, args.concat(callArgs));
	    });
	    return bound;
	  });

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder by default, allowing any combination of arguments to be
	  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
	  _.partial = restArguments(function(func, boundArgs) {
	    var placeholder = _.partial.placeholder;
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  });

	  _.partial.placeholder = _;

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = restArguments(function(obj, keys) {
	    keys = flatten(keys, false, false);
	    var index = keys.length;
	    if (index < 1) throw new Error('bindAll must be passed function names');
	    while (index--) {
	      var key = keys[index];
	      obj[key] = _.bind(obj[key], obj);
	    }
	  });

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = restArguments(function(func, wait, args) {
	    return setTimeout(function() {
	      return func.apply(null, args);
	    }, wait);
	  });

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var timeout, context, args, result;
	    var previous = 0;
	    if (!options) options = {};

	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };

	    var throttled = function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };

	    throttled.cancel = function() {
	      clearTimeout(timeout);
	      previous = 0;
	      timeout = context = args = null;
	    };

	    return throttled;
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, result;

	    var later = function(context, args) {
	      timeout = null;
	      if (args) result = func.apply(context, args);
	    };

	    var debounced = restArguments(function(args) {
	      if (timeout) clearTimeout(timeout);
	      if (immediate) {
	        var callNow = !timeout;
	        timeout = setTimeout(later, wait);
	        if (callNow) result = func.apply(this, args);
	      } else {
	        timeout = _.delay(later, wait, this, args);
	      }

	      return result;
	    });

	    debounced.cancel = function() {
	      clearTimeout(timeout);
	      timeout = null;
	    };

	    return debounced;
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  _.restArguments = restArguments;

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  var collectNonEnumProps = function(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  };

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`.
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object.
	  // In contrast to _.map it returns an object.
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = _.keys(obj),
	        length = keys.length,
	        results = {};
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys[index];
	      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  // The opposite of _.object.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`.
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, defaults) {
	    return function(obj) {
	      var length = arguments.length;
	      if (defaults) obj = Object(obj);
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!defaults || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s).
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test.
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Internal pick helper function to determine if `obj` has key `key`.
	  var keyInObj = function(value, key, obj) {
	    return key in obj;
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = restArguments(function(obj, keys) {
	    var result = {}, iteratee = keys[0];
	    if (obj == null) return result;
	    if (_.isFunction(iteratee)) {
	      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
	      keys = _.allKeys(obj);
	    } else {
	      iteratee = keyInObj;
	      keys = flatten(keys, false, false);
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  });

	  // Return a copy of the object without the blacklisted properties.
	  _.omit = restArguments(function(obj, keys) {
	    var iteratee = keys[0], context;
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	      if (keys.length > 1) context = keys[1];
	    } else {
	      keys = _.map(flatten(keys, false, false), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  });

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq, deepEq;
	  eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // `null` or `undefined` only equal to itself (strict comparison).
	    if (a == null || b == null) return false;
	    // `NaN`s are equivalent, but non-reflexive.
	    if (a !== a) return b !== b;
	    // Exhaust primitive checks
	    var type = typeof a;
	    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
	    return deepEq(a, b, aStack, bStack);
	  };

	  // Internal recursive comparison function for `isEqual`.
	  deepEq = function(a, b, aStack, bStack) {
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN.
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	      case '[object Symbol]':
	        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
	  var nodelist = root.document && root.document.childNodes;
	  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`?
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && isNaN(obj);
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, path) {
	    if (!_.isArray(path)) {
	      return has(obj, path);
	    }
	    var length = path.length;
	    for (var i = 0; i < length; i++) {
	      var key = path[i];
	      if (obj == null || !hasOwnProperty.call(obj, key)) {
	        return false;
	      }
	      obj = obj[key];
	    }
	    return !!length;
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  // Creates a function that, when passed an object, will traverse that object’s
	  // properties down the given `path`, specified as an array of keys or indexes.
	  _.property = function(path) {
	    if (!_.isArray(path)) {
	      return shallowProperty(path);
	    }
	    return function(obj) {
	      return deepGet(obj, path);
	    };
	  };

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    if (obj == null) {
	      return function(){};
	    }
	    return function(path) {
	      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	  // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped.
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // Traverses the children of `obj` along `path`. If a child is a function, it
	  // is invoked with its parent as context. Returns the value of the final
	  // child, or `fallback` if any child is undefined.
	  _.result = function(obj, path, fallback) {
	    if (!_.isArray(path)) path = [path];
	    var length = path.length;
	    if (!length) {
	      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
	    }
	    for (var i = 0; i < length; i++) {
	      var prop = obj == null ? void 0 : obj[path[i]];
	      if (prop === void 0) {
	        prop = fallback;
	        i = length; // Ensure we don't continue iterating.
	      }
	      obj = _.isFunction(prop) ? prop.call(obj) : prop;
	    }
	    return obj;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate: /<%([\s\S]+?)%>/g,
	    interpolate: /<%=([\s\S]+?)%>/g,
	    escape: /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'": "'",
	    '\\': '\\',
	    '\r': 'r',
	    '\n': 'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offset.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    var render;
	    try {
	      render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var chainResult = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return chainResult(this, func.apply(_, args));
	      };
	    });
	    return _;
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return chainResult(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return chainResult(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return String(this._wrapped);
	  };
	}());
	});
	var underscore_1 = underscore._;

	class Normalizer {
	    constructor(points) {
	        this.points = points.map(e=>e.slice());
	        //pass the data over
	        this.points.forEach((p, i)=>{
	            p.data = points[i].data;
	        });
	        let nds = this.nds = underscore.unzip(this.points);
	        let maxD = this.maxD = [];
	        let minD = this.minD = [];
	        let rangeD = this.rangeD = [];
	        let normalizedD = this.normalizedD = [];
	        nds.forEach((d, i)=>{
	            maxD[i] = underscore.max(d);
	            minD[i] = underscore.min(d);
	            rangeD[i] = (maxD[i] != minD[i]) ? maxD[i] - minD[i] : 1;
	            normalizedD[i] = d.map(e=>(e-minD[i])/rangeD[i]);
	        });
	        let length = this.points.length;
	        this.normalizedPoints = [];
	        for (let i = 0; i < length; i++) {
	            this.normalizedPoints[i] = [];
	            for (let j = 0; j < this.nds.length; j++) {
	                this.normalizedPoints[i][j] = normalizedD[j][i];
	            }
	        }
	        //Add one step to pass the data over if there is.
	        for (let i = 0; i < length; i++) {
	            this.normalizedPoints[i].data = this.points[i].data;
	        }
	    }

	    /**
	     * Input a set of points in this scale range [0, 1] and will be scaled back to
	     * - Original scale ([minX, maxX], [minY, maxY], [minZ, maxZ])
	     * @param points
	     */
	    scaleBackPoints(points) {
	        return points.map(point => {
	            return this.scaleBackPoint(point);
	        });
	    }

	    /**
	     * Input a single point in this scale range [0, 1] and will be scaled back to
	     * - Original scale ([minX, maxX], [minY, maxY], [minZ, maxZ])
	     * @param points
	     */
	    scaleBackPoint(point) {
	        let newPoint = point.map((vs, i)=>{
	            let v = this.rangeD[i]*vs + this.minD[i];
	            return v;
	        });
	        return newPoint;
	    }
	}

	class LeaderBinner {
	    constructor(points, radius) {
	        //TODO: Should check if there are more than 3 unique values here or even after the binning.
	        //TODO: May need to clone the points to avoid modifying it, but we don't do to reserve other data or to make the process faster
	        // //Clone these to avoid modifying them
	        // this.points = points.map(p=>p.slice(0));
	        this.points = points;
	        this.radius = radius;
	    }

	    get leaders() {
	        let self = this;
	        let theLeaders = [];
	        //find all the leaders
	        this.points.forEach(point => {
	            let leader = closestLeader(theLeaders, point);
	            if (!leader) {
	                let newLeader = [];
	                newLeader.site = point.slice();
	                theLeaders.push(newLeader);
	            }
	        });
	        //now do this again to set the closest leader.
	        this.points.forEach(point => {
	            let leader = closestLeader(theLeaders, point);
	            leader.push(point);
	        });
	        return theLeaders;

	        function closestLeader(leaders, point) {
	            let length = leaders.length;
	            let minDistance = Number.MAX_SAFE_INTEGER;
	            let theLeader = null;
	            for (let i = 0; i < length; ++i) {
	                let l = leaders[i];
	                let d = distance(l.site, point);
	                if (d < self.radius) {
	                    if (d < minDistance) {
	                        minDistance = d;
	                        theLeader = l;
	                    }
	                }
	            }
	            return theLeader;
	        }
	    }
	}

	function distance(a, b) {
	    let sumsquared = 0;
	    for (let i = 0; i < a.length; i++) {
	        let d = a[i] - b[i];
	        if(!Number.isNaN(d)){
	            sumsquared += d*d;
	        }
	    }
	    //For computer storage issue, some coordinates of the same distance may return different distances if we use long floating point
	    //So take only 10 digits after the floating points=> this is precise enough and still have the same values for two different lines of the same distance
	    return Math.round(Math.sqrt(sumsquared) * Math.pow(10, 10)) / Math.pow(10, 10);
	}

	// https://gist.github.com/bmershon/25a74f7b1c7cbd07e7456af1d2c07da1

	/**
	 * This function create the pairs between node and its links.
	 *
	 * @param links
	 * @returns [["nodeX,nodeY": Array(numberOfLinksRelatedToTheNodes)]]
	 */
	function pairNodeLinks(links) {
	    let nestedByNodes = {};
	    links.forEach(l => {
	        let sourceKey = l.source.join(',');
	        if (!nestedByNodes[sourceKey]) {
	            nestedByNodes[sourceKey] = [];
	        }
	        nestedByNodes[sourceKey].push(l);
	        let targetKey = l.target.join(',');
	        if (!nestedByNodes[targetKey]) {
	            nestedByNodes[targetKey] = [];
	        }
	        nestedByNodes[targetKey].push(l);
	    });
	    //Pair the results
	    let pairedResults = underscore.pairs(nestedByNodes);
	    return pairedResults;
	}

	/**
	 * This function returns corners (three vertices) of vertices of degree two in the for mat of
	 * point1, point2, point3 => point1 is the the vertex with degree two (two edges connected to it are [point1, point2] and [point1, point3] (order of the points in each edge is not important)).
	 * @param tree
	 * @returns {*}
	 */
	function getAllV2CornersFromTree(tree) {
	    let pairedResults = pairNodeLinks(tree.links);
	    //Get all pairs with length = 2 (V2)
	    let allV2 = pairedResults.filter(p => p[1].length == 2);

	    let allCorners = allV2.map(v2 => {
	        let corner = [];
	        //First point is the common vertice
	        corner.push(v2[0].split(',').map(d => +d));//map(d=>+d) is to convert the strings into digits
	        //Push the source or target if they are not the common vertices of the two edges
	        v2[1].forEach(link => {
	            if (link.source.join(',') != v2[0]) {
	                corner.push(link.source);
	            } else {
	                corner.push(link.target);
	            }
	        });
	        return corner;
	    });
	    return allCorners;
	}
	/**
	 * This function returns all vertices with degree greater than or equal 2
	 * @param tree
	 */
	function getAllV2OrGreaterFromTree(tree) {
	    let pairedResults = pairNodeLinks(tree.links);
	    //Get all pairs with length >= 2 (V2)
	    let allGTEV2 = pairedResults.filter(p => p[1].length >= 2);
	    return allGTEV2.map(v => v[0].split(',').map(Number));
	}
	/**
	 * This function returns all single degree vertices from a tree
	 * @param tree
	 */
	function getAllV1sFromTree(tree) {
	    let pairedResults = pairNodeLinks(tree.links);
	    //Get all pairs with length = 1 (V1)
	    let allV1 = pairedResults.filter(p => p[1].length == 1);
	    return allV1.map(v1 => v1[0].split(',').map(Number));
	}

	/**
	 * Create a graph from mesh
	 * @param triangles is inform of set of triangles as the result from delaunay triangulations
	 */
	function createGraph(tetrahedra, weights) {

	    function makeLink(sourceId, targetId, weight) {
	        return {"source": sourceId, "target": targetId, "weight": weight};
	    }

	    let graph = {};
	    graph.nodes = [];
	    graph.links = [];
	    //Creating nodes
	    tetrahedra.forEach(t => {
	        t.forEach(id => {
	            if (!idExists(graph.nodes, id)) {
	                graph.nodes.push(makeNode(id));
	            }
	        });
	    });

	    //Creating links
	    tetrahedra.forEach(t => {
	        for (let i = 0; i < t.length - 1; i++) {
	            let p1 = t[i];
	            for (let j = i + 1; j < t.length; j++) {
	                let p2 = t[j];
	                let id1 = p1;
	                let id2 = p2;
	                let dist = distance$1(p1, p2, weights);
	                let link = makeLink(id1, id2, dist);
	                if (!linkExists(graph.links, link)) {
	                    graph.links.push(link);
	                }
	            }
	        }
	    });

	    //TODO: may sort the id alphabetically => when creating => so we can just check 1 condition only.
	    function linkExists(links, link) {
	        let length = links.length;
	        for (let i = length - 1; i >= 0; --i) {
	            if (equalLinks(link, links[i])) {
	                return true;
	            }
	        }
	        return false;
	    }
	    return graph;
	}

	function distance$1(a, b, weights) {
	    let totalSumSquared = 0;
	    if (!weights) {
	        for (let i = 0; i < a.length; i++) {
	            let diff = (a[i] - b[i]) * (a[i] - b[i]);
	            if (!Number.isNaN(diff)) {
	                totalSumSquared += diff;
	            }
	        }
	    } else {
	        for (let i = 0; i < a.length; i++) {
	            let diff = (a[i] - b[i]) * (a[i] - b[i]);
	            if (!Number.isNaN(diff)) {
	                totalSumSquared += diff * weights[i];
	            }
	        }
	    }
	//For computer storage issue, some coordinates of the same distance may return different distances if we use long floating point
	//So take only 10 digits after the floating points=> this is precise enough and still have the same values for two different lines of the same distance
	    return Math.round(Math.sqrt(totalSumSquared) * Math.pow(10, 10)) / Math.pow(10, 10);
	}

	function equalPoints(id1, id2) {
	    for (let i = 0; i < id1.length; i++) {
	        if (id1[i] !== id2[i]) {
	            return false;
	        }
	    }
	    return true;
	}

	function pointExists(points, point) {
	    for (let i = 0; i < points.length; i++) {
	        let point1 = points[i];
	        if (equalPoints(point1, point)) {
	            return true;
	        }
	    }
	    return false;
	}

	function equalLinks(l1, l2) {
	    return (equalPoints(l1.source, l2.source) && equalPoints(l1.target, l2.target)) ||
	        (equalPoints(l1.source, l2.target) && equalPoints(l1.target, l2.source));
	}

	function idExists(nodes, id) {
	    let length = nodes.length;
	    for (let i = length - 1; i >= 0; --i) {
	        let node = nodes[i];
	        if (equalPoints(node.id, id)) {
	            return true;
	        }
	    }
	    return false;
	}

	function makeNode(id) {
	    return {"id": id};
	}

	/**
	 * create the mst
	 * @param graph: in form of nodes and links
	 * @returns {{nodes: (selection_nodes|nodes), links: Array}}
	 */
	function mst(graph) {
	    let vertices = graph.nodes,
	        edges = graph.links.slice(0),
	        selectedEdges = [],
	        forest = new DisjointSet();

	    // Each vertex begins "disconnected" and isolated from all the others.
	    vertices.forEach((vertex) => {
	        forest.makeSet(vertex.id);
	    });

	    // Sort edges in descending order of weight. We will pop edges beginning
	    // from the end of the array.
	    edges.sort((a, b) => {
	        return -(a.weight - b.weight);
	    });

	    while (edges.length && forest.size() > 1) {
	        let edge = edges.pop();

	        if (forest.find(edge.source) !== forest.find(edge.target)) {
	            forest.union(edge.source, edge.target);
	            selectedEdges.push(edge);
	        }
	    }

	    return {
	        nodes: vertices,
	        links: selectedEdges
	    }
	}

	//<editor-fold desc="This section is for the disjoint set">
	function DisjointSet() {
	    this.index_ = {};
	}

	function Node(id) {
	    this.id_ = id;
	    this.parent_ = this;
	    this.rank_ = 0;
	}

	DisjointSet.prototype.makeSet = function (id) {
	    if (!this.index_[id]) {
	        let created = new Node(id);
	        this.index_[id] = created;
	    }
	};

	// Returns the id of the representative element of this set that (id)
	// belongs to.
	DisjointSet.prototype.find = function (id) {
	    if (this.index_[id] === undefined) {
	        return undefined;
	    }

	    let current = this.index_[id].parent_;
	    while (current !== current.parent_) {
	        current = current.parent_;
	    }
	    return current.id_;
	};

	DisjointSet.prototype.union = function (x, y) {
	    let xRoot = this.index_[this.find(x)];
	    let yRoot = this.index_[this.find(y)];

	    if (xRoot === undefined || yRoot === undefined || xRoot === yRoot) {
	        // x and y already belong to the same set.
	        return;
	    }

	    if (xRoot.rank < yRoot.rank) { // Move x into the set y is a member of.
	        xRoot.parent_ = yRoot;
	    } else if (yRoot.rank_ < xRoot.rank_) { // Move y into the set x is a member of.
	        yRoot.parent_ = xRoot;
	    } else { // Arbitrarily choose to move y into the set x is a member of.
	        yRoot.parent_ = xRoot;
	        xRoot.rank_++;
	    }
	};

	// Returns the current number of disjoint sets.
	DisjointSet.prototype.size = function () {
	    let uniqueIndices = {};
	    Object.keys(this.index_).forEach((id) => {
	        uniqueIndices[id] = true;
	    });
	    return Object.keys(uniqueIndices).length;
	};
	//</editor-fold>

	function c(r){if(0===r.length)throw new Error("max requires at least one data point");for(var t=r[0],n=1;n<r.length;n++)r[n]>t&&(t=r[n]);return t}function y(r,t){var n=r.length*t;if(0===r.length)throw new Error("quantile requires at least one data point.");if(t<0||t>1)throw new Error("quantiles must be between 0 and 1");return 1===t?r[r.length-1]:0===t?r[0]:n%1!=0?r[Math.ceil(n)-1]:r.length%2==0?(r[n-1]+r[n])/2:r[n]}function b(r,t,n,e){for(n=n||0,e=e||r.length-1;e>n;){if(e-n>600){var o=e-n+1,a=t-n+1,h=Math.log(o),f=.5*Math.exp(2*h/3),u=.5*Math.sqrt(h*f*(o-f)/o);a-o/2<0&&(u*=-1),b(r,t,Math.max(n,Math.floor(t-a*f/o+u)),Math.min(e,Math.floor(t+(o-a)*f/o+u)));}var i=r[t],l=n,g=e;for(d(r,n,t),r[e]>i&&d(r,n,e);l<g;){for(d(r,l,g),l++,g--;r[l]<i;)l++;for(;r[g]>i;)g--;}r[n]===i?d(r,n,g):d(r,++g,e),g<=t&&(n=g+1),t<=g&&(e=g-1);}}function d(r,t,n){var e=r[t];r[t]=r[n],r[n]=e;}function I(r,t){var n=r.slice();if(Array.isArray(t)){!function(r,t){for(var n=[0],e=0;e<t.length;e++)n.push(N(r.length,t[e]));n.push(r.length-1),n.sort(C);var o=[0,n.length-1];for(;o.length;){var a=Math.ceil(o.pop()),h=Math.floor(o.pop());if(!(a-h<=1)){var f=Math.floor((h+a)/2);P(r,n[f],Math.floor(n[h]),Math.ceil(n[a])),o.push(h,f,f,a);}}}(n,t);for(var e=[],o=0;o<t.length;o++)e[o]=y(n,t[o]);return e}return P(n,N(n.length,t),0,n.length-1),y(n,t)}function P(r,t,n,e){t%1==0?b(r,t,n,e):(b(r,t=Math.floor(t),n,e),b(r,t+1,t+1,e));}function C(r,t){return r-t}function N(r,t){var n=r*t;return 1===t?r-1:0===t?0:n%1!=0?Math.ceil(n)-1:r%2==0?n-.5:n}var pr=Math.log(Math.sqrt(2*Math.PI));var dr=Math.sqrt(2*Math.PI);var _r=Math.sqrt(2*Math.PI);function Ar(r){for(var t=r,n=r,e=1;e<15;e++)t+=n*=r*r/(2*e+1);return Math.round(1e4*(.5+t/_r*Math.exp(-r*r/2)))/1e4}for(var zr=[],Ur=0;Ur<=3.09;Ur+=.01)zr.push(Ar(Ur));

	/**
	 * options may contain upperBound, outlyingCoefficient (1.5 or 3.0), and weights (different variables may have different weights)
	 */
	class Outlying {
	    constructor(tree, options = {}) {
	        let upperBound = options.upperBound;
	        let outlyingCoefficient = options.outlyingCoefficient;
	        let weights = options.weights;
	        //Clone the tree to avoid modifying it
	        this.tree = JSON.parse(JSON.stringify(tree));
	        this.upperBound = upperBound;
	        this.outlyingCoefficient = outlyingCoefficient ? outlyingCoefficient : 1.5;
	        //Calculate the upper bound if it is not provided.
	        if (!upperBound) {
	            upperBound = findUpperBound(this.tree, 1.5);
	            //Save it for displaying purpose.
	            this.upperBound = upperBound;
	        }
	        //Mark the long links
	        markLongLinks(this.tree, upperBound);
	        //Finding normal nodes
	        let normalNodes = findNormalNodes(this.tree);
	        //Finding outlying points
	        this.outlyingPoints = findOutlyingPoints(this.tree, normalNodes);

	        function findOutlyingPoints(tree, normalNodes) {
	            let newNodes = normalNodes;
	            let oldNodes = tree.nodes;
	            //Get the outlying points
	            let ops = [];
	            oldNodes.forEach(on => {
	                //.id since we are accessing to points and the node is in form of {id: thePoint}
	                if (!pointExists(newNodes.map(nn => nn.id), on.id)) {
	                    ops.push(on.id);
	                }
	            });
	            return ops;
	        }

	        //Now mark the outlying links
	        markOutlyingLinks(this.tree, this.outlyingPoints);

	        //Create none outlying tree
	        this.noOutlyingTree = buildNoOutlyingTree(this.tree, this.outlyingPoints);

	        function buildNoOutlyingTree(tree, outlyingPoints) {
	            let noOutlyingTree = {};
	            noOutlyingTree.nodes = normalNodes;
	            noOutlyingTree.links = tree.links.filter(l => l.isOutlying !== true);
	            //If the outlying nodes has the degree of 2 or greater => it will break the tree into subtrees => so we need to rebuild the tree.
	            //Take the outlying points
	            let outlyingPointsStr = outlyingPoints.map(p => p.join(','));
	            let v2OrGreaterStr = getAllV2OrGreaterFromTree(tree).map(p => p.join(','));

	            let diff = underscore.difference(outlyingPointsStr, v2OrGreaterStr);
	            if (diff.length < outlyingPointsStr.length) {
	                //Means there is outlying node(s) with degree 2 or higher (so we should rebuild the tree)
	                let graph = createGraph(noOutlyingTree.nodes.map(n => n.id), weights);
	                noOutlyingTree = mst(graph);
	            }
	            return noOutlyingTree;
	        }

	        function findNormalNodes(tree) {
	            //Remove long links
	            let normalLinks = tree.links.filter(l => !l.isLong);
	            //Remove outlying nodes (nodes are not in any none-long links)
	            let allNodesWithLinks = [];
	            normalLinks.forEach(l => {
	                allNodesWithLinks.push(l.source);
	                allNodesWithLinks.push(l.target);
	            });
	            allNodesWithLinks = underscore.uniq(allNodesWithLinks, false, d => d.join(','));
	            let normalNodes = allNodesWithLinks.map(n => {
	                return {id: n};
	            });
	            return normalNodes;
	        }

	        function markLongLinks(tree, upperBound) {
	            tree.links.forEach(l => {
	                if (l.weight > upperBound) {
	                    l.isLong = true;
	                }
	            });
	        }

	        function findUpperBound(tree, coefficient) {
	            let allLengths = tree.links.map(l => l.weight),
	                q1 = I(allLengths, 0.25),
	                q3 = I(allLengths, 0.75),
	                iqr = q3 - q1,
	                upperBound = q3 + coefficient * iqr;
	            return upperBound;
	        }

	        function markOutlyingLinks(tree, outlyingPoints) {
	            if (outlyingPoints.length > 0) {
	                //Check the long links only
	                tree.links.filter(l => l.isLong).forEach(l => {
	                    //Also check if the link contains outlying points.
	                    if (pointExists(outlyingPoints, l.source) || pointExists(outlyingPoints, l.target)) {
	                        l.isOutlying = true;
	                    }
	                });
	            }
	        }
	    }

	    /**
	     * Returns outlying score
	     * @returns {number}
	     */
	    score() {
	        let totalLengths = 0;
	        let totalOutlyingLengths = 0;
	        this.tree.links.forEach(l => {
	            totalLengths += l.weight;
	            //If there are outlying points first.
	            if (l.isOutlying) {
	                totalOutlyingLengths += l.weight;
	            }
	        });
	        return totalOutlyingLengths / totalLengths;
	    }

	    /**
	     * Returns outlying links
	     */
	    links() {
	        if (!this.outlyingLinks) {
	            this.outlyingLinks = this.tree.links.filter(l => l.isOutlying);
	        }
	        return this.outlyingLinks;
	    }

	    /**
	     * Remove outlying links and nodes and return a new tree without outlying points/edges
	     */
	    removeOutlying() {
	        return this.noOutlyingTree;
	    }

	    /**
	     * Returns the outlying points (in form of points, not node object).
	     * @returns {Array}
	     */
	    points() {
	        return this.outlyingPoints;
	    }
	}

	class Skewed {
	    constructor(tree) {
	        //Clone the tree to avoid modifying it
	        this.tree = JSON.parse(JSON.stringify(tree));
	    }

	    /**
	     * Returns skewed score
	     * @returns {number}
	     */
	    score() {
	        let allLengths = this.tree.links.map(l=>l.weight),
	        q90 = I(allLengths, .9),
	        q50 = I(allLengths, .5),
	        q10 = I(allLengths, .1);
	        if(q90!=q10){
	            return (q90-q50)/(q90-q10);
	        }else{
	            return 0;
	        }
	    }
	}

	class Sparse {
	    constructor(tree) {
	        //Clone the tree to avoid modifying it
	        this.tree = JSON.parse(JSON.stringify(tree));
	    }

	    /**
	     * Returns sparse score
	     * @returns {number}
	     */
	    score() {
	        let allLengths = this.tree.links.map(l=>l.weight),
	            q90 = I(allLengths, .9);
	        let n = this.tree.links[0].source.length;
	        return q90/Math.sqrt(Math.floor(2*n/3));
	    }
	}

	class Clumpy {
	    constructor(tree) {
	        //Clone the tree to avoid modifying it
	        this.tree = JSON.parse(JSON.stringify(tree));
	    }

	    /**
	     * Returns clumpy score
	     * @returns {number}
	     */
	    score() {
	        let allRuntRatios = [];
	        this.tree.links.forEach(link =>{
	            let rg = this.runtGraph(link);
	            if(rg.length>0){
	                allRuntRatios.push(this.maxLength(rg)/link.weight);
	            }
	        });
	        if(allRuntRatios.length>0){
	            //Only if there are some runt graphs
	            return c(allRuntRatios.map(rr=>1-rr));
	        }else{
	            //In case all lengths are equal => then the score is 0
	            return 0;
	        }
	    }

	    runtGraph(link){
	        //Links that are greater or equal to the currently checking link
	        let greaterOrEqualLinks = this.tree.links.filter(l=>l.weight < link.weight);
	        //Remove the currently checking link.
	        greaterOrEqualLinks = greaterOrEqualLinks.filter(l=>!equalLinks(l, link));
	        let pairedResults = pairNodeLinks(greaterOrEqualLinks);

	        //Process the source side.
	        let sourceConnectedNodes = [link.source];
	        let sourceConnectedLinks = this.getConnectedLinks(sourceConnectedNodes, pairedResults);

	        let targetConnectedNodes = [link.target];
	        let targetConnectedLinks = this.getConnectedLinks(targetConnectedNodes, pairedResults);

	        return sourceConnectedLinks.length < targetConnectedLinks.length?sourceConnectedLinks:targetConnectedLinks;
	    }


	    getConnectedLinks(connectedNodes, pairedResults) {
	        let processedNodes = [];
	        let connectedLinks = [];
	        while (connectedNodes.length > 0) {
	            //Can stop earlier if this is having more than half of the links in the whole tree.
	            if(connectedLinks.length > this.tree.links.length + 1){
	                break;
	            }
	            let firstNode = underscore.first(connectedNodes);
	            //Removed the processed nodes
	            connectedNodes = underscore.without(connectedNodes, firstNode);
	            //Add it to the processed node
	            processedNodes.push(firstNode);
	            //Find the edges connected to that node.
	            let result = pairedResults.find(p => p[0] === firstNode.join(","));
	            let links = result?result[1]:[];
	            connectedLinks = connectedLinks.concat(links);
	            //Add new nodes to be processed
	            links.forEach(l => {
	                //If the node in the connected link is not processed => then add it to be processed (to expand later on).
	                if (!pointExists(processedNodes, l.source)) {
	                    connectedNodes.push(l.source);
	                }
	                if(!pointExists(processedNodes, l.target)) {
	                    connectedNodes.push(l.target);
	                }
	            });
	        }
	        return connectedLinks;
	    }

	    maxLength(runtGraph){
	        if(runtGraph.length===0){
	            return 0;
	        }
	        return c(runtGraph.map(l=>l.weight));
	    }
	}

	class Stringy {
	    constructor(tree) {
	        //Clone the tree to avoid modifying it
	        this.tree = JSON.parse(JSON.stringify(tree));
	    }

	    /**
	     * Returns striated score
	     * @returns {number}
	     */
	    score() {
	        //Loop through the nodes.
	        let verticesCount = this.tree.nodes.length;
	        let v2Count = this.getAllV2Corners().length;
	        let v1Count = this.getAllV1s().length;
	        return v2Count/(verticesCount-v1Count);
	    }

	    /**
	     * This function returns corners (three vertices) of vertices of degree two in the for mat of
	     * point1, point2, point3 => point1 is the the vertex with degree two (two edges connected to it are [point1, point2] and [point1, point3] (order of the points in each edge is not important)).
	     * @returns {Array}
	     */
	    getAllV2Corners(){
	        return getAllV2CornersFromTree(this.tree);
	    }

	    /**
	     * This function returns
	     * @returns {Array}
	     */
	    getAllV1s(){
	        return getAllV1sFromTree(this.tree);
	    }
	}

	class Monotonic {
	    constructor(points) {
	        //Clone it in order to avoid modifying it.
	        this.points = points.slice(0);
	    }

	    /**
	     * Returns monotonic score
	     * @returns {number}
	     */
	    score() {
	        let spearmans = [];
	        let variables = underscore.unzip(this.points);
	        let length = variables.length;

	        //Calculate the spearman for all pairs of variables.
	        for (let i = 0; i < length - 1; i++) {
	            let v1 = variables[i];
	            for (let j = i+1; j < length; j++) {
	                let v2 = variables[j];
	                let r = computeSpearmans(v1, v2);
	                spearmans.push(r*r);
	            }
	        }
	        return underscore.max(spearmans);

	        /**Adopted from: https://bl.ocks.org/nkullman/f65d5619843dc22e061d957249121408**/
	        function computeSpearmans(arrX, arrY) {
	            // simple error handling for input arrays of nonequal lengths
	            if (arrX.length !== arrY.length) {
	                return null;
	            }

	            // number of observations
	            let n = arrX.length;

	            // rank datasets
	            let xRanked = rankArray(arrX),
	                yRanked = rankArray(arrY);

	            // sum of distances between ranks
	            let dsq = 0;
	            for (let i = 0; i < n; i++) {
	                dsq += Math.pow(xRanked[i] - yRanked[i], 2);
	            }

	            // compute correction for ties
	            let xTies = countTies(arrX),
	                yTies = countTies(arrY);
	            let xCorrection = 0,
	                yCorrection = 0;
	            for (let tieLength in xTies) {
	                xCorrection += xTies[tieLength] * tieLength * (Math.pow(tieLength, 2) - 1);
	            }
	            xCorrection /= 12.0;
	            for (let tieLength in yTies) {
	                yCorrection += yTies[tieLength] * tieLength * (Math.pow(tieLength, 2) - 1);
	            }
	            yCorrection /= 12.0;

	            // denominator
	            let denominator = n * (Math.pow(n, 2) - 1) / 6.0;

	            // compute rho
	            let rho = denominator - dsq - xCorrection - yCorrection;
	            rho /= Math.sqrt((denominator - 2 * xCorrection) * (denominator - 2 * yCorrection));

	            return rho;
	        }

	        /** Computes the rank array for arr, where each entry in arr is
	         * assigned a value 1 thru n, where n is arr.length.
	         *
	         * Tied entries in arr are each given the average rank of the ties.
	         * Lower ranks are not increased
	         */
	        function rankArray(arr) {

	            // ranking without averaging
	            let sorted = arr.slice().sort(function (a, b) {
	                return b - a
	            });
	            let ranks = arr.slice().map(function (v) {
	                return sorted.indexOf(v) + 1
	            });

	            // counts of each rank
	            let counts = {};
	            ranks.forEach(function (x) {
	                counts[x] = (counts[x] || 0) + 1;
	            });

	            // average duplicates
	            ranks = ranks.map(function (x) {
	                return x + 0.5 * ((counts[x] || 0) - 1);
	            });

	            return ranks;
	        }

	        /** Counts the number of ties in arr, and returns
	         * an object with
	         * a key for each tie length (an entry n for each n-way tie) and
	         * a value corresponding to the number of key-way (n-way) ties
	         */
	        function countTies(arr) {
	            let ties = {},
	                arrSorted = arr.slice().sort(),
	                currValue = arrSorted[0],
	                tieLength = 1;

	            for (let i = 1; i < arrSorted.length; i++) {
	                if (arrSorted[i] === currValue) {
	                    tieLength++;
	                } else {
	                    if (tieLength > 1) {
	                        if (ties[tieLength] === undefined) ties[tieLength] = 0;
	                        ties[tieLength]++;
	                    }
	                    currValue = arrSorted[i];
	                    tieLength = 1;
	                }
	            }
	            if (tieLength > 1) {
	                if (ties[tieLength] === undefined) ties[tieLength] = 0;
	                ties[tieLength]++;
	            }
	            return ties;
	        }
	    }
	}

	(function (window) {
	    /**
	     * initialize a scagnosticsnd object
	     * @param inputPoints   {*[][]} set of points from the scatter plot
	     * @returns {*[][]}
	     */
	    window.scagnosticsnd = function (inputPoints, options = {}) {
	        let dims = inputPoints[0].length;
	        //Clone it to avoid modifying it.
	        let points = inputPoints.map(e => e.slice());
	        //Add one step to pass the data over if there is.
	        for (let i = 0; i < points.length; i++) {
	            points[i].data = inputPoints[i].data;
	        }
	        let normalizedPoints = points;

	        if (options.isNormalized === undefined) {
	            let normalizer = new Normalizer(points);
	            normalizedPoints = normalizer.normalizedPoints;
	            outputValue("normalizedPoints", normalizedPoints);
	            outputValue("normalizer", normalizer);
	        }

	        let binType = options.binType;
	        /******This section is about the outlying score and outlying score results******/
	        let outlyingUpperBound = options.outlyingUpperBound;
	        let outlyingCoefficient = options.outlyingCoefficient;

	        /******This section is about finding number of bins and binners******/
	        let sites = null;
	        let bins = null;
	        let binner = null;
	        let binSize = null;
	        let binRadius = 0;
	        let startBinGridSize = options.startBinGridSize;

	        if (options.isBinned === undefined) {//Only do the binning if needed.
	            let incrementA = options.incrementA ? options.incrementA : 2;
	            let incrementB = options.incrementB ? options.incrementB : 0;
	            let decrementA = options.decrementA ? options.decrementA : 1 / 2;
	            let decrementB = options.decrementB ? options.decrementB : 0;

	            if (startBinGridSize === undefined) {
	                startBinGridSize = 20;
	            }
	            bins = [];
	            //Default number of bins
	            let minNumOfBins = 30;
	            let maxNumOfBins = 200;
	            let minBins = options.minBins;
	            let maxBins = options.maxBins;
	            if (minBins) {
	                minNumOfBins = minBins;
	            }
	            if (maxBins) {
	                maxNumOfBins = maxBins;
	            }
	            //Don't do the binning if the unique set of values are less than min number. Just return the unique set.
	            // let uniqueKeys = underscore_1.uniq(normalizedPoints.map(p => p.join(',')));
	            // let groups = underscore_1.groupBy(normalizedPoints, p => p.join(','));
	            // if (uniqueKeys.length < minNumOfBins) {
	            //     uniqueKeys.forEach(key => {
	            //         let bin = groups[key];
	            //         //Take the coordinate of the first point in the group to be the bin leader (they should have the same points actually=> so just take the first one.
	            //         bin.site = bin[0].slice();
	            //         bins.push(bin);
	            //     });
	            // } else {
	                do {
	                    //Start with binSize x binSize x binSize... bins, and then increase it as binSize = binSize * incrementA + incrementB or binSize = binSize * decrementA + decrementB.
	                    if (binSize === null) {
	                        binSize = startBinGridSize;
	                    } else if (bins.length > maxNumOfBins) {
	                        binSize = binSize * decrementA + decrementB;
	                    } else if (bins.length < minNumOfBins) {
	                        binSize = binSize * incrementA + incrementB;
	                    }
	                    if (binType === "hexagon") ; else if (!binType || binType === "leader") {
	                        // This section uses leader binner
	                        binRadius = Math.sqrt(dims * Math.pow(1 / (binSize * 2), 2));
	                        binner = new LeaderBinner(normalizedPoints, binRadius);
	                        bins = binner.leaders;
	                    }
	                } while (bins.length > maxNumOfBins || bins.length < minNumOfBins);
	            // }
	            sites = bins.map(d => d.site); //=>sites are the set of centers of all bins
	            /******This section is about the binning and binning results******/
	            outputValue("binner", binner);
	            outputValue("bins", bins);
	            outputValue("binSize", binSize);
	            outputValue("binRadius", binRadius);
	        } else {
	            sites = normalizedPoints;
	        }

	        outputValue("binnedSites", sites);

	        /******This section is about the spanning tree and spanning tree results******/
	            //Spanning tree calculation
	        let tetrahedraCoordinates = [sites];
	        let weights = options.distanceWeights;
	        let graph = createGraph(tetrahedraCoordinates, weights);
	        let mstree = mst(graph);
	        //Assigning the output values
	        outputValue("graph", graph);
	        outputValue("mst", mstree);

	        /******This section is about the outlying score and outlying score results******/
	            //TODO: Need to check if outlying links are really connected to outlying points
	        let outlying = new Outlying(mstree, {
	                outlyingUpperBound: outlyingUpperBound,
	                outlyingCoefficient: outlyingCoefficient});
	        let outlyingScore = outlying.score();
	        outlyingUpperBound = outlying.upperBound;
	        let outlyingLinks = outlying.links();
	        let outlyingSites = outlying.points().map(p => p.join(','));
	        let outlyingBins = bins.filter(b => outlyingSites.indexOf(b.site.join(',')) >= 0);

	        //Add outlying points from the bin to it.
	        let outlyingPoints = [];
	        outlying.points().forEach(p => {
	            bins.forEach(b => {
	                if (equalPoints(p, b.site)) {
	                    outlyingPoints = outlyingPoints.concat(b);
	                }
	            });

	        });
	        outputValue("outlyingBins", outlyingBins);
	        outputValue("outlyingScore", outlyingScore);
	        outputValue("outlyingUpperBound", outlyingUpperBound);
	        outputValue("outlyingLinks", outlyingLinks);
	        outputValue("outlyingPoints", outlyingPoints);


	        /******This section is about the skewed score and skewed score results******/
	        let noOutlyingTree = outlying.removeOutlying();
	        let skewed = new Skewed(noOutlyingTree);
	        outputValue("skewedScore", skewed.score());

	        /******This section is about the sparse score and sparse score results******/
	        let sparse = new Sparse(noOutlyingTree);
	        outputValue("sparseScore", sparse.score());

	        /******This section is about the clumpy score and clumpy score results******/
	        let clumpy = new Clumpy(noOutlyingTree);
	        outputValue("clumpy", clumpy);
	        outputValue("clumpyScore", clumpy.score());

	        // /******This section is about the striated score and striated score results******/
	        // let striated = new Striated(noOutlyingTree);
	        // outputValue("striatedScore", striated.score());
	        //
	        // /******This section is about the convex hull and convex hull results******/
	        // let convex = new Convex(noOutlyingTree, 1/outlying.upperBound);
	        // let convexHull = convex.convexHull();
	        // outputValue("convexHull", convexHull);


	        // /******This section is about the concave hull and concave hull results******/
	        // let concaveHull = convex.concaveHull();
	        // outputValue("concaveHull", concaveHull);
	        //
	        //
	        // /******This section is about the convex score and convex score results******/
	        // let convexScore = convex.score();
	        // outputValue("convexScore", convexScore);
	        //
	        //
	        // /******This section is about the skinny score and skinny score results******/
	        // let skinny = new Skinny(concaveHull);
	        // let skinnyScore = skinny.score();
	        // outputValue("skinnyScore", skinnyScore);
	        //
	        /******This section is about the stringy score and stringy score results******/
	        let stringy = new Stringy(noOutlyingTree);
	        let v1s = stringy.getAllV1s();
	        let v2Corners = stringy.getAllV2Corners();
	        // let obtuseV2Corners = striated.getAllObtuseV2Corners();
	        let stringyScore = stringy.score();
	        outputValue("v1s", v1s);
	        outputValue("stringyScore", stringyScore);
	        outputValue("v2Corners", v2Corners);
	        // outputValue("obtuseV2Corners", obtuseV2Corners);


	        /******This section is about the monotonic score and monotonic score results******/
	        let monotonic = new Monotonic(noOutlyingTree.nodes.map(n => n.id));
	        let monotonicScore = monotonic.score();
	        outputValue("monotonicScore", monotonicScore);

	        return window.scagnosticsnd;

	        function outputValue(name, value) {
	            window.scagnosticsnd[name] = value;
	        }
	    };

	})(window);

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhZ25vc3RpY3NuZC5taW4uanMiLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiLCIuLi8uLi9zcmMvc2NyaXB0cy9tb2R1bGVzL25vcm1hbGl6ZXIuanMiLCIuLi8uLi9zcmMvc2NyaXB0cy9tb2R1bGVzL2xlYWRlckJpbm5lci5qcyIsIi4uLy4uL3NyYy9zY3JpcHRzL21vZHVsZXMva3J1c2thbC1tc3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3MvZGlzdC9zaW1wbGUtc3RhdGlzdGljcy5tanMiLCIuLi8uLi9zcmMvc2NyaXB0cy9tb2R1bGVzL291dGx5aW5nLmpzIiwiLi4vLi4vc3JjL3NjcmlwdHMvbW9kdWxlcy9za2V3ZWQuanMiLCIuLi8uLi9zcmMvc2NyaXB0cy9tb2R1bGVzL3NwYXJzZS5qcyIsIi4uLy4uL3NyYy9zY3JpcHRzL21vZHVsZXMvY2x1bXB5LmpzIiwiLi4vLi4vc3JjL3NjcmlwdHMvbW9kdWxlcy9zdHJpbmd5LmpzIiwiLi4vLi4vc3JjL3NjcmlwdHMvbW9kdWxlcy9tb25vdG9uaWMuanMiLCIuLi8uLi9zcmMvc2NyaXB0cy9zY2Fnbm9zdGljc25kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuOS4xXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE4IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XG4gICAgICAgICAgICB0aGlzIHx8XG4gICAgICAgICAgICB7fTtcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBTeW1ib2xQcm90byA9IHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnID8gU3ltYm9sLnByb3RvdHlwZSA6IG51bGw7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhciBwdXNoID0gQXJyYXlQcm90by5wdXNoLFxuICAgICAgc2xpY2UgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgICAgdG9TdHJpbmcgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICAgIGhhc093blByb3BlcnR5ID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXksXG4gICAgICBuYXRpdmVLZXlzID0gT2JqZWN0LmtleXMsXG4gICAgICBuYXRpdmVDcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG4gIC8vIE5ha2VkIGZ1bmN0aW9uIHJlZmVyZW5jZSBmb3Igc3Vycm9nYXRlLXByb3RvdHlwZS1zd2FwcGluZy5cbiAgdmFyIEN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGVpciBvbGQgbW9kdWxlIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICAvLyAoYG5vZGVUeXBlYCBpcyBjaGVja2VkIHRvIGVuc3VyZSB0aGF0IGBtb2R1bGVgXG4gIC8vIGFuZCBgZXhwb3J0c2AgYXJlIG5vdCBIVE1MIGVsZW1lbnRzLilcbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmICFleHBvcnRzLm5vZGVUeXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS45LjEnO1xuXG4gIC8vIEludGVybmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlZmZpY2llbnQgKGZvciBjdXJyZW50IGVuZ2luZXMpIHZlcnNpb25cbiAgLy8gb2YgdGhlIHBhc3NlZC1pbiBjYWxsYmFjaywgdG8gYmUgcmVwZWF0ZWRseSBhcHBsaWVkIGluIG90aGVyIFVuZGVyc2NvcmVcbiAgLy8gZnVuY3Rpb25zLlxuICB2YXIgb3B0aW1pemVDYiA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvLyBUaGUgMi1hcmd1bWVudCBjYXNlIGlzIG9taXR0ZWQgYmVjYXVzZSB3ZeKAmXJlIG5vdCB1c2luZyBpdC5cbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIHZhciBidWlsdGluSXRlcmF0ZWU7XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gZWFjaFxuICAvLyBlbGVtZW50IGluIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBkZXNpcmVkIHJlc3VsdCDigJQgZWl0aGVyIGBpZGVudGl0eWAsXG4gIC8vIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoXy5pdGVyYXRlZSAhPT0gYnVpbHRpbkl0ZXJhdGVlKSByZXR1cm4gXy5pdGVyYXRlZSh2YWx1ZSwgY29udGV4dCk7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gb3B0aW1pemVDYih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSAmJiAhXy5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIEV4dGVybmFsIHdyYXBwZXIgZm9yIG91ciBjYWxsYmFjayBnZW5lcmF0b3IuIFVzZXJzIG1heSBjdXN0b21pemVcbiAgLy8gYF8uaXRlcmF0ZWVgIGlmIHRoZXkgd2FudCBhZGRpdGlvbmFsIHByZWRpY2F0ZS9pdGVyYXRlZSBzaG9ydGhhbmQgc3R5bGVzLlxuICAvLyBUaGlzIGFic3RyYWN0aW9uIGhpZGVzIHRoZSBpbnRlcm5hbC1vbmx5IGFyZ0NvdW50IGFyZ3VtZW50LlxuICBfLml0ZXJhdGVlID0gYnVpbHRpbkl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gY2IodmFsdWUsIGNvbnRleHQsIEluZmluaXR5KTtcbiAgfTtcblxuICAvLyBTb21lIGZ1bmN0aW9ucyB0YWtlIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cywgb3IgYSBmZXcgZXhwZWN0ZWRcbiAgLy8gYXJndW1lbnRzIGF0IHRoZSBiZWdpbm5pbmcgYW5kIHRoZW4gYSB2YXJpYWJsZSBudW1iZXIgb2YgdmFsdWVzIHRvIG9wZXJhdGVcbiAgLy8gb24uIFRoaXMgaGVscGVyIGFjY3VtdWxhdGVzIGFsbCByZW1haW5pbmcgYXJndW1lbnRzIHBhc3QgdGhlIGZ1bmN0aW9u4oCZc1xuICAvLyBhcmd1bWVudCBsZW5ndGggKG9yIGFuIGV4cGxpY2l0IGBzdGFydEluZGV4YCksIGludG8gYW4gYXJyYXkgdGhhdCBiZWNvbWVzXG4gIC8vIHRoZSBsYXN0IGFyZ3VtZW50LiBTaW1pbGFyIHRvIEVTNuKAmXMgXCJyZXN0IHBhcmFtZXRlclwiLlxuICB2YXIgcmVzdEFyZ3VtZW50cyA9IGZ1bmN0aW9uKGZ1bmMsIHN0YXJ0SW5kZXgpIHtcbiAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKSxcbiAgICAgICAgICByZXN0ID0gQXJyYXkobGVuZ3RoKSxcbiAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpcywgcmVzdCk7XG4gICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sIHJlc3QpO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgIGFyZ3NbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4XTtcbiAgICAgIH1cbiAgICAgIGFyZ3Nbc3RhcnRJbmRleF0gPSByZXN0O1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSBhbm90aGVyLlxuICB2YXIgYmFzZUNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgIGlmICghXy5pc09iamVjdChwcm90b3R5cGUpKSByZXR1cm4ge307XG4gICAgaWYgKG5hdGl2ZUNyZWF0ZSkgcmV0dXJuIG5hdGl2ZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIEN0b3IucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHZhciByZXN1bHQgPSBuZXcgQ3RvcjtcbiAgICBDdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgc2hhbGxvd1Byb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICB2YXIgaGFzID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwYXRoKTtcbiAgfVxuXG4gIHZhciBkZWVwR2V0ID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgdmFyIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICAgIG9iaiA9IG9ialtwYXRoW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGxlbmd0aCA/IG9iaiA6IHZvaWQgMDtcbiAgfTtcblxuICAvLyBIZWxwZXIgZm9yIGNvbGxlY3Rpb24gbWV0aG9kcyB0byBkZXRlcm1pbmUgd2hldGhlciBhIGNvbGxlY3Rpb25cbiAgLy8gc2hvdWxkIGJlIGl0ZXJhdGVkIGFzIGFuIGFycmF5IG9yIGFzIGFuIG9iamVjdC5cbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBzaGFsbG93UHJvcGVydHkoJ2xlbmd0aCcpO1xuICB2YXIgaXNBcnJheUxpa2UgPSBmdW5jdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChjb2xsZWN0aW9uKTtcbiAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBsZW5ndGggPj0gMCAmJiBsZW5ndGggPD0gTUFYX0FSUkFZX0lOREVYO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGksIGxlbmd0aDtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50LlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDcmVhdGUgYSByZWR1Y2luZyBmdW5jdGlvbiBpdGVyYXRpbmcgbGVmdCBvciByaWdodC5cbiAgdmFyIGNyZWF0ZVJlZHVjZSA9IGZ1bmN0aW9uKGRpcikge1xuICAgIC8vIFdyYXAgY29kZSB0aGF0IHJlYXNzaWducyBhcmd1bWVudCB2YXJpYWJsZXMgaW4gYSBzZXBhcmF0ZSBmdW5jdGlvbiB0aGFuXG4gICAgLy8gdGhlIG9uZSB0aGF0IGFjY2Vzc2VzIGBhcmd1bWVudHMubGVuZ3RoYCB0byBhdm9pZCBhIHBlcmYgaGl0LiAoIzE5OTEpXG4gICAgdmFyIHJlZHVjZXIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBpbml0aWFsKSB7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXhdO1xuICAgICAgICBpbmRleCArPSBkaXI7XG4gICAgICB9XG4gICAgICBmb3IgKDsgaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gZGlyKSB7XG4gICAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+PSAzO1xuICAgICAgcmV0dXJuIHJlZHVjZXIob2JqLCBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCA0KSwgbWVtbywgaW5pdGlhbCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gY3JlYXRlUmVkdWNlKDEpO1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGNyZWF0ZVJlZHVjZSgtMSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIGtleUZpbmRlciA9IGlzQXJyYXlMaWtlKG9iaikgPyBfLmZpbmRJbmRleCA6IF8uZmluZEtleTtcbiAgICB2YXIga2V5ID0ga2V5RmluZGVyKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBpZiAoa2V5ICE9PSB2b2lkIDAgJiYga2V5ICE9PSAtMSkgcmV0dXJuIG9ialtrZXldO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoY2IocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gaXRlbSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlc2AgYW5kIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZXMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIGl0ZW0sIGZyb21JbmRleCwgZ3VhcmQpIHtcbiAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggIT0gJ251bWJlcicgfHwgZ3VhcmQpIGZyb21JbmRleCA9IDA7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIGl0ZW0sIGZyb21JbmRleCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKG9iaiwgcGF0aCwgYXJncykge1xuICAgIHZhciBjb250ZXh0UGF0aCwgZnVuYztcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBhdGgpKSB7XG4gICAgICBmdW5jID0gcGF0aDtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShwYXRoKSkge1xuICAgICAgY29udGV4dFBhdGggPSBwYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgIHBhdGggPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgIHZhciBtZXRob2QgPSBmdW5jO1xuICAgICAgaWYgKCFtZXRob2QpIHtcbiAgICAgICAgaWYgKGNvbnRleHRQYXRoICYmIGNvbnRleHRQYXRoLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnRleHQgPSBkZWVwR2V0KGNvbnRleHQsIGNvbnRleHRQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGV4dCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgICAgICBtZXRob2QgPSBjb250ZXh0W3BhdGhdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ldGhvZCA9PSBudWxsID8gbWV0aG9kIDogbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsIHx8IHR5cGVvZiBpdGVyYXRlZSA9PSAnbnVtYmVyJyAmJiB0eXBlb2Ygb2JqWzBdICE9ICdvYmplY3QnICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2LCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHYsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSAtSW5maW5pdHkgJiYgcmVzdWx0ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2O1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCB8fCB0eXBlb2YgaXRlcmF0ZWUgPT0gJ251bWJlcicgJiYgdHlwZW9mIG9ialswXSAhPSAnb2JqZWN0JyAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odiwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2LCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gSW5maW5pdHkgJiYgcmVzdWx0ID09PSBJbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHY7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5zYW1wbGUob2JqLCBJbmZpbml0eSk7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24gdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgdmFyIHNhbXBsZSA9IGlzQXJyYXlMaWtlKG9iaikgPyBfLmNsb25lKG9iaikgOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoc2FtcGxlKTtcbiAgICBuID0gTWF0aC5tYXgoTWF0aC5taW4obiwgbGVuZ3RoKSwgMCk7XG4gICAgdmFyIGxhc3QgPSBsZW5ndGggLSAxO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBuOyBpbmRleCsrKSB7XG4gICAgICB2YXIgcmFuZCA9IF8ucmFuZG9tKGluZGV4LCBsYXN0KTtcbiAgICAgIHZhciB0ZW1wID0gc2FtcGxlW2luZGV4XTtcbiAgICAgIHNhbXBsZVtpbmRleF0gPSBzYW1wbGVbcmFuZF07XG4gICAgICBzYW1wbGVbcmFuZF0gPSB0ZW1wO1xuICAgIH1cbiAgICByZXR1cm4gc2FtcGxlLnNsaWNlKDAsIG4pO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4KyssXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRlZSh2YWx1ZSwga2V5LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IsIHBhcnRpdGlvbikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0gcGFydGl0aW9uID8gW1tdLCBbXV0gOiB7fTtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwgdmFsdWUsIGtleSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChoYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgdmFyIHJlU3RyU3ltYm9sID0gL1teXFx1ZDgwMC1cXHVkZmZmXXxbXFx1ZDgwMC1cXHVkYmZmXVtcXHVkYzAwLVxcdWRmZmZdfFtcXHVkODAwLVxcdWRmZmZdL2c7XG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChfLmlzU3RyaW5nKG9iaikpIHtcbiAgICAgIC8vIEtlZXAgc3Vycm9nYXRlIHBhaXIgY2hhcmFjdGVycyB0b2dldGhlclxuICAgICAgcmV0dXJuIG9iai5tYXRjaChyZVN0clN5bWJvbCk7XG4gICAgfVxuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iaikgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIFNwbGl0IGEgY29sbGVjdGlvbiBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIHBhc3MpIHtcbiAgICByZXN1bHRbcGFzcyA/IDAgOiAxXS5wdXNoKHZhbHVlKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsIHx8IGFycmF5Lmxlbmd0aCA8IDEpIHJldHVybiBuID09IG51bGwgPyB2b2lkIDAgOiBbXTtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCB8fCBhcnJheS5sZW5ndGggPCAxKSByZXR1cm4gbiA9PSBudWxsID8gdm9pZCAwIDogW107XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBfLnJlc3QoYXJyYXksIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIG4pKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBCb29sZWFuKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KSB7XG4gICAgb3V0cHV0ID0gb3V0cHV0IHx8IFtdO1xuICAgIHZhciBpZHggPSBvdXRwdXQubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoaW5wdXQpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSAmJiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkpIHtcbiAgICAgICAgLy8gRmxhdHRlbiBjdXJyZW50IGxldmVsIG9mIGFycmF5IG9yIGFyZ3VtZW50cyBvYmplY3QuXG4gICAgICAgIGlmIChzaGFsbG93KSB7XG4gICAgICAgICAgdmFyIGogPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKGogPCBsZW4pIG91dHB1dFtpZHgrK10gPSB2YWx1ZVtqKytdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KTtcbiAgICAgICAgICBpZHggPSBvdXRwdXQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UpO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGFycmF5LCBvdGhlckFycmF5cykge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIG90aGVyQXJyYXlzKTtcbiAgfSk7XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBUaGUgZmFzdGVyIGFsZ29yaXRobSB3aWxsIG5vdCB3b3JrIHdpdGggYW4gaXRlcmF0ZWUgaWYgdGhlIGl0ZXJhdGVlXG4gIC8vIGlzIG5vdCBhIG9uZS10by1vbmUgZnVuY3Rpb24sIHNvIHByb3ZpZGluZyBhbiBpdGVyYXRlZSB3aWxsIGRpc2FibGVcbiAgLy8gdGhlIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQgJiYgIWl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghaSB8fCBzZWVuICE9PSBjb21wdXRlZCkgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICBzZWVuID0gY29tcHV0ZWQ7XG4gICAgICB9IGVsc2UgaWYgKGl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhzZWVuLCBjb21wdXRlZCkpIHtcbiAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghXy5jb250YWlucyhyZXN1bHQsIHZhbHVlKSkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcnJheXMpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJyYXlzLCB0cnVlLCB0cnVlKSk7XG4gIH0pO1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIGlmIChfLmNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xuICAgICAgdmFyIGo7XG4gICAgICBmb3IgKGogPSAxOyBqIDwgYXJnc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oYXJyYXksIHJlc3QpIHtcbiAgICByZXN0ID0gZmxhdHRlbihyZXN0LCB0cnVlLCB0cnVlKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIENvbXBsZW1lbnQgb2YgXy56aXAuIFVuemlwIGFjY2VwdHMgYW4gYXJyYXkgb2YgYXJyYXlzIGFuZCBncm91cHNcbiAgLy8gZWFjaCBhcnJheSdzIGVsZW1lbnRzIG9uIHNoYXJlZCBpbmRpY2VzLlxuICBfLnVuemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkgJiYgXy5tYXgoYXJyYXksIGdldExlbmd0aCkubGVuZ3RoIHx8IDA7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gXy5wbHVjayhhcnJheSwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gcmVzdEFyZ3VtZW50cyhfLnVuemlwKTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuIFBhc3NpbmcgYnkgcGFpcnMgaXMgdGhlIHJldmVyc2Ugb2YgXy5wYWlycy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChsaXN0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgZmluZEluZGV4IGFuZCBmaW5kTGFzdEluZGV4IGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyID0gZnVuY3Rpb24oZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGluZGV4IG9uIGFuIGFycmF5LWxpa2UgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdC5cbiAgXy5maW5kSW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigxKTtcbiAgXy5maW5kTGFzdEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoLTEpO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRlZShvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGluZGV4T2YgYW5kIGxhc3RJbmRleE9mIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUluZGV4RmluZGVyID0gZnVuY3Rpb24oZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgIGkgPSBpZHggPj0gMCA/IGlkeCA6IE1hdGgubWF4KGlkeCArIGxlbmd0aCwgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVuZ3RoID0gaWR4ID49IDAgPyBNYXRoLm1pbihpZHggKyAxLCBsZW5ndGgpIDogaWR4ICsgbGVuZ3RoICsgMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzb3J0ZWRJbmRleCAmJiBpZHggJiYgbGVuZ3RoKSB7XG4gICAgICAgIGlkeCA9IHNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2lkeF0gPT09IGl0ZW0gPyBpZHggOiAtMTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtICE9PSBpdGVtKSB7XG4gICAgICAgIGlkeCA9IHByZWRpY2F0ZUZpbmQoc2xpY2UuY2FsbChhcnJheSwgaSwgbGVuZ3RoKSwgXy5pc05hTik7XG4gICAgICAgIHJldHVybiBpZHggPj0gMCA/IGlkeCArIGkgOiAtMTtcbiAgICAgIH1cbiAgICAgIGZvciAoaWR4ID0gZGlyID4gMCA/IGkgOiBsZW5ndGggLSAxOyBpZHggPj0gMCAmJiBpZHggPCBsZW5ndGg7IGlkeCArPSBkaXIpIHtcbiAgICAgICAgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBpZiAoIXN0ZXApIHtcbiAgICAgIHN0ZXAgPSBzdG9wIDwgc3RhcnQgPyAtMSA6IDE7XG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBDaHVuayBhIHNpbmdsZSBhcnJheSBpbnRvIG11bHRpcGxlIGFycmF5cywgZWFjaCBjb250YWluaW5nIGBjb3VudGAgb3IgZmV3ZXJcbiAgLy8gaXRlbXMuXG4gIF8uY2h1bmsgPSBmdW5jdGlvbihhcnJheSwgY291bnQpIHtcbiAgICBpZiAoY291bnQgPT0gbnVsbCB8fCBjb3VudCA8IDEpIHJldHVybiBbXTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGkgPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHNsaWNlLmNhbGwoYXJyYXksIGksIGkgKz0gY291bnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHMuXG4gIHZhciBleGVjdXRlQm91bmQgPSBmdW5jdGlvbihzb3VyY2VGdW5jLCBib3VuZEZ1bmMsIGNvbnRleHQsIGNhbGxpbmdDb250ZXh0LCBhcmdzKSB7XG4gICAgaWYgKCEoY2FsbGluZ0NvbnRleHQgaW5zdGFuY2VvZiBib3VuZEZ1bmMpKSByZXR1cm4gc291cmNlRnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB2YXIgc2VsZiA9IGJhc2VDcmVhdGUoc291cmNlRnVuYy5wcm90b3R5cGUpO1xuICAgIHZhciByZXN1bHQgPSBzb3VyY2VGdW5jLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQmluZCBtdXN0IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uJyk7XG4gICAgdmFyIGJvdW5kID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihjYWxsQXJncykge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoY2FsbEFyZ3MpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH0pO1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyIGJ5IGRlZmF1bHQsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmVcbiAgLy8gcHJlLWZpbGxlZC4gU2V0IGBfLnBhcnRpYWwucGxhY2Vob2xkZXJgIGZvciBhIGN1c3RvbSBwbGFjZWhvbGRlciBhcmd1bWVudC5cbiAgXy5wYXJ0aWFsID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihmdW5jLCBib3VuZEFyZ3MpIHtcbiAgICB2YXIgcGxhY2Vob2xkZXIgPSBfLnBhcnRpYWwucGxhY2Vob2xkZXI7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBwbGFjZWhvbGRlciA/IGFyZ3VtZW50c1twb3NpdGlvbisrXSA6IGJvdW5kQXJnc1tpXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgdGhpcywgdGhpcywgYXJncyk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH0pO1xuXG4gIF8ucGFydGlhbC5wbGFjZWhvbGRlciA9IF87XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBrZXlzKSB7XG4gICAga2V5cyA9IGZsYXR0ZW4oa2V5cywgZmFsc2UsIGZhbHNlKTtcbiAgICB2YXIgaW5kZXggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAoaW5kZXggPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICB9KTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtb2l6ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICAgIHZhciBhZGRyZXNzID0gJycgKyAoaGFzaGVyID8gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrZXkpO1xuICAgICAgaWYgKCFoYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oZnVuYywgd2FpdCwgYXJncykge1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH0pO1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gXy5wYXJ0aWFsKF8uZGVsYXksIF8sIDEpO1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGltZW91dCwgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcblxuICAgIHZhciB0aHJvdHRsZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB0aHJvdHRsZWQuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBwcmV2aW91cyA9IDA7XG4gICAgICB0aW1lb3V0ID0gY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhyb3R0bGVkO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbihjb250ZXh0LCBhcmdzKSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIGlmIChhcmdzKSByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG5cbiAgICB2YXIgZGVib3VuY2VkID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcmdzKSB7XG4gICAgICBpZiAodGltZW91dCkgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgaWYgKGltbWVkaWF0ZSkge1xuICAgICAgICB2YXIgY2FsbE5vdyA9ICF0aW1lb3V0O1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICAgIGlmIChjYWxsTm93KSByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IF8uZGVsYXkobGF0ZXIsIHdhaXQsIHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgZGVib3VuY2VkLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWJvdW5jZWQ7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbiAgXy5uZWdhdGUgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gc3RhcnQ7XG4gICAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBvbiBhbmQgYWZ0ZXIgdGhlIE50aCBjYWxsLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCB1cCB0byAoYnV0IG5vdCBpbmNsdWRpbmcpIHRoZSBOdGggY2FsbC5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWVzIDw9IDEpIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gXy5wYXJ0aWFsKF8uYmVmb3JlLCAyKTtcblxuICBfLnJlc3RBcmd1bWVudHMgPSByZXN0QXJndW1lbnRzO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEtleXMgaW4gSUUgPCA5IHRoYXQgd29uJ3QgYmUgaXRlcmF0ZWQgYnkgYGZvciBrZXkgaW4gLi4uYCBhbmQgdGh1cyBtaXNzZWQuXG4gIHZhciBoYXNFbnVtQnVnID0gIXt0b1N0cmluZzogbnVsbH0ucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG4gIHZhciBub25FbnVtZXJhYmxlUHJvcHMgPSBbJ3ZhbHVlT2YnLCAnaXNQcm90b3R5cGVPZicsICd0b1N0cmluZycsXG4gICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2hhc093blByb3BlcnR5JywgJ3RvTG9jYWxlU3RyaW5nJ107XG5cbiAgdmFyIGNvbGxlY3ROb25FbnVtUHJvcHMgPSBmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgbm9uRW51bUlkeCA9IG5vbkVudW1lcmFibGVQcm9wcy5sZW5ndGg7XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuICAgIHZhciBwcm90byA9IF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlIHx8IE9ialByb3RvO1xuXG4gICAgLy8gQ29uc3RydWN0b3IgaXMgYSBzcGVjaWFsIGNhc2UuXG4gICAgdmFyIHByb3AgPSAnY29uc3RydWN0b3InO1xuICAgIGlmIChoYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgLlxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKGhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdC5cbiAgLy8gSW4gY29udHJhc3QgdG8gXy5tYXAgaXQgcmV0dXJucyBhbiBvYmplY3QuXG4gIF8ubWFwT2JqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0ge307XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgIHJlc3VsdHNbY3VycmVudEtleV0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICAvLyBUaGUgb3Bwb3NpdGUgb2YgXy5vYmplY3QuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgLlxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFzc2lnbmVyIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUFzc2lnbmVyID0gZnVuY3Rpb24oa2V5c0Z1bmMsIGRlZmF1bHRzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAoZGVmYXVsdHMpIG9iaiA9IE9iamVjdChvYmopO1xuICAgICAgaWYgKGxlbmd0aCA8IDIgfHwgb2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdLFxuICAgICAgICAgICAga2V5cyA9IGtleXNGdW5jKHNvdXJjZSksXG4gICAgICAgICAgICBsID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKCFkZWZhdWx0cyB8fCBvYmpba2V5XSA9PT0gdm9pZCAwKSBvYmpba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzKTtcblxuICAvLyBBc3NpZ25zIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBvd24gcHJvcGVydGllcyBpbiB0aGUgcGFzc2VkLWluIG9iamVjdChzKS5cbiAgLy8gKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24pXG4gIF8uZXh0ZW5kT3duID0gXy5hc3NpZ24gPSBjcmVhdGVBc3NpZ25lcihfLmtleXMpO1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGtleSBvbiBhbiBvYmplY3QgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdC5cbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcGljayBoZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGBvYmpgIGhhcyBrZXkgYGtleWAuXG4gIHZhciBrZXlJbk9iaiA9IGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgIHJldHVybiBrZXkgaW4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBrZXlzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9LCBpdGVyYXRlZSA9IGtleXNbMF07XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpZiAoa2V5cy5sZW5ndGggPiAxKSBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGtleXNbMV0pO1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGtleUluT2JqO1xuICAgICAga2V5cyA9IGZsYXR0ZW4oa2V5cywgZmFsc2UsIGZhbHNlKTtcbiAgICAgIG9iaiA9IE9iamVjdChvYmopO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgaXRlcmF0ZWUgPSBrZXlzWzBdLCBjb250ZXh0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IF8ubmVnYXRlKGl0ZXJhdGVlKTtcbiAgICAgIGlmIChrZXlzLmxlbmd0aCA+IDEpIGNvbnRleHQgPSBrZXlzWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXlzID0gXy5tYXAoZmxhdHRlbihrZXlzLCBmYWxzZSwgZmFsc2UpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfSk7XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cywgdHJ1ZSk7XG5cbiAgLy8gQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBwcm90b3R5cGUgb2JqZWN0LlxuICAvLyBJZiBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXJlIHByb3ZpZGVkIHRoZW4gdGhleSB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuICAvLyBjcmVhdGVkIG9iamVjdC5cbiAgXy5jcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUsIHByb3BzKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VDcmVhdGUocHJvdG90eXBlKTtcbiAgICBpZiAocHJvcHMpIF8uZXh0ZW5kT3duKHJlc3VsdCwgcHJvcHMpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybnMgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmlzTWF0Y2ggPSBmdW5jdGlvbihvYmplY3QsIGF0dHJzKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMoYXR0cnMpLCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICAgIHZhciBvYmogPSBPYmplY3Qob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSB8fCAhKGtleSBpbiBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxLCBkZWVwRXE7XG4gIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYjtcbiAgICAvLyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgb25seSBlcXVhbCB0byBpdHNlbGYgKHN0cmljdCBjb21wYXJpc29uKS5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgaWYgKGEgIT09IGEpIHJldHVybiBiICE9PSBiO1xuICAgIC8vIEV4aGF1c3QgcHJpbWl0aXZlIGNoZWNrc1xuICAgIHZhciB0eXBlID0gdHlwZW9mIGE7XG4gICAgaWYgKHR5cGUgIT09ICdmdW5jdGlvbicgJiYgdHlwZSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZGVlcEVxKGEsIGIsIGFTdGFjaywgYlN0YWNrKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICBkZWVwRXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgcmVndWxhciBleHByZXNzaW9ucywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgLy8gUmVnRXhwcyBhcmUgY29lcmNlZCB0byBzdHJpbmdzIGZvciBjb21wYXJpc29uIChOb3RlOiAnJyArIC9hL2kgPT09ICcvYS9pJylcbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuICcnICsgYSA9PT0gJycgKyBiO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICAgICAgLy8gT2JqZWN0KE5hTikgaXMgZXF1aXZhbGVudCB0byBOYU4uXG4gICAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAgIC8vIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3Igb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBTeW1ib2xdJzpcbiAgICAgICAgcmV0dXJuIFN5bWJvbFByb3RvLnZhbHVlT2YuY2FsbChhKSA9PT0gU3ltYm9sUHJvdG8udmFsdWVPZi5jYWxsKGIpO1xuICAgIH1cblxuICAgIHZhciBhcmVBcnJheXMgPSBjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgaWYgKCFhcmVBcnJheXMpIHtcbiAgICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHMgb3IgYEFycmF5YHNcbiAgICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiBhQ3RvciBpbnN0YW5jZW9mIGFDdG9yICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG5cbiAgICAvLyBJbml0aWFsaXppbmcgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgLy8gSXQncyBkb25lIGhlcmUgc2luY2Ugd2Ugb25seSBuZWVkIHRoZW0gZm9yIG9iamVjdHMgYW5kIGFycmF5cyBjb21wYXJpc29uLlxuICAgIGFTdGFjayA9IGFTdGFjayB8fCBbXTtcbiAgICBiU3RhY2sgPSBiU3RhY2sgfHwgW107XG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChhcmVBcnJheXMpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoIWVxKGFbbGVuZ3RoXSwgYltsZW5ndGhdLCBhU3RhY2ssIGJTdGFjaykpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICBpZiAoXy5rZXlzKGIpLmxlbmd0aCAhPT0gbGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyXG4gICAgICAgIGtleSA9IGtleXNbbGVuZ3RoXTtcbiAgICAgICAgaWYgKCEoaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IsIGlzTWFwLCBpc1dlYWtNYXAsIGlzU2V0LCBpc1dlYWtTZXQuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJywgJ1N5bWJvbCcsICdNYXAnLCAnV2Vha01hcCcsICdTZXQnLCAnV2Vha1NldCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUgPCA5KSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gaGFzKG9iaiwgJ2NhbGxlZScpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIHNvbWUgdHlwZW9mIGJ1Z3MgaW4gb2xkIHY4LFxuICAvLyBJRSAxMSAoIzE2MjEpLCBTYWZhcmkgOCAoIzE5MjkpLCBhbmQgUGhhbnRvbUpTICgjMjIzNikuXG4gIHZhciBub2RlbGlzdCA9IHJvb3QuZG9jdW1lbnQgJiYgcm9vdC5kb2N1bWVudC5jaGlsZE5vZGVzO1xuICBpZiAodHlwZW9mIC8uLyAhPSAnZnVuY3Rpb24nICYmIHR5cGVvZiBJbnQ4QXJyYXkgIT0gJ29iamVjdCcgJiYgdHlwZW9mIG5vZGVsaXN0ICE9ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhXy5pc1N5bWJvbChvYmopICYmIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gP1xuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBpc05hTihvYmopO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkocGF0aCkpIHtcbiAgICAgIHJldHVybiBoYXMob2JqLCBwYXRoKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBwYXRoW2ldO1xuICAgICAgaWYgKG9iaiA9PSBudWxsIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBvYmogPSBvYmpba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuICEhbGVuZ3RoO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0ZWVzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUHJlZGljYXRlLWdlbmVyYXRpbmcgZnVuY3Rpb25zLiBPZnRlbiB1c2VmdWwgb3V0c2lkZSBvZiBVbmRlcnNjb3JlLlxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLm5vb3AgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gcGFzc2VkIGFuIG9iamVjdCwgd2lsbCB0cmF2ZXJzZSB0aGF0IG9iamVjdOKAmXNcbiAgLy8gcHJvcGVydGllcyBkb3duIHRoZSBnaXZlbiBgcGF0aGAsIHNwZWNpZmllZCBhcyBhbiBhcnJheSBvZiBrZXlzIG9yIGluZGV4ZXMuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkocGF0aCkpIHtcbiAgICAgIHJldHVybiBzaGFsbG93UHJvcGVydHkocGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBkZWVwR2V0KG9iaiwgcGF0aCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7fTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgIHJldHVybiAhXy5pc0FycmF5KHBhdGgpID8gb2JqW3BhdGhdIDogZGVlcEdldChvYmosIHBhdGgpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlc2NhcGVNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgICAnYCc6ICcmI3g2MDsnXG4gIH07XG4gIHZhciB1bmVzY2FwZU1hcCA9IF8uaW52ZXJ0KGVzY2FwZU1hcCk7XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICB2YXIgY3JlYXRlRXNjYXBlciA9IGZ1bmN0aW9uKG1hcCkge1xuICAgIHZhciBlc2NhcGVyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXBbbWF0Y2hdO1xuICAgIH07XG4gICAgLy8gUmVnZXhlcyBmb3IgaWRlbnRpZnlpbmcgYSBrZXkgdGhhdCBuZWVkcyB0byBiZSBlc2NhcGVkLlxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIFRyYXZlcnNlcyB0aGUgY2hpbGRyZW4gb2YgYG9iamAgYWxvbmcgYHBhdGhgLiBJZiBhIGNoaWxkIGlzIGEgZnVuY3Rpb24sIGl0XG4gIC8vIGlzIGludm9rZWQgd2l0aCBpdHMgcGFyZW50IGFzIGNvbnRleHQuIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBmaW5hbFxuICAvLyBjaGlsZCwgb3IgYGZhbGxiYWNrYCBpZiBhbnkgY2hpbGQgaXMgdW5kZWZpbmVkLlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iaiwgcGF0aCwgZmFsbGJhY2spIHtcbiAgICBpZiAoIV8uaXNBcnJheShwYXRoKSkgcGF0aCA9IFtwYXRoXTtcbiAgICB2YXIgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG4gICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgIHJldHVybiBfLmlzRnVuY3Rpb24oZmFsbGJhY2spID8gZmFsbGJhY2suY2FsbChvYmopIDogZmFsbGJhY2s7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwcm9wID0gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpbcGF0aFtpXV07XG4gICAgICBpZiAocHJvcCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHByb3AgPSBmYWxsYmFjaztcbiAgICAgICAgaSA9IGxlbmd0aDsgLy8gRW5zdXJlIHdlIGRvbid0IGNvbnRpbnVlIGl0ZXJhdGluZy5cbiAgICAgIH1cbiAgICAgIG9iaiA9IF8uaXNGdW5jdGlvbihwcm9wKSA/IHByb3AuY2FsbChvYmopIDogcHJvcDtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGU6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6IFwiJ1wiLFxuICAgICdcXFxcJzogJ1xcXFwnLFxuICAgICdcXHInOiAncicsXG4gICAgJ1xcbic6ICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZVJlZ0V4cCA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcblxuICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdO1xuICB9O1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIC8vIE5COiBgb2xkU2V0dGluZ3NgIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIHNldHRpbmdzLCBvbGRTZXR0aW5ncykge1xuICAgIGlmICghc2V0dGluZ3MgJiYgb2xkU2V0dGluZ3MpIHNldHRpbmdzID0gb2xkU2V0dGluZ3M7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKGVzY2FwZVJlZ0V4cCwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2Zmc2V0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHZhciByZW5kZXI7XG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIGFyZ3VtZW50ICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpbnN0YW5jZSA9IF8ob2JqKTtcbiAgICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgY2hhaW5SZXN1bHQgPSBmdW5jdGlvbihpbnN0YW5jZSwgb2JqKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIF8uZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiBfO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICBfLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIFByb3ZpZGUgdW53cmFwcGluZyBwcm94eSBmb3Igc29tZSBtZXRob2RzIHVzZWQgaW4gZW5naW5lIG9wZXJhdGlvbnNcbiAgLy8gc3VjaCBhcyBhcml0aG1ldGljIGFuZCBKU09OIHN0cmluZ2lmaWNhdGlvbi5cbiAgXy5wcm90b3R5cGUudmFsdWVPZiA9IF8ucHJvdG90eXBlLnRvSlNPTiA9IF8ucHJvdG90eXBlLnZhbHVlO1xuXG4gIF8ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLl93cmFwcGVkKTtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufSgpKTtcbiIsImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgTm9ybWFsaXplciB7XG4gICAgY29uc3RydWN0b3IocG9pbnRzKSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gcG9pbnRzLm1hcChlPT5lLnNsaWNlKCkpO1xuICAgICAgICAvL3Bhc3MgdGhlIGRhdGEgb3ZlclxuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwLCBpKT0+e1xuICAgICAgICAgICAgcC5kYXRhID0gcG9pbnRzW2ldLmRhdGE7XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgbmRzID0gdGhpcy5uZHMgPSBfLnVuemlwKHRoaXMucG9pbnRzKTtcbiAgICAgICAgbGV0IG1heEQgPSB0aGlzLm1heEQgPSBbXTtcbiAgICAgICAgbGV0IG1pbkQgPSB0aGlzLm1pbkQgPSBbXTtcbiAgICAgICAgbGV0IHJhbmdlRCA9IHRoaXMucmFuZ2VEID0gW107XG4gICAgICAgIGxldCBub3JtYWxpemVkRCA9IHRoaXMubm9ybWFsaXplZEQgPSBbXTtcbiAgICAgICAgbmRzLmZvckVhY2goKGQsIGkpPT57XG4gICAgICAgICAgICBtYXhEW2ldID0gXy5tYXgoZCk7XG4gICAgICAgICAgICBtaW5EW2ldID0gXy5taW4oZCk7XG4gICAgICAgICAgICByYW5nZURbaV0gPSAobWF4RFtpXSAhPSBtaW5EW2ldKSA/IG1heERbaV0gLSBtaW5EW2ldIDogMTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWREW2ldID0gZC5tYXAoZT0+KGUtbWluRFtpXSkvcmFuZ2VEW2ldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLnBvaW50cy5sZW5ndGg7XG4gICAgICAgIHRoaXMubm9ybWFsaXplZFBvaW50cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLm5vcm1hbGl6ZWRQb2ludHNbaV0gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5uZHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vcm1hbGl6ZWRQb2ludHNbaV1bal0gPSBub3JtYWxpemVkRFtqXVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL0FkZCBvbmUgc3RlcCB0byBwYXNzIHRoZSBkYXRhIG92ZXIgaWYgdGhlcmUgaXMuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubm9ybWFsaXplZFBvaW50c1tpXS5kYXRhID0gdGhpcy5wb2ludHNbaV0uZGF0YTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElucHV0IGEgc2V0IG9mIHBvaW50cyBpbiB0aGlzIHNjYWxlIHJhbmdlIFswLCAxXSBhbmQgd2lsbCBiZSBzY2FsZWQgYmFjayB0b1xuICAgICAqIC0gT3JpZ2luYWwgc2NhbGUgKFttaW5YLCBtYXhYXSwgW21pblksIG1heFldLCBbbWluWiwgbWF4Wl0pXG4gICAgICogQHBhcmFtIHBvaW50c1xuICAgICAqL1xuICAgIHNjYWxlQmFja1BvaW50cyhwb2ludHMpIHtcbiAgICAgICAgcmV0dXJuIHBvaW50cy5tYXAocG9pbnQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2NhbGVCYWNrUG9pbnQocG9pbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnB1dCBhIHNpbmdsZSBwb2ludCBpbiB0aGlzIHNjYWxlIHJhbmdlIFswLCAxXSBhbmQgd2lsbCBiZSBzY2FsZWQgYmFjayB0b1xuICAgICAqIC0gT3JpZ2luYWwgc2NhbGUgKFttaW5YLCBtYXhYXSwgW21pblksIG1heFldLCBbbWluWiwgbWF4Wl0pXG4gICAgICogQHBhcmFtIHBvaW50c1xuICAgICAqL1xuICAgIHNjYWxlQmFja1BvaW50KHBvaW50KSB7XG4gICAgICAgIGxldCBuZXdQb2ludCA9IHBvaW50Lm1hcCgodnMsIGkpPT57XG4gICAgICAgICAgICBsZXQgdiA9IHRoaXMucmFuZ2VEW2ldKnZzICsgdGhpcy5taW5EW2ldO1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3UG9pbnQ7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIExlYWRlckJpbm5lciB7XG4gICAgY29uc3RydWN0b3IocG9pbnRzLCByYWRpdXMpIHtcbiAgICAgICAgLy9UT0RPOiBTaG91bGQgY2hlY2sgaWYgdGhlcmUgYXJlIG1vcmUgdGhhbiAzIHVuaXF1ZSB2YWx1ZXMgaGVyZSBvciBldmVuIGFmdGVyIHRoZSBiaW5uaW5nLlxuICAgICAgICAvL1RPRE86IE1heSBuZWVkIHRvIGNsb25lIHRoZSBwb2ludHMgdG8gYXZvaWQgbW9kaWZ5aW5nIGl0LCBidXQgd2UgZG9uJ3QgZG8gdG8gcmVzZXJ2ZSBvdGhlciBkYXRhIG9yIHRvIG1ha2UgdGhlIHByb2Nlc3MgZmFzdGVyXG4gICAgICAgIC8vIC8vQ2xvbmUgdGhlc2UgdG8gYXZvaWQgbW9kaWZ5aW5nIHRoZW1cbiAgICAgICAgLy8gdGhpcy5wb2ludHMgPSBwb2ludHMubWFwKHA9PnAuc2xpY2UoMCkpO1xuICAgICAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgfVxuXG4gICAgZ2V0IGxlYWRlcnMoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IHRoZUxlYWRlcnMgPSBbXTtcbiAgICAgICAgLy9maW5kIGFsbCB0aGUgbGVhZGVyc1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKHBvaW50ID0+IHtcbiAgICAgICAgICAgIGxldCBsZWFkZXIgPSBjbG9zZXN0TGVhZGVyKHRoZUxlYWRlcnMsIHBvaW50KTtcbiAgICAgICAgICAgIGlmICghbGVhZGVyKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0xlYWRlciA9IFtdO1xuICAgICAgICAgICAgICAgIG5ld0xlYWRlci5zaXRlID0gcG9pbnQuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICB0aGVMZWFkZXJzLnB1c2gobmV3TGVhZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vbm93IGRvIHRoaXMgYWdhaW4gdG8gc2V0IHRoZSBjbG9zZXN0IGxlYWRlci5cbiAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaChwb2ludCA9PiB7XG4gICAgICAgICAgICBsZXQgbGVhZGVyID0gY2xvc2VzdExlYWRlcih0aGVMZWFkZXJzLCBwb2ludCk7XG4gICAgICAgICAgICBsZWFkZXIucHVzaChwb2ludCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhlTGVhZGVycztcblxuICAgICAgICBmdW5jdGlvbiBjbG9zZXN0TGVhZGVyKGxlYWRlcnMsIHBvaW50KSB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gbGVhZGVycy5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgbWluRGlzdGFuY2UgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICAgIGxldCB0aGVMZWFkZXIgPSBudWxsO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGxldCBsID0gbGVhZGVyc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgZCA9IGRpc3RhbmNlKGwuc2l0ZSwgcG9pbnQpO1xuICAgICAgICAgICAgICAgIGlmIChkIDwgc2VsZi5yYWRpdXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlTGVhZGVyID0gbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGVMZWFkZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gICAgbGV0IHN1bXNxdWFyZWQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgZCA9IGFbaV0gLSBiW2ldO1xuICAgICAgICBpZighTnVtYmVyLmlzTmFOKGQpKXtcbiAgICAgICAgICAgIHN1bXNxdWFyZWQgKz0gZCpkO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vRm9yIGNvbXB1dGVyIHN0b3JhZ2UgaXNzdWUsIHNvbWUgY29vcmRpbmF0ZXMgb2YgdGhlIHNhbWUgZGlzdGFuY2UgbWF5IHJldHVybiBkaWZmZXJlbnQgZGlzdGFuY2VzIGlmIHdlIHVzZSBsb25nIGZsb2F0aW5nIHBvaW50XG4gICAgLy9TbyB0YWtlIG9ubHkgMTAgZGlnaXRzIGFmdGVyIHRoZSBmbG9hdGluZyBwb2ludHM9PiB0aGlzIGlzIHByZWNpc2UgZW5vdWdoIGFuZCBzdGlsbCBoYXZlIHRoZSBzYW1lIHZhbHVlcyBmb3IgdHdvIGRpZmZlcmVudCBsaW5lcyBvZiB0aGUgc2FtZSBkaXN0YW5jZVxuICAgIHJldHVybiBNYXRoLnJvdW5kKE1hdGguc3FydChzdW1zcXVhcmVkKSAqIE1hdGgucG93KDEwLCAxMCkpIC8gTWF0aC5wb3coMTAsIDEwKTtcbn0iLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ibWVyc2hvbi8yNWE3NGY3YjFjN2NiZDA3ZTc0NTZhZjFkMmMwN2RhMVxuLy8gU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0tydXNrYWwlMjdzX2FsZ29yaXRobVxcXG4vLyBEZXBlbmRzIG9uIERpc2pvaW50U2V0LlxuaW1wb3J0IF8gZnJvbSBcInVuZGVyc2NvcmVcIjtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZSB0aGUgcGFpcnMgYmV0d2VlbiBub2RlIGFuZCBpdHMgbGlua3MuXG4gKlxuICogQHBhcmFtIGxpbmtzXG4gKiBAcmV0dXJucyBbW1wibm9kZVgsbm9kZVlcIjogQXJyYXkobnVtYmVyT2ZMaW5rc1JlbGF0ZWRUb1RoZU5vZGVzKV1dXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWlyTm9kZUxpbmtzKGxpbmtzKSB7XG4gICAgbGV0IG5lc3RlZEJ5Tm9kZXMgPSB7fTtcbiAgICBsaW5rcy5mb3JFYWNoKGwgPT4ge1xuICAgICAgICBsZXQgc291cmNlS2V5ID0gbC5zb3VyY2Uuam9pbignLCcpO1xuICAgICAgICBpZiAoIW5lc3RlZEJ5Tm9kZXNbc291cmNlS2V5XSkge1xuICAgICAgICAgICAgbmVzdGVkQnlOb2Rlc1tzb3VyY2VLZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgbmVzdGVkQnlOb2Rlc1tzb3VyY2VLZXldLnB1c2gobCk7XG4gICAgICAgIGxldCB0YXJnZXRLZXkgPSBsLnRhcmdldC5qb2luKCcsJyk7XG4gICAgICAgIGlmICghbmVzdGVkQnlOb2Rlc1t0YXJnZXRLZXldKSB7XG4gICAgICAgICAgICBuZXN0ZWRCeU5vZGVzW3RhcmdldEtleV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBuZXN0ZWRCeU5vZGVzW3RhcmdldEtleV0ucHVzaChsKTtcbiAgICB9KTtcbiAgICAvL1BhaXIgdGhlIHJlc3VsdHNcbiAgICBsZXQgcGFpcmVkUmVzdWx0cyA9IF8ucGFpcnMobmVzdGVkQnlOb2Rlcyk7XG4gICAgcmV0dXJuIHBhaXJlZFJlc3VsdHM7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGNvcm5lcnMgKHRocmVlIHZlcnRpY2VzKSBvZiB2ZXJ0aWNlcyBvZiBkZWdyZWUgdHdvIGluIHRoZSBmb3IgbWF0IG9mXG4gKiBwb2ludDEsIHBvaW50MiwgcG9pbnQzID0+IHBvaW50MSBpcyB0aGUgdGhlIHZlcnRleCB3aXRoIGRlZ3JlZSB0d28gKHR3byBlZGdlcyBjb25uZWN0ZWQgdG8gaXQgYXJlIFtwb2ludDEsIHBvaW50Ml0gYW5kIFtwb2ludDEsIHBvaW50M10gKG9yZGVyIG9mIHRoZSBwb2ludHMgaW4gZWFjaCBlZGdlIGlzIG5vdCBpbXBvcnRhbnQpKS5cbiAqIEBwYXJhbSB0cmVlXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFYyQ29ybmVyc0Zyb21UcmVlKHRyZWUpIHtcbiAgICBsZXQgcGFpcmVkUmVzdWx0cyA9IHBhaXJOb2RlTGlua3ModHJlZS5saW5rcyk7XG4gICAgLy9HZXQgYWxsIHBhaXJzIHdpdGggbGVuZ3RoID0gMiAoVjIpXG4gICAgbGV0IGFsbFYyID0gcGFpcmVkUmVzdWx0cy5maWx0ZXIocCA9PiBwWzFdLmxlbmd0aCA9PSAyKTtcblxuICAgIGxldCBhbGxDb3JuZXJzID0gYWxsVjIubWFwKHYyID0+IHtcbiAgICAgICAgbGV0IGNvcm5lciA9IFtdO1xuICAgICAgICAvL0ZpcnN0IHBvaW50IGlzIHRoZSBjb21tb24gdmVydGljZVxuICAgICAgICBjb3JuZXIucHVzaCh2MlswXS5zcGxpdCgnLCcpLm1hcChkID0+ICtkKSk7Ly9tYXAoZD0+K2QpIGlzIHRvIGNvbnZlcnQgdGhlIHN0cmluZ3MgaW50byBkaWdpdHNcbiAgICAgICAgLy9QdXNoIHRoZSBzb3VyY2Ugb3IgdGFyZ2V0IGlmIHRoZXkgYXJlIG5vdCB0aGUgY29tbW9uIHZlcnRpY2VzIG9mIHRoZSB0d28gZWRnZXNcbiAgICAgICAgdjJbMV0uZm9yRWFjaChsaW5rID0+IHtcbiAgICAgICAgICAgIGlmIChsaW5rLnNvdXJjZS5qb2luKCcsJykgIT0gdjJbMF0pIHtcbiAgICAgICAgICAgICAgICBjb3JuZXIucHVzaChsaW5rLnNvdXJjZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvcm5lci5wdXNoKGxpbmsudGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb3JuZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFsbENvcm5lcnM7XG59XG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhbGwgdmVydGljZXMgd2l0aCBkZWdyZWUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIDJcbiAqIEBwYXJhbSB0cmVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxWMk9yR3JlYXRlckZyb21UcmVlKHRyZWUpIHtcbiAgICBsZXQgcGFpcmVkUmVzdWx0cyA9IHBhaXJOb2RlTGlua3ModHJlZS5saW5rcyk7XG4gICAgLy9HZXQgYWxsIHBhaXJzIHdpdGggbGVuZ3RoID49IDIgKFYyKVxuICAgIGxldCBhbGxHVEVWMiA9IHBhaXJlZFJlc3VsdHMuZmlsdGVyKHAgPT4gcFsxXS5sZW5ndGggPj0gMik7XG4gICAgcmV0dXJuIGFsbEdURVYyLm1hcCh2ID0+IHZbMF0uc3BsaXQoJywnKS5tYXAoTnVtYmVyKSk7XG59XG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhbGwgc2luZ2xlIGRlZ3JlZSB2ZXJ0aWNlcyBmcm9tIGEgdHJlZVxuICogQHBhcmFtIHRyZWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFYxc0Zyb21UcmVlKHRyZWUpIHtcbiAgICBsZXQgcGFpcmVkUmVzdWx0cyA9IHBhaXJOb2RlTGlua3ModHJlZS5saW5rcyk7XG4gICAgLy9HZXQgYWxsIHBhaXJzIHdpdGggbGVuZ3RoID0gMSAoVjEpXG4gICAgbGV0IGFsbFYxID0gcGFpcmVkUmVzdWx0cy5maWx0ZXIocCA9PiBwWzFdLmxlbmd0aCA9PSAxKTtcbiAgICByZXR1cm4gYWxsVjEubWFwKHYxID0+IHYxWzBdLnNwbGl0KCcsJykubWFwKE51bWJlcikpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGdyYXBoIGZyb20gbWVzaFxuICogQHBhcmFtIHRyaWFuZ2xlcyBpcyBpbmZvcm0gb2Ygc2V0IG9mIHRyaWFuZ2xlcyBhcyB0aGUgcmVzdWx0IGZyb20gZGVsYXVuYXkgdHJpYW5ndWxhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdyYXBoKHRldHJhaGVkcmEsIHdlaWdodHMpIHtcblxuICAgIGZ1bmN0aW9uIG1ha2VMaW5rKHNvdXJjZUlkLCB0YXJnZXRJZCwgd2VpZ2h0KSB7XG4gICAgICAgIHJldHVybiB7XCJzb3VyY2VcIjogc291cmNlSWQsIFwidGFyZ2V0XCI6IHRhcmdldElkLCBcIndlaWdodFwiOiB3ZWlnaHR9O1xuICAgIH1cblxuICAgIGxldCBncmFwaCA9IHt9O1xuICAgIGdyYXBoLm5vZGVzID0gW107XG4gICAgZ3JhcGgubGlua3MgPSBbXTtcbiAgICAvL0NyZWF0aW5nIG5vZGVzXG4gICAgdGV0cmFoZWRyYS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICB0LmZvckVhY2goaWQgPT4ge1xuICAgICAgICAgICAgaWYgKCFpZEV4aXN0cyhncmFwaC5ub2RlcywgaWQpKSB7XG4gICAgICAgICAgICAgICAgZ3JhcGgubm9kZXMucHVzaChtYWtlTm9kZShpZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vQ3JlYXRpbmcgbGlua3NcbiAgICB0ZXRyYWhlZHJhLmZvckVhY2godCA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBwMSA9IHRbaV07XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHAyID0gdFtqXTtcbiAgICAgICAgICAgICAgICBsZXQgaWQxID0gcDE7XG4gICAgICAgICAgICAgICAgbGV0IGlkMiA9IHAyO1xuICAgICAgICAgICAgICAgIGxldCBkaXN0ID0gZGlzdGFuY2UocDEsIHAyLCB3ZWlnaHRzKTtcbiAgICAgICAgICAgICAgICBsZXQgbGluayA9IG1ha2VMaW5rKGlkMSwgaWQyLCBkaXN0KTtcbiAgICAgICAgICAgICAgICBpZiAoIWxpbmtFeGlzdHMoZ3JhcGgubGlua3MsIGxpbmspKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyYXBoLmxpbmtzLnB1c2gobGluayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1RPRE86IG1heSBzb3J0IHRoZSBpZCBhbHBoYWJldGljYWxseSA9PiB3aGVuIGNyZWF0aW5nID0+IHNvIHdlIGNhbiBqdXN0IGNoZWNrIDEgY29uZGl0aW9uIG9ubHkuXG4gICAgZnVuY3Rpb24gbGlua0V4aXN0cyhsaW5rcywgbGluaykge1xuICAgICAgICBsZXQgbGVuZ3RoID0gbGlua3MubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gbGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGlmIChlcXVhbExpbmtzKGxpbmssIGxpbmtzW2ldKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGdyYXBoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYiwgd2VpZ2h0cykge1xuICAgIGxldCB0b3RhbFN1bVNxdWFyZWQgPSAwO1xuICAgIGlmICghd2VpZ2h0cykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkaWZmID0gKGFbaV0gLSBiW2ldKSAqIChhW2ldIC0gYltpXSk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc05hTihkaWZmKSkge1xuICAgICAgICAgICAgICAgIHRvdGFsU3VtU3F1YXJlZCArPSBkaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZGlmZiA9IChhW2ldIC0gYltpXSkgKiAoYVtpXSAtIGJbaV0pO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNOYU4oZGlmZikpIHtcbiAgICAgICAgICAgICAgICB0b3RhbFN1bVNxdWFyZWQgKz0gZGlmZiAqIHdlaWdodHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4vL0ZvciBjb21wdXRlciBzdG9yYWdlIGlzc3VlLCBzb21lIGNvb3JkaW5hdGVzIG9mIHRoZSBzYW1lIGRpc3RhbmNlIG1heSByZXR1cm4gZGlmZmVyZW50IGRpc3RhbmNlcyBpZiB3ZSB1c2UgbG9uZyBmbG9hdGluZyBwb2ludFxuLy9TbyB0YWtlIG9ubHkgMTAgZGlnaXRzIGFmdGVyIHRoZSBmbG9hdGluZyBwb2ludHM9PiB0aGlzIGlzIHByZWNpc2UgZW5vdWdoIGFuZCBzdGlsbCBoYXZlIHRoZSBzYW1lIHZhbHVlcyBmb3IgdHdvIGRpZmZlcmVudCBsaW5lcyBvZiB0aGUgc2FtZSBkaXN0YW5jZVxuICAgIHJldHVybiBNYXRoLnJvdW5kKE1hdGguc3FydCh0b3RhbFN1bVNxdWFyZWQpICogTWF0aC5wb3coMTAsIDEwKSkgLyBNYXRoLnBvdygxMCwgMTApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxQb2ludHMoaWQxLCBpZDIpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlkMS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaWQxW2ldICE9PSBpZDJbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvaW50RXhpc3RzKHBvaW50cywgcG9pbnQpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcG9pbnQxID0gcG9pbnRzW2ldO1xuICAgICAgICBpZiAoZXF1YWxQb2ludHMocG9pbnQxLCBwb2ludCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsTGlua3MobDEsIGwyKSB7XG4gICAgcmV0dXJuIChlcXVhbFBvaW50cyhsMS5zb3VyY2UsIGwyLnNvdXJjZSkgJiYgZXF1YWxQb2ludHMobDEudGFyZ2V0LCBsMi50YXJnZXQpKSB8fFxuICAgICAgICAoZXF1YWxQb2ludHMobDEuc291cmNlLCBsMi50YXJnZXQpICYmIGVxdWFsUG9pbnRzKGwxLnRhcmdldCwgbDIuc291cmNlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZEV4aXN0cyhub2RlcywgaWQpIHtcbiAgICBsZXQgbGVuZ3RoID0gbm9kZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSBsZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBsZXQgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAoZXF1YWxQb2ludHMobm9kZS5pZCwgaWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlTm9kZShpZCkge1xuICAgIHJldHVybiB7XCJpZFwiOiBpZH07XG59XG5cbi8qKlxuICogY3JlYXRlIHRoZSBtc3RcbiAqIEBwYXJhbSBncmFwaDogaW4gZm9ybSBvZiBub2RlcyBhbmQgbGlua3NcbiAqIEByZXR1cm5zIHt7bm9kZXM6IChzZWxlY3Rpb25fbm9kZXN8bm9kZXMpLCBsaW5rczogQXJyYXl9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXN0KGdyYXBoKSB7XG4gICAgbGV0IHZlcnRpY2VzID0gZ3JhcGgubm9kZXMsXG4gICAgICAgIGVkZ2VzID0gZ3JhcGgubGlua3Muc2xpY2UoMCksXG4gICAgICAgIHNlbGVjdGVkRWRnZXMgPSBbXSxcbiAgICAgICAgZm9yZXN0ID0gbmV3IERpc2pvaW50U2V0KCk7XG5cbiAgICAvLyBFYWNoIHZlcnRleCBiZWdpbnMgXCJkaXNjb25uZWN0ZWRcIiBhbmQgaXNvbGF0ZWQgZnJvbSBhbGwgdGhlIG90aGVycy5cbiAgICB2ZXJ0aWNlcy5mb3JFYWNoKCh2ZXJ0ZXgpID0+IHtcbiAgICAgICAgZm9yZXN0Lm1ha2VTZXQodmVydGV4LmlkKTtcbiAgICB9KTtcblxuICAgIC8vIFNvcnQgZWRnZXMgaW4gZGVzY2VuZGluZyBvcmRlciBvZiB3ZWlnaHQuIFdlIHdpbGwgcG9wIGVkZ2VzIGJlZ2lubmluZ1xuICAgIC8vIGZyb20gdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAgZWRnZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gLShhLndlaWdodCAtIGIud2VpZ2h0KTtcbiAgICB9KTtcblxuICAgIHdoaWxlIChlZGdlcy5sZW5ndGggJiYgZm9yZXN0LnNpemUoKSA+IDEpIHtcbiAgICAgICAgbGV0IGVkZ2UgPSBlZGdlcy5wb3AoKTtcblxuICAgICAgICBpZiAoZm9yZXN0LmZpbmQoZWRnZS5zb3VyY2UpICE9PSBmb3Jlc3QuZmluZChlZGdlLnRhcmdldCkpIHtcbiAgICAgICAgICAgIGZvcmVzdC51bmlvbihlZGdlLnNvdXJjZSwgZWRnZS50YXJnZXQpO1xuICAgICAgICAgICAgc2VsZWN0ZWRFZGdlcy5wdXNoKGVkZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZXM6IHZlcnRpY2VzLFxuICAgICAgICBsaW5rczogc2VsZWN0ZWRFZGdlc1xuICAgIH1cbn1cblxuLy88ZWRpdG9yLWZvbGQgZGVzYz1cIlRoaXMgc2VjdGlvbiBpcyBmb3IgdGhlIGRpc2pvaW50IHNldFwiPlxuZnVuY3Rpb24gRGlzam9pbnRTZXQoKSB7XG4gICAgdGhpcy5pbmRleF8gPSB7fTtcbn1cblxuZnVuY3Rpb24gTm9kZShpZCkge1xuICAgIHRoaXMuaWRfID0gaWQ7XG4gICAgdGhpcy5wYXJlbnRfID0gdGhpcztcbiAgICB0aGlzLnJhbmtfID0gMDtcbn1cblxuRGlzam9pbnRTZXQucHJvdG90eXBlLm1ha2VTZXQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICBpZiAoIXRoaXMuaW5kZXhfW2lkXSkge1xuICAgICAgICBsZXQgY3JlYXRlZCA9IG5ldyBOb2RlKGlkKTtcbiAgICAgICAgdGhpcy5pbmRleF9baWRdID0gY3JlYXRlZDtcbiAgICB9XG59XG5cbi8vIFJldHVybnMgdGhlIGlkIG9mIHRoZSByZXByZXNlbnRhdGl2ZSBlbGVtZW50IG9mIHRoaXMgc2V0IHRoYXQgKGlkKVxuLy8gYmVsb25ncyB0by5cbkRpc2pvaW50U2V0LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgaWYgKHRoaXMuaW5kZXhfW2lkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmluZGV4X1tpZF0ucGFyZW50XztcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gY3VycmVudC5wYXJlbnRfKSB7XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudF87XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50LmlkXztcbn1cblxuRGlzam9pbnRTZXQucHJvdG90eXBlLnVuaW9uID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICBsZXQgeFJvb3QgPSB0aGlzLmluZGV4X1t0aGlzLmZpbmQoeCldO1xuICAgIGxldCB5Um9vdCA9IHRoaXMuaW5kZXhfW3RoaXMuZmluZCh5KV07XG5cbiAgICBpZiAoeFJvb3QgPT09IHVuZGVmaW5lZCB8fCB5Um9vdCA9PT0gdW5kZWZpbmVkIHx8IHhSb290ID09PSB5Um9vdCkge1xuICAgICAgICAvLyB4IGFuZCB5IGFscmVhZHkgYmVsb25nIHRvIHRoZSBzYW1lIHNldC5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh4Um9vdC5yYW5rIDwgeVJvb3QucmFuaykgeyAvLyBNb3ZlIHggaW50byB0aGUgc2V0IHkgaXMgYSBtZW1iZXIgb2YuXG4gICAgICAgIHhSb290LnBhcmVudF8gPSB5Um9vdDtcbiAgICB9IGVsc2UgaWYgKHlSb290LnJhbmtfIDwgeFJvb3QucmFua18pIHsgLy8gTW92ZSB5IGludG8gdGhlIHNldCB4IGlzIGEgbWVtYmVyIG9mLlxuICAgICAgICB5Um9vdC5wYXJlbnRfID0geFJvb3Q7XG4gICAgfSBlbHNlIHsgLy8gQXJiaXRyYXJpbHkgY2hvb3NlIHRvIG1vdmUgeSBpbnRvIHRoZSBzZXQgeCBpcyBhIG1lbWJlciBvZi5cbiAgICAgICAgeVJvb3QucGFyZW50XyA9IHhSb290O1xuICAgICAgICB4Um9vdC5yYW5rXysrO1xuICAgIH1cbn1cblxuLy8gUmV0dXJucyB0aGUgY3VycmVudCBudW1iZXIgb2YgZGlzam9pbnQgc2V0cy5cbkRpc2pvaW50U2V0LnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCB1bmlxdWVJbmRpY2VzID0ge307XG4gICAgT2JqZWN0LmtleXModGhpcy5pbmRleF8pLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICAgIHVuaXF1ZUluZGljZXNbaWRdID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModW5pcXVlSW5kaWNlcykubGVuZ3RoO1xufVxuLy88L2VkaXRvci1mb2xkPiIsImZ1bmN0aW9uIHIocil7dmFyIHQsbixlPXIubGVuZ3RoO2lmKDE9PT1lKXQ9MCxuPXJbMF1bMV07ZWxzZXtmb3IodmFyIG8sYSxoLGY9MCx1PTAsaT0wLGw9MCxnPTA7ZzxlO2crKylmKz1hPShvPXJbZ10pWzBdLHUrPWg9b1sxXSxpKz1hKmEsbCs9YSpoO249dS9lLSh0PShlKmwtZip1KS8oZSppLWYqZikpKmYvZX1yZXR1cm57bTp0LGI6bn19ZnVuY3Rpb24gdChyKXtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHIuYityLm0qdH19ZnVuY3Rpb24gbihyKXtpZigwPT09ci5sZW5ndGgpcmV0dXJuIDA7Zm9yKHZhciB0LG49clswXSxlPTAsbz0xO288ci5sZW5ndGg7bysrKXQ9bityW29dLE1hdGguYWJzKG4pPj1NYXRoLmFicyhyW29dKT9lKz1uLXQrcltvXTplKz1yW29dLXQrbixuPXQ7cmV0dXJuIG4rZX1mdW5jdGlvbiBlKHIpe2lmKDA9PT1yLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJtZWFuIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBkYXRhIHBvaW50XCIpO3JldHVybiBuKHIpL3IubGVuZ3RofWZ1bmN0aW9uIG8ocix0KXt2YXIgbixvLGE9ZShyKSxoPTA7aWYoMj09PXQpZm9yKG89MDtvPHIubGVuZ3RoO28rKyloKz0obj1yW29dLWEpKm47ZWxzZSBmb3Iobz0wO288ci5sZW5ndGg7bysrKWgrPU1hdGgucG93KHJbb10tYSx0KTtyZXR1cm4gaH1mdW5jdGlvbiBhKHIpe2lmKDA9PT1yLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJ2YXJpYW5jZSByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZGF0YSBwb2ludFwiKTtyZXR1cm4gbyhyLDIpL3IubGVuZ3RofWZ1bmN0aW9uIGgocil7aWYoMT09PXIubGVuZ3RoKXJldHVybiAwO3ZhciB0PWEocik7cmV0dXJuIE1hdGguc3FydCh0KX1mdW5jdGlvbiBmKHIsdCl7aWYoci5sZW5ndGg8MilyZXR1cm4gMTtmb3IodmFyIG49MCxlPTA7ZTxyLmxlbmd0aDtlKyspbis9cltlXVsxXTtmb3IodmFyIG89bi9yLmxlbmd0aCxhPTAsaD0wO2g8ci5sZW5ndGg7aCsrKWErPU1hdGgucG93KG8tcltoXVsxXSwyKTtmb3IodmFyIGY9MCx1PTA7dTxyLmxlbmd0aDt1KyspZis9TWF0aC5wb3coclt1XVsxXS10KHJbdV1bMF0pLDIpO3JldHVybiAxLWYvYX1mdW5jdGlvbiB1KHIpe2lmKDA9PT1yLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJtb2RlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBkYXRhIHBvaW50XCIpO2lmKDE9PT1yLmxlbmd0aClyZXR1cm4gclswXTtmb3IodmFyIHQ9clswXSxuPU5hTixlPTAsbz0xLGE9MTthPHIubGVuZ3RoKzE7YSsrKXJbYV0hPT10PyhvPmUmJihlPW8sbj10KSxvPTEsdD1yW2FdKTpvKys7cmV0dXJuIG59ZnVuY3Rpb24gaShyKXtyZXR1cm4gci5zbGljZSgpLnNvcnQoZnVuY3Rpb24ocix0KXtyZXR1cm4gci10fSl9ZnVuY3Rpb24gbChyKXtyZXR1cm4gdShpKHIpKX1mdW5jdGlvbiBnKHIpe2Zvcih2YXIgdCxuPW5ldyBNYXAsZT0wLG89MDtvPHIubGVuZ3RoO28rKyl7dmFyIGE9bi5nZXQocltvXSk7dm9pZCAwPT09YT9hPTE6YSsrLGE+ZSYmKHQ9cltvXSxlPWEpLG4uc2V0KHJbb10sYSl9aWYoMD09PWUpdGhyb3cgbmV3IEVycm9yKFwibW9kZSByZXF1aXJlcyBhdCBsYXN0IG9uZSBkYXRhIHBvaW50XCIpO3JldHVybiB0fWZ1bmN0aW9uIHYocil7aWYoMD09PXIubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcIm1pbiByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZGF0YSBwb2ludFwiKTtmb3IodmFyIHQ9clswXSxuPTE7bjxyLmxlbmd0aDtuKyspcltuXTx0JiYodD1yW25dKTtyZXR1cm4gdH1mdW5jdGlvbiBjKHIpe2lmKDA9PT1yLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJtYXggcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGRhdGEgcG9pbnRcIik7Zm9yKHZhciB0PXJbMF0sbj0xO248ci5sZW5ndGg7bisrKXJbbl0+dCYmKHQ9cltuXSk7cmV0dXJuIHR9ZnVuY3Rpb24gcyhyKXtpZigwPT09ci5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKFwiZXh0ZW50IHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBkYXRhIHBvaW50XCIpO2Zvcih2YXIgdD1yWzBdLG49clswXSxlPTE7ZTxyLmxlbmd0aDtlKyspcltlXT5uJiYobj1yW2VdKSxyW2VdPHQmJih0PXJbZV0pO3JldHVyblt0LG5dfWZ1bmN0aW9uIHAocil7cmV0dXJuIHJbMF19ZnVuY3Rpb24gTShyKXtyZXR1cm4gcltyLmxlbmd0aC0xXX1mdW5jdGlvbiB3KHIpe3JldHVybltyWzBdLHJbci5sZW5ndGgtMV1dfWZ1bmN0aW9uIHEocil7Zm9yKHZhciB0PTAsbj0wO248ci5sZW5ndGg7bisrKXQrPXJbbl07cmV0dXJuIHR9ZnVuY3Rpb24gRShyKXtmb3IodmFyIHQ9MSxuPTA7bjxyLmxlbmd0aDtuKyspdCo9cltuXTtyZXR1cm4gdH1mdW5jdGlvbiB5KHIsdCl7dmFyIG49ci5sZW5ndGgqdDtpZigwPT09ci5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKFwicXVhbnRpbGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGRhdGEgcG9pbnQuXCIpO2lmKHQ8MHx8dD4xKXRocm93IG5ldyBFcnJvcihcInF1YW50aWxlcyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMVwiKTtyZXR1cm4gMT09PXQ/cltyLmxlbmd0aC0xXTowPT09dD9yWzBdOm4lMSE9MD9yW01hdGguY2VpbChuKS0xXTpyLmxlbmd0aCUyPT0wPyhyW24tMV0rcltuXSkvMjpyW25dfWZ1bmN0aW9uIGIocix0LG4sZSl7Zm9yKG49bnx8MCxlPWV8fHIubGVuZ3RoLTE7ZT5uOyl7aWYoZS1uPjYwMCl7dmFyIG89ZS1uKzEsYT10LW4rMSxoPU1hdGgubG9nKG8pLGY9LjUqTWF0aC5leHAoMipoLzMpLHU9LjUqTWF0aC5zcXJ0KGgqZiooby1mKS9vKTthLW8vMjwwJiYodSo9LTEpLGIocix0LE1hdGgubWF4KG4sTWF0aC5mbG9vcih0LWEqZi9vK3UpKSxNYXRoLm1pbihlLE1hdGguZmxvb3IodCsoby1hKSpmL28rdSkpKX12YXIgaT1yW3RdLGw9bixnPWU7Zm9yKGQocixuLHQpLHJbZV0+aSYmZChyLG4sZSk7bDxnOyl7Zm9yKGQocixsLGcpLGwrKyxnLS07cltsXTxpOylsKys7Zm9yKDtyW2ddPmk7KWctLX1yW25dPT09aT9kKHIsbixnKTpkKHIsKytnLGUpLGc8PXQmJihuPWcrMSksdDw9ZyYmKGU9Zy0xKX19ZnVuY3Rpb24gZChyLHQsbil7dmFyIGU9clt0XTtyW3RdPXJbbl0scltuXT1lfWZ1bmN0aW9uIEkocix0KXt2YXIgbj1yLnNsaWNlKCk7aWYoQXJyYXkuaXNBcnJheSh0KSl7IWZ1bmN0aW9uKHIsdCl7Zm9yKHZhciBuPVswXSxlPTA7ZTx0Lmxlbmd0aDtlKyspbi5wdXNoKE4oci5sZW5ndGgsdFtlXSkpO24ucHVzaChyLmxlbmd0aC0xKSxuLnNvcnQoQyk7dmFyIG89WzAsbi5sZW5ndGgtMV07Zm9yKDtvLmxlbmd0aDspe3ZhciBhPU1hdGguY2VpbChvLnBvcCgpKSxoPU1hdGguZmxvb3Ioby5wb3AoKSk7aWYoIShhLWg8PTEpKXt2YXIgZj1NYXRoLmZsb29yKChoK2EpLzIpO1AocixuW2ZdLE1hdGguZmxvb3IobltoXSksTWF0aC5jZWlsKG5bYV0pKSxvLnB1c2goaCxmLGYsYSl9fX0obix0KTtmb3IodmFyIGU9W10sbz0wO288dC5sZW5ndGg7bysrKWVbb109eShuLHRbb10pO3JldHVybiBlfXJldHVybiBQKG4sTihuLmxlbmd0aCx0KSwwLG4ubGVuZ3RoLTEpLHkobix0KX1mdW5jdGlvbiBQKHIsdCxuLGUpe3QlMT09MD9iKHIsdCxuLGUpOihiKHIsdD1NYXRoLmZsb29yKHQpLG4sZSksYihyLHQrMSx0KzEsZSkpfWZ1bmN0aW9uIEMocix0KXtyZXR1cm4gci10fWZ1bmN0aW9uIE4ocix0KXt2YXIgbj1yKnQ7cmV0dXJuIDE9PT10P3ItMTowPT09dD8wOm4lMSE9MD9NYXRoLmNlaWwobiktMTpyJTI9PTA/bi0uNTpufWZ1bmN0aW9uIF8ocix0KXtpZih0PHJbMF0pcmV0dXJuIDA7aWYodD5yW3IubGVuZ3RoLTFdKXJldHVybiAxO3ZhciBuPWZ1bmN0aW9uKHIsdCl7dmFyIG49MCxlPTAsbz1yLmxlbmd0aDtmb3IoO2U8bzspdDw9cltuPWUrbz4+PjFdP289bjplPS1+bjtyZXR1cm4gZX0ocix0KTtpZihyW25dIT09dClyZXR1cm4gbi9yLmxlbmd0aDtuKys7dmFyIGU9ZnVuY3Rpb24ocix0KXt2YXIgbj0wLGU9MCxvPXIubGVuZ3RoO2Zvcig7ZTxvOyl0Pj1yW249ZStvPj4+MV0/ZT0tfm46bz1uO3JldHVybiBlfShyLHQpO2lmKGU9PT1uKXJldHVybiBuL3IubGVuZ3RoO3ZhciBvPWUtbisxO3JldHVybiBvKihlK24pLzIvby9yLmxlbmd0aH1mdW5jdGlvbiBBKHIsdCl7cmV0dXJuIF8oaShyKSx0KX1mdW5jdGlvbiB6KHIpe3ZhciB0PUkociwuNzUpLG49SShyLC4yNSk7aWYoXCJudW1iZXJcIj09dHlwZW9mIHQmJlwibnVtYmVyXCI9PXR5cGVvZiBuKXJldHVybiB0LW59ZnVuY3Rpb24gVShyKXtyZXR1cm4rSShyLC41KX1mdW5jdGlvbiBLKHIpe2Zvcih2YXIgdD1VKHIpLG49W10sZT0wO2U8ci5sZW5ndGg7ZSsrKW4ucHVzaChNYXRoLmFicyhyW2VdLXQpKTtyZXR1cm4gVShuKX1mdW5jdGlvbiBCKHIsdCl7dmFyIG49W107aWYodDwxKXRocm93IG5ldyBFcnJvcihcImNodW5rIHNpemUgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlclwiKTtpZihNYXRoLmZsb29yKHQpIT09dCl0aHJvdyBuZXcgRXJyb3IoXCJjaHVuayBzaXplIG11c3QgYmUgYW4gaW50ZWdlclwiKTtmb3IodmFyIGU9MDtlPHIubGVuZ3RoO2UrPXQpbi5wdXNoKHIuc2xpY2UoZSxlK3QpKTtyZXR1cm4gbn1mdW5jdGlvbiBHKHIsdCxuKXtpZigwPT09ci5sZW5ndGgpcmV0dXJuW107bj1ufHxNYXRoLnJhbmRvbTtmb3IodmFyIGU9ci5sZW5ndGgsbz1bXSxhPTA7YTx0O2ErKyl7dmFyIGg9TWF0aC5mbG9vcihuKCkqZSk7by5wdXNoKHJbaF0pfXJldHVybiBvfWZ1bmN0aW9uIEgocix0KXt0PXR8fE1hdGgucmFuZG9tO2Zvcih2YXIgbixlLG89ci5sZW5ndGg7bz4wOyllPU1hdGguZmxvb3IodCgpKm8tLSksbj1yW29dLHJbb109cltlXSxyW2VdPW47cmV0dXJuIHJ9ZnVuY3Rpb24gSihyLHQpe3JldHVybiBIKHIuc2xpY2UoKS5zbGljZSgpLHQpfWZ1bmN0aW9uIFEocix0LG4pe3JldHVybiBKKHIsbikuc2xpY2UoMCx0KX1mdW5jdGlvbiBSKHIpe2Zvcih2YXIgdCxuPTAsZT0wO2U8ci5sZW5ndGg7ZSsrKTAhPT1lJiZyW2VdPT09dHx8KHQ9cltlXSxuKyspO3JldHVybiBufWZ1bmN0aW9uIFcocix0KXtmb3IodmFyIG49W10sZT0wO2U8cjtlKyspe2Zvcih2YXIgbz1bXSxhPTA7YTx0O2ErKylvLnB1c2goMCk7bi5wdXNoKG8pfXJldHVybiBufWZ1bmN0aW9uIFkocix0LG4sZSl7dmFyIG87aWYocj4wKXt2YXIgYT0oblt0XS1uW3ItMV0pLyh0LXIrMSk7bz1lW3RdLWVbci0xXS0odC1yKzEpKmEqYX1lbHNlIG89ZVt0XS1uW3RdKm5bdF0vKHQrMSk7cmV0dXJuIG88MD8wOm99ZnVuY3Rpb24gWihyLHQsbixlLG8sYSxoKXtpZighKHI+dCkpe3ZhciBmPU1hdGguZmxvb3IoKHIrdCkvMik7ZVtuXVtmXT1lW24tMV1bZi0xXSxvW25dW2ZdPWY7dmFyIHU9bjtyPm4mJih1PU1hdGgubWF4KHUsb1tuXVtyLTFdfHwwKSksdT1NYXRoLm1heCh1LG9bbi0xXVtmXXx8MCk7dmFyIGksbCxnLHY9Zi0xO3Q8ZS5sZW5ndGgtMSYmKHY9TWF0aC5taW4odixvW25dW3QrMV18fDApKTtmb3IodmFyIGM9djtjPj11JiYhKChpPVkoYyxmLGEsaCkpK2Vbbi0xXVt1LTFdPj1lW25dW2ZdKTstLWMpKGw9WSh1LGYsYSxoKStlW24tMV1bdS0xXSk8ZVtuXVtmXSYmKGVbbl1bZl09bCxvW25dW2ZdPXUpLHUrKywoZz1pK2Vbbi0xXVtjLTFdKTxlW25dW2ZdJiYoZVtuXVtmXT1nLG9bbl1bZl09Yyk7WihyLGYtMSxuLGUsbyxhLGgpLFooZisxLHQsbixlLG8sYSxoKX19ZnVuY3Rpb24geChyLHQpe2lmKHQ+ci5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IGdlbmVyYXRlIG1vcmUgY2xhc3NlcyB0aGFuIHRoZXJlIGFyZSBkYXRhIHZhbHVlc1wiKTt2YXIgbj1pKHIpO2lmKDE9PT1SKG4pKXJldHVybltuXTt2YXIgZT1XKHQsbi5sZW5ndGgpLG89Vyh0LG4ubGVuZ3RoKTshZnVuY3Rpb24ocix0LG4pe2Zvcih2YXIgZT10WzBdLmxlbmd0aCxvPXJbTWF0aC5mbG9vcihlLzIpXSxhPVtdLGg9W10sZj0wLHU9dm9pZCAwO2Y8ZTsrK2YpdT1yW2ZdLW8sMD09PWY/KGEucHVzaCh1KSxoLnB1c2godSp1KSk6KGEucHVzaChhW2YtMV0rdSksaC5wdXNoKGhbZi0xXSt1KnUpKSx0WzBdW2ZdPVkoMCxmLGEsaCksblswXVtmXT0wO2Zvcih2YXIgaT0xO2k8dC5sZW5ndGg7KytpKVooaTx0Lmxlbmd0aC0xP2k6ZS0xLGUtMSxpLHQsbixhLGgpfShuLGUsbyk7Zm9yKHZhciBhPVtdLGg9b1swXS5sZW5ndGgtMSxmPW8ubGVuZ3RoLTE7Zj49MDtmLS0pe3ZhciB1PW9bZl1baF07YVtmXT1uLnNsaWNlKHUsaCsxKSxmPjAmJihoPXUtMSl9cmV0dXJuIGF9ZnVuY3Rpb24gVChyLHQpe2lmKHIubGVuZ3RoPDIpcmV0dXJuIHI7Zm9yKHZhciBuPXYociksZT1jKHIpLG89W25dLGE9KGUtbikvdCxoPTE7aDx0O2grKylvLnB1c2gob1swXSthKmgpO3JldHVybiBvLnB1c2goZSksb31mdW5jdGlvbiBEKHIsdCl7aWYoci5sZW5ndGghPT10Lmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJzYW1wbGVDb3ZhcmlhbmNlIHJlcXVpcmVzIHNhbXBsZXMgd2l0aCBlcXVhbCBsZW5ndGhzXCIpO2lmKHIubGVuZ3RoPDIpdGhyb3cgbmV3IEVycm9yKFwic2FtcGxlQ292YXJpYW5jZSByZXF1aXJlcyBhdCBsZWFzdCB0d28gZGF0YSBwb2ludHMgaW4gZWFjaCBzYW1wbGVcIik7Zm9yKHZhciBuPWUociksbz1lKHQpLGE9MCxoPTA7aDxyLmxlbmd0aDtoKyspYSs9KHJbaF0tbikqKHRbaF0tbyk7cmV0dXJuIGEvKHIubGVuZ3RoLTEpfWZ1bmN0aW9uIEwocil7aWYoci5sZW5ndGg8Mil0aHJvdyBuZXcgRXJyb3IoXCJzYW1wbGVWYXJpYW5jZSByZXF1aXJlcyBhdCBsZWFzdCB0d28gZGF0YSBwb2ludHNcIik7cmV0dXJuIG8ociwyKS8oci5sZW5ndGgtMSl9ZnVuY3Rpb24gTyhyKXt2YXIgdD1MKHIpO3JldHVybiBNYXRoLnNxcnQodCl9ZnVuY3Rpb24gWChyLHQpe3JldHVybiBEKHIsdCkvTyhyKS9PKHQpfWZ1bmN0aW9uIFYocil7aWYoci5sZW5ndGg8Myl0aHJvdyBuZXcgRXJyb3IoXCJzYW1wbGVTa2V3bmVzcyByZXF1aXJlcyBhdCBsZWFzdCB0aHJlZSBkYXRhIHBvaW50c1wiKTtmb3IodmFyIHQsbj1lKHIpLG89MCxhPTAsaD0wO2g8ci5sZW5ndGg7aCsrKW8rPSh0PXJbaF0tbikqdCxhKz10KnQqdDt2YXIgZj1NYXRoLnNxcnQoby8oci5sZW5ndGgtMSkpLHU9ci5sZW5ndGg7cmV0dXJuIHUqYS8oKHUtMSkqKHUtMikqTWF0aC5wb3coZiwzKSl9ZnVuY3Rpb24gbShyKXt2YXIgdD1yLmxlbmd0aDtpZih0PDQpdGhyb3cgbmV3IEVycm9yKFwic2FtcGxlS3VydG9zaXMgcmVxdWlyZXMgYXQgbGVhc3QgZm91ciBkYXRhIHBvaW50c1wiKTtmb3IodmFyIG4sbz1lKHIpLGE9MCxoPTAsZj0wO2Y8dDtmKyspYSs9KG49cltmXS1vKSpuLGgrPW4qbipuKm47cmV0dXJuKHQtMSkvKCh0LTIpKih0LTMpKSoodCoodCsxKSpoLyhhKmEpLTMqKHQtMSkpfWZ1bmN0aW9uIEYocil7Zm9yKHZhciB0PW5ldyBBcnJheShyLmxlbmd0aCksbj1bci5zbGljZSgpXSxlPTA7ZTxyLmxlbmd0aDtlKyspdFtlXT0wO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7KWlmKHRbb108byl7dmFyIGE9MDtvJTIhPTAmJihhPXRbb10pO3ZhciBoPXJbYV07clthXT1yW29dLHJbb109aCxuLnB1c2goci5zbGljZSgpKSx0W29dKyssbz0wfWVsc2UgdFtvXT0wLG8rKztyZXR1cm4gbn1mdW5jdGlvbiBrKHIsdCl7dmFyIG4sZSxvLGEsaD1bXTtmb3Iobj0wO248ci5sZW5ndGg7bisrKWlmKDE9PT10KWgucHVzaChbcltuXV0pO2Vsc2UgZm9yKG89ayhyLnNsaWNlKG4rMSxyLmxlbmd0aCksdC0xKSxlPTA7ZTxvLmxlbmd0aDtlKyspKGE9b1tlXSkudW5zaGlmdChyW25dKSxoLnB1c2goYSk7cmV0dXJuIGh9ZnVuY3Rpb24gUyhyLHQpe2Zvcih2YXIgbj1bXSxlPTA7ZTxyLmxlbmd0aDtlKyspaWYoMT09PXQpbi5wdXNoKFtyW2VdXSk7ZWxzZSBmb3IodmFyIG89UyhyLnNsaWNlKGUsci5sZW5ndGgpLHQtMSksYT0wO2E8by5sZW5ndGg7YSsrKW4ucHVzaChbcltlXV0uY29uY2F0KG9bYV0pKTtyZXR1cm4gbn1mdW5jdGlvbiBqKHIsdCxuKXtyZXR1cm4gcisobi1yKS8odCsxKX1mdW5jdGlvbiAkKHIsdCxuLGUpe3JldHVybihyKnQrbiplKS8odCtlKX1mdW5jdGlvbiBycihyLHQsbixlLG8sYSl7dmFyIGg9JCh0LG4sbyxhKTtyZXR1cm4obioocitNYXRoLnBvdyh0LWgsMikpK2EqKGUrTWF0aC5wb3coby1oLDIpKSkvKG4rYSl9ZnVuY3Rpb24gdHIocil7aWYoMD09PXIubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcImdlb21ldHJpY01lYW4gcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGRhdGEgcG9pbnRcIik7Zm9yKHZhciB0PTEsbj0wO248ci5sZW5ndGg7bisrKXtpZihyW25dPD0wKXRocm93IG5ldyBFcnJvcihcImdlb21ldHJpY01lYW4gcmVxdWlyZXMgb25seSBwb3NpdGl2ZSBudW1iZXJzIGFzIGlucHV0XCIpO3QqPXJbbl19cmV0dXJuIE1hdGgucG93KHQsMS9yLmxlbmd0aCl9ZnVuY3Rpb24gbnIocil7aWYoMD09PXIubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcImhhcm1vbmljTWVhbiByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZGF0YSBwb2ludFwiKTtmb3IodmFyIHQ9MCxuPTA7bjxyLmxlbmd0aDtuKyspe2lmKHJbbl08PTApdGhyb3cgbmV3IEVycm9yKFwiaGFybW9uaWNNZWFuIHJlcXVpcmVzIG9ubHkgcG9zaXRpdmUgbnVtYmVycyBhcyBpbnB1dFwiKTt0Kz0xL3Jbbl19cmV0dXJuIHIubGVuZ3RoL3R9ZnVuY3Rpb24gZXIocil7cmV0dXJuIHkociwuNSl9ZnVuY3Rpb24gb3Iocix0LG4pe3JldHVybihyKnQtbikvKHQtMSl9ZnVuY3Rpb24gYXIocil7aWYoMD09PXIubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcInJvb3RNZWFuU3F1YXJlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBkYXRhIHBvaW50XCIpO2Zvcih2YXIgdD0wLG49MDtuPHIubGVuZ3RoO24rKyl0Kz1NYXRoLnBvdyhyW25dLDIpO3JldHVybiBNYXRoLnNxcnQodC9yLmxlbmd0aCl9ZnVuY3Rpb24gaHIocix0KXtyZXR1cm4oZShyKS10KS8oaChyKS9NYXRoLnNxcnQoci5sZW5ndGgpKX1mdW5jdGlvbiBmcihyLHQsbil7dmFyIG89ci5sZW5ndGgsYT10Lmxlbmd0aDtpZighb3x8IWEpcmV0dXJuIG51bGw7bnx8KG49MCk7dmFyIGg9ZShyKSxmPWUodCksdT1MKHIpLGk9TCh0KTtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgaCYmXCJudW1iZXJcIj09dHlwZW9mIGYmJlwibnVtYmVyXCI9PXR5cGVvZiB1JiZcIm51bWJlclwiPT10eXBlb2YgaT8oaC1mLW4pL01hdGguc3FydCgoKG8tMSkqdSsoYS0xKSppKS8obythLTIpKigxL28rMS9hKSk6dm9pZCAwfXZhciB1cj1mdW5jdGlvbigpe3RoaXMudG90YWxDb3VudD0wLHRoaXMuZGF0YT17fX07dXIucHJvdG90eXBlLnRyYWluPWZ1bmN0aW9uKHIsdCl7Zm9yKHZhciBuIGluIHRoaXMuZGF0YVt0XXx8KHRoaXMuZGF0YVt0XT17fSkscil7dmFyIGU9cltuXTt2b2lkIDA9PT10aGlzLmRhdGFbdF1bbl0mJih0aGlzLmRhdGFbdF1bbl09e30pLHZvaWQgMD09PXRoaXMuZGF0YVt0XVtuXVtlXSYmKHRoaXMuZGF0YVt0XVtuXVtlXT0wKSx0aGlzLmRhdGFbdF1bbl1bZV0rK310aGlzLnRvdGFsQ291bnQrK30sdXIucHJvdG90eXBlLnNjb3JlPWZ1bmN0aW9uKHIpe3ZhciB0LG49e307Zm9yKHZhciBlIGluIHIpe3ZhciBvPXJbZV07Zm9yKHQgaW4gdGhpcy5kYXRhKW5bdF09e30sblt0XVtlK1wiX1wiK29dPXRoaXMuZGF0YVt0XVtlXT8odGhpcy5kYXRhW3RdW2VdW29dfHwwKS90aGlzLnRvdGFsQ291bnQ6MH12YXIgYT17fTtmb3IodCBpbiBuKWZvcih2YXIgaCBpbiBhW3RdPTAsblt0XSlhW3RdKz1uW3RdW2hdO3JldHVybiBhfTt2YXIgaXI9ZnVuY3Rpb24oKXt0aGlzLndlaWdodHM9W10sdGhpcy5iaWFzPTB9O2lyLnByb3RvdHlwZS5wcmVkaWN0PWZ1bmN0aW9uKHIpe2lmKHIubGVuZ3RoIT09dGhpcy53ZWlnaHRzLmxlbmd0aClyZXR1cm4gbnVsbDtmb3IodmFyIHQ9MCxuPTA7bjx0aGlzLndlaWdodHMubGVuZ3RoO24rKyl0Kz10aGlzLndlaWdodHNbbl0qcltuXTtyZXR1cm4odCs9dGhpcy5iaWFzKT4wPzE6MH0saXIucHJvdG90eXBlLnRyYWluPWZ1bmN0aW9uKHIsdCl7aWYoMCE9PXQmJjEhPT10KXJldHVybiBudWxsO3IubGVuZ3RoIT09dGhpcy53ZWlnaHRzLmxlbmd0aCYmKHRoaXMud2VpZ2h0cz1yLHRoaXMuYmlhcz0xKTt2YXIgbj10aGlzLnByZWRpY3Qocik7aWYoXCJudW1iZXJcIj09dHlwZW9mIG4mJm4hPT10KXtmb3IodmFyIGU9dC1uLG89MDtvPHRoaXMud2VpZ2h0cy5sZW5ndGg7bysrKXRoaXMud2VpZ2h0c1tvXSs9ZSpyW29dO3RoaXMuYmlhcys9ZX1yZXR1cm4gdGhpc307dmFyIGxyPTFlLTQ7ZnVuY3Rpb24gZ3Iocil7aWYocjwwKXRocm93IG5ldyBFcnJvcihcImZhY3RvcmlhbCByZXF1aXJlcyBhIG5vbi1uZWdhdGl2ZSB2YWx1ZVwiKTtpZihNYXRoLmZsb29yKHIpIT09cil0aHJvdyBuZXcgRXJyb3IoXCJmYWN0b3JpYWwgcmVxdWlyZXMgYW4gaW50ZWdlciBpbnB1dFwiKTtmb3IodmFyIHQ9MSxuPTI7bjw9cjtuKyspdCo9bjtyZXR1cm4gdH1mdW5jdGlvbiB2cihyKXtpZihOdW1iZXIuaXNJbnRlZ2VyKHIpKXJldHVybiByPD0wP05hTjpncihyLTEpO2lmKC0tcjwwKXJldHVybiBNYXRoLlBJLyhNYXRoLnNpbihNYXRoLlBJKi1yKSp2cigtcikpO3ZhciB0PXIrLjI1O3JldHVybiBNYXRoLnBvdyhyL01hdGguRSxyKSpNYXRoLnNxcnQoMipNYXRoLlBJKihyKzEvNikpKigxKzEvMTQ0L01hdGgucG93KHQsMiktMS8xMjk2MC9NYXRoLnBvdyh0LDMpLTI1Ny8yMDczNjAvTWF0aC5wb3codCw0KS01Mi8yNjEyNzM2L01hdGgucG93KHQsNSkrNTc0MTE3My85NDA1ODQ5NjAwL01hdGgucG93KHQsNikrMzc1MjkvMTg4MTE2OTkyMDAvTWF0aC5wb3codCw3KSl9dmFyIGNyPVsuOTk5OTk5OTk5OTk5OTk3MSw1Ny4xNTYyMzU2NjU4NjI5MiwtNTkuNTk3OTYwMzU1NDc1NDksMTQuMTM2MDk3OTc0NzQxNzQ2LC0uNDkxOTEzODE2MDk3NjIwMiwzMzk5NDY0OTk4NDgxMTg5ZS0yMCw0NjUyMzYyODkyNzA0ODU4ZS0yMCwtOTgzNzQ0NzUzMDQ4Nzk1NmUtMjAsLjAwMDE1ODA4ODcwMzIyNDkxMjUsLS4wMDAyMTAyNjQ0NDE3MjQxMDQ4OCwuMDAwMjE3NDM5NjE4MTE1MjEyNjUsLS4wMDAxNjQzMTgxMDY1MzY3NjM5LDg0NDE4MjIzOTgzODUyNzVlLTIwLC0yNjE5MDgzODQwMTU4MTQwOGUtMjEsMzY4OTkxODI2NTk1MzE2MjVlLTIyXSxzcj02MDcvMTI4LHByPU1hdGgubG9nKE1hdGguc3FydCgyKk1hdGguUEkpKTtmdW5jdGlvbiBNcihyKXtpZihyPD0wKXJldHVybiBJbmZpbml0eTtyLS07Zm9yKHZhciB0PWNyWzBdLG49MTtuPDE1O24rKyl0Kz1jcltuXS8ocituKTt2YXIgZT1zcisuNStyO3JldHVybiBwcitNYXRoLmxvZyh0KS1lKyhyKy41KSpNYXRoLmxvZyhlKX1mdW5jdGlvbiB3cihyKXtpZihyPDB8fHI+MSl0aHJvdyBuZXcgRXJyb3IoXCJiZXJub3VsbGlEaXN0cmlidXRpb24gcmVxdWlyZXMgcHJvYmFiaWxpdHkgdG8gYmUgYmV0d2VlbiAwIGFuZCAxIGluY2x1c2l2ZVwiKTtyZXR1cm5bMS1yLHJdfWZ1bmN0aW9uIHFyKHIsdCl7aWYoISh0PDB8fHQ+MXx8cjw9MHx8ciUxIT0wKSl7dmFyIG49MCxlPTAsbz1bXSxhPTE7ZG97b1tuXT1hKk1hdGgucG93KHQsbikqTWF0aC5wb3coMS10LHItbiksZSs9b1tuXSxhPWEqKHItKytuKzEpL259d2hpbGUoZTwxLWxyKTtyZXR1cm4gb319ZnVuY3Rpb24gRXIocil7aWYoIShyPD0wKSl7dmFyIHQ9MCxuPTAsZT1bXSxvPTE7ZG97ZVt0XT1NYXRoLmV4cCgtcikqTWF0aC5wb3cocix0KS9vLG4rPWVbdF0sbyo9Kyt0fXdoaWxlKG48MS1scik7cmV0dXJuIGV9fXZhciB5cj17MTp7Ljk5NTowLC45OTowLC45NzU6MCwuOTU6MCwuOTouMDIsLjU6LjQ1LC4xOjIuNzEsLjA1OjMuODQsLjAyNTo1LjAyLC4wMTo2LjYzLC4wMDU6Ny44OH0sMjp7Ljk5NTouMDEsLjk5Oi4wMiwuOTc1Oi4wNSwuOTU6LjEsLjk6LjIxLC41OjEuMzksLjE6NC42MSwuMDU6NS45OSwuMDI1OjcuMzgsLjAxOjkuMjEsLjAwNToxMC42fSwzOnsuOTk1Oi4wNywuOTk6LjExLC45NzU6LjIyLC45NTouMzUsLjk6LjU4LC41OjIuMzcsLjE6Ni4yNSwuMDU6Ny44MSwuMDI1OjkuMzUsLjAxOjExLjM0LC4wMDU6MTIuODR9LDQ6ey45OTU6LjIxLC45OTouMywuOTc1Oi40OCwuOTU6LjcxLC45OjEuMDYsLjU6My4zNiwuMTo3Ljc4LC4wNTo5LjQ5LC4wMjU6MTEuMTQsLjAxOjEzLjI4LC4wMDU6MTQuODZ9LDU6ey45OTU6LjQxLC45OTouNTUsLjk3NTouODMsLjk1OjEuMTUsLjk6MS42MSwuNTo0LjM1LC4xOjkuMjQsLjA1OjExLjA3LC4wMjU6MTIuODMsLjAxOjE1LjA5LC4wMDU6MTYuNzV9LDY6ey45OTU6LjY4LC45OTouODcsLjk3NToxLjI0LC45NToxLjY0LC45OjIuMiwuNTo1LjM1LC4xOjEwLjY1LC4wNToxMi41OSwuMDI1OjE0LjQ1LC4wMToxNi44MSwuMDA1OjE4LjU1fSw3OnsuOTk1Oi45OSwuOTk6MS4yNSwuOTc1OjEuNjksLjk1OjIuMTcsLjk6Mi44MywuNTo2LjM1LC4xOjEyLjAyLC4wNToxNC4wNywuMDI1OjE2LjAxLC4wMToxOC40OCwuMDA1OjIwLjI4fSw4OnsuOTk1OjEuMzQsLjk5OjEuNjUsLjk3NToyLjE4LC45NToyLjczLC45OjMuNDksLjU6Ny4zNCwuMToxMy4zNiwuMDU6MTUuNTEsLjAyNToxNy41MywuMDE6MjAuMDksLjAwNToyMS45Nn0sOTp7Ljk5NToxLjczLC45OToyLjA5LC45NzU6Mi43LC45NTozLjMzLC45OjQuMTcsLjU6OC4zNCwuMToxNC42OCwuMDU6MTYuOTIsLjAyNToxOS4wMiwuMDE6MjEuNjcsLjAwNToyMy41OX0sMTA6ey45OTU6Mi4xNiwuOTk6Mi41NiwuOTc1OjMuMjUsLjk1OjMuOTQsLjk6NC44NywuNTo5LjM0LC4xOjE1Ljk5LC4wNToxOC4zMSwuMDI1OjIwLjQ4LC4wMToyMy4yMSwuMDA1OjI1LjE5fSwxMTp7Ljk5NToyLjYsLjk5OjMuMDUsLjk3NTozLjgyLC45NTo0LjU3LC45OjUuNTgsLjU6MTAuMzQsLjE6MTcuMjgsLjA1OjE5LjY4LC4wMjU6MjEuOTIsLjAxOjI0LjcyLC4wMDU6MjYuNzZ9LDEyOnsuOTk1OjMuMDcsLjk5OjMuNTcsLjk3NTo0LjQsLjk1OjUuMjMsLjk6Ni4zLC41OjExLjM0LC4xOjE4LjU1LC4wNToyMS4wMywuMDI1OjIzLjM0LC4wMToyNi4yMiwuMDA1OjI4LjN9LDEzOnsuOTk1OjMuNTcsLjk5OjQuMTEsLjk3NTo1LjAxLC45NTo1Ljg5LC45OjcuMDQsLjU6MTIuMzQsLjE6MTkuODEsLjA1OjIyLjM2LC4wMjU6MjQuNzQsLjAxOjI3LjY5LC4wMDU6MjkuODJ9LDE0OnsuOTk1OjQuMDcsLjk5OjQuNjYsLjk3NTo1LjYzLC45NTo2LjU3LC45OjcuNzksLjU6MTMuMzQsLjE6MjEuMDYsLjA1OjIzLjY4LC4wMjU6MjYuMTIsLjAxOjI5LjE0LC4wMDU6MzEuMzJ9LDE1OnsuOTk1OjQuNiwuOTk6NS4yMywuOTc1OjYuMjcsLjk1OjcuMjYsLjk6OC41NSwuNToxNC4zNCwuMToyMi4zMSwuMDU6MjUsLjAyNToyNy40OSwuMDE6MzAuNTgsLjAwNTozMi44fSwxNjp7Ljk5NTo1LjE0LC45OTo1LjgxLC45NzU6Ni45MSwuOTU6Ny45NiwuOTo5LjMxLC41OjE1LjM0LC4xOjIzLjU0LC4wNToyNi4zLC4wMjU6MjguODUsLjAxOjMyLC4wMDU6MzQuMjd9LDE3OnsuOTk1OjUuNywuOTk6Ni40MSwuOTc1OjcuNTYsLjk1OjguNjcsLjk6MTAuMDksLjU6MTYuMzQsLjE6MjQuNzcsLjA1OjI3LjU5LC4wMjU6MzAuMTksLjAxOjMzLjQxLC4wMDU6MzUuNzJ9LDE4OnsuOTk1OjYuMjYsLjk5OjcuMDEsLjk3NTo4LjIzLC45NTo5LjM5LC45OjEwLjg3LC41OjE3LjM0LC4xOjI1Ljk5LC4wNToyOC44NywuMDI1OjMxLjUzLC4wMTozNC44MSwuMDA1OjM3LjE2fSwxOTp7Ljk5NTo2Ljg0LC45OTo3LjYzLC45NzU6OC45MSwuOTU6MTAuMTIsLjk6MTEuNjUsLjU6MTguMzQsLjE6MjcuMiwuMDU6MzAuMTQsLjAyNTozMi44NSwuMDE6MzYuMTksLjAwNTozOC41OH0sMjA6ey45OTU6Ny40MywuOTk6OC4yNiwuOTc1OjkuNTksLjk1OjEwLjg1LC45OjEyLjQ0LC41OjE5LjM0LC4xOjI4LjQxLC4wNTozMS40MSwuMDI1OjM0LjE3LC4wMTozNy41NywuMDA1OjQwfSwyMTp7Ljk5NTo4LjAzLC45OTo4LjksLjk3NToxMC4yOCwuOTU6MTEuNTksLjk6MTMuMjQsLjU6MjAuMzQsLjE6MjkuNjIsLjA1OjMyLjY3LC4wMjU6MzUuNDgsLjAxOjM4LjkzLC4wMDU6NDEuNH0sMjI6ey45OTU6OC42NCwuOTk6OS41NCwuOTc1OjEwLjk4LC45NToxMi4zNCwuOToxNC4wNCwuNToyMS4zNCwuMTozMC44MSwuMDU6MzMuOTIsLjAyNTozNi43OCwuMDE6NDAuMjksLjAwNTo0Mi44fSwyMzp7Ljk5NTo5LjI2LC45OToxMC4yLC45NzU6MTEuNjksLjk1OjEzLjA5LC45OjE0Ljg1LC41OjIyLjM0LC4xOjMyLjAxLC4wNTozNS4xNywuMDI1OjM4LjA4LC4wMTo0MS42NCwuMDA1OjQ0LjE4fSwyNDp7Ljk5NTo5Ljg5LC45OToxMC44NiwuOTc1OjEyLjQsLjk1OjEzLjg1LC45OjE1LjY2LC41OjIzLjM0LC4xOjMzLjIsLjA1OjM2LjQyLC4wMjU6MzkuMzYsLjAxOjQyLjk4LC4wMDU6NDUuNTZ9LDI1OnsuOTk1OjEwLjUyLC45OToxMS41MiwuOTc1OjEzLjEyLC45NToxNC42MSwuOToxNi40NywuNToyNC4zNCwuMTozNC4yOCwuMDU6MzcuNjUsLjAyNTo0MC42NSwuMDE6NDQuMzEsLjAwNTo0Ni45M30sMjY6ey45OTU6MTEuMTYsLjk5OjEyLjIsLjk3NToxMy44NCwuOTU6MTUuMzgsLjk6MTcuMjksLjU6MjUuMzQsLjE6MzUuNTYsLjA1OjM4Ljg5LC4wMjU6NDEuOTIsLjAxOjQ1LjY0LC4wMDU6NDguMjl9LDI3OnsuOTk1OjExLjgxLC45OToxMi44OCwuOTc1OjE0LjU3LC45NToxNi4xNSwuOToxOC4xMSwuNToyNi4zNCwuMTozNi43NCwuMDU6NDAuMTEsLjAyNTo0My4xOSwuMDE6NDYuOTYsLjAwNTo0OS42NX0sMjg6ey45OTU6MTIuNDYsLjk5OjEzLjU3LC45NzU6MTUuMzEsLjk1OjE2LjkzLC45OjE4Ljk0LC41OjI3LjM0LC4xOjM3LjkyLC4wNTo0MS4zNCwuMDI1OjQ0LjQ2LC4wMTo0OC4yOCwuMDA1OjUwLjk5fSwyOTp7Ljk5NToxMy4xMiwuOTk6MTQuMjYsLjk3NToxNi4wNSwuOTU6MTcuNzEsLjk6MTkuNzcsLjU6MjguMzQsLjE6MzkuMDksLjA1OjQyLjU2LC4wMjU6NDUuNzIsLjAxOjQ5LjU5LC4wMDU6NTIuMzR9LDMwOnsuOTk1OjEzLjc5LC45OToxNC45NSwuOTc1OjE2Ljc5LC45NToxOC40OSwuOToyMC42LC41OjI5LjM0LC4xOjQwLjI2LC4wNTo0My43NywuMDI1OjQ2Ljk4LC4wMTo1MC44OSwuMDA1OjUzLjY3fSw0MDp7Ljk5NToyMC43MSwuOTk6MjIuMTYsLjk3NToyNC40MywuOTU6MjYuNTEsLjk6MjkuMDUsLjU6MzkuMzQsLjE6NTEuODEsLjA1OjU1Ljc2LC4wMjU6NTkuMzQsLjAxOjYzLjY5LC4wMDU6NjYuNzd9LDUwOnsuOTk1OjI3Ljk5LC45OToyOS43MSwuOTc1OjMyLjM2LC45NTozNC43NiwuOTozNy42OSwuNTo0OS4zMywuMTo2My4xNywuMDU6NjcuNSwuMDI1OjcxLjQyLC4wMTo3Ni4xNSwuMDA1Ojc5LjQ5fSw2MDp7Ljk5NTozNS41MywuOTk6MzcuNDgsLjk3NTo0MC40OCwuOTU6NDMuMTksLjk6NDYuNDYsLjU6NTkuMzMsLjE6NzQuNCwuMDU6NzkuMDgsLjAyNTo4My4zLC4wMTo4OC4zOCwuMDA1OjkxLjk1fSw3MDp7Ljk5NTo0My4yOCwuOTk6NDUuNDQsLjk3NTo0OC43NiwuOTU6NTEuNzQsLjk6NTUuMzMsLjU6NjkuMzMsLjE6ODUuNTMsLjA1OjkwLjUzLC4wMjU6OTUuMDIsLjAxOjEwMC40MiwuMDA1OjEwNC4yMn0sODA6ey45OTU6NTEuMTcsLjk5OjUzLjU0LC45NzU6NTcuMTUsLjk1OjYwLjM5LC45OjY0LjI4LC41Ojc5LjMzLC4xOjk2LjU4LC4wNToxMDEuODgsLjAyNToxMDYuNjMsLjAxOjExMi4zMywuMDA1OjExNi4zMn0sOTA6ey45OTU6NTkuMiwuOTk6NjEuNzUsLjk3NTo2NS42NSwuOTU6NjkuMTMsLjk6NzMuMjksLjU6ODkuMzMsLjE6MTA3LjU3LC4wNToxMTMuMTQsLjAyNToxMTguMTQsLjAxOjEyNC4xMiwuMDA1OjEyOC4zfSwxMDA6ey45OTU6NjcuMzMsLjk5OjcwLjA2LC45NzU6NzQuMjIsLjk1Ojc3LjkzLC45OjgyLjM2LC41Ojk5LjMzLC4xOjExOC41LC4wNToxMjQuMzQsLjAyNToxMjkuNTYsLjAxOjEzNS44MSwuMDA1OjE0MC4xN319O2Z1bmN0aW9uIGJyKHIsdCxuKXtmb3IodmFyIG89MCxhPXQoZShyKSksaD1bXSxmPVtdLHU9MDt1PHIubGVuZ3RoO3UrKyl2b2lkIDA9PT1oW3JbdV1dJiYoaFtyW3VdXT0wKSxoW3JbdV1dKys7Zm9yKHZhciBpPTA7aTxoLmxlbmd0aDtpKyspdm9pZCAwPT09aFtpXSYmKGhbaV09MCk7Zm9yKHZhciBsIGluIGEpbCBpbiBoJiYoZlsrbF09YVtsXSpyLmxlbmd0aCk7Zm9yKHZhciBnPWYubGVuZ3RoLTE7Zz49MDtnLS0pZltnXTwzJiYoZltnLTFdKz1mW2ddLGYucG9wKCksaFtnLTFdKz1oW2ddLGgucG9wKCkpO2Zvcih2YXIgdj0wO3Y8aC5sZW5ndGg7disrKW8rPU1hdGgucG93KGhbdl0tZlt2XSwyKS9mW3ZdO3JldHVybiB5cltoLmxlbmd0aC0xLTFdW25dPG99dmFyIGRyPU1hdGguc3FydCgyKk1hdGguUEkpLElyPXtnYXVzc2lhbjpmdW5jdGlvbihyKXtyZXR1cm4gTWF0aC5leHAoLS41KnIqcikvZHJ9fSxQcj17bnJkOmZ1bmN0aW9uKHIpe3ZhciB0PU8ociksbj16KHIpO3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiBuJiYodD1NYXRoLm1pbih0LG4vMS4zNCkpLDEuMDYqdCpNYXRoLnBvdyhyLmxlbmd0aCwtLjIpfX07ZnVuY3Rpb24gQ3Iocix0LG4pe3ZhciBlLG87aWYodm9pZCAwPT09dCllPUlyLmdhdXNzaWFuO2Vsc2UgaWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpe2lmKCFJclt0XSl0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24ga2VybmVsIFwiJyt0KydcIicpO2U9SXJbdF19ZWxzZSBlPXQ7aWYodm9pZCAwPT09bilvPVByLm5yZChyKTtlbHNlIGlmKFwic3RyaW5nXCI9PXR5cGVvZiBuKXtpZighUHJbbl0pdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGJhbmR3aWR0aCBtZXRob2QgXCInK24rJ1wiJyk7bz1QcltuXShyKX1lbHNlIG89bjtyZXR1cm4gZnVuY3Rpb24odCl7dmFyIG49MCxhPTA7Zm9yKG49MDtuPHIubGVuZ3RoO24rKylhKz1lKCh0LXJbbl0pL28pO3JldHVybiBhL28vci5sZW5ndGh9fWZ1bmN0aW9uIE5yKHIsdCxuKXtyZXR1cm4oci10KS9ufXZhciBfcj1NYXRoLnNxcnQoMipNYXRoLlBJKTtmdW5jdGlvbiBBcihyKXtmb3IodmFyIHQ9cixuPXIsZT0xO2U8MTU7ZSsrKXQrPW4qPXIqci8oMiplKzEpO3JldHVybiBNYXRoLnJvdW5kKDFlNCooLjUrdC9fcipNYXRoLmV4cCgtcipyLzIpKSkvMWU0fWZvcih2YXIgenI9W10sVXI9MDtVcjw9My4wOTtVcis9LjAxKXpyLnB1c2goQXIoVXIpKTtmdW5jdGlvbiBLcihyKXt2YXIgdD1NYXRoLmFicyhyKSxuPU1hdGgubWluKE1hdGgucm91bmQoMTAwKnQpLHpyLmxlbmd0aC0xKTtyZXR1cm4gcj49MD96cltuXTorKDEtenJbbl0pLnRvRml4ZWQoNCl9ZnVuY3Rpb24gQnIocil7dmFyIHQ9MS8oMSsuNSpNYXRoLmFicyhyKSksbj10Kk1hdGguZXhwKC1NYXRoLnBvdyhyLDIpLTEuMjY1NTEyMjMrMS4wMDAwMjM2OCp0Ky4zNzQwOTE5NipNYXRoLnBvdyh0LDIpKy4wOTY3ODQxOCpNYXRoLnBvdyh0LDMpLS4xODYyODgwNipNYXRoLnBvdyh0LDQpKy4yNzg4NjgwNypNYXRoLnBvdyh0LDUpLTEuMTM1MjAzOTgqTWF0aC5wb3codCw2KSsxLjQ4ODUxNTg3Kk1hdGgucG93KHQsNyktLjgyMjE1MjIzKk1hdGgucG93KHQsOCkrLjE3MDg3Mjc3Kk1hdGgucG93KHQsOSkpO3JldHVybiByPj0wPzEtbjpuLTF9ZnVuY3Rpb24gR3Iocil7dmFyIHQ9OCooTWF0aC5QSS0zKS8oMypNYXRoLlBJKig0LU1hdGguUEkpKSxuPU1hdGguc3FydChNYXRoLnNxcnQoTWF0aC5wb3coMi8oTWF0aC5QSSp0KStNYXRoLmxvZygxLXIqcikvMiwyKS1NYXRoLmxvZygxLXIqcikvdCktKDIvKE1hdGguUEkqdCkrTWF0aC5sb2coMS1yKnIpLzIpKTtyZXR1cm4gcj49MD9uOi1ufWZ1bmN0aW9uIEhyKHIpe3JldHVybiAwPT09cj9yPWxyOnI+PTEmJihyPTEtbHIpLE1hdGguc3FydCgyKSpHcigyKnItMSl9ZnVuY3Rpb24gSnIocix0LG4sbyl7aWYodm9pZCAwPT09byYmKG89MWU0KSx2b2lkIDA9PT1uJiYobj1cInR3b19zaWRlXCIpLFwidHdvX3NpZGVcIiE9PW4mJlwiZ3JlYXRlclwiIT09biYmXCJsZXNzXCIhPT1uKXRocm93IG5ldyBFcnJvcihcImBhbHRlcm5hdGl2ZWAgbXVzdCBiZSBlaXRoZXIgJ3R3b19zaWRlJywgJ2dyZWF0ZXInLCBvciAnbGVzcydcIik7Zm9yKHZhciBhPWUociktZSh0KSxoPW5ldyBBcnJheShvKSxmPXIuY29uY2F0KHQpLHU9TWF0aC5mbG9vcihmLmxlbmd0aC8yKSxpPTA7aTxvO2krKyl7SChmKTt2YXIgbD1mLnNsaWNlKDAsdSksZz1mLnNsaWNlKHUsZi5sZW5ndGgpLHY9ZShsKS1lKGcpO2hbaV09dn12YXIgYz0wO2lmKFwidHdvX3NpZGVcIj09PW4pZm9yKHZhciBzPTA7czw9bztzKyspTWF0aC5hYnMoaFtzXSk+PU1hdGguYWJzKGEpJiYoYys9MSk7ZWxzZSBpZihcImdyZWF0ZXJcIj09PW4pZm9yKHZhciBwPTA7cDw9bztwKyspaFtwXT49YSYmKGMrPTEpO2Vsc2UgZm9yKHZhciBNPTA7TTw9bztNKyspaFtNXTw9YSYmKGMrPTEpO3JldHVybiBjL299ZnVuY3Rpb24gUXIocil7aWYoXCJudW1iZXJcIj09dHlwZW9mIHIpcmV0dXJuIHI8MD8tMTowPT09cj8wOjE7dGhyb3cgbmV3IFR5cGVFcnJvcihcIm5vdCBhIG51bWJlclwiKX1mdW5jdGlvbiBScihyLHQsbixlLG8pe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcihcImZ1bmMgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO2Zvcih2YXIgYT0wO2E8ZTthKyspe3ZhciBoPSh0K24pLzI7aWYoMD09PXIoaCl8fE1hdGguYWJzKChuLXQpLzIpPG8pcmV0dXJuIGg7UXIocihoKSk9PT1RcihyKHQpKT90PWg6bj1ofXRocm93IG5ldyBFcnJvcihcIm1heGltdW0gbnVtYmVyIG9mIGl0ZXJhdGlvbnMgZXhjZWVkZWRcIil9ZXhwb3J0e3IgYXMgbGluZWFyUmVncmVzc2lvbix0IGFzIGxpbmVhclJlZ3Jlc3Npb25MaW5lLGggYXMgc3RhbmRhcmREZXZpYXRpb24sZiBhcyByU3F1YXJlZCxsIGFzIG1vZGUsZyBhcyBtb2RlRmFzdCx1IGFzIG1vZGVTb3J0ZWQsdiBhcyBtaW4sYyBhcyBtYXgscyBhcyBleHRlbnQscCBhcyBtaW5Tb3J0ZWQsTSBhcyBtYXhTb3J0ZWQsdyBhcyBleHRlbnRTb3J0ZWQsbiBhcyBzdW0scSBhcyBzdW1TaW1wbGUsRSBhcyBwcm9kdWN0LEkgYXMgcXVhbnRpbGUseSBhcyBxdWFudGlsZVNvcnRlZCxBIGFzIHF1YW50aWxlUmFuayxfIGFzIHF1YW50aWxlUmFua1NvcnRlZCx6IGFzIGludGVycXVhcnRpbGVSYW5nZSx6IGFzIGlxcixLIGFzIG1lZGlhbkFic29sdXRlRGV2aWF0aW9uLEsgYXMgbWFkLEIgYXMgY2h1bmssRyBhcyBzYW1wbGVXaXRoUmVwbGFjZW1lbnQsSiBhcyBzaHVmZmxlLEggYXMgc2h1ZmZsZUluUGxhY2UsUSBhcyBzYW1wbGUseCBhcyBja21lYW5zLFIgYXMgdW5pcXVlQ291bnRTb3J0ZWQsbyBhcyBzdW1OdGhQb3dlckRldmlhdGlvbnMsVCBhcyBlcXVhbEludGVydmFsQnJlYWtzLEQgYXMgc2FtcGxlQ292YXJpYW5jZSxYIGFzIHNhbXBsZUNvcnJlbGF0aW9uLEwgYXMgc2FtcGxlVmFyaWFuY2UsTyBhcyBzYW1wbGVTdGFuZGFyZERldmlhdGlvbixWIGFzIHNhbXBsZVNrZXduZXNzLG0gYXMgc2FtcGxlS3VydG9zaXMsRiBhcyBwZXJtdXRhdGlvbnNIZWFwLGsgYXMgY29tYmluYXRpb25zLFMgYXMgY29tYmluYXRpb25zUmVwbGFjZW1lbnQsaiBhcyBhZGRUb01lYW4sJCBhcyBjb21iaW5lTWVhbnMscnIgYXMgY29tYmluZVZhcmlhbmNlcyx0ciBhcyBnZW9tZXRyaWNNZWFuLG5yIGFzIGhhcm1vbmljTWVhbixlIGFzIGF2ZXJhZ2UsZSBhcyBtZWFuLFUgYXMgbWVkaWFuLGVyIGFzIG1lZGlhblNvcnRlZCxvciBhcyBzdWJ0cmFjdEZyb21NZWFuLGFyIGFzIHJvb3RNZWFuU3F1YXJlLGFyIGFzIHJtcyxhIGFzIHZhcmlhbmNlLGhyIGFzIHRUZXN0LGZyIGFzIHRUZXN0VHdvU2FtcGxlLHVyIGFzIEJheWVzaWFuQ2xhc3NpZmllcix1ciBhcyBiYXllc2lhbixpciBhcyBQZXJjZXB0cm9uTW9kZWwsaXIgYXMgcGVyY2VwdHJvbixsciBhcyBlcHNpbG9uLGdyIGFzIGZhY3RvcmlhbCx2ciBhcyBnYW1tYSxNciBhcyBnYW1tYWxuLHdyIGFzIGJlcm5vdWxsaURpc3RyaWJ1dGlvbixxciBhcyBiaW5vbWlhbERpc3RyaWJ1dGlvbixFciBhcyBwb2lzc29uRGlzdHJpYnV0aW9uLHlyIGFzIGNoaVNxdWFyZWREaXN0cmlidXRpb25UYWJsZSxiciBhcyBjaGlTcXVhcmVkR29vZG5lc3NPZkZpdCxDciBhcyBrZXJuZWxEZW5zaXR5RXN0aW1hdGlvbixDciBhcyBrZGUsTnIgYXMgelNjb3JlLEtyIGFzIGN1bXVsYXRpdmVTdGROb3JtYWxQcm9iYWJpbGl0eSx6ciBhcyBzdGFuZGFyZE5vcm1hbFRhYmxlLEJyIGFzIGVycm9yRnVuY3Rpb24sQnIgYXMgZXJmLEdyIGFzIGludmVyc2VFcnJvckZ1bmN0aW9uLEhyIGFzIHByb2JpdCxKciBhcyBwZXJtdXRhdGlvblRlc3QsUnIgYXMgYmlzZWN0LGIgYXMgcXVpY2tzZWxlY3QsUXIgYXMgc2lnbixpIGFzIG51bWVyaWNTb3J0fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpbXBsZS1zdGF0aXN0aWNzLm1qcy5tYXBcbiIsImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IHtxdWFudGlsZX0gZnJvbSAnc2ltcGxlLXN0YXRpc3RpY3MnO1xuaW1wb3J0IHtwb2ludEV4aXN0cywgY3JlYXRlR3JhcGgsIG1zdCwgZ2V0QWxsVjJPckdyZWF0ZXJGcm9tVHJlZX0gZnJvbSBcIi4va3J1c2thbC1tc3RcIjtcblxuLyoqXG4gKiBvcHRpb25zIG1heSBjb250YWluIHVwcGVyQm91bmQsIG91dGx5aW5nQ29lZmZpY2llbnQgKDEuNSBvciAzLjApLCBhbmQgd2VpZ2h0cyAoZGlmZmVyZW50IHZhcmlhYmxlcyBtYXkgaGF2ZSBkaWZmZXJlbnQgd2VpZ2h0cylcbiAqL1xuZXhwb3J0IGNsYXNzIE91dGx5aW5nIHtcbiAgICBjb25zdHJ1Y3Rvcih0cmVlLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgbGV0IHVwcGVyQm91bmQgPSBvcHRpb25zLnVwcGVyQm91bmQ7XG4gICAgICAgIGxldCBvdXRseWluZ0NvZWZmaWNpZW50ID0gb3B0aW9ucy5vdXRseWluZ0NvZWZmaWNpZW50O1xuICAgICAgICBsZXQgd2VpZ2h0cyA9IG9wdGlvbnMud2VpZ2h0cztcbiAgICAgICAgLy9DbG9uZSB0aGUgdHJlZSB0byBhdm9pZCBtb2RpZnlpbmcgaXRcbiAgICAgICAgdGhpcy50cmVlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0cmVlKSk7XG4gICAgICAgIHRoaXMudXBwZXJCb3VuZCA9IHVwcGVyQm91bmQ7XG4gICAgICAgIHRoaXMub3V0bHlpbmdDb2VmZmljaWVudCA9IG91dGx5aW5nQ29lZmZpY2llbnQgPyBvdXRseWluZ0NvZWZmaWNpZW50IDogMS41O1xuICAgICAgICAvL0NhbGN1bGF0ZSB0aGUgdXBwZXIgYm91bmQgaWYgaXQgaXMgbm90IHByb3ZpZGVkLlxuICAgICAgICBpZiAoIXVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSBmaW5kVXBwZXJCb3VuZCh0aGlzLnRyZWUsIDEuNSk7XG4gICAgICAgICAgICAvL1NhdmUgaXQgZm9yIGRpc3BsYXlpbmcgcHVycG9zZS5cbiAgICAgICAgICAgIHRoaXMudXBwZXJCb3VuZCA9IHVwcGVyQm91bmQ7XG4gICAgICAgIH1cbiAgICAgICAgLy9NYXJrIHRoZSBsb25nIGxpbmtzXG4gICAgICAgIG1hcmtMb25nTGlua3ModGhpcy50cmVlLCB1cHBlckJvdW5kKTtcbiAgICAgICAgLy9GaW5kaW5nIG5vcm1hbCBub2Rlc1xuICAgICAgICBsZXQgbm9ybWFsTm9kZXMgPSBmaW5kTm9ybWFsTm9kZXModGhpcy50cmVlKTtcbiAgICAgICAgLy9GaW5kaW5nIG91dGx5aW5nIHBvaW50c1xuICAgICAgICB0aGlzLm91dGx5aW5nUG9pbnRzID0gZmluZE91dGx5aW5nUG9pbnRzKHRoaXMudHJlZSwgbm9ybWFsTm9kZXMpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGZpbmRPdXRseWluZ1BvaW50cyh0cmVlLCBub3JtYWxOb2Rlcykge1xuICAgICAgICAgICAgbGV0IG5ld05vZGVzID0gbm9ybWFsTm9kZXM7XG4gICAgICAgICAgICBsZXQgb2xkTm9kZXMgPSB0cmVlLm5vZGVzO1xuICAgICAgICAgICAgLy9HZXQgdGhlIG91dGx5aW5nIHBvaW50c1xuICAgICAgICAgICAgbGV0IG9wcyA9IFtdO1xuICAgICAgICAgICAgb2xkTm9kZXMuZm9yRWFjaChvbiA9PiB7XG4gICAgICAgICAgICAgICAgLy8uaWQgc2luY2Ugd2UgYXJlIGFjY2Vzc2luZyB0byBwb2ludHMgYW5kIHRoZSBub2RlIGlzIGluIGZvcm0gb2Yge2lkOiB0aGVQb2ludH1cbiAgICAgICAgICAgICAgICBpZiAoIXBvaW50RXhpc3RzKG5ld05vZGVzLm1hcChubiA9PiBubi5pZCksIG9uLmlkKSkge1xuICAgICAgICAgICAgICAgICAgICBvcHMucHVzaChvbi5pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Ob3cgbWFyayB0aGUgb3V0bHlpbmcgbGlua3NcbiAgICAgICAgbWFya091dGx5aW5nTGlua3ModGhpcy50cmVlLCB0aGlzLm91dGx5aW5nUG9pbnRzKTtcblxuICAgICAgICAvL0NyZWF0ZSBub25lIG91dGx5aW5nIHRyZWVcbiAgICAgICAgdGhpcy5ub091dGx5aW5nVHJlZSA9IGJ1aWxkTm9PdXRseWluZ1RyZWUodGhpcy50cmVlLCB0aGlzLm91dGx5aW5nUG9pbnRzKTtcblxuICAgICAgICBmdW5jdGlvbiBidWlsZE5vT3V0bHlpbmdUcmVlKHRyZWUsIG91dGx5aW5nUG9pbnRzKSB7XG4gICAgICAgICAgICBsZXQgbm9PdXRseWluZ1RyZWUgPSB7fTtcbiAgICAgICAgICAgIG5vT3V0bHlpbmdUcmVlLm5vZGVzID0gbm9ybWFsTm9kZXM7XG4gICAgICAgICAgICBub091dGx5aW5nVHJlZS5saW5rcyA9IHRyZWUubGlua3MuZmlsdGVyKGwgPT4gbC5pc091dGx5aW5nICE9PSB0cnVlKVxuICAgICAgICAgICAgLy9JZiB0aGUgb3V0bHlpbmcgbm9kZXMgaGFzIHRoZSBkZWdyZWUgb2YgMiBvciBncmVhdGVyID0+IGl0IHdpbGwgYnJlYWsgdGhlIHRyZWUgaW50byBzdWJ0cmVlcyA9PiBzbyB3ZSBuZWVkIHRvIHJlYnVpbGQgdGhlIHRyZWUuXG4gICAgICAgICAgICAvL1Rha2UgdGhlIG91dGx5aW5nIHBvaW50c1xuICAgICAgICAgICAgbGV0IG91dGx5aW5nUG9pbnRzU3RyID0gb3V0bHlpbmdQb2ludHMubWFwKHAgPT4gcC5qb2luKCcsJykpO1xuICAgICAgICAgICAgbGV0IHYyT3JHcmVhdGVyU3RyID0gZ2V0QWxsVjJPckdyZWF0ZXJGcm9tVHJlZSh0cmVlKS5tYXAocCA9PiBwLmpvaW4oJywnKSk7XG5cbiAgICAgICAgICAgIGxldCBkaWZmID0gXy5kaWZmZXJlbmNlKG91dGx5aW5nUG9pbnRzU3RyLCB2Mk9yR3JlYXRlclN0cik7XG4gICAgICAgICAgICBpZiAoZGlmZi5sZW5ndGggPCBvdXRseWluZ1BvaW50c1N0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvL01lYW5zIHRoZXJlIGlzIG91dGx5aW5nIG5vZGUocykgd2l0aCBkZWdyZWUgMiBvciBoaWdoZXIgKHNvIHdlIHNob3VsZCByZWJ1aWxkIHRoZSB0cmVlKVxuICAgICAgICAgICAgICAgIGxldCBncmFwaCA9IGNyZWF0ZUdyYXBoKG5vT3V0bHlpbmdUcmVlLm5vZGVzLm1hcChuID0+IG4uaWQpLCB3ZWlnaHRzKVxuICAgICAgICAgICAgICAgIG5vT3V0bHlpbmdUcmVlID0gbXN0KGdyYXBoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBub091dGx5aW5nVHJlZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGZpbmROb3JtYWxOb2Rlcyh0cmVlKSB7XG4gICAgICAgICAgICAvL1JlbW92ZSBsb25nIGxpbmtzXG4gICAgICAgICAgICBsZXQgbm9ybWFsTGlua3MgPSB0cmVlLmxpbmtzLmZpbHRlcihsID0+ICFsLmlzTG9uZyk7XG4gICAgICAgICAgICAvL1JlbW92ZSBvdXRseWluZyBub2RlcyAobm9kZXMgYXJlIG5vdCBpbiBhbnkgbm9uZS1sb25nIGxpbmtzKVxuICAgICAgICAgICAgbGV0IGFsbE5vZGVzV2l0aExpbmtzID0gW107XG4gICAgICAgICAgICBub3JtYWxMaW5rcy5mb3JFYWNoKGwgPT4ge1xuICAgICAgICAgICAgICAgIGFsbE5vZGVzV2l0aExpbmtzLnB1c2gobC5zb3VyY2UpO1xuICAgICAgICAgICAgICAgIGFsbE5vZGVzV2l0aExpbmtzLnB1c2gobC50YXJnZXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbGxOb2Rlc1dpdGhMaW5rcyA9IF8udW5pcShhbGxOb2Rlc1dpdGhMaW5rcywgZmFsc2UsIGQgPT4gZC5qb2luKCcsJykpO1xuICAgICAgICAgICAgbGV0IG5vcm1hbE5vZGVzID0gYWxsTm9kZXNXaXRoTGlua3MubWFwKG4gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7aWQ6IG59O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbm9ybWFsTm9kZXM7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtYXJrTG9uZ0xpbmtzKHRyZWUsIHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgIHRyZWUubGlua3MuZm9yRWFjaChsID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobC53ZWlnaHQgPiB1cHBlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGwuaXNMb25nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGZpbmRVcHBlckJvdW5kKHRyZWUsIGNvZWZmaWNpZW50KSB7XG4gICAgICAgICAgICBsZXQgYWxsTGVuZ3RocyA9IHRyZWUubGlua3MubWFwKGwgPT4gbC53ZWlnaHQpLFxuICAgICAgICAgICAgICAgIHExID0gcXVhbnRpbGUoYWxsTGVuZ3RocywgMC4yNSksXG4gICAgICAgICAgICAgICAgcTMgPSBxdWFudGlsZShhbGxMZW5ndGhzLCAwLjc1KSxcbiAgICAgICAgICAgICAgICBpcXIgPSBxMyAtIHExLFxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQgPSBxMyArIGNvZWZmaWNpZW50ICogaXFyO1xuICAgICAgICAgICAgcmV0dXJuIHVwcGVyQm91bmQ7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtYXJrT3V0bHlpbmdMaW5rcyh0cmVlLCBvdXRseWluZ1BvaW50cykge1xuICAgICAgICAgICAgaWYgKG91dGx5aW5nUG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL0NoZWNrIHRoZSBsb25nIGxpbmtzIG9ubHlcbiAgICAgICAgICAgICAgICB0cmVlLmxpbmtzLmZpbHRlcihsID0+IGwuaXNMb25nKS5mb3JFYWNoKGwgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvL0Fsc28gY2hlY2sgaWYgdGhlIGxpbmsgY29udGFpbnMgb3V0bHlpbmcgcG9pbnRzLlxuICAgICAgICAgICAgICAgICAgICBpZiAocG9pbnRFeGlzdHMob3V0bHlpbmdQb2ludHMsIGwuc291cmNlKSB8fCBwb2ludEV4aXN0cyhvdXRseWluZ1BvaW50cywgbC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsLmlzT3V0bHlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIG91dGx5aW5nIHNjb3JlXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBzY29yZSgpIHtcbiAgICAgICAgbGV0IHRvdGFsTGVuZ3RocyA9IDA7XG4gICAgICAgIGxldCB0b3RhbE91dGx5aW5nTGVuZ3RocyA9IDA7XG4gICAgICAgIHRoaXMudHJlZS5saW5rcy5mb3JFYWNoKGwgPT4ge1xuICAgICAgICAgICAgdG90YWxMZW5ndGhzICs9IGwud2VpZ2h0O1xuICAgICAgICAgICAgLy9JZiB0aGVyZSBhcmUgb3V0bHlpbmcgcG9pbnRzIGZpcnN0LlxuICAgICAgICAgICAgaWYgKGwuaXNPdXRseWluZykge1xuICAgICAgICAgICAgICAgIHRvdGFsT3V0bHlpbmdMZW5ndGhzICs9IGwud2VpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRvdGFsT3V0bHlpbmdMZW5ndGhzIC8gdG90YWxMZW5ndGhzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgb3V0bHlpbmcgbGlua3NcbiAgICAgKi9cbiAgICBsaW5rcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLm91dGx5aW5nTGlua3MpIHtcbiAgICAgICAgICAgIHRoaXMub3V0bHlpbmdMaW5rcyA9IHRoaXMudHJlZS5saW5rcy5maWx0ZXIobCA9PiBsLmlzT3V0bHlpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLm91dGx5aW5nTGlua3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIG91dGx5aW5nIGxpbmtzIGFuZCBub2RlcyBhbmQgcmV0dXJuIGEgbmV3IHRyZWUgd2l0aG91dCBvdXRseWluZyBwb2ludHMvZWRnZXNcbiAgICAgKi9cbiAgICByZW1vdmVPdXRseWluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9PdXRseWluZ1RyZWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgb3V0bHlpbmcgcG9pbnRzIChpbiBmb3JtIG9mIHBvaW50cywgbm90IG5vZGUgb2JqZWN0KS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgcG9pbnRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vdXRseWluZ1BvaW50cztcbiAgICB9XG59IiwiaW1wb3J0IHtxdWFudGlsZX0gZnJvbSAnc2ltcGxlLXN0YXRpc3RpY3MnO1xuXG5leHBvcnQgY2xhc3MgU2tld2VkIHtcbiAgICBjb25zdHJ1Y3Rvcih0cmVlKSB7XG4gICAgICAgIC8vQ2xvbmUgdGhlIHRyZWUgdG8gYXZvaWQgbW9kaWZ5aW5nIGl0XG4gICAgICAgIHRoaXMudHJlZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodHJlZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgc2tld2VkIHNjb3JlXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBzY29yZSgpIHtcbiAgICAgICAgbGV0IGFsbExlbmd0aHMgPSB0aGlzLnRyZWUubGlua3MubWFwKGw9Pmwud2VpZ2h0KSxcbiAgICAgICAgcTkwID0gcXVhbnRpbGUoYWxsTGVuZ3RocywgLjkpLFxuICAgICAgICBxNTAgPSBxdWFudGlsZShhbGxMZW5ndGhzLCAuNSksXG4gICAgICAgIHExMCA9IHF1YW50aWxlKGFsbExlbmd0aHMsIC4xKTtcbiAgICAgICAgaWYocTkwIT1xMTApe1xuICAgICAgICAgICAgcmV0dXJuIChxOTAtcTUwKS8ocTkwLXExMCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQge3F1YW50aWxlfSBmcm9tICdzaW1wbGUtc3RhdGlzdGljcyc7XG5cbmV4cG9ydCBjbGFzcyBTcGFyc2Uge1xuICAgIGNvbnN0cnVjdG9yKHRyZWUpIHtcbiAgICAgICAgLy9DbG9uZSB0aGUgdHJlZSB0byBhdm9pZCBtb2RpZnlpbmcgaXRcbiAgICAgICAgdGhpcy50cmVlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0cmVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBzcGFyc2Ugc2NvcmVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNjb3JlKCkge1xuICAgICAgICBsZXQgYWxsTGVuZ3RocyA9IHRoaXMudHJlZS5saW5rcy5tYXAobD0+bC53ZWlnaHQpLFxuICAgICAgICAgICAgcTkwID0gcXVhbnRpbGUoYWxsTGVuZ3RocywgLjkpO1xuICAgICAgICBsZXQgbiA9IHRoaXMudHJlZS5saW5rc1swXS5zb3VyY2UubGVuZ3RoO1xuICAgICAgICByZXR1cm4gcTkwL01hdGguc3FydChNYXRoLmZsb29yKDIqbi8zKSk7XG4gICAgfVxufSIsImltcG9ydCB7bWF4fSBmcm9tICdzaW1wbGUtc3RhdGlzdGljcyc7XG5pbXBvcnQge3BhaXJOb2RlTGlua3MsIGVxdWFsTGlua3MsIHBvaW50RXhpc3RzfSBmcm9tIFwiLi9rcnVza2FsLW1zdFwiO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5cbmV4cG9ydCBjbGFzcyBDbHVtcHkge1xuICAgIGNvbnN0cnVjdG9yKHRyZWUpIHtcbiAgICAgICAgLy9DbG9uZSB0aGUgdHJlZSB0byBhdm9pZCBtb2RpZnlpbmcgaXRcbiAgICAgICAgdGhpcy50cmVlID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0cmVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjbHVtcHkgc2NvcmVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNjb3JlKCkge1xuICAgICAgICBsZXQgYWxsUnVudFJhdGlvcyA9IFtdO1xuICAgICAgICB0aGlzLnRyZWUubGlua3MuZm9yRWFjaChsaW5rID0+e1xuICAgICAgICAgICAgbGV0IHJnID0gdGhpcy5ydW50R3JhcGgobGluayk7XG4gICAgICAgICAgICBpZihyZy5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgYWxsUnVudFJhdGlvcy5wdXNoKHRoaXMubWF4TGVuZ3RoKHJnKS9saW5rLndlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZihhbGxSdW50UmF0aW9zLmxlbmd0aD4wKXtcbiAgICAgICAgICAgIC8vT25seSBpZiB0aGVyZSBhcmUgc29tZSBydW50IGdyYXBoc1xuICAgICAgICAgICAgcmV0dXJuIG1heChhbGxSdW50UmF0aW9zLm1hcChycj0+MS1ycikpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vSW4gY2FzZSBhbGwgbGVuZ3RocyBhcmUgZXF1YWwgPT4gdGhlbiB0aGUgc2NvcmUgaXMgMFxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW50R3JhcGgobGluayl7XG4gICAgICAgIC8vTGlua3MgdGhhdCBhcmUgZ3JlYXRlciBvciBlcXVhbCB0byB0aGUgY3VycmVudGx5IGNoZWNraW5nIGxpbmtcbiAgICAgICAgbGV0IGdyZWF0ZXJPckVxdWFsTGlua3MgPSB0aGlzLnRyZWUubGlua3MuZmlsdGVyKGw9Pmwud2VpZ2h0IDwgbGluay53ZWlnaHQpO1xuICAgICAgICAvL1JlbW92ZSB0aGUgY3VycmVudGx5IGNoZWNraW5nIGxpbmsuXG4gICAgICAgIGdyZWF0ZXJPckVxdWFsTGlua3MgPSBncmVhdGVyT3JFcXVhbExpbmtzLmZpbHRlcihsPT4hZXF1YWxMaW5rcyhsLCBsaW5rKSk7XG4gICAgICAgIGxldCBwYWlyZWRSZXN1bHRzID0gcGFpck5vZGVMaW5rcyhncmVhdGVyT3JFcXVhbExpbmtzKTtcblxuICAgICAgICAvL1Byb2Nlc3MgdGhlIHNvdXJjZSBzaWRlLlxuICAgICAgICBsZXQgc291cmNlQ29ubmVjdGVkTm9kZXMgPSBbbGluay5zb3VyY2VdO1xuICAgICAgICBsZXQgc291cmNlQ29ubmVjdGVkTGlua3MgPSB0aGlzLmdldENvbm5lY3RlZExpbmtzKHNvdXJjZUNvbm5lY3RlZE5vZGVzLCBwYWlyZWRSZXN1bHRzKTtcblxuICAgICAgICBsZXQgdGFyZ2V0Q29ubmVjdGVkTm9kZXMgPSBbbGluay50YXJnZXRdO1xuICAgICAgICBsZXQgdGFyZ2V0Q29ubmVjdGVkTGlua3MgPSB0aGlzLmdldENvbm5lY3RlZExpbmtzKHRhcmdldENvbm5lY3RlZE5vZGVzLCBwYWlyZWRSZXN1bHRzKTtcblxuICAgICAgICByZXR1cm4gc291cmNlQ29ubmVjdGVkTGlua3MubGVuZ3RoIDwgdGFyZ2V0Q29ubmVjdGVkTGlua3MubGVuZ3RoP3NvdXJjZUNvbm5lY3RlZExpbmtzOnRhcmdldENvbm5lY3RlZExpbmtzO1xuICAgIH1cblxuXG4gICAgZ2V0Q29ubmVjdGVkTGlua3MoY29ubmVjdGVkTm9kZXMsIHBhaXJlZFJlc3VsdHMpIHtcbiAgICAgICAgbGV0IHByb2Nlc3NlZE5vZGVzID0gW107XG4gICAgICAgIGxldCBjb25uZWN0ZWRMaW5rcyA9IFtdO1xuICAgICAgICB3aGlsZSAoY29ubmVjdGVkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy9DYW4gc3RvcCBlYXJsaWVyIGlmIHRoaXMgaXMgaGF2aW5nIG1vcmUgdGhhbiBoYWxmIG9mIHRoZSBsaW5rcyBpbiB0aGUgd2hvbGUgdHJlZS5cbiAgICAgICAgICAgIGlmKGNvbm5lY3RlZExpbmtzLmxlbmd0aCA+IHRoaXMudHJlZS5saW5rcy5sZW5ndGggKyAxKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBmaXJzdE5vZGUgPSBfLmZpcnN0KGNvbm5lY3RlZE5vZGVzKTtcbiAgICAgICAgICAgIC8vUmVtb3ZlZCB0aGUgcHJvY2Vzc2VkIG5vZGVzXG4gICAgICAgICAgICBjb25uZWN0ZWROb2RlcyA9IF8ud2l0aG91dChjb25uZWN0ZWROb2RlcywgZmlyc3ROb2RlKTtcbiAgICAgICAgICAgIC8vQWRkIGl0IHRvIHRoZSBwcm9jZXNzZWQgbm9kZVxuICAgICAgICAgICAgcHJvY2Vzc2VkTm9kZXMucHVzaChmaXJzdE5vZGUpO1xuICAgICAgICAgICAgLy9GaW5kIHRoZSBlZGdlcyBjb25uZWN0ZWQgdG8gdGhhdCBub2RlLlxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHBhaXJlZFJlc3VsdHMuZmluZChwID0+IHBbMF0gPT09IGZpcnN0Tm9kZS5qb2luKFwiLFwiKSk7XG4gICAgICAgICAgICBsZXQgbGlua3MgPSByZXN1bHQ/cmVzdWx0WzFdOltdO1xuICAgICAgICAgICAgY29ubmVjdGVkTGlua3MgPSBjb25uZWN0ZWRMaW5rcy5jb25jYXQobGlua3MpO1xuICAgICAgICAgICAgLy9BZGQgbmV3IG5vZGVzIHRvIGJlIHByb2Nlc3NlZFxuICAgICAgICAgICAgbGlua3MuZm9yRWFjaChsID0+IHtcbiAgICAgICAgICAgICAgICAvL0lmIHRoZSBub2RlIGluIHRoZSBjb25uZWN0ZWQgbGluayBpcyBub3QgcHJvY2Vzc2VkID0+IHRoZW4gYWRkIGl0IHRvIGJlIHByb2Nlc3NlZCAodG8gZXhwYW5kIGxhdGVyIG9uKS5cbiAgICAgICAgICAgICAgICBpZiAoIXBvaW50RXhpc3RzKHByb2Nlc3NlZE5vZGVzLCBsLnNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkTm9kZXMucHVzaChsLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKCFwb2ludEV4aXN0cyhwcm9jZXNzZWROb2RlcywgbC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RlZE5vZGVzLnB1c2gobC50YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25uZWN0ZWRMaW5rcztcbiAgICB9XG5cbiAgICBtYXhMZW5ndGgocnVudEdyYXBoKXtcbiAgICAgICAgaWYocnVudEdyYXBoLmxlbmd0aD09PTApe1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heChydW50R3JhcGgubWFwKGw9Pmwud2VpZ2h0KSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtnZXRBbGxWMkNvcm5lcnNGcm9tVHJlZSwgZ2V0QWxsVjFzRnJvbVRyZWV9IGZyb20gXCIuL2tydXNrYWwtbXN0XCI7XG5cbmV4cG9ydCBjbGFzcyBTdHJpbmd5IHtcbiAgICBjb25zdHJ1Y3Rvcih0cmVlKSB7XG4gICAgICAgIC8vQ2xvbmUgdGhlIHRyZWUgdG8gYXZvaWQgbW9kaWZ5aW5nIGl0XG4gICAgICAgIHRoaXMudHJlZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodHJlZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgc3RyaWF0ZWQgc2NvcmVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNjb3JlKCkge1xuICAgICAgICAvL0xvb3AgdGhyb3VnaCB0aGUgbm9kZXMuXG4gICAgICAgIGxldCB2ZXJ0aWNlc0NvdW50ID0gdGhpcy50cmVlLm5vZGVzLmxlbmd0aDtcbiAgICAgICAgbGV0IHYyQ291bnQgPSB0aGlzLmdldEFsbFYyQ29ybmVycygpLmxlbmd0aDtcbiAgICAgICAgbGV0IHYxQ291bnQgPSB0aGlzLmdldEFsbFYxcygpLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHYyQ291bnQvKHZlcnRpY2VzQ291bnQtdjFDb3VudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGNvcm5lcnMgKHRocmVlIHZlcnRpY2VzKSBvZiB2ZXJ0aWNlcyBvZiBkZWdyZWUgdHdvIGluIHRoZSBmb3IgbWF0IG9mXG4gICAgICogcG9pbnQxLCBwb2ludDIsIHBvaW50MyA9PiBwb2ludDEgaXMgdGhlIHRoZSB2ZXJ0ZXggd2l0aCBkZWdyZWUgdHdvICh0d28gZWRnZXMgY29ubmVjdGVkIHRvIGl0IGFyZSBbcG9pbnQxLCBwb2ludDJdIGFuZCBbcG9pbnQxLCBwb2ludDNdIChvcmRlciBvZiB0aGUgcG9pbnRzIGluIGVhY2ggZWRnZSBpcyBub3QgaW1wb3J0YW50KSkuXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIGdldEFsbFYyQ29ybmVycygpe1xuICAgICAgICByZXR1cm4gZ2V0QWxsVjJDb3JuZXJzRnJvbVRyZWUodGhpcy50cmVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgZ2V0QWxsVjFzKCl7XG4gICAgICAgIHJldHVybiBnZXRBbGxWMXNGcm9tVHJlZSh0aGlzLnRyZWUpO1xuICAgIH1cbn1cbiIsImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmV4cG9ydCBjbGFzcyBNb25vdG9uaWMge1xuICAgIGNvbnN0cnVjdG9yKHBvaW50cykge1xuICAgICAgICAvL0Nsb25lIGl0IGluIG9yZGVyIHRvIGF2b2lkIG1vZGlmeWluZyBpdC5cbiAgICAgICAgdGhpcy5wb2ludHMgPSBwb2ludHMuc2xpY2UoMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBtb25vdG9uaWMgc2NvcmVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNjb3JlKCkge1xuICAgICAgICBsZXQgc3BlYXJtYW5zID0gW107XG4gICAgICAgIGxldCB2YXJpYWJsZXMgPSBfLnVuemlwKHRoaXMucG9pbnRzKTtcbiAgICAgICAgbGV0IGxlbmd0aCA9IHZhcmlhYmxlcy5sZW5ndGg7XG5cbiAgICAgICAgLy9DYWxjdWxhdGUgdGhlIHNwZWFybWFuIGZvciBhbGwgcGFpcnMgb2YgdmFyaWFibGVzLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgbGV0IHYxID0gdmFyaWFibGVzW2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkrMTsgaiA8IGxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHYyID0gdmFyaWFibGVzW2pdO1xuICAgICAgICAgICAgICAgIGxldCByID0gY29tcHV0ZVNwZWFybWFucyh2MSwgdjIpO1xuICAgICAgICAgICAgICAgIHNwZWFybWFucy5wdXNoKHIqcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8ubWF4KHNwZWFybWFucyk7XG5cbiAgICAgICAgLyoqQWRvcHRlZCBmcm9tOiBodHRwczovL2JsLm9ja3Mub3JnL25rdWxsbWFuL2Y2NWQ1NjE5ODQzZGMyMmUwNjFkOTU3MjQ5MTIxNDA4KiovXG4gICAgICAgIGZ1bmN0aW9uIGNvbXB1dGVTcGVhcm1hbnMoYXJyWCwgYXJyWSkge1xuICAgICAgICAgICAgLy8gc2ltcGxlIGVycm9yIGhhbmRsaW5nIGZvciBpbnB1dCBhcnJheXMgb2Ygbm9uZXF1YWwgbGVuZ3Roc1xuICAgICAgICAgICAgaWYgKGFyclgubGVuZ3RoICE9PSBhcnJZLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBudW1iZXIgb2Ygb2JzZXJ2YXRpb25zXG4gICAgICAgICAgICBsZXQgbiA9IGFyclgubGVuZ3RoO1xuXG4gICAgICAgICAgICAvLyByYW5rIGRhdGFzZXRzXG4gICAgICAgICAgICBsZXQgeFJhbmtlZCA9IHJhbmtBcnJheShhcnJYKSxcbiAgICAgICAgICAgICAgICB5UmFua2VkID0gcmFua0FycmF5KGFyclkpO1xuXG4gICAgICAgICAgICAvLyBzdW0gb2YgZGlzdGFuY2VzIGJldHdlZW4gcmFua3NcbiAgICAgICAgICAgIGxldCBkc3EgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkc3EgKz0gTWF0aC5wb3coeFJhbmtlZFtpXSAtIHlSYW5rZWRbaV0sIDIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb21wdXRlIGNvcnJlY3Rpb24gZm9yIHRpZXNcbiAgICAgICAgICAgIGxldCB4VGllcyA9IGNvdW50VGllcyhhcnJYKSxcbiAgICAgICAgICAgICAgICB5VGllcyA9IGNvdW50VGllcyhhcnJZKTtcbiAgICAgICAgICAgIGxldCB4Q29ycmVjdGlvbiA9IDAsXG4gICAgICAgICAgICAgICAgeUNvcnJlY3Rpb24gPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgdGllTGVuZ3RoIGluIHhUaWVzKSB7XG4gICAgICAgICAgICAgICAgeENvcnJlY3Rpb24gKz0geFRpZXNbdGllTGVuZ3RoXSAqIHRpZUxlbmd0aCAqIChNYXRoLnBvdyh0aWVMZW5ndGgsIDIpIC0gMSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhDb3JyZWN0aW9uIC89IDEyLjA7XG4gICAgICAgICAgICBmb3IgKGxldCB0aWVMZW5ndGggaW4geVRpZXMpIHtcbiAgICAgICAgICAgICAgICB5Q29ycmVjdGlvbiArPSB5VGllc1t0aWVMZW5ndGhdICogdGllTGVuZ3RoICogKE1hdGgucG93KHRpZUxlbmd0aCwgMikgLSAxKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeUNvcnJlY3Rpb24gLz0gMTIuMDtcblxuICAgICAgICAgICAgLy8gZGVub21pbmF0b3JcbiAgICAgICAgICAgIGxldCBkZW5vbWluYXRvciA9IG4gKiAoTWF0aC5wb3cobiwgMikgLSAxKSAvIDYuMDtcblxuICAgICAgICAgICAgLy8gY29tcHV0ZSByaG9cbiAgICAgICAgICAgIGxldCByaG8gPSBkZW5vbWluYXRvciAtIGRzcSAtIHhDb3JyZWN0aW9uIC0geUNvcnJlY3Rpb247XG4gICAgICAgICAgICByaG8gLz0gTWF0aC5zcXJ0KChkZW5vbWluYXRvciAtIDIgKiB4Q29ycmVjdGlvbikgKiAoZGVub21pbmF0b3IgLSAyICogeUNvcnJlY3Rpb24pKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJobztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBDb21wdXRlcyB0aGUgcmFuayBhcnJheSBmb3IgYXJyLCB3aGVyZSBlYWNoIGVudHJ5IGluIGFyciBpc1xuICAgICAgICAgKiBhc3NpZ25lZCBhIHZhbHVlIDEgdGhydSBuLCB3aGVyZSBuIGlzIGFyci5sZW5ndGguXG4gICAgICAgICAqXG4gICAgICAgICAqIFRpZWQgZW50cmllcyBpbiBhcnIgYXJlIGVhY2ggZ2l2ZW4gdGhlIGF2ZXJhZ2UgcmFuayBvZiB0aGUgdGllcy5cbiAgICAgICAgICogTG93ZXIgcmFua3MgYXJlIG5vdCBpbmNyZWFzZWRcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHJhbmtBcnJheShhcnIpIHtcblxuICAgICAgICAgICAgLy8gcmFua2luZyB3aXRob3V0IGF2ZXJhZ2luZ1xuICAgICAgICAgICAgbGV0IHNvcnRlZCA9IGFyci5zbGljZSgpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYiAtIGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IHJhbmtzID0gYXJyLnNsaWNlKCkubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvcnRlZC5pbmRleE9mKHYpICsgMVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGNvdW50cyBvZiBlYWNoIHJhbmtcbiAgICAgICAgICAgIGxldCBjb3VudHMgPSB7fTtcbiAgICAgICAgICAgIHJhbmtzLmZvckVhY2goZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICBjb3VudHNbeF0gPSAoY291bnRzW3hdIHx8IDApICsgMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhdmVyYWdlIGR1cGxpY2F0ZXNcbiAgICAgICAgICAgIHJhbmtzID0gcmFua3MubWFwKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHggKyAwLjUgKiAoKGNvdW50c1t4XSB8fCAwKSAtIDEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByYW5rcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBDb3VudHMgdGhlIG51bWJlciBvZiB0aWVzIGluIGFyciwgYW5kIHJldHVybnNcbiAgICAgICAgICogYW4gb2JqZWN0IHdpdGhcbiAgICAgICAgICogYSBrZXkgZm9yIGVhY2ggdGllIGxlbmd0aCAoYW4gZW50cnkgbiBmb3IgZWFjaCBuLXdheSB0aWUpIGFuZFxuICAgICAgICAgKiBhIHZhbHVlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIG51bWJlciBvZiBrZXktd2F5IChuLXdheSkgdGllc1xuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY291bnRUaWVzKGFycikge1xuICAgICAgICAgICAgbGV0IHRpZXMgPSB7fSxcbiAgICAgICAgICAgICAgICBhcnJTb3J0ZWQgPSBhcnIuc2xpY2UoKS5zb3J0KCksXG4gICAgICAgICAgICAgICAgY3VyclZhbHVlID0gYXJyU29ydGVkWzBdLFxuICAgICAgICAgICAgICAgIHRpZUxlbmd0aCA9IDE7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJyU29ydGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyclNvcnRlZFtpXSA9PT0gY3VyclZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpZUxlbmd0aCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aWVMZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGllc1t0aWVMZW5ndGhdID09PSB1bmRlZmluZWQpIHRpZXNbdGllTGVuZ3RoXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWVzW3RpZUxlbmd0aF0rKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdXJyVmFsdWUgPSBhcnJTb3J0ZWRbaV07XG4gICAgICAgICAgICAgICAgICAgIHRpZUxlbmd0aCA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRpZUxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAodGllc1t0aWVMZW5ndGhdID09PSB1bmRlZmluZWQpIHRpZXNbdGllTGVuZ3RoXSA9IDA7XG4gICAgICAgICAgICAgICAgdGllc1t0aWVMZW5ndGhdKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGllcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7Tm9ybWFsaXplcn0gZnJvbSBcIi4vbW9kdWxlcy9ub3JtYWxpemVyXCI7XG5pbXBvcnQge0xlYWRlckJpbm5lcn0gZnJvbSBcIi4vbW9kdWxlcy9sZWFkZXJCaW5uZXJcIjtcbmltcG9ydCB7X30gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB7Y3JlYXRlR3JhcGgsIG1zdCwgZXF1YWxQb2ludHN9IGZyb20gXCIuL21vZHVsZXMva3J1c2thbC1tc3RcIjtcbmltcG9ydCB7T3V0bHlpbmd9IGZyb20gXCIuL21vZHVsZXMvb3V0bHlpbmdcIjtcbmltcG9ydCB7U2tld2VkfSBmcm9tIFwiLi9tb2R1bGVzL3NrZXdlZFwiO1xuaW1wb3J0IHtTcGFyc2V9IGZyb20gXCIuL21vZHVsZXMvc3BhcnNlXCI7XG5pbXBvcnQge0NsdW1weX0gZnJvbSBcIi4vbW9kdWxlcy9jbHVtcHlcIjtcbi8vIGltcG9ydCB7U3RyaWF0ZWR9IGZyb20gXCIuL21vZHVsZXMvc3RyaWF0ZWRcIjtcbi8vIGltcG9ydCB7Q29udmV4fSBmcm9tIFwiLi9tb2R1bGVzL2NvbnZleFwiO1xuLy8gaW1wb3J0IHtTa2lubnl9IGZyb20gXCIuL21vZHVsZXMvc2tpbm55XCI7XG5pbXBvcnQge1N0cmluZ3l9IGZyb20gXCIuL21vZHVsZXMvc3RyaW5neVwiO1xuaW1wb3J0IHtNb25vdG9uaWN9IGZyb20gXCIuL21vZHVsZXMvbW9ub3RvbmljXCI7XG5cbihmdW5jdGlvbiAod2luZG93KSB7XG4gICAgLyoqXG4gICAgICogaW5pdGlhbGl6ZSBhIHNjYWdub3N0aWNzbmQgb2JqZWN0XG4gICAgICogQHBhcmFtIGlucHV0UG9pbnRzICAgeypbXVtdfSBzZXQgb2YgcG9pbnRzIGZyb20gdGhlIHNjYXR0ZXIgcGxvdFxuICAgICAqIEByZXR1cm5zIHsqW11bXX1cbiAgICAgKi9cbiAgICB3aW5kb3cuc2NhZ25vc3RpY3NuZCA9IGZ1bmN0aW9uIChpbnB1dFBvaW50cywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGxldCBkaW1zID0gaW5wdXRQb2ludHNbMF0ubGVuZ3RoO1xuICAgICAgICAvL0Nsb25lIGl0IHRvIGF2b2lkIG1vZGlmeWluZyBpdC5cbiAgICAgICAgbGV0IHBvaW50cyA9IGlucHV0UG9pbnRzLm1hcChlID0+IGUuc2xpY2UoKSk7XG4gICAgICAgIC8vQWRkIG9uZSBzdGVwIHRvIHBhc3MgdGhlIGRhdGEgb3ZlciBpZiB0aGVyZSBpcy5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBvaW50c1tpXS5kYXRhID0gaW5wdXRQb2ludHNbaV0uZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbm9ybWFsaXplZFBvaW50cyA9IHBvaW50cztcblxuICAgICAgICBpZiAob3B0aW9ucy5pc05vcm1hbGl6ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGV0IG5vcm1hbGl6ZXIgPSBuZXcgTm9ybWFsaXplcihwb2ludHMpO1xuICAgICAgICAgICAgbm9ybWFsaXplZFBvaW50cyA9IG5vcm1hbGl6ZXIubm9ybWFsaXplZFBvaW50cztcbiAgICAgICAgICAgIG91dHB1dFZhbHVlKFwibm9ybWFsaXplZFBvaW50c1wiLCBub3JtYWxpemVkUG9pbnRzKTtcbiAgICAgICAgICAgIG91dHB1dFZhbHVlKFwibm9ybWFsaXplclwiLCBub3JtYWxpemVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBiaW5UeXBlID0gb3B0aW9ucy5iaW5UeXBlO1xuICAgICAgICAvKioqKioqVGhpcyBzZWN0aW9uIGlzIGFib3V0IHRoZSBvdXRseWluZyBzY29yZSBhbmQgb3V0bHlpbmcgc2NvcmUgcmVzdWx0cyoqKioqKi9cbiAgICAgICAgbGV0IG91dGx5aW5nVXBwZXJCb3VuZCA9IG9wdGlvbnMub3V0bHlpbmdVcHBlckJvdW5kO1xuICAgICAgICBsZXQgb3V0bHlpbmdDb2VmZmljaWVudCA9IG9wdGlvbnMub3V0bHlpbmdDb2VmZmljaWVudDtcblxuICAgICAgICAvKioqKioqVGhpcyBzZWN0aW9uIGlzIGFib3V0IGZpbmRpbmcgbnVtYmVyIG9mIGJpbnMgYW5kIGJpbm5lcnMqKioqKiovXG4gICAgICAgIGxldCBzaXRlcyA9IG51bGw7XG4gICAgICAgIGxldCBiaW5zID0gbnVsbDtcbiAgICAgICAgbGV0IGJpbm5lciA9IG51bGw7XG4gICAgICAgIGxldCBiaW5TaXplID0gbnVsbDtcbiAgICAgICAgbGV0IGJpblJhZGl1cyA9IDA7XG4gICAgICAgIGxldCBzdGFydEJpbkdyaWRTaXplID0gb3B0aW9ucy5zdGFydEJpbkdyaWRTaXplO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmlzQmlubmVkID09PSB1bmRlZmluZWQpIHsvL09ubHkgZG8gdGhlIGJpbm5pbmcgaWYgbmVlZGVkLlxuICAgICAgICAgICAgbGV0IGluY3JlbWVudEEgPSBvcHRpb25zLmluY3JlbWVudEEgPyBvcHRpb25zLmluY3JlbWVudEEgOiAyO1xuICAgICAgICAgICAgbGV0IGluY3JlbWVudEIgPSBvcHRpb25zLmluY3JlbWVudEIgPyBvcHRpb25zLmluY3JlbWVudEIgOiAwO1xuICAgICAgICAgICAgbGV0IGRlY3JlbWVudEEgPSBvcHRpb25zLmRlY3JlbWVudEEgPyBvcHRpb25zLmRlY3JlbWVudEEgOiAxIC8gMjtcbiAgICAgICAgICAgIGxldCBkZWNyZW1lbnRCID0gb3B0aW9ucy5kZWNyZW1lbnRCID8gb3B0aW9ucy5kZWNyZW1lbnRCIDogMDtcblxuICAgICAgICAgICAgaWYgKHN0YXJ0QmluR3JpZFNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0QmluR3JpZFNpemUgPSAyMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJpbnMgPSBbXTtcbiAgICAgICAgICAgIC8vRGVmYXVsdCBudW1iZXIgb2YgYmluc1xuICAgICAgICAgICAgbGV0IG1pbk51bU9mQmlucyA9IDMwO1xuICAgICAgICAgICAgbGV0IG1heE51bU9mQmlucyA9IDIwMDtcbiAgICAgICAgICAgIGxldCBtaW5CaW5zID0gb3B0aW9ucy5taW5CaW5zO1xuICAgICAgICAgICAgbGV0IG1heEJpbnMgPSBvcHRpb25zLm1heEJpbnM7XG4gICAgICAgICAgICBpZiAobWluQmlucykge1xuICAgICAgICAgICAgICAgIG1pbk51bU9mQmlucyA9IG1pbkJpbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWF4Qmlucykge1xuICAgICAgICAgICAgICAgIG1heE51bU9mQmlucyA9IG1heEJpbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL0Rvbid0IGRvIHRoZSBiaW5uaW5nIGlmIHRoZSB1bmlxdWUgc2V0IG9mIHZhbHVlcyBhcmUgbGVzcyB0aGFuIG1pbiBudW1iZXIuIEp1c3QgcmV0dXJuIHRoZSB1bmlxdWUgc2V0LlxuICAgICAgICAgICAgbGV0IHVuaXF1ZUtleXMgPSBfLnVuaXEobm9ybWFsaXplZFBvaW50cy5tYXAocCA9PiBwLmpvaW4oJywnKSkpO1xuICAgICAgICAgICAgbGV0IGdyb3VwcyA9IF8uZ3JvdXBCeShub3JtYWxpemVkUG9pbnRzLCBwID0+IHAuam9pbignLCcpKTtcbiAgICAgICAgICAgIGlmICh1bmlxdWVLZXlzLmxlbmd0aCA8IG1pbk51bU9mQmlucykge1xuICAgICAgICAgICAgICAgIHVuaXF1ZUtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYmluID0gZ3JvdXBzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIC8vVGFrZSB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgcG9pbnQgaW4gdGhlIGdyb3VwIHRvIGJlIHRoZSBiaW4gbGVhZGVyICh0aGV5IHNob3VsZCBoYXZlIHRoZSBzYW1lIHBvaW50cyBhY3R1YWxseT0+IHNvIGp1c3QgdGFrZSB0aGUgZmlyc3Qgb25lLlxuICAgICAgICAgICAgICAgICAgICBiaW4uc2l0ZSA9IGJpblswXS5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICBiaW5zLnB1c2goYmluKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICAvL1N0YXJ0IHdpdGggYmluU2l6ZSB4IGJpblNpemUgeCBiaW5TaXplLi4uIGJpbnMsIGFuZCB0aGVuIGluY3JlYXNlIGl0IGFzIGJpblNpemUgPSBiaW5TaXplICogaW5jcmVtZW50QSArIGluY3JlbWVudEIgb3IgYmluU2l6ZSA9IGJpblNpemUgKiBkZWNyZW1lbnRBICsgZGVjcmVtZW50Qi5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJpblNpemUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpblNpemUgPSBzdGFydEJpbkdyaWRTaXplO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbnMubGVuZ3RoID4gbWF4TnVtT2ZCaW5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5TaXplID0gYmluU2l6ZSAqIGRlY3JlbWVudEEgKyBkZWNyZW1lbnRCO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbnMubGVuZ3RoIDwgbWluTnVtT2ZCaW5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5TaXplID0gYmluU2l6ZSAqIGluY3JlbWVudEEgKyBpbmNyZW1lbnRCO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5UeXBlID09PSBcImhleGFnb25cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLy8gVGhpcyBzZWN0aW9uIHVzZXMgaGV4YWdvbiBiaW5uaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgc2hvcnREaWFnb25hbCA9IDEvYmluU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJpblJhZGl1cyA9IE1hdGguc3FydCgzKSpzaG9ydERpYWdvbmFsLzI7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBiaW5uZXIgPSBuZXcgQmlubmVyKCkucmFkaXVzKGJpblJhZGl1cykuZXh0ZW50KFtbMCwgMF0sIFsxLCAxXV0pOy8vZXh0ZW50IGZyb20gWzAsIDBdIHRvIFsxLCAxXSBzaW5jZSB3ZSBhbHJlYWR5IG5vcm1hbGl6ZWQgZGF0YS5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJpbnMgPSBiaW5uZXIuaGV4YmluKG5vcm1hbGl6ZWRQb2ludHMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFiaW5UeXBlIHx8IGJpblR5cGUgPT09IFwibGVhZGVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgc2VjdGlvbiB1c2VzIGxlYWRlciBiaW5uZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpblJhZGl1cyA9IE1hdGguc3FydChkaW1zICogTWF0aC5wb3coMSAvIChiaW5TaXplICogMiksIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbm5lciA9IG5ldyBMZWFkZXJCaW5uZXIobm9ybWFsaXplZFBvaW50cywgYmluUmFkaXVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbnMgPSBiaW5uZXIubGVhZGVycztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gd2hpbGUgKGJpbnMubGVuZ3RoID4gbWF4TnVtT2ZCaW5zIHx8IGJpbnMubGVuZ3RoIDwgbWluTnVtT2ZCaW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNpdGVzID0gYmlucy5tYXAoZCA9PiBkLnNpdGUpOyAvLz0+c2l0ZXMgYXJlIHRoZSBzZXQgb2YgY2VudGVycyBvZiBhbGwgYmluc1xuICAgICAgICAgICAgLyoqKioqKlRoaXMgc2VjdGlvbiBpcyBhYm91dCB0aGUgYmlubmluZyBhbmQgYmlubmluZyByZXN1bHRzKioqKioqL1xuICAgICAgICAgICAgb3V0cHV0VmFsdWUoXCJiaW5uZXJcIiwgYmlubmVyKTtcbiAgICAgICAgICAgIG91dHB1dFZhbHVlKFwiYmluc1wiLCBiaW5zKTtcbiAgICAgICAgICAgIG91dHB1dFZhbHVlKFwiYmluU2l6ZVwiLCBiaW5TaXplKTtcbiAgICAgICAgICAgIG91dHB1dFZhbHVlKFwiYmluUmFkaXVzXCIsIGJpblJhZGl1cylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpdGVzID0gbm9ybWFsaXplZFBvaW50cztcbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dFZhbHVlKFwiYmlubmVkU2l0ZXNcIiwgc2l0ZXMpO1xuXG4gICAgICAgIC8qKioqKipUaGlzIHNlY3Rpb24gaXMgYWJvdXQgdGhlIHNwYW5uaW5nIHRyZWUgYW5kIHNwYW5uaW5nIHRyZWUgcmVzdWx0cyoqKioqKi9cbiAgICAgICAgICAgIC8vU3Bhbm5pbmcgdHJlZSBjYWxjdWxhdGlvblxuICAgICAgICBsZXQgdGV0cmFoZWRyYUNvb3JkaW5hdGVzID0gW3NpdGVzXTtcbiAgICAgICAgbGV0IHdlaWdodHMgPSBvcHRpb25zLmRpc3RhbmNlV2VpZ2h0cztcbiAgICAgICAgbGV0IGdyYXBoID0gY3JlYXRlR3JhcGgodGV0cmFoZWRyYUNvb3JkaW5hdGVzLCB3ZWlnaHRzKTtcbiAgICAgICAgbGV0IG1zdHJlZSA9IG1zdChncmFwaCk7XG4gICAgICAgIC8vQXNzaWduaW5nIHRoZSBvdXRwdXQgdmFsdWVzXG4gICAgICAgIG91dHB1dFZhbHVlKFwiZ3JhcGhcIiwgZ3JhcGgpO1xuICAgICAgICBvdXRwdXRWYWx1ZShcIm1zdFwiLCBtc3RyZWUpO1xuXG4gICAgICAgIC8qKioqKipUaGlzIHNlY3Rpb24gaXMgYWJvdXQgdGhlIG91dGx5aW5nIHNjb3JlIGFuZCBvdXRseWluZyBzY29yZSByZXN1bHRzKioqKioqL1xuICAgICAgICAgICAgLy9UT0RPOiBOZWVkIHRvIGNoZWNrIGlmIG91dGx5aW5nIGxpbmtzIGFyZSByZWFsbHkgY29ubmVjdGVkIHRvIG91dGx5aW5nIHBvaW50c1xuICAgICAgICBsZXQgb3V0bHlpbmcgPSBuZXcgT3V0bHlpbmcobXN0cmVlLCB7XG4gICAgICAgICAgICAgICAgb3V0bHlpbmdVcHBlckJvdW5kOiBvdXRseWluZ1VwcGVyQm91bmQsXG4gICAgICAgICAgICAgICAgb3V0bHlpbmdDb2VmZmljaWVudDogb3V0bHlpbmdDb2VmZmljaWVudH0pO1xuICAgICAgICBsZXQgb3V0bHlpbmdTY29yZSA9IG91dGx5aW5nLnNjb3JlKCk7XG4gICAgICAgIG91dGx5aW5nVXBwZXJCb3VuZCA9IG91dGx5aW5nLnVwcGVyQm91bmQ7XG4gICAgICAgIGxldCBvdXRseWluZ0xpbmtzID0gb3V0bHlpbmcubGlua3MoKTtcbiAgICAgICAgbGV0IG91dGx5aW5nU2l0ZXMgPSBvdXRseWluZy5wb2ludHMoKS5tYXAocCA9PiBwLmpvaW4oJywnKSk7XG4gICAgICAgIGxldCBvdXRseWluZ0JpbnMgPSBiaW5zLmZpbHRlcihiID0+IG91dGx5aW5nU2l0ZXMuaW5kZXhPZihiLnNpdGUuam9pbignLCcpKSA+PSAwKTtcblxuICAgICAgICAvL0FkZCBvdXRseWluZyBwb2ludHMgZnJvbSB0aGUgYmluIHRvIGl0LlxuICAgICAgICBsZXQgb3V0bHlpbmdQb2ludHMgPSBbXTtcbiAgICAgICAgb3V0bHlpbmcucG9pbnRzKCkuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIGJpbnMuZm9yRWFjaChiID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxQb2ludHMocCwgYi5zaXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRseWluZ1BvaW50cyA9IG91dGx5aW5nUG9pbnRzLmNvbmNhdChiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcbiAgICAgICAgb3V0cHV0VmFsdWUoXCJvdXRseWluZ0JpbnNcIiwgb3V0bHlpbmdCaW5zKTtcbiAgICAgICAgb3V0cHV0VmFsdWUoXCJvdXRseWluZ1Njb3JlXCIsIG91dGx5aW5nU2NvcmUpO1xuICAgICAgICBvdXRwdXRWYWx1ZShcIm91dGx5aW5nVXBwZXJCb3VuZFwiLCBvdXRseWluZ1VwcGVyQm91bmQpO1xuICAgICAgICBvdXRwdXRWYWx1ZShcIm91dGx5aW5nTGlua3NcIiwgb3V0bHlpbmdMaW5rcyk7XG4gICAgICAgIG91dHB1dFZhbHVlKFwib3V0bHlpbmdQb2ludHNcIiwgb3V0bHlpbmdQb2ludHMpO1xuXG5cbiAgICAgICAgLyoqKioqKlRoaXMgc2VjdGlvbiBpcyBhYm91dCB0aGUgc2tld2VkIHNjb3JlIGFuZCBza2V3ZWQgc2NvcmUgcmVzdWx0cyoqKioqKi9cbiAgICAgICAgbGV0IG5vT3V0bHlpbmdUcmVlID0gb3V0bHlpbmcucmVtb3ZlT3V0bHlpbmcoKTtcbiAgICAgICAgbGV0IHNrZXdlZCA9IG5ldyBTa2V3ZWQobm9PdXRseWluZ1RyZWUpO1xuICAgICAgICBvdXRwdXRWYWx1ZShcInNrZXdlZFNjb3JlXCIsIHNrZXdlZC5zY29yZSgpKTtcblxuICAgICAgICAvKioqKioqVGhpcyBzZWN0aW9uIGlzIGFib3V0IHRoZSBzcGFyc2Ugc2NvcmUgYW5kIHNwYXJzZSBzY29yZSByZXN1bHRzKioqKioqL1xuICAgICAgICBsZXQgc3BhcnNlID0gbmV3IFNwYXJzZShub091dGx5aW5nVHJlZSk7XG4gICAgICAgIG91dHB1dFZhbHVlKFwic3BhcnNlU2NvcmVcIiwgc3BhcnNlLnNjb3JlKCkpO1xuXG4gICAgICAgIC8qKioqKipUaGlzIHNlY3Rpb24gaXMgYWJvdXQgdGhlIGNsdW1weSBzY29yZSBhbmQgY2x1bXB5IHNjb3JlIHJlc3VsdHMqKioqKiovXG4gICAgICAgIGxldCBjbHVtcHkgPSBuZXcgQ2x1bXB5KG5vT3V0bHlpbmdUcmVlKTtcbiAgICAgICAgb3V0cHV0VmFsdWUoXCJjbHVtcHlcIiwgY2x1bXB5KTtcbiAgICAgICAgb3V0cHV0VmFsdWUoXCJjbHVtcHlTY29yZVwiLCBjbHVtcHkuc2NvcmUoKSk7XG5cbiAgICAgICAgLy8gLyoqKioqKlRoaXMgc2VjdGlvbiBpcyBhYm91dCB0aGUgc3RyaWF0ZWQgc2NvcmUgYW5kIHN0cmlhdGVkIHNjb3JlIHJlc3VsdHMqKioqKiovXG4gICAgICAgIC8vIGxldCBzdHJpYXRlZCA9IG5ldyBTdHJpYXRlZChub091dGx5aW5nVHJlZSk7XG4gICAgICAgIC8vIG91dHB1dFZhbHVlKFwic3RyaWF0ZWRTY29yZVwiLCBzdHJpYXRlZC5zY29yZSgpKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gLyoqKioqKlRoaXMgc2VjdGlvbiBpcyBhYm91dCB0aGUgY29udmV4IGh1bGwgYW5kIGNvbnZleCBodWxsIHJlc3VsdHMqKioqKiovXG4gICAgICAgIC8vIGxldCBjb252ZXggPSBuZXcgQ29udmV4KG5vT3V0bHlpbmdUcmVlLCAxL291dGx5aW5nLnVwcGVyQm91bmQpO1xuICAgICAgICAvLyBsZXQgY29udmV4SHVsbCA9IGNvbnZleC5jb252ZXhIdWxsKCk7XG4gICAgICAgIC8vIG91dHB1dFZhbHVlKFwiY29udmV4SHVsbFwiLCBjb252ZXhIdWxsKTtcblxuXG4gICAgICAgIC8vIC8qKioqKipUaGlzIHNlY3Rpb24gaXMgYWJvdXQgdGhlIGNvbmNhdmUgaHVsbCBhbmQgY29uY2F2ZSBodWxsIHJlc3VsdHMqKioqKiovXG4gICAgICAgIC8vIGxldCBjb25jYXZlSHVsbCA9IGNvbnZleC5jb25jYXZlSHVsbCgpO1xuICAgICAgICAvLyBvdXRwdXRWYWx1ZShcImNvbmNhdmVIdWxsXCIsIGNvbmNhdmVIdWxsKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy9cbiAgICAgICAgLy8gLyoqKioqKlRoaXMgc2VjdGlvbiBpcyBhYm91dCB0aGUgY29udmV4IHNjb3JlIGFuZCBjb252ZXggc2NvcmUgcmVzdWx0cyoqKioqKi9cbiAgICAgICAgLy8gbGV0IGNvbnZleFNjb3JlID0gY29udmV4LnNjb3JlKCk7XG4gICAgICAgIC8vIG91dHB1dFZhbHVlKFwiY29udmV4U2NvcmVcIiwgY29udmV4U2NvcmUpO1xuICAgICAgICAvL1xuICAgICAgICAvL1xuICAgICAgICAvLyAvKioqKioqVGhpcyBzZWN0aW9uIGlzIGFib3V0IHRoZSBza2lubnkgc2NvcmUgYW5kIHNraW5ueSBzY29yZSByZXN1bHRzKioqKioqL1xuICAgICAgICAvLyBsZXQgc2tpbm55ID0gbmV3IFNraW5ueShjb25jYXZlSHVsbCk7XG4gICAgICAgIC8vIGxldCBza2lubnlTY29yZSA9IHNraW5ueS5zY29yZSgpO1xuICAgICAgICAvLyBvdXRwdXRWYWx1ZShcInNraW5ueVNjb3JlXCIsIHNraW5ueVNjb3JlKTtcbiAgICAgICAgLy9cbiAgICAgICAgLyoqKioqKlRoaXMgc2VjdGlvbiBpcyBhYm91dCB0aGUgc3RyaW5neSBzY29yZSBhbmQgc3RyaW5neSBzY29yZSByZXN1bHRzKioqKioqL1xuICAgICAgICBsZXQgc3RyaW5neSA9IG5ldyBTdHJpbmd5KG5vT3V0bHlpbmdUcmVlKTtcbiAgICAgICAgbGV0IHYxcyA9IHN0cmluZ3kuZ2V0QWxsVjFzKCk7XG4gICAgICAgIGxldCB2MkNvcm5lcnMgPSBzdHJpbmd5LmdldEFsbFYyQ29ybmVycygpO1xuICAgICAgICAvLyBsZXQgb2J0dXNlVjJDb3JuZXJzID0gc3RyaWF0ZWQuZ2V0QWxsT2J0dXNlVjJDb3JuZXJzKCk7XG4gICAgICAgIGxldCBzdHJpbmd5U2NvcmUgPSBzdHJpbmd5LnNjb3JlKCk7XG4gICAgICAgIG91dHB1dFZhbHVlKFwidjFzXCIsIHYxcyk7XG4gICAgICAgIG91dHB1dFZhbHVlKFwic3RyaW5neVNjb3JlXCIsIHN0cmluZ3lTY29yZSk7XG4gICAgICAgIG91dHB1dFZhbHVlKFwidjJDb3JuZXJzXCIsIHYyQ29ybmVycyk7XG4gICAgICAgIC8vIG91dHB1dFZhbHVlKFwib2J0dXNlVjJDb3JuZXJzXCIsIG9idHVzZVYyQ29ybmVycyk7XG5cblxuICAgICAgICAvKioqKioqVGhpcyBzZWN0aW9uIGlzIGFib3V0IHRoZSBtb25vdG9uaWMgc2NvcmUgYW5kIG1vbm90b25pYyBzY29yZSByZXN1bHRzKioqKioqL1xuICAgICAgICBsZXQgbW9ub3RvbmljID0gbmV3IE1vbm90b25pYyhub091dGx5aW5nVHJlZS5ub2Rlcy5tYXAobiA9PiBuLmlkKSk7XG4gICAgICAgIGxldCBtb25vdG9uaWNTY29yZSA9IG1vbm90b25pYy5zY29yZSgpO1xuICAgICAgICBvdXRwdXRWYWx1ZShcIm1vbm90b25pY1Njb3JlXCIsIG1vbm90b25pY1Njb3JlKTtcblxuICAgICAgICByZXR1cm4gd2luZG93LnNjYWdub3N0aWNzbmQ7XG5cbiAgICAgICAgZnVuY3Rpb24gb3V0cHV0VmFsdWUobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zY2Fnbm9zdGljc25kW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KSh3aW5kb3cpOyJdLCJuYW1lcyI6WyJnbG9iYWwiLCJfIiwiZGlzdGFuY2UiLCJxdWFudGlsZSIsIm1heCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztDQUFBOzs7OztDQUtBLENBQUMsV0FBVzs7Ozs7Ozs7R0FRVixJQUFJLElBQUksR0FBRyxPQUFPLElBQUksSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSTthQUN0RCxPQUFPQSxjQUFNLElBQUksUUFBUSxJQUFJQSxjQUFNLENBQUMsTUFBTSxLQUFLQSxjQUFNLElBQUlBLGNBQU07YUFDL0QsSUFBSTthQUNKLEVBQUUsQ0FBQzs7O0dBR2IsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7R0FHaEMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztHQUM5RCxJQUFJLFdBQVcsR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7OztHQUcxRSxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSTtPQUN0QixLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUs7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O0tBQzFCLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDM0QsQ0FBQzs7OztHQUlGLENBQUMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7S0FDaEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLEVBQUUsSUFBSSxDQUFDLENBQUM7Ozs7Ozs7O0dBUVQsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtLQUNwRCxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUN0RSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3hDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDOzs7OztHQUtGLENBQUMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtLQUNwQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkYs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LENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxBQUFteE4sSUFBd1UsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQTQ3SixJQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQTRrQixJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENB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LEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZDLFNBQVMsSUFBSTtDQUNiLFlBQVksT0FBTyxDQUFDLENBQUM7Q0FDckIsU0FBUztDQUNULEtBQUs7Q0FDTCxDQUFDOztDQ3JCTSxNQUFNLE1BQU0sQ0FBQztDQUNwQixJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Q0FDdEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDckQsS0FBSzs7Q0FFTDtDQUNBO0NBQ0E7Q0FDQTtDQUNBLElBQUksS0FBSyxHQUFHO0NBQ1osUUFBUSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7Q0FDekQsWUFBWSxHQUFHLEdBQUdBLENBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDM0MsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0NBQ2pELFFBQVEsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNoRCxLQUFLO0NBQ0w7O0VBQUMsRENkTSxNQUFNLE1BQU0sQ0FBQztDQUNwQixJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUU7Q0FDdEI7Q0FDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDckQsS0FBSzs7Q0FFTDtDQUNBO0NBQ0E7Q0FDQTtDQUNBLElBQUksS0FBSyxHQUFHO0NBQ1osUUFBUSxJ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
