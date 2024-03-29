// com.aleiby.ippl
// /Applications/iPPL.app/main.js

Plugins.load("UIKit");
Plugins.load("iPPLcore");

Application.setStatusBarMode(1,1,0,0);

var settings = {
  tickInterval: 0.1,
  feedInterval: 0.07
};

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

iPPLcore.Init();  //!!ARL: Pass in num cols, rows, types, etc.

function NewBoard()
{
  //!!ARL: Expose BoardIterator (EachBlock) to Javascript.
  
  // Clear first half of board.
  var filledRows = Math.floor(BOARD_ROWS / 2);
  for (var row=0; row<filledRows; row++)
    for (var col=0; col<BOARD_COLS; col++)
      iPPLcore.SetBlockType(row,col,0); // empty

  // Fill in the rest with normal blocks (not special).      
  for (var row=filledRows; row<BOARD_ROWS; row++)
    for (var col=0; col<BOARD_COLS; col++)
      iPPLcore.SetBlockType(Math.floor(Math.random()*5 + 1));
  
  // Update until the blocks settle.
  function Settled()
  {
    for (var row=filledRows; row<BOARD_ROWS; row++)
    {
      for (var col=0; col<BOARD_COLS; col++)
        if (iPPLcore.IsLocked(row,col))
          return false;
    }
    return true;
  }
  do { iPPLcore.Update(); } while (!Settled());
  
  // Feed one line so we have a locked row on the bottom to start with.
  iPPLcore.Feed();
}
NewBoard();

// Create a frame for the board.
var boardWidth = BLOCK_SIZE*BOARD_COLS;
var boardHeight = BLOCK_SIZE*BOARD_ROWS;
var frameView = new UIView([24,30,boardWidth,boardHeight]);
frameView.clipsSubviews = true;
mainView.addSubview(frameView);

// Create a playing board.
var boardView = new UIView([0,0,boardWidth,boardHeight]);
frameView.addSubview(boardView);

// Load up the images for all of our blocks.
var imageNames = [];
var images = {empty:null, red:null, green:null, blue:null, yellow:null, pink:null, special:null};
for (var name in images)
{
  imageNames.push(name);
  images[name] = new Image("res/"+name+".png");
}

// Add a set of blocks.
boardView.blocksView = new UIView();
for (var row=0; row<BOARD_ROWS; row++)
  for (var col=0; col<BOARD_COLS; col++)
  {
    var block = new UIImageView(null);
    block.origin = [BLOCK_SIZE*col,BLOCK_SIZE*row];
    boardView.blocksView.addSubview(block);
  }
boardView.addSubview(boardView.blocksView);

// Update images based on current game state.
boardView.blocksView.update = function()
{
  //!!ARL: Register callback for changes instead?
  var blocks = this.subviews;
  for (var i=0, row=0; row<BOARD_ROWS; row++)
    for (var col=0; col<BOARD_COLS; col++)
    {
      var type = iPPLcore.GetBlockType(row,col);
      var name = imageNames[type];
      blocks[i++].setImage(images[name]);
    }
}

// Some simple animation support.
boardView.blocksView.swapRow = function(row,colA,colB)
{
  var views = this.subviews;

  var viewA = views[row * BOARD_COLS + colA];
  var viewB = views[row * BOARD_COLS + colB];

  var originA = viewA.origin;
  var originB = viewB.origin;

  viewA.origin = originB;
  viewB.origin = originA;
  
  UIViewAnimation.beginAnimations()
  UIViewAnimation.setAnimationDuration(settings.tickInterval);
 
  viewA.origin = originA;
  viewB.origin = originB;
 
  UIViewAnimation.endAnimations();
}
boardView.blocksView.moveCol = function(col,rowA,rowB)
{
  var views = this.subviews;

  var viewA = views[rowA * BOARD_COLS + col];
  var viewB = views[rowB * BOARD_COLS + col];

  var originA = viewA.origin;
  var originB = viewB.origin;

  viewA.origin = originB;
  
  UIViewAnimation.beginAnimations()
  UIViewAnimation.setAnimationDuration(settings.tickInterval);
  UIViewAnimation.setAnimationCurve(3); // linear
 
  viewA.origin = originA;
 
  UIViewAnimation.endAnimations();
}
boardView.blocksView.flash = function(row,col)
{
  var view = this.subviews[row * BOARD_COLS + col];
  
  view.alpha = 0.0;

  UIViewAnimation.beginAnimations()
  UIViewAnimation.setAnimationDuration(settings.tickInterval);
  
  view.alpha = 1.0;
  
  UIViewAnimation.endAnimations();
}

// Give the board a selector.
boardView.selectedView = new UIImageView(new Image("res/selected.png"));
boardView.colGivenX = function(x) { return parseInt(x / this.frame.getWidth() * BOARD_COLS); };
boardView.rowGivenY = function(y) { return parseInt(y / this.frame.getHeight() * BOARD_ROWS); };
boardView.onMouseDown = function(event)
{
  var loc = event.locationInView;
  var col = this.colGivenX(loc.getX());
  var row = this.rowGivenY(loc.getY());

  this.dragStart = loc.getY();
  this.selectedRow = row;
  this.selectedCol = col;
  this.desiredCol = col;
  this.selectedView.origin = [(col-(col>2))*BLOCK_SIZE,row*BLOCK_SIZE];
  this.selectedView.alpha = 1.0;
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

// Helper functions.
boardView.GetSelectedType = function()
{
  if (boardView.selectedRow && boardView.selectedCol)
    return iPPLcore.GetBlockType(boardView.selectedRow,boardView.selectedCol);
    
  return undefined;
}
boardView.reset = function()
{
  this.selectedRow = this.selectedCol = this.desiredCol = undefined;
  this.selectedView.alpha = 0.0;
}
boardView.reset();

// Feed support.
boardView.setFeedOffset = function(offset)
{
  if (boardView.blocksFalling)
    return;
    
  if (boardView.blocksBreaking)
    return;

  this.feedOffset = offset;
  this.origin = [this.origin.getX(),BLOCK_SIZE-this.feedOffset];
}
boardView.setFeedOffset(0.0);

// Auto-feed support.
boardView.feedTimer = new Timer(0.0);
boardView.feedTimer.onTimer = function(timer)
{
  boardView.setFeedOffset(boardView.feedOffset+1.0);
}
boardView.feedTimer.start(settings.feedInterval);

// Finally, some game logic.
boardView.timer = new Timer(settings.tickInterval);
boardView.timer.onTimer = function(timer)
{
  // Update feed...
  while (boardView.feedOffset >= BLOCK_SIZE)
  {
    if (!iPPLcore.Feed())
    {
      boardView.GameOver();
      return;
    }

    boardView.setFeedOffset(boardView.feedOffset-BLOCK_SIZE);
    if (boardView.selectedRow > 0)
    {
      boardView.selectedRow -= 1;
      boardView.selectedView.origin =
        [boardView.selectedView.origin.getX(),
        boardView.selectedRow * BLOCK_SIZE];
    }
  }

  // All the real magic happens here.
  iPPLcore.Update();

  // Animate blocks that fell/broke this update...
  boardView.blocksFalling = false;
  boardView.blocksBreaking = false;
  for (var row=0; row<BOARD_ROWS; row++)
    for (var col=0; col<BOARD_COLS; col++)
      if (iPPLcore.IsFalling(row,col))
      {
        boardView.blocksFalling = true;
        boardView.blocksView.moveCol(col,row,row-1);
      }
      else if (iPPLcore.IsBreaking(row,col))
      {
        boardView.blocksBreaking = true;
        boardView.blocksView.flash(row,col);
      }

  // Update dragging...
  if (boardView.selectedRow)
  {
    // Auto-release if our selected block is breaking.
    if (iPPLcore.IsBreaking(boardView.selectedRow, boardView.selectedCol))
    {
      boardView.reset();
    }
    // Update selection when falling.
    else if (boardView.selectedRow < BOARD_ROWS-1 &&
      iPPLcore.IsFalling(boardView.selectedRow+1,boardView.selectedCol))
    {
      ++boardView.selectedRow;
      var origin = boardView.selectedView.origin;
      boardView.selectedView.origin = [origin.getX(),origin.getY()+BLOCK_SIZE];
    }
    // Drag left.
    else if (boardView.desiredCol < boardView.selectedCol &&
      iPPLcore.MoveLeft(boardView.selectedRow, boardView.selectedCol))
    {
      var from = boardView.selectedCol--;
      boardView.blocksView.swapRow(boardView.selectedRow,from,boardView.selectedCol);
      boardView.selectedView.origin = [Math.min(boardView.selectedCol,BOARD_COLS-2)*BLOCK_SIZE,
        boardView.selectedView.origin.getY()];
    }
    // Drag right.
    else if (boardView.desiredCol > boardView.selectedCol &&
      iPPLcore.MoveRight(boardView.selectedRow, boardView.selectedCol))
    {
      var from = boardView.selectedCol++;
      boardView.blocksView.swapRow(boardView.selectedRow,from,boardView.selectedCol);
      boardView.selectedView.origin = [Math.max(boardView.selectedCol-1,0)*BLOCK_SIZE,
        boardView.selectedView.origin.getY()];
    }
  }

  boardView.blocksView.update();
}
boardView.timer.start();

// Handle losing...
boardView.GameOver = function()
{
  boardView.timer.stop();
  boardView.feedTimer.stop();
  
  var redOut = new UIView(boardView.frame);
  redOut.backgroundColor = [1,1,1,1];
  boardView.addSubview(redOut);
  boardView.bringSubviewToFront(redOut);
  
  UIViewAnimation.beginAnimations();
  UIViewAnimation.setAnimationDuration(0.5);
  UIViewAnimation.setAnimationCurve(2); //ease-out
  redOut.backgroundColor = [0.8,0,0,0.3];
  UIViewAnimation.endAnimations();
  
  var text = new UITextView([6,520,200,50], "Game Over!");
  text.backgroundColor = [0,0,0,0];
  text.textColor = [1,1,1,1];
  text.textSize = 32;
  boardView.addSubview(text);
  boardView.bringSubviewToFront(text);
  
  UIViewAnimation.beginAnimations();
  UIViewAnimation.setAnimationDuration(1.5);
  text.origin = [6,126];
  UIViewAnimation.endAnimations();
}
