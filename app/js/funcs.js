(function (g, C4) {
  C4.F = {};
  C4.Util = {};
  
  //// Functional helpers
  
  // Is if a function?
  function isFunction(fn) {
    return typeof fn === 'function';
  }

  // Boolean negate
  function not(val) {
    return !val;
  }
  
  // Integer negate
  function negate(int) {
    return -int;
  }
  
  // Convert any array-like object to an actuall array
  function toArray(list) {
    return Array.prototype.slice.call(list);
  }
  
  // Get the first item of a list
  function first(list) {
    return list[0];
  }
  
  // Get everything BUT the first item of a list
  function tail(list) {
    return toArray(list).slice(1);
  }
  
  // Create a new function with some arguments already set
  function partial(fn) {
    var boundArgs = tail(arguments);
    return function() {
      return fn.apply(fn, boundArgs.concat(toArray(arguments)));
    };
  }
  
  //// Misc helpers
  
  // Create a DOM element
  function buildElement(name, attrs, content) {
    var el = document.createElement(name);
    
    // Should have better type checking for plain objects
    if (attrs) {
      for (var p in attrs) {
        el[p] = attrs[p];
      }
    }
    
    if (content && typeof content === 'string') {
      el.textContent = content;
    }
    
    return el;
  }
  
  // Is the slot empty?
  function slotIsEmpty(slot) {
    return slot.piece === null;
  }

  // num >= num <= num helper
  function inclusive(min, max, num) {
    if (num < min) { 
      return false;
    } else if (num > max) {
      return false;
    } else {
      return true;
    }
  }
  
  // Helper function to get the name of a function if possible
  function getFunctionName(fn) {
    if(isFunction(fn)) {
      if ('name' in fn) {
        return fn.name;
      }

      var match = fn.toString().match(/^function\s+(\w+)/);
      return match ? first(match) : null;
    }
  }

  // Add functions to a namespace
  function addToNamespace(ns) {
    var fns = tail(arguments);
    fns
      .filter(isFunction)
      .forEach(function(fn) {
        var fnName = getFunctionName(fn);
        if (fnName) {
          ns[fnName] = fn;
        }
      })
    ;
  }
  
  addToNamespace(C4.Util, buildElement, slotIsEmpty);
  
  addToNamespace(C4.F, isFunction, not, negate, toArray, first, tail, partial, inclusive);
})(this, this.C4);