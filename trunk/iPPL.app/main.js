// com.aleiby.ippl
// /Applications/iPPL.app/main.js

Plugins.load("UIKit");

var window = new UIWindow(UIHardware.fullScreenApplicationContentRect);
window.setHidden(false);
window.orderFront();
window.makeKey();
window.backgroundColor = [0,0,0,0.5];

var mainView = new UIView();
window.setContentView(mainView);

// Some constants.
var BLOCK_SIZE = 34;
var BOARD_COLS = 6;
var BOARD_ROWS = 12;

// Some rect helpers.
Array.prototype.getX      = function() { return this[0]; }
Array.prototype.getY      = function() { return this[1]; }
Array.prototype.getWidth  = function() { return this[2]; }
Array.prototype.getHeight = function() { return this[3]; }
Array.prototype.getOrigin = function() { return this.split(0,2); }

// Create a frame for the board.
var frameView = new UIView([24,30,BLOCK_SIZE*BOARD_COLS,BLOCK_SIZE*BOARD_ROWS-1]);
frameView.clipsSubviews = true;
mainView.addSubview(frameView);

// Create a playing board.
var boardWidth = BLOCK_SIZE*BOARD_COLS;
var boardHeight = BLOCK_SIZE*BOARD_ROWS;
var boardView = new UIView([0,0,boardWidth,boardHeight]);
frameView.addSubview(boardView);

// Load up the images for all of our blocks.
var images = {empty:null, red:null, green:null, blue:null, yellow:null, pink:null, special:null};
for (var name in images)
  images[name] = new Image("res/"+name+".png");

// Add a set of blocks.
boardView.blocksView = new UIView();
for (var row = 0; row < BOARD_ROWS; row++)
  for (var col = 0; col < BOARD_COLS; col++)
  {
    var block = new UIImageView(images.green); //(null);
    block.origin = [BLOCK_SIZE*col,BLOCK_SIZE*row];
    boardView.blocksView.addSubview(block);
  }
boardView.addSubview(boardView.blocksView);

// Some simple animation support.
boardView.blocksView.swapBlocks = function(viewA,viewB)
{
  var frameA = viewA.frame;
  var frameB = viewB.frame;

  viewA.frame = frameB;
  viewB.frame = frameA;

  var animA = new UIFrameAnimation(viewA, 0, viewA.frame, frameA);
  var animB = new UIFrameAnimation(viewB, 0, viewB.frame, frameB);

  Animator.addAnimation(animA, 0.1, true);
  Animator.addAnimation(animB, 0.1, true);
}
boardView.blocksView.swapRow = function(row,colA,colB)
{
  var offset = row * BOARD_COLS;
  var viewA = this.subviews[offset+colA];
  var viewB = this.subviews[offset+colB];
  this.swapBlocks(viewA,viewB);
}

// Give the board a selector.
boardView.selectedView = new UIImageView(new Image("res/selected.png"));
boardView.colGivenX = function(x) { return parseInt(x / this.frame.getWidth() * BOARD_COLS); };
boardView.rowGivenY = function(y) { return parseInt(y / this.frame.getHeight() * BOARD_ROWS); };
boardView.onMouseDown = function(event)
{
  var loc = event.locationInView;
  var row = this.rowGivenY(loc.getY());
  var col = this.colGivenX(loc.getX());

  this.dragStart = loc.getY();
  this.selectedRow = row;
  this.selectedCol = col;
  this.desiredCol = col;
  this.selectedView.origin = [(col-(col>2))*BLOCK_SIZE,row*BLOCK_SIZE];
}
boardView.onMouseDragged = function(event)
{
  this.desiredCol = this.colGivenX(event.locationInView.getX());
}
boardView.addSubview(boardView.selectedView);

// Mask out the last/locked row.
var bottomRow = new UIView([0,boardHeight-BLOCK_SIZE,boardWidth,BLOCK_SIZE]);
bottomRow.backgroundColor = [0,0,0,1];
bottomRow.alpha = 0.7;
boardView.addSubview(bottomRow);

// Finally, some game logic.
boardView.timer = new Timer(0.15);
boardView.timer.onTimer = function(timer)
{
  // Update dragging...
  if (boardView.selectedRow)
  {
    if (boardView.desiredCol < boardView.selectedCol && boardView.selectedCol > 0)
    {
      var from = boardView.selectedCol--;
      boardView.blocksView.swapRow(boardView.selectedRow,from,boardView.selectedCol);
      boardView.selectedView.origin = [Math.min(boardView.selectedCol,BOARD_COLS-2)*BLOCK_SIZE,
        boardView.selectedView.origin.getY()];
    }
    else if (boardView.desiredCol > boardView.selectedCol && boardView.selectedCol < BOARD_COLS-1)
    {
      var from = boardView.selectedCol++;
      boardView.blocksView.swapRow(boardView.selectedRow,from,boardView.selectedCol);
      boardView.selectedView.origin = [Math.max(boardView.selectedCol-1,0)*BLOCK_SIZE,
        boardView.selectedView.origin.getY()];
    }
  }
}
boardView.timer.start();
