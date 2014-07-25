(function (g, C4) {
  C4.F = {};
  C4.Util = {};
  
  /* Functional helpers */
  function isFunction(fn) {
    return typeof fn === 'function';
  }
  
  function getFunctionName(fn) {
    if(isFunction(fn)) {
      if ('name' in fn) {
        return fn.name;
      }

      var match = fn.toString().match(/^function\s+(\w+)/);
      return match ? first(match) : null;
    }
  }

  function not(val) {
    return !val;
  }
  
  function negate(int) {
    return -int;
  }
  
  function toArray(list) {
    return Array.prototype.slice.call(list);
  }
  
  function first(list) {
    return list[0];
  }
  
  function tail(list) {
    return toArray(list).slice(1);
  }
  
  function partial(fn) {
    var boundArgs = tail(arguments);
    return function() {
      return fn.apply(fn, boundArgs.concat(toArray(arguments)));
    };
  }
  
  function compose() {
    var fns = arguments,
        length = arguments.length;

    return function () {
        var i = length,
            args = arguments;
        // we need to go in reverse order
        while ( --i >= 0 ) {
            args = [fns[i].apply(this, args)];
        }
        return args[0];
    };
  }
  
  /* Higher Order Functions */
  function createFactoryMethod(Ctor) {
    return function() {
      return new Ctor();
    };
  }
  
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
  
  function navigateBoard(board, num) {
    var withinBounds = partial(inclusive, 0, board.cells.length);
    return function(originIdx) {
      var tgtIdx = originIdx + num;
      return withinBounds(tgtIdx) ? tgtIdx : null;
    };
  }
  
  function slotIsEmpty(slot) {
    return slot.piece === null;
  }
  
  /* Misc helpers */
  function inclusive(min, max, num) {
    if (num < min) { 
      return false;
    } else if (num > max) {
      return false;
    } else {
      return true;
    }
  }
  
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
  
  addToNamespace(C4.Util,
    createFactoryMethod, buildElement, slotIsEmpty, navigateBoard
  );
  
  addToNamespace(C4.F,
    isFunction, not, negate, toArray, first, tail, partial, compose, inclusive
  );
})(this, this.C4);