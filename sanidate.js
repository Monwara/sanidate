/**
 * # Sanidate
 *
 * Validation-sanitizing functionality for web frameworks, browsers, and
 * you-name-it.
 *
 * @author Monwara LLC / Branko Vukelic <branko@brankovukeluc.com>
 * @version 0.0.6
 * @license MIT
 */
void(0); // tells uglfy to not keep docs below
/**
 * ## Overview
 *
 * Sanidate (SANItize + valiDATE) is a JavaScript library for validating and
 * sanitizing user-supplied data. It uses a developer-defined constraint schema
 * and converts input data into valid and properly formatted data. It can be
 * used both on server- and client-side, and provides middlewares for
 * [Express.js](http://expressjs.com/), and 
 * [FragRouter](https://github.com/foxbunny/FragRouter), as well as a jQuery
 * plugin.
 *
 * Sanidate grew out of author's frustration with existing validation
 * frameworks which tend to produce a lot of cruft, and/or create unreasonably
 * hard-to-read, verbose code. Data validation and sanitizing is a very common
 * task (virtually _all_ user input has to be validated and/or sanitized at
 * some point), repetitive, and outright boring. On top of it, it's not even
 * the _most important_ part of the business logic, but merely an overture.
 *
 * Sanidate tries to reduce validation and sanitizing to what it's supposed to
 * be, merely a checklist for what the data should look like before it can be
 * consumed by business logic code. It also tries to reduce validation and
 * sanitizing into a single pass (called 'sanidation'), so you don't have to do
 * two mentally very close tasks tasks in two separate passes. Finally, it
 * systematizes data into a convenient package, so you can access it with ease,
 * rather than hunt for it in multiple different places.
 *
 * The core of Sanidate is its constraints system. Each constraint is a
 * function which does two things:
 *
 *  + converts data into intended data _type_
 *  + checks the validity of the data
 *
 * These constraints are named, and a sanidation schema can be contructed using
 * the names, instead of references to functions. This makes for concise
 * representation of the sanidation schema (more on that in the following
 * section).
 *
 * Unlike some of the validation frameworks for JavaScript, Sanidate is fully
 * asynchronous, which means it supports asynchronous operations like database
 * lookups in its constraint functions. In fact, it ships with two
 * Mongoose-specific constraints all good to go.
 *
 * ## Basic usage
 *
 * To sanidate some data, you need two things:
 *
 *  + The actual data as an object (key-value parirs)
 *  + The sanidation schema (more on that in next section)
 *
 * When you have both, simply call the `sanidate.check()` method:
 *
 *     sanidate.check(data, schema, function(err, data) {
 *       if (err) { return console.log('Error!'); }
 *       // Do something useful with the data, like:
 *       console.log(data);
 *     });
 *
 * ## Sanidation schema
 *
 * Sanidation schema is an object that describes your desired output. Since
 * input is almost always string, Sanidate not only checks the validity of the
 * strings, but also converts them into desired type and/or format. The
 * conversion and validation for a single constraint are both controlled by a
 * single constraint function.
 *
 * Let's take a look at a simple sanidation schema and then discuss its
 * structure in more detail:
 *
 *     var schema = {
 *       name: 'required',
 *       email: 'email',
 *       age: 'integer',
 *       username: 'required',
 *       profilePicture: [
 *         ['custom', checkStorage]
 *       ]
 *     };
 *
 * You will first notice that, for most part, schema is simply a key-value
 * pair, where keys are parameter names, and values are strings or arrays. 
 *
 * Strings values are very simple: they are names of built-in constraints
 * (e.g., 'required', 'email', 'numeric'...). 
 *
 * For specifying multiple constraints, or specifying constraints with
 * parameters, arrays must be used. Each member of the constraint array is a
 * single constraint, and it can be either a string or an array. Strings are
 * the same as string values above: just names of built-in constraints.
 * Constraint represented by an array has the name of the built-in constraint
 * as it's first member, and other members are arguments passed to the
 * constraint function.
 *
 * In our example, `profilePicture` parameter has a single constraint called
 * 'custom', with a single argument, which is a reference to a function caleld
 * `checkStorage` (which, you can imagine, checks the hard drive for profile
 * image file and fails validation if one is not found).
 *
 * The built-in constraints, such as 'required' or 'email', are all stored in
 * `sanidate.funcs` object. They are looked up internally when validation takes
 * place, but are exposed for your convenience, if you ever need to customize
 * them, or add new constraints yourself.
 *
 * One thing to note about the constraints such as 'numeric' is that they will
 * actually convert the input data into an appropriate type (e.g., 'numeric'
 * converts to a float, 'integer' converts to an integer, and 'date' converts
 * to `Date` object).
 *
 * Another important note is that all constraints require a value to be
 * present. Currently, there is no support for optional constraints that are
 * applied only when data is present. If you wish to apply constraints only if
 * a value is present, use the 'optional' constraint as the first constraint,
 * followed by other constraints.
 *
 * ## Constraint chaining
 *
 * If you use more than one constraint on a parameter, you should keep in mind
 * that each constraint transforms data before passing to the next one. For
 * example, if you put a 'match' constraint _after_ the 'date' constraint, this
 * will yield unexpected results, because the value will have been transformed
 * into a `Date` object before reaching the 'match' constraint.
 *
 * Think of constraint arrays as layers of filters one on top of the other on
 * which you drip the data. If data is prevented to pass any of the layers,
 * subsequent layers will not even see it. Any layer always sees data as
 * filtered by previous layers. This is also important to remember when
 * handling validation errors, because, for a set of chained constarints, error
 * will only be registered for the first constraint that reports validations
 * failure.
 *
 * The built-in constraints are constructed in such a way that you usually only
 * need one of them at a time, so chaining should generally not be required.
 * For example, 'max' constraint may also serve as either 'numeric' or 
 * 'integer' constraint becuase it will fail if value is not a valid number.
 *
 * ## Built-in constraints
 *
 * Sanidate ships with a handful of (arguably) very useful constraints. These
 * are (with arguments in square brackets):
 *
 *  + required: Simply fails if value is not supplied
 *  + optional: [def] If no value is supplied, return the default value
 *    (`def`), and interrupt execution of further constraints; must be the
 *    first constraint if used with other constraints
 *  + match: [pattern] Fails if value does not match the regexp `pattern`
 *  + numeric: Forces conversion to float, and fails when conversion fails
 *  + integer: Forces conversion to integer and fails when conversion fails
 *  + max: [x, integer, equality] Forces conversion to float or integer (if
 *    `integer` flag is set to `true`), and, depending on equality boolean
 *    falg, fails if greater than or greater _and_ equal to `x`
 *  + min: [x, integer, equality] Same as `max`, but fails if less than / less
 *    than or equal to`x`
 *  + date: Forces conversion to Date, and fails if conversion fails (does not
 *    work with any particular date format, so if date formatting is required, 
 *    insert the `match` constraint before date constraint)
 *  + email: Fails if value is not an email
 *  + zip: Fails if value is not a 5-digit number (such as US zip code)
 *  + phone: [digitsOnly] Fails if value does not _contain_ 10 digits 
 *    (disregaring any other non-numeric characters), and returns either only
 *    the digits (if `digitsOnly` flag is set to `true`), or formatted phone
 *    number (currently only supports US phone format)
 *  + isTrue: Returns `true` if value is 'true', 'yes', 'on', or '1', otherwise
 *    returns `false`, and never fails
 *  + isNotTrue: Returns `false` if value is 'false', 'no', 'off', or '0',
 *    otherwise returns `true`, and never fails
 *  + isDocument: [Model, key] Looks up Mongoose model using either supplied
 *    optional `key`, or parameter name as key name, and fails if no documents
 *    are found; value is converted to returned document
 *  + isNotDocument: [Model, key] Same as 'isDocument', but fails if document
 *    _is_ found, and returns original value on success.
 *  + custom: [func] Uses the `func` function as constraint
 *  + derive: [paramName, func] Uses parameter `paramName` from original
 *    user-supplied data, and applies `func` validation function to its value
 *
 * Note that you _can_ use multiple 'custom' constraints for any user-supplied
 * data.
 *
 * ## Sanidation errors
 *
 * Sanidation errors are returned as first argument to the callback you pass to
 * `sanidate.check()`. If there are no errors, you will receive `null` instead.
 *
 * If there are any errors, the error object will have two keys. 
 *
 * The `count` represents an integer count of errors. This number can never be
 * higher than the number of parameters that were sanidated. 
 *
 * The `errors` key will contain a object mapping between parameter names and
 * constraint names. Constraint names in the mapping represent the names of
 * constraints for which the parameter values failed validation.
 *
 * ## Writing custom constraints
 *
 * It is possible to write custom constraint functions and use them with the 
 * 'custom' constraint. 
 *
 * Let's take a look at a simple constraint function that checks the age of a
 * date field, and makes sure it is not older than 20 days:
 *
 *     function minAge(v, next) {
 *       var now = Date.now();
 *       v = new Date(v);
 *       var maxDifference = 20 * 24 * 60 * 60 * 1000; // 20 days in ms
 *       var difference = now - v.getTime();
 *       next(null, difference < maxDifference ? v : null, 'minAge');
 *     }
 *
 * The function takes two arguments. First argument, `v`, is the current value
 * of the data, as sanidated by all previous constraints. The second argument
 * is a callback function which allows Sanidate to continue applying
 * other constraints.
 *
 * What goes on inside the function is pretty self-evident, so we won't go into
 * details. The important bit is the data we pass on to the callback. Callback
 * takes three arguments. 
 *
 * The first argument is an error object. It is currently not important, as it
 * makes little difference whether you pass an error object. Presence of an
 * error will be treated as failed validation. This behavior _will_ change in
 * future, so it's best to always pass the error object if there has been a
 * non-validation-related error (such as filesystem or database failure). In
 * later versions, Sanidate will be able to somehow tell you that there has
 * been an unexpected condition.
 *
 * The second argument is sanidated value. It's important to note that only
 * `null` value is considered a failure. Falsy values like 0, empty string, and
 * even undefined, are _not_ considered failure conditions. So, if you want to
 * let Sanidate know that validation has failed, you _must_ pass a null value
 * as sanidated value.
 *
 * Last argument is the constraint name. Because there can be multiple 'custom' 
 * constraints, Sanidate allows constraint functions to return a different 
 * constraint name in the callback. As with all other arguments, `null` is,
 * again, the special value. If you pass `null` as constraint name, any further
 * constraint processing will be abandoned, and the value passed to the
 * callback will be used without questions. That is, for example, what 
 * 'optional' does. It passes on any value that user has provided, and passes
 * `null` as constraint name to foce Sanidate to use any provided value
 * (including `null`).
 *
 * Custom constraint functions have access to details about the parameter that
 * is being processed (like the parameter name), the original parameter value,
 * and the original values of all other parameters that are being sanidated.
 * This data is stored in `this` as properties:
 *
 *  + `this.paramName`: parameter name
 *  + `this.originalValue`: original (raw) value of the parameter
 *  + `this.originalData`: all data being sanidated as name-value pairs
 *
 * Although the 'derive' constraint can be used effectively for the same
 * purpose, we will write our own 'custom' constraint that checks email
 * confirmation, just to demonstrate usage of `originalData` property.
 *
 *     function emailConfirmation(v, next) {
 *       next(null, v === this.originalData['email'] ? v : null,
 *         'emailConfirmation');
 *     }
 *
 * We assume that the email was first entered in a field named `email`, and
 * then confirmed in a field called `emailconfirm`:
 *
 *     var schema = {
 *       email: 'email',
 *       emailconfirm: [['custom', emailConfrimation]]
 *     };
 *
 * To demonstrate the difference between 'custom' constraint and 'derive'
 * constraint in this scenario, let's rewrite the above to use 'derive':
 *
 *    function emailConfirmation(v, o) {
 *      return v === o ? v : null;
 *    }
 *
 *    var schema = {
 *      email: 'email',
 *      emailconfirm: [['derive', 'email', emailConfrimation]]
 *    };
 *
 * Note that 'emailconfirm' paramter does not have an 'email' constraint. We
 * don't need to add that, since we know that if 'email' constraint on 'email'
 * field failed, it must also fail for 'emailconfirm' field if it is identical
 * to 'email' field.
 * 
 * Apart from writing function for use with 'custom' constraint, you can also
 * add your constraint as a named constraint to make it act as one of the
 * built-in constraints. To do that, siply add your constraint to
 * `sanidate.funcs` object:
 *
 *     sanidate.funcs.minAge = function(maxDays) {
 *       return function minAge(v, next) {
 *         var now = Date.now();
 *         v = new Date(v);
 *         var maxDifference = maxDays * 24 * 60 * 60 * 1000; // 20 days in ms
 *         var difference = now - v.getTime();
 *         next(null, difference < maxDifference ? v : null, 'minAge');
 *       };
 *     }
 *
 * As you can see, a built-in constraint is a function that returns functions.
 * The outer function is called a setup function, which prepares the validation
 * function. The outer function has access to a `paramObject` (via `this`),
 * which contains more information
 *
 * ## Generic JavaScript example
 *
 *     var data = {
 *       email: 'test@example.com',
 *       number: '11'
 *     };
 *
 *     var schema = {
 *       name: 'required',
 *       email: 'email',
 *       number: 'integer'
 *     };
 *
 *     sanidate.check(data, schema, function(err, data) {
 *       if (err) {
 *         console.log('There were ' + err.count + ' errors:', err.errors);
 *       }
 *       // data is:
 *       //   {email: 'test@example.com', number: 11}
 *     });
 *
 * ## Express.js example
 *
 *     var schema = {
 *       name: 'required',
 *       email: 'email',
 *       number: 'integer'
 *     };
 *
 *     // Set up middleware using `sanidate.express()` call
 *     app.post('/user', sanidate.express(schema), function(req, res) {
 *       if (req.dataError) { return req.send('Error', 400); }
 *
 *       // Sanidated data is now available as req.data
 *
 *       req.send('Success!', 200);
 *     });
 *
 * ## FragRouter example
 *
 *     frag.addMiddleware(sanidate.frag);
 *
 *     function myHandler() {
 *       var schema = {
 *         name: 'required',
 *         email: 'email',
 *         number: 'integer'
 *       };
 *
 *       // get `data` from somewhere
 *
 *       this.sanidate(data, schema)
 *     }
 *
 * ## jQuery example
 *
 * Although Sanidate _is_ an AMD module, it doesn't list jQuery as its
 * dependency, since it doesn't actually _need_ it. 
 *
 * If you want to use Sanidate's jQuery plugin, you need to make sure Sanidate
 * is loaded _after_ jQuery, or configure your AMD loader to load jQuery as
 * Sanidate's dependency.
 *
 * Alternatively, you can run this line after jQuery has been loaded:
 *
 *     sanidate.jQuery($);
 *
 * After you've successfully activated the plugin, you can use it like this:
 *
 *     var schema = {
 *       name: 'required',
 *       email: 'email',
 *       number: 'integer'
 *     };
 *
 *     $('#myForm').sanidate(schema, function(err, data) {
 *       // `err` and `data` are the usual objects
 *     });
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.sanidate = factory();
  }
})(this, function() {
  var sanidate = {};

  var emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var phoneRe = /^\(?\d{3}\)? ?\d{3}-?\d{4}$/;

  function extractDigits(s) {
    var r = /\d+/g;
    var ss = '';
    while (match = r.exec(s)) {
      ss += match[0];
    }
    return ss;
  }

  function formatPhone(s) {
    s = extractDigits(s);
    return '(' + s.slice(0, 3) + ') ' + s.slice(3, 6) + '-' + s.slice(6);
  }

  /**
   * ## sanidate.funcs
   * 
   * This object contains all of the built-in constraints that can be used by
   * name in the sanidation schema. Each property is a function which may take
   * one or more arguments, and which returns a sanidation function.
   *
   * Sanidation functions take two arguments, of which first is the value as
   * sanidized by any previous constraints, and second is a callback which
   * chains to next sanidizer or finishes the chain. The sanidation function
   * works more or less the same way as custom functions (see 'Writing custom 
   * constraints' section for more details).
   *
   * You can customize any of the built-in constraints by overloading the
   * function assigned to its key in this object. You can also add new built-in
   * constraints by adding new keys.
   */
  sanidate.funcs = {
    /**
     * ### sanidate.funcs.required()
     *
     * Makes value required, and won't pass if there is no value.
     */
    'required': function() {
      return function(v, next) {
        next(null, v ? v : null, 'required');
      };
    },

    /**
     * ### sanidate.funcs.match(pattern)
     *
     * Makes value match a pattern.
     *
     * @param {RegExp} pattern Regexp pattern to match
     */
    'match': function(pattern) {
      return function(v, next) {
        next(null, pattern.exec(v) ? v : null, 'match');
      };
    },

    /**
     * ### sanidate.funcs.numeric()
     *
     * Makes value numeric.
     */
    'numeric': function() {
      return function(v, next) {
        var f = parseFloat(v);
        next(null, !isNaN(f) ? f : null, 'numeric');
      };
    },

    /**
     * ### sanidate.funcs.integer()
     *
     * Makes value integer.
     */
    'integer': function() {
      return function(v, next) {
        var i = parseInt(v, 10);
        next(null, !isNaN(i) ? i : null, 'integer');
      };
    },

    /**
     * ### sanidate.funcs.min(x, integer, equality)
     *
     * Makes value be greater than or equal to `x`. If `integer` is `true`, it 
     * will only do integer comparison.
     *
     * @param {Number} x The minimum value allowed
     * @param {Boolean} integer Whether to do integer comparison (default: 
     * false)
     * @param {Boolean} equality Whether to accept equality (default: false)
     */
    'min': function(x, integer, equality) {
      return function(v, next) {
        var i = integer ? parseInt(v, 10) : parseFloat(v);
        next(null, (!isNaN(i) && (equality ? i >= x : i > x)) ? i : null, 'min');
      };
    },

    /**
     * ### sanidate.funcs.max(x, integer, equality)
     *
     * Makes value be less than or equal to `x`. If `integer` is `true`, it 
     * will only do integer comparison.
     *
     * @param {Number} x The maximum value allowed
     * @param {Boolean} integer Whether to do integer comparison (default: 
     * false)
     * @param {Boolean} equality Whether to accept equality (default: false)
     */
    'max': function(x, integer, equality) {
      return function(v, next) {
        var i = integer ? parseInt(v, 10) : parseFloat(v);
        next(null, (!isNaN(i) && (equality ? i <= x : i < x)) ? i : null, 'min');
      };
    },

    /**
     * ### sanidate.funcs.date()
     *
     * Makes value a date.
     */
    'date': function() {
      return function(v, next) {
        var d = new Date(v);
        next(null, (d.toString() !== 'Invalid Date') ? d : null, 'date');
      };
    },

    /**
     * ### sanidate.funcs.email()
     *
     * Makes value match a canonical email format.
     */
    'email': function() {
      return function(v, next) {
        next(null, emailRe.exec(v) ? v : null, 'email');
      };
    },

    /**
     * ### sanidate.funcs.zip()
     *
     * Makes vlaue match 5-digit number. It returns the original value on
     * match, not converted to numbers.
     */
    'zip': function() {
      return function(v, next) {
        next(null, /^\d{5}$/.exec(v) ? v : null, 'zip');
      };
    },

    /**
     * ### sanidate.funcs.isTrue()
     *
     * Makes value match any of the following:
     *  + true
     *  + yes
     *  + on
     *  + 1
     *
     * If the value matches, `true` is returned, otherwise `false` is returned.
     *
     * This validator never fails.
     */
    'isTrue': function() {
      return function(v, next) {
        next(null, 'true yes 1 on'.split(' ').indexOf(v) > -1, 'isTrue');
      };
    },

    /**
     * ### sanidate.funcs.isNotFalse()
     *
     * Makes value _not_ match any of the following:
     *  + false
     *  + no
     *  + off
     *  + 0
     *
     * If the value matches any of the above, `false` is returned. Otherwise,
     * `true` is returned.
     *
     * This validator never fails.
     */
    'isNotFalse': function() {
      return function(v, next) {
        next(null, 'false no 0 off'.split(' ').indexOf(v) < 0, 'isFalse');
      };
    },

    /**
     * ### sanidate.funcs.phone(digitsOnly)
     *
     * Tests if 10 digits are contained in the value, and returns only the
     * digits as string (`digitsOnly === true`), or a formatted US phone number
     * (`digitsOnly === false`).
     *
     * @param {Boolean} digitsOnly Optional flag to ask for digits without
     * formatting.
     */
    'phone': function(digitsOnly) {
      return function(v, next) {
        next(null, phoneRe.exec(v) ? 
             (digitsOnly ? extractDigits(v) : formatPhone(v)) :
             null, 'phone');
      };
    },

    /**
     * ### sanidate.funcs.isDocument(Model, [key])
     *
     * Tests if a document that has the key-value pair matching the value of
     * the parameter exists in a Mongoose/MongoDB database.
     *
     * The validator only succeeds if there is a match, and returns the
     * document as new value.
     *
     * Key name will default to parameter name.
     *
     * @param {mongoose.Model} Model A Mongoose model object
     * @param {String} key A database key to use for lookup (optional)
     */
    'isDocument': function(Model, key) {
      key = key || this.name;
      return function(v, next) {
        var criteria = {};
        criteria[key] = v;
        Model.findOne(criteria, function(err, doc) {
          if (err) { next(err, null, 'isDocument'); }
          next(null, doc || null, 'isDocument');
        });
      };
    },

    /**
     * ### sanidate.funcs.isNotDocument(Model, [key])
     *
     * Tests if a document that has the key-value part matching the value of
     * the parameter _does not_ exist in a Mongoose/MongoDB database.
     *
     * The validator fails if there is such a document, otherwise it returns
     * the value of the parameter intact.
     *
     * Key name will default to parameter name.
     *
     * @param {mongoose.Model} Model A Mongoose model object
     * @param {String} key A database key to use for lookup (optional)
     */
    'isNotDocument': function(Model, key) {
      key = key || this.name;
      return function(v, next) {
        var criteria = {};
        criteria[key] = v;
        Model.findOne(criteria, function(err, doc) {
          if (err) { next(err, null, 'isNotDocument'); }
          next(null, doc ? null : v, 'isNotDocument');
        });
      };
    },

    /**
     * ### sanidate.funcs.custom(func)
     *
     * Run a custom validation function. The custom function must have the same
     * signature as normal validation functions, and must call the next
     * callback.
     *
     * @param {Function} func Custom validation function
     */
    'custom': function(func) {
      var paramObject = this;
      return function(v, next) {
        func.call(paramObject, v, next);
      };
    },

    /**
     * ### sanidate.funcs.optional(def)
     *
     * Interrupts sanidation immediately if no value is found, but does not
     * fail validation.
     *
     * If `def` is a function, it will be executed with no arguments, and its
     * return value will be used as the default value. Function is always 
     * executed after it is determined that default value is needed.
     *
     * @param {Any} def Optional default value that is returned in case no
     * value is found.
     */
    'optional': function(def) {
      return function(v, next) {
        next(null, v ? v : (typeof def === 'function' ? def() : def), 
             v ? 'optional' : null);
      };
    },

    /**
     * ### sanidate.derive(paramName, func);
     *
     * Uses data from another parameter to either derive its own value, or
     * validate its value. 
     *
     * The `func` function accepts two arguments. First argument is the
     * sanidated value of the current parameter. Second paramter is the
     * original (unsanidated) value of the other parameter. The func must
     * return a value, which is then used for validation. To fail validation,
     * you must return `null`. All other values (including `undefined`) will be
     * considered valid.
     *
     * Note that 'derive' only operates on the _original_ value of the other
     * parameter, and not the sanidated value.
     *
     * @param {String} paramName Name of the other parameter to use for
     * derivation
     * @param {Function} func Validation function
     */
    'derive': function(paramName, func) {
      var o = this.originalData[paramName];
      return function(v, next) {
        next(null, func(v, o), 'derive');
      };
    }

  };

  /**
   * ## sanidate.checkParam(paramName, value, constraints, data, cb)
   *
   * Runs constraints on a parameter with `paramName` name, `value` value, and
   * executes a `cb` callback when finished. The callback should expect three
   * arguments:
   *
   *  + error object (null if there were no errors)
   *  + final value after running sanidators over the original value
   *  + constraint name if there was a failure of no value was returned
   *
   * The constraint name is the name of the sanidator that was run last in case
   * there is no value returned from it, or it threw an error.
   *
   * This method, although exposed, is a private method, and you should not
   * rely on the stability of its API.
   *
   * @param {String} paramName Original parameter name
   * @param {String} value Value to test against constraints
   * @param {Array} constraints Array of constraints definitions
   * @param {Object} data Original data
   * @param {Function} cb Callback function
   * @private
   */
  sanidate.checkParam = function(paramName, value, constraints, data, cb) {
    var paramObject = {
      name: paramName,
      originalValue: value,
      originalData: data
    };

    function runValidators(funcs, val, final) {
      if (!funcs.length) { return final(null, val); }

      funcs[0](val, function(err, val, constraintName, interrupt) {
        if (err) { return final(err, null, constraintName); }
        if (constraintName === null) { return final(null, val); }
        if (val === null) { return final(null, null, constraintName); }
        runValidators(funcs.slice(1), val, final);
      });
    }

    if (typeof constraints === 'string') {
      constraints = [constraints];
    }

    constraints = constraints.map(function(constraint) {
      var cFunc;
      var cParams;

      if (typeof constraint === 'string') {
        cFunc = sanidate.funcs[constraint];
        cParams = [];
      } else {
        cFunc = sanidate.funcs[constraint[0]];
        cParams = constraint.slice(1);
      }

      if (typeof cFunc !== 'function') {
        throw new Error('Constraint ' + constraint + ' is not a function ' + 
                        'for param ' + parameterName);
      }

      return cFunc.apply(paramObject, cParams);
    });

    runValidators(constraints, value, cb);
  };

  /**
   * ## sanidate.check(data, schema, [excludeEmpty], cb)
   *
   * Sanidates the data from `data` object using `schema` validation schema,
   * and calls the `cb` callback.
   *
   * @param {Object} data Key-value pair of request parameters to validate
   * @param {Object} schema Sanidation schema
   * @param {Boolean} excludeEmpty Optional flag to exclude keys for empty
   * values
   * @param {Function} cb Callback function
   */
  sanidate.check = function(data, schema, excludeEmpty, cb) {
    if (typeof excludeEmpty === 'function') {
      cb = excludeEmpty;
      excludeEmpty = false;
    }
    var cleanedData = {};
    var errors = {
      count: 0,
      errors: {}
    };
    var completed = Object.keys(schema).length;
    Object.keys(schema).forEach(function(paramName) {
      sanidate.checkParam(
        paramName, data[paramName], schema[paramName], data,
        function(err, val, constraintName) {
          if (err || val === null) {
            errors.count += 1;
            errors.errors[paramName] = constraintName;
          } else {
            if (!excludeEmpty || (typeof val !== 'undefined' && val !== null)) {
              cleanedData[paramName] = val;
            }
          }
          completed--;
          if (!completed) {
            if (!errors.count) { errors = null; }
            cb(errors, cleanedData);
          }
        });
    });
  };

  /**
   * ## sanidate.express(schema, excludeEmpty)
   *
   * Express.js middleware for automatic sanidation of data prior to request
   * handling.
   *
   * The sanidated data will be stored in `req.data`, and can be accessed
   * normally, as you would with `req.query` or `req.post`.
   *
   * Any validation errors that occur will cause the `dataErrors` property to
   * appear in `req` object, so you can check for presence of this property
   * when testing for possible errors.
   *
   * @param {Object} schema Sanidation schema
   * @param {Boolean} excludeEmpty Optional flag to exclude keys for empty
   */
  sanidate.express = function(schema, excludeEmpty) {
    excludeEmpty = typeof excludeEmpty === 'boolean' ? excludeEmpty : false;
    return function(req, res, next) {
      req.sanidateFuncs = sanidate.funcs;
      req.sanidate = sanidate.check;

      if (schema) {
        var data = {};
        Object.keys(schema).forEach(function(param) {
          data[param] = req.param(param);
        });
        sanidate.check(data, schema, excludeEmpty, function(err, data) {
          req.data = data;
          err.count && (req.dataErrors = err);
          next();
        });
      } else {
        next();
      }
    };
  };

  /**
   * ## sanidate.frag(schema)
   *
   * FragRouter middleware. Currently, passing schema does absolutely nothing.
   *
   * Using this middleware, you can call `sanidate.check` as `this.sanidate()`.
   * The method signature is the same as for `sanidate.check`.
   *
   * @param {Object} schema Sanidation schema (does nothing)
   */
  sanidate.frag = function(schema) {
    return function(next) {
      this.sanidateFuncs = sanidate.funcs;
      this.sanidate = sanidate.check;
    };
  };

  sanidate.jQuery = function(jQuery) {
    jQuery.fn.sanidate = function(schema, cb) {
      var form = jQuery(this);
      var data = {};
      Object.keys(schema).forEach(function(param) {
        data[param] = form.find(':input[name=' + param + ']').val();
      });
      sanidate.check(data, schema, cb);
    };
  };

  // Attach the jQuery plugin automatically if jQuery seems present
  if (typeof jQuery === 'function' && jQuery.fn) {
    sanidate.jQuery(jQuery);
  }

  return sanidate;
});
