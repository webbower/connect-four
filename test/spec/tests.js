/* global module, expect, test, ok, equal, strictEqual */

(function (g) {
  'use strict';

  //// Utility testing methods

  // Test if value is a function
  // function isFunction(fn, message) {
  //   equal( typeof fn, 'function', message );
  // }

  // More expressive name to test for the existense of a value
  function exists(value, message) {
    ok(value !== undefined && value !== null, message);
  }

  // Tests if an instance is that of a specific constructor
  function isA(inst, ctor, message) {
    ok( inst instanceof ctor , message);
  }

  // Test for null value
  function isNull(value, message) {
    strictEqual(value, null, message);
  }

  module('Core tests');
  test('Check if namespace exists', function() {
    expect(1);
    ok( g.C4, 'Top-level namespace (C4) exists' );
  });
  
  // Local/short references
  var C4 = g.C4;
  var F = C4.F;
  var Util = C4.Util;
  
  module('Test data objects');
  test('Test Player Object', function() {
    expect(2);
    exists( C4.Player, 'Player constructor exists');
    isA( new C4.Player(), C4.Player, 'Player instances can be created');
  });

  test('Test Board Object', function() {
    // expect(3);
    exists( C4.Board, 'Board constructor exists');
    isA( new C4.Board(), C4.Board, 'Board instances can be created');

    var board = new C4.Board(4, 4, C4.Slot);
    strictEqual( board.cells.length, 16, 'Board cell created correct number of cells');
    
    var boardEl = document.getElementById('board');
    board.renderToElement(boardEl);
    ok(boardEl.firstElementChild.classList.contains('slot'), 'Board element contains a .slot element');
    equal(boardEl.childElementCount, board.cells.length, 'Board rendered one element per slot');
  });

  test('Test slot boundary detection', function() {
    var board = new C4.Board(4, 4);
    ok( board.isTopEdgeIdx(0), 'Index 0 is top edge');
    ok( board.isTopEdgeIdx(8), 'Index 8 is top edge');
    ok(!board.isTopEdgeIdx(7), 'Index 7 is not top edge');

    ok( board.isLeftEdgeIdx(0), 'Index 0 is left edge');
    ok( board.isLeftEdgeIdx(2), 'Index 2 is left edge');
    ok(!board.isLeftEdgeIdx(5), 'Index 5 is not left edge');

    ok( board.isRightEdgeIdx(15), 'Index 15 is right edge');
    ok( board.isRightEdgeIdx(13), 'Index 13 is right edge');
    ok(!board.isRightEdgeIdx(11), 'Index 11 is not right edge');

    ok( board.isBottomEdgeIdx(3), 'Index 3 is bottom edge');
    ok( board.isBottomEdgeIdx(7), 'Index 7 is bottom edge');
    ok(!board.isBottomEdgeIdx(8), 'Index 8 is not bottom edge');
  });
  
  test('Test board navigation', function() {
    var board = new C4.Board(4, 4, C4.Slot);
    
    equal(board.getNCellIdx(3), 2, 'Should get slot at one index before');
    equal(board.getNECellIdx(3), 6, 'Should get slot at 3 index after');
    equal(board.getECellIdx(3), 7, 'Should get slot at 4 index after');
    isNull(board.getSECellIdx(3), 'Bottom cell should get null');
    isNull(board.getSCellIdx(3), 'Bottom cell should get null');
    isNull(board.getSWCellIdx(3), 'Bottom/Left cell should get null');
    isNull(board.getWCellIdx(3), 'Left cell should get null');
    isNull(board.getNWCellIdx(3), 'Left cell should get null');
  });

  test('Test Game Object', function() {
    // expect(2);
    exists( C4.Game, 'Game constructor exists');
    
    var
      gameStateEl = document.getElementById('gamestate'),
      game = new C4.Game(
      [
        new C4.Player('Black', new C4.Color('#000000', 'black')),
        new C4.Player('Red', new C4.Color('#FF0000', 'red'))
      ],
      gameStateEl
    );

    isA( game, C4.Game, 'Game instances can be created');
    equal(gameStateEl.textContent, "Black's turn", 'Game state message is correct');
  });

  test('Test Slot Object', function() {
    expect(2);
    exists( C4.Slot, 'Slot constructor exists');
    isA( new C4.Slot(), C4.Slot, 'Slot instances can be created');
  });

  test('Test Piece Object', function() {
    expect(2);
    exists( C4.Piece, 'Piece constructor exists');
    isA( new C4.Piece(), C4.Piece, 'Piece instances can be created');
  });

  test('Test Player Color Object', function() {
    expect(2);
    exists( C4.Color, 'Color constructor exists');
    isA( new C4.Color(), C4.Color, 'Color instances can be created');
  });

  module('Functional method tests');
  test('test isFunction', function() {
    expect(2);
    ok(F.isFunction(function() {}), 'Function literal passes');
    ok(!F.isFunction(null), 'Null literal fails');
  });

  test('test not', function() {
    expect(2);
    ok(F.not(false), 'False literal converted to true');
    ok(!F.not(true), 'True literal converted to false');
  });

  // test('test first', function() {
  //   expect(2);
  //   var list = ['foo', 'bar', 'baz'];
  //   equal(F.first(list), 'foo', 'Failing to get first index');
  //   equal(F.first([]), undefined, 'Empty list does not get undefined');
  // });

})(this);