(function(g, C4, Util, F) {
  'use strict';

  function highlightSlot(slot, color) {
    slot.el.style.background = color || 'red';
  }
  
  function highlight(el, color) {
    el.style.background = color || 'red';
  }

  function reloadPage() {
    location.reload();
  }

  C4.Game = function Game(players, el) {
    this.el = el;
    this.players = players || [];
    this.currentPlayer = F.first(players) || null;
    this.active = true;
    this.winningPlayer = null;
    
    this.displayPlayerState(this.currentPlayer.name + "'s turn");
  };

  C4.Game.prototype.advanceToNextPlayer = function advanceToNextPlayer() {
    var currentPlayerIndex = this.players.indexOf(this.currentPlayer);
    this.currentPlayer = this.players[(currentPlayerIndex + 1) % this.players.length];
    this.displayPlayerState(this.currentPlayer.name + "'s turn");
  };

  C4.Game.prototype.showEndOfGameMessage = function showEndOfGameMessage(message, cb) {
    if (cb && window.confirm(message)) {
      cb();
    } else {
      window.alert(message);
    }
  };

  C4.Game.prototype.declareWinner = function declareWinner(player) {
    this.active = false;
    this.winningPlayer = player;
    this.displayPlayerState(player.name + ' Wins!');
  };

  C4.Game.prototype.displayPlayerState = function displayPlayerState(msg) {
    this.el.textContent = msg;
  };

  C4.Board = function Board(w, h, CellClass, game) {
    this.width = w || 0;
    this.height = h || 0;
    this.cells = new Array(this.width * this.height);
    this.game = game || null;

    if (CellClass) {
      for(var i = 0 ; i < this.cells.length ; i++) {
        this.cells[i] = new CellClass();
      }
    }
    
    this.withinBounds = F.partial(F.inclusive, 0, this.cells.length);
    
    // this.getNCellIdx  = Util.navigateBoard(this, -1);
    // this.getNECellIdx = Util.navigateBoard(this, 5);
    // this.getECellIdx  = Util.navigateBoard(this, 6);
    // this.getSECellIdx = Util.navigateBoard(this, 7);
    // this.getSCellIdx  = Util.navigateBoard(this, 1);
    // this.getSWCellIdx = Util.navigateBoard(this, -5);
    // this.getWCellIdx  = Util.navigateBoard(this, -6);
    // this.getNWCellIdx = Util.navigateBoard(this, -7);
  };
  
  C4.Board.prototype.renderToElement = function renderToElement(el) {
    this.el = el;

    var slotEls = this.cells.reduce(function(frag, slot) {
      frag.appendChild(slot.getElement());
      return frag;
    }, document.createDocumentFragment());

    this.el.appendChild(slotEls);
    this.bindEvents();
  };

  C4.Board.prototype.bindEvents = function bindEvents() {
    var board = this;

    this.el.addEventListener('click', function(ev) {
      ev = ev || window.event;

      if (ev.target.classList.contains('slot')) {
        var tgtIdx = board.playPieceToColumnFromEl(board.game.currentPlayer, ev.target);

        if (board.noMovesLeft()) {
          board.game.active = false;
          board.game.displayPlayerState('Game Over');
          board.game.showEndOfGameMessage('There are no moves left. Play again?', reloadPage);
        } else if (board.winnerDetected(tgtIdx)) {
          board.game.active = false;
          var winningPlayer = board.game.winningPlayer;
          board.game.showEndOfGameMessage(winningPlayer.name + ' WINS!! Play again?', reloadPage);
        } else {
          board.game.advanceToNextPlayer();
        }
      }
    }, false);
  };
  
  C4.Board.prototype.isTopEdgeIdx = function isTopEdgeIdx(idx) {
    // All top edge slot indicies are 0 and multiples of the height
    return idx % this.height === 0;
  };

  C4.Board.prototype.isLeftEdgeIdx = function isLeftEdgeIdx(idx) {
    // All left edge slot indicies are less than the height and greater than or equal to 0
    return F.inclusive(0, this.height - 1, idx);
  };

  C4.Board.prototype.isRightEdgeIdx = function isRightEdgeIdx(idx) {
    // Right edge slot indicies are less than total cells and greater than or equal to the total cells minus the height
    var totalCells = this.cells.length;
    return F.inclusive(totalCells - this.height, totalCells - 1, idx);
  };

  C4.Board.prototype.isBottomEdgeIdx = function isBottomEdgeIdx(idx) {
    // Bottom edge slot indicies are multiples of the height minus 1
    return idx % this.height === (this.height - 1);
  };
  
  C4.Board.prototype.getNCellIdx  = function getNCellIdx(originIdx) {
    if (this.isTopEdgeIdx(originIdx)) {
      return null;
    }

    // North is one previous
    var tgtIdx = originIdx + F.negate(1);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };

  C4.Board.prototype.getNECellIdx = function getNECellIdx(originIdx) {
    if (this.isTopEdgeIdx(originIdx) || this.isRightEdgeIdx(originIdx)) {
      return null;
    }

    // NorthEast is board height minus 1
    var tgtIdx = originIdx + (this.height - 1);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };

  C4.Board.prototype.getECellIdx  = function getECellIdx(originIdx) {
    if (this.isRightEdgeIdx(originIdx)) {
      return null;
    }

    // East is board height
    var tgtIdx = originIdx + (this.height);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };

  C4.Board.prototype.getSECellIdx = function getSECellIdx(originIdx) {
    if (this.isBottomEdgeIdx(originIdx) || this.isRightEdgeIdx(originIdx)) {
      return null;
    }

    // SouthEast is board height plus 1
    var tgtIdx = originIdx + (this.height + 1);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };

  C4.Board.prototype.getSCellIdx  = function getSCellIdx(originIdx) {
    if (this.isBottomEdgeIdx(originIdx)) {
      return null;
    }

    // South is next cell
    var tgtIdx = originIdx + (1);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };

  C4.Board.prototype.getSWCellIdx = function getSWCellIdx(originIdx) {
    if (this.isBottomEdgeIdx(originIdx) || this.isLeftEdgeIdx(originIdx)) {
      return null;
    }

    // SouthWest is board height minus 1 negated
    var tgtIdx = originIdx + F.negate(this.height - 1);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };

  C4.Board.prototype.getWCellIdx  = function getWCellIdx(originIdx) {
    if (this.isLeftEdgeIdx(originIdx)) {
      return null;
    }

    // NorthEast is board height minus 1
    var tgtIdx = originIdx + F.negate(this.height);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };

  C4.Board.prototype.getNWCellIdx = function getNWCellIdx(originIdx) {
    if (this.isTopEdgeIdx(originIdx) || this.isLeftEdgeIdx(originIdx)) {
      return null;
    }

    // NorthEast is board height minus 1
    var tgtIdx = originIdx + F.negate(this.height + 1);

    return this.withinBounds(tgtIdx) ? tgtIdx : null;
  };
  
  C4.Board.prototype.noMovesLeft = function noMovesLeft() {
    var noMovesLeftRes = F.not(this.cells.some(Util.slotIsEmpty));
    
    if (noMovesLeftRes) {
      this.game.displayPlayerState('Game Over');
    }
    
    return noMovesLeftRes;
  };

  C4.Board.prototype.winnerDetected = function winnerDetected(originSlotIdx) {
    var originSlot = this.cells[originSlotIdx];
    /*
    highlightSlot(this.cells[this.getNCellIdx(originSlotIdx)]);
    highlightSlot(this.cells[this.getNECellIdx(originSlotIdx)], 'orange');
    highlightSlot(this.cells[this.getECellIdx(originSlotIdx)], 'yellow');
    highlightSlot(this.cells[this.getSECellIdx(originSlotIdx)], 'green');
    highlightSlot(this.cells[this.getSCellIdx(originSlotIdx)], 'blue');
    highlightSlot(this.cells[this.getSWCellIdx(originSlotIdx)], 'indigo');
    highlightSlot(this.cells[this.getWCellIdx(originSlotIdx)], 'violet');
    highlightSlot(this.cells[this.getNWCellIdx(originSlotIdx)], 'black');
    return false;
    */
    var inARow = 1;
    var player = originSlot.piece.player;
    var nextInlineSlotIdx = this.getNCellIdx(originSlotIdx);
    var nextInlineSlot = this.cells[nextInlineSlotIdx];
    
    // There are better ways to do this
    
    // Check vertical (|)
    while(nextInlineSlot) {
      if (nextInlineSlot.hasPlayerPiece(player)) {
        inARow++;
        nextInlineSlotIdx = this.getNCellIdx(nextInlineSlotIdx);
        nextInlineSlot = this.cells[nextInlineSlotIdx];
      } else {
        break;
      }

    }

    nextInlineSlotIdx = this.getSCellIdx(originSlotIdx);
    nextInlineSlot = this.cells[nextInlineSlotIdx];
    while(nextInlineSlot) {
      if (nextInlineSlot.hasPlayerPiece(player)) {
        inARow++;
        nextInlineSlotIdx = this.getSCellIdx(nextInlineSlotIdx);
        nextInlineSlot = this.cells[nextInlineSlotIdx];
      } else {
        break;
      }
    }
    
    // Check diagonal (/)
    if (inARow < 4) {
      inARow = 1;
      nextInlineSlotIdx = this.getNWCellIdx(originSlotIdx);
      nextInlineSlot = this.cells[nextInlineSlotIdx];
      while(nextInlineSlot) {
        if (nextInlineSlot.hasPlayerPiece(player)) {
          inARow++;
          nextInlineSlotIdx = this.getNWCellIdx(nextInlineSlotIdx);
          nextInlineSlot = this.cells[nextInlineSlotIdx];
        } else {
          break;
        }
      }
      
      nextInlineSlotIdx = this.getSECellIdx(originSlotIdx);
      nextInlineSlot = this.cells[nextInlineSlotIdx];
      while(nextInlineSlot) {
        if (nextInlineSlot.hasPlayerPiece(player)) {
          inARow++;
          nextInlineSlotIdx = this.getSECellIdx(nextInlineSlotIdx);
          nextInlineSlot = this.cells[nextInlineSlotIdx];
        } else {
          break;
        }
      }
    }
    
    // Check horizontal (-)
    if (inARow < 4) {
      inARow = 1;
      nextInlineSlotIdx = this.getWCellIdx(originSlotIdx);
      nextInlineSlot = this.cells[nextInlineSlotIdx];
      while(nextInlineSlot) {
        if (nextInlineSlot.hasPlayerPiece(player)) {
          inARow++;
          nextInlineSlotIdx = this.getWCellIdx(nextInlineSlotIdx);
          nextInlineSlot = this.cells[nextInlineSlotIdx];
        } else {
          break;
        }
      }
      
      nextInlineSlotIdx = this.getECellIdx(originSlotIdx);
      nextInlineSlot = this.cells[nextInlineSlotIdx];
      while(nextInlineSlot) {
        if (nextInlineSlot.hasPlayerPiece(player)) {
          inARow++;
          nextInlineSlotIdx = this.getECellIdx(nextInlineSlotIdx);
          nextInlineSlot = this.cells[nextInlineSlotIdx];
        } else {
          break;
        }
      }
    }
    
    // Check diagonal (\)
    if (inARow < 4) {
      inARow = 1;
      nextInlineSlotIdx = this.getSWCellIdx(originSlotIdx);
      nextInlineSlot = this.cells[nextInlineSlotIdx];
      while(nextInlineSlot) {
        if (nextInlineSlot.hasPlayerPiece(player)) {
          inARow++;
          nextInlineSlotIdx = this.getSWCellIdx(nextInlineSlotIdx);
          nextInlineSlot = this.cells[nextInlineSlotIdx];
        } else {
          break;
        }
      }
      
      nextInlineSlotIdx = this.getNECellIdx(originSlotIdx);
      nextInlineSlot = this.cells[nextInlineSlotIdx];
      while(nextInlineSlot) {
        if (nextInlineSlot.hasPlayerPiece(player)) {
          inARow++;
          nextInlineSlotIdx = this.getNECellIdx(nextInlineSlotIdx);
          nextInlineSlot = this.cells[nextInlineSlotIdx];
        } else {
          break;
        }
      }
    }
    
    if (inARow >= 4) {
      this.game.declareWinner(player);
      return true;
    }
    
    return false;
  };

  C4.Board.prototype.playPieceToColumn = function playPieceToColumn(player, colIdx) {
    if (!this.game.active) {
      this.game.showEndOfGameMessage('The game is over. Play again?', reloadPage);
      return;
    }

    var colTopCellIdx = (colIdx - 1) * this.height;
    // The the topmost cell in the "column" that doesn't have a piece yet
    var tgtSlot = this.cells.slice(colTopCellIdx, colTopCellIdx + this.height).filter(function(slot) {
      return slot.piece === null;
    }).pop();

    if (tgtSlot) {
      tgtSlot.playPiece(new C4.Piece(player));
      return this.cells.indexOf(tgtSlot);
    }
    
    return false;
  };

  C4.Board.prototype.playPieceToColumnFromEl = function playPieceToColumnFromEl(player, slotEl) {
    var slotIdx = this.getSlotIndexFromEl(slotEl);
    var columnIdx = ((slotIdx - (slotIdx % this.height)) / this.height) + 1;
    return this.playPieceToColumn(player, columnIdx);
  };

  C4.Board.prototype.getSlotIndexFromEl = function getSlotIndexFromEl(slotEl) {
    for (var i = 0 ; i < this.cells.length ; i++) {
      if (this.cells[i].el === slotEl) {
        return i;
      }
    }
    
    return -1;
  };

  C4.Player = function Player(name, color) {
    this.name = name;
    this.color = color;
  };

  C4.Slot = function Slot(piece) {
    this.klass = 'slot';
    this.piece = piece || null;
  };

  C4.Slot.prototype.getElement = function getElement() {
    if (!this.el) {
      this.el = Util.buildElement('div', { 'className' : this.klass });
    }

    return this.el;
  };
  
  C4.Slot.prototype.playPiece = function playPiece(piece) {
    this.piece = piece;
    this.el.appendChild(this.piece.getElement());
  };

  C4.Slot.prototype.hasPiece = function hasPiece() {
    return this.piece !== null;
  };

  C4.Slot.prototype.hasPlayerPiece = function hasPlayerPiece(player) {
    return this.hasPiece() && this.piece.player === player;
  };

  C4.Piece = function Piece(player) {
    this.player = player || null;
    this.color = (player && player.color) || null;
    this.klass = 'piece';
  };
  
  C4.Piece.prototype.getElement = function getElement() {
    if (!this.el) {
      var nsKlass = [this.klass, this.color.label].join('-');
      this.el = Util.buildElement('span', { 'className' : [this.klass, nsKlass].join(' ') });
    }

    return this.el;
  };

  C4.Color = function Color(hex, label) {
    this.hex = hex;
    this.label = label;
  };
  
})(this, this.C4, this.C4.Util, this.C4.F);