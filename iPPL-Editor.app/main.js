// com.aleiby.ippleditor
// /Applications/iPPL Editor.app/main.js

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

// Create a playing board.
var boardWidth = BLOCK_SIZE*BOARD_COLS;
var boardHeight = BLOCK_SIZE*BOARD_ROWS;
var boardView = new UIView([24,30,boardWidth,boardHeight]);
mainView.addSubview(boardView);

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
    var block = new UIImageView(images.empty);
    block.origin = [BLOCK_SIZE*col,BLOCK_SIZE*row];
    boardView.blocksView.addSubview(block);
  }
boardView.addSubview(boardView.blocksView);

// Add a radial menu block type selector.
boardView.radialMenu = new UIView();
for each (var image in images)
{
  if (image != images.empty)
  {
    var block = new UIImageView(image);
    boardView.radialMenu.addSubview(block);
  }
}
boardView.radialMenu.set = function(image)
{
  if (this.selected && this.selected.image != image)
    this.selected.setImage(image);
}
boardView.radialMenu.show = function(row,col)
{
  boardView.addSubview(boardView.radialMenu);
  this.origin = [col*BLOCK_SIZE,row*BLOCK_SIZE];
  this.selected = boardView.blocksView.subviews[row*BOARD_COLS+col];
  this.set(images.empty);

  // Start in the middle.
  var blocks = this.subviews;
  for each (var block in blocks)
  {
    block.origin = [0,0];
  }

  // Fan out evenly.
  UIViewAnimation.beginAnimations();
  UIViewAnimation.setAnimationDuration(0.3);
  for (var i=0; i<blocks.length; i++)
  {
    with (Math)
    {
       var theta = i / blocks.length * 2*PI;
       var r = 1.5*BLOCK_SIZE;
       var x = r*sin(theta);
       var y = r*cos(theta);

       blocks[i].origin = [x,y];
    }
  }
  UIViewAnimation.endAnimations();
}
boardView.radialMenu.select = function(loc)
{
  var dx = loc[0] - (this.origin[0] + BLOCK_SIZE/2);
  var dy = loc[1] - (this.origin[1] + BLOCK_SIZE/2);

  with (Math)
  {
    var r = sqrt(dx*dx + dy*dy);
    if (r < BLOCK_SIZE)
    {
      this.set(images.empty);
      return;
    }
    var blocks = this.subviews;
    var theta = atan2(dx/r, dy/r);
    theta += PI / blocks.length; // pull back half a segment
    while (theta < 0) // normalize 0 to 360
      theta += 2*PI;
    var i = parseInt(theta / (2*PI) * blocks.length);
    var name = imageNames[i+1];
    var image = images[name];
    this.set(image);
  }
}
boardView.radialMenu.hide = function()
{
  this.removeFromSuperview();
}

// Pop-up support for radial menu block type selector.
boardView.colGivenX = function(x) { return Math.floor(x / this.frame[2] * BOARD_COLS); };
boardView.rowGivenY = function(y) { return Math.floor(y / this.frame[3] * BOARD_ROWS); };
boardView.onMouseDown = function(event)
{
  var loc = event.locationInView;
  var col = this.colGivenX(loc[0]);
  var row = this.rowGivenY(loc[1]);
  
  boardView.radialMenu.show(row,col);
}
boardView.onMouseDragged = function(event)
{
  var loc = event.locationInView;
  boardView.radialMenu.select(loc);
}
boardView.onMouseUp = function(event)
{
  boardView.radialMenu.hide();
}
