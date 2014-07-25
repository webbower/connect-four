(function (g, doc, C4) {
  'use strict';

  var game = new C4.Game(
    [
      new C4.Player('Black', new C4.Color('#000000', 'black')),
      new C4.Player('Red', new C4.Color('#FF0000', 'red'))
    ],
    document.getElementById('gamestate')
  );

  var board = new C4.Board(7, 6, C4.Slot, game);
  board.renderToElement(doc.getElementById('board'));

  // board.playPieceToColumn(p1, 3);
  // board.playPieceToColumn(p2, 3);
  // board.playPieceToColumn(p1, 3);
  // board.playPieceToColumn(p2, 3);
  // board.playPieceToColumn(p1, 3);
  // board.playPieceToColumn(p2, 3);
  // board.cells[15].playPiece(new C4.Piece(p1.color));

})(this, this.document, this.C4);