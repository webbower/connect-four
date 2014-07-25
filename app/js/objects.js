(function(g, C4, Util, F) {
  'use strict';

  // Wrapper that can be passed as a callback
  function reloadPage() {
    location.reload();
  }

  //// Game Object
  // For tracking game state
  C4.Game = function Game(players, el) {
    // Element to render state to
    this.el = el;
    // List of players
    this.players = players || [];
    // The current player
    this.currentPlayer = F.first(players) || null;
    // The game is currently unfinished
    this.active = true;
    // Which player won
    this.winningPlayer = null;
    
    // Initialize player state UI
    this.displayPlayerState(this.currentPlayer.name + "'s turn");
  };

  // Sets the next player in sequence to be the next player
  C4.Game.prototype.advanceToNextPlayer = function advanceToNextPlayer() {
    var currentPlayerIndex = this.players.indexOf(this.currentPlayer);
    this.currentPlayer = this.players[(currentPlayerIndex + 1) % this.players.length];
    this.displayPlayerState(this.currentPlayer.name + "'s turn");
  };

  // Utility method to show end of game message and optionally perform an action
  C4.Game.prototype.showEndOfGameMessage = function showEndOfGameMessage(message, cb) {
    if (cb && window.confirm(message)) {
      cb();
    } else {
      window.alert(message);
    }
  };

  // Ends the game
  C4.Game.prototype.gameOver = function gameOver() {
    this.active = false;
  };

  // End the game with a winner and update the game state UI
  C4.Game.prototype.declareWinner = function declareWinner(player) {
    this.gameOver();
    this.winningPlayer = player;
    this.displayPlayerState(player.name + ' Wins!');
  };

  // Update game state UI method
  C4.Game.prototype.displayPlayerState = function displayPlayerState(msg) {
    this.el.textContent = msg;
  };

  //// Board Object
  // For managing slots/tiles on the board
  // NOTE: Could have an abstracted superclass of Grid to allow for varieties of grid-style playfield types
  C4.Board = function Board(w, h, CellClass, game) {
    // Grid width
    this.width = w || 0;
    // Grid height
    this.height = h || 0;
    // List of cells. Cells are represented as a list and use array math (or whatever it's called) to traverse as a grid
    this.cells = new Array(this.width * this.height);
    // Optional game state
    this.game = game || null;

    // Initialize all the board cells
    if (CellClass) {
      for(var i = 0 ; i < this.cells.length ; i++) {
        this.cells[i] = new CellClass();
      }
    }
    
    // Dynamically create utility method to check if a cell index is within the bounds of the board
    this.withinBounds = F.partial(F.inclusive, 0, this.cells.length);
  };
  
  // Render and bind the board to a specific DOM element
  C4.Board.prototype.renderToElement = function renderToElement(el) {
    this.el = el;

    var slotEls = this.cells.reduce(function(frag, slot) {
      frag.appendChild(slot.getElement());
      return frag;
    }, document.createDocumentFragment());

    this.el.appendChild(slotEls);
    this.bindEvents();
  };

  // Handler for clicking to play a piece
  C4.Board.prototype.handlePlayPiece = function handlePlayPiece(ev) {
    // Play the piece to the board
    var tgtIdx = this.playPieceToColumnFromEl(this.game.currentPlayer, ev.target);

    if (this.noMovesLeft()) {
      // First check if any more move can be made
      this.game.showEndOfGameMessage('There are no moves left. Play again?', reloadPage);
    } else if (this.winnerDetected(tgtIdx)) {
      // Check if someone won
      var winningPlayer = this.game.winningPlayer;
      this.game.showEndOfGameMessage(winningPlayer.name + ' WINS!! Play again?', reloadPage);
    } else {
      // Switch player and continue
      this.game.advanceToNextPlayer();
    }
  };

  // Bind user interaction event(s)
  C4.Board.prototype.bindEvents = function bindEvents() {
    var board = this;

    // 
    this.el.addEventListener('click', function(ev) {
      ev = ev || window.event;

      if (ev.target.classList.contains('slot')) {
        board.handlePlayPiece(ev);
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
  
  // Check if any move are still possible (full board)
  C4.Board.prototype.noMovesLeft = function noMovesLeft() {
    // If there's one open slot, moves are still possible
    // Method to check if slot is empty isn't an instance method because it can't be pased functionally
    var noMovesLeftRes = F.not(this.cells.some(Util.slotIsEmpty));
    
    // If there's no move lefts, end the game and update the game state UI
    if (noMovesLeftRes) {
      this.game.gameOver();
      this.game.displayPlayerState('Game Over');
    }
    
    return noMovesLeftRes;
  };

  // Check for a winner
  C4.Board.prototype.winnerDetected = function winnerDetected(originSlotIdx) {
    // Start with receiving the index of the slot that got the piece played on it
    // Get the corresponding slot instance
    var originSlot = this.cells[originSlotIdx];
    // Well, they got one in a row right off the bat
    var inARow = 1;
    // Get the reference to the player who played the piece
    var player = originSlot.piece.player;
    // Start checking upward
    var nextInlineSlotIdx = this.getNCellIdx(originSlotIdx);
    var nextInlineSlot = this.cells[nextInlineSlotIdx];
    
    // There are better ways to do this
    
    // Check vertical (|)
    // While there is even a next slot (not at the edge)
    while(nextInlineSlot) {
      // If the next slot in line is the same player's piece...
      if (nextInlineSlot.hasPlayerPiece(player)) {
        // ...another in a row...
        inARow++;
        // ...and get the next slot in the same line
        nextInlineSlotIdx = this.getNCellIdx(nextInlineSlotIdx);
        nextInlineSlot = this.cells[nextInlineSlotIdx];
      } else {
        // Next piece wasn't owned by the same player
        break;
      }

    }

    // Then check the same way in the opposite direction
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
      // If they didn't get 4 in a row vertically, start the count over and check the next direction
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
    
    // The player won!
    if (inARow >= 4) {
      // Update the game state
      this.game.declareWinner(player);
      return true;
    }
    
    return false;
  };

  // Play a piece to a column (1 thru board.width, inclusive)
  C4.Board.prototype.playPieceToColumn = function playPieceToColumn(player, colIdx) {
    // If the game is over, prompt to start a new game
    if (!this.game.active) {
      this.game.showEndOfGameMessage('The game is over. Play again?', reloadPage);
      return;
    }

    var colTopCellIdx = (colIdx - 1) * this.height;
    // Get the the topmost cell in the "column" that doesn't have a piece yet
    var tgtSlot = this.cells.slice(colTopCellIdx, colTopCellIdx + this.height).filter(function(slot) {
      return slot.piece === null;
    }).pop();

    if (tgtSlot) {
      // If we found a valid slot, play a piece to it and return the index of said slot
      tgtSlot.playPiece(new C4.Piece(player));
      return this.cells.indexOf(tgtSlot);
    }
    
    return false;
  };

  // Helper method to calculate the column to play a piece to so anywhere can be clicked on the board to play a piece
  C4.Board.prototype.playPieceToColumnFromEl = function playPieceToColumnFromEl(player, slotEl) {
    // Get the index of the slot element
    var slotIdx = this.getSlotIndexFromEl(slotEl);
    // Get the index of the slot at the top of the column
    var columnIdx = ((slotIdx - (slotIdx % this.height)) / this.height) + 1;
    // Play a piece to the column
    return this.playPieceToColumn(player, columnIdx);
  };

  // Helper method to get the index of a slot element
  C4.Board.prototype.getSlotIndexFromEl = function getSlotIndexFromEl(slotEl) {
    for (var i = 0 ; i < this.cells.length ; i++) {
      if (this.cells[i].el === slotEl) {
        return i;
      }
    }
    
    return -1;
  };

  //// Player object
  // Simple typed data object for player data
  C4.Player = function Player(name, color) {
    // The player's name
    this.name = name;
    // The color of the player's pieces
    this.color = color;
  };

  //// Slot Object
  // The building block of a game board
  // NOTE: Could have an abstracted superclass of GridCell to allow for different units of grid-style playfields
  C4.Slot = function Slot(piece) {
    // Class for the DOM element
    this.klass = 'slot';
    // Reference to a piece played to this slot
    this.piece = piece || null;
  };

  // Generate and get the reference to the DOM element for this instance
  C4.Slot.prototype.getElement = function getElement() {
    if (!this.el) {
      this.el = Util.buildElement('div', { 'className' : this.klass });
    }

    return this.el;
  };
  
  // Play a piece to this slot
  C4.Slot.prototype.playPiece = function playPiece(piece) {
    this.piece = piece;
    this.el.appendChild(this.piece.getElement());
  };

  // Does this slot have a piece?
  C4.Slot.prototype.hasPiece = function hasPiece() {
    return this.piece !== null;
  };

  // Does this slot have a piece of a specific player?
  C4.Slot.prototype.hasPlayerPiece = function hasPlayerPiece(player) {
    return this.hasPiece() && this.piece.player === player;
  };

  //// Piece Object
  // Represents the pieces for the game
  C4.Piece = function Piece(player) {
    // Reference to the player that owns the piece
    this.player = player || null;
    // Reference to the color of the piece (used for rendering)
    this.color = (player && player.color) || null;
    // Class for the DOM element
    this.klass = 'piece';
  };
  
  // Generate and get the reference to the DOM element for this instance
  C4.Piece.prototype.getElement = function getElement() {
    if (!this.el) {
      var nsKlass = [this.klass, this.color.label].join('-');
      this.el = Util.buildElement('span', { 'className' : [this.klass, nsKlass].join(' ') });
    }

    return this.el;
  };

  //// Color Object
  // Simple typed data object for color data
  C4.Color = function Color(hex, label) {
    // HEx value of the color
    this.hex = hex;
    // Label for the color
    this.label = label;
  };
  
})(this, this.C4, this.C4.Util, this.C4.F);