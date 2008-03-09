// com.aleiby.ippleditor
// /Applications/iPPL Editor.app/main.js

Plugins.load("UIKit");
include("jiggy.magic.js");

var window = new UIWindow(UIHardware.fullScreenApplicationContentRect);
window.setHidden(false);
window.orderFront();
window.makeKey();
window.backgroundColor = [1,1,1,1];

var mainView = new UIView();
window.setContentView(mainView);

// Add a navigation bar.
var navBar = new UINavigationBar([0,0,window.bounds[2],UINavigationBar.defaultHeight]);
navBar.disableAnimation();
mainView.addSubview(navBar);

var navItem = new UINavigationItem();

// Add a transition view.
var transitionView = new UITransitionView([0,navBar.bounds[3],window.bounds[2],
  window.bounds[3] - navBar.bounds[3] ]);
mainView.addSubview(transitionView);

// Some constants.
var BLOCK_SIZE = 34;
var BOARD_COLS = 6;
var BOARD_ROWS = 12;

// Create a playing board.
var boardWidth = BLOCK_SIZE*BOARD_COLS;
var boardHeight = BLOCK_SIZE*BOARD_ROWS;
var boardView = new UIView([transitionView.bounds[2]/2 - boardWidth/2,
  transitionView.bounds[3]/2 - boardHeight/2,boardWidth,boardHeight]);
boardView.backgroundColor = [0,0,0,0.7];

var editorView = new UIView(transitionView.bounds);
editorView.addSubview(boardView);

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
  if (image !== images.empty)
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

  // Fan out in a stack.
  UIViewAnimation.beginAnimations();
  UIViewAnimation.setAnimationDuration(0.3);

  var origin = [0,0];
  var dy = BLOCK_SIZE * 0.7;
  var dx = 3.0;
  var ddx = 2.0;

  // Flip direction to fit on screen.
  if (row > 3)
    dy = -dy;
  else
  {
    dx = -dx;
    ddx = -ddx;
  }

  for (var i=0; i<blocks.length; i++)
  {
    origin[0] += dx;
    origin[1] += dy;
    dx += ddx;

    blocks[i].origin = origin;
  }

  UIViewAnimation.endAnimations();
}
boardView.radialMenu.select = function(loc)
{
  var x = loc[0] - this.origin[0];
  var y = loc[1] - this.origin[1];

  var image = images.empty;
  var blocks = this.subviews;
  for (var i=0; i<blocks.length; i++)
  {
    var frame = blocks[i].frame;
    if (x >= frame[0] && y >= frame[1]
      && x <= frame[0]+frame[2]
      && y <= frame[1]+frame[3])
    {
      var name = imageNames[i+1];
      image = images[name];
    }
  }
  this.set(image);
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

// Placeholder list of boards.
var boardPaths = ["red","blue","green","/var/mobile/Library/iPPL/Boards/TestSingleFrameForce"];

// List of boards to load.
var table = new UITable([0,UINavigationBar.defaultHeight,
  320,480-UINavigationBar.defaultHeight]);
table.rowHeight = 40;

var cells = [];
for (var i=0; i<boardPaths.length; i++)
{
  var cell = new UITableCell([0,0,table.bounds[2],table.rowHeight]);
  var label = new UITextLabel([20,0,table.bounds[2]-40,table.rowHeight]);
  label.text = boardPaths[i];
  label.backgroundColor = [0,0,0,0];
  label.setEllipsisStyle(UITextField.ellipsisStyles.showEnd);
  cell.addSubview(label);
  cells.push(cell);
}

table.separatorStyle = UITableCell.separatorStyles.singleLine;
table.addTableColumn(new UITableColumn("column","column",table.bounds[2]));

table.onGetNumberOfRows = function(tbl)
{
  return cells.length;
}

table.onGetCell = function(tbl,col,row)
{
  return cells[row];
}

table.onCanSelectRow = function(tbl,row)
{
  return true;
}

table.onRowSelected = function(tbl,row)
{
  transitionView.transition(UITransitionView.styles. shiftLeft, editorView);
  navItem.title = boardPaths[row];
  navBar.pushNavigationItem(navItem);
  navBar.showButtonsWithLeftTitle("Boards","Save",1);
}

var boardTitle = new UINavigationItem("Boards");
navBar.pushNavigationItem(boardTitle);

// Start with the Board view active.
//!!ARL: Auto-select "new" board option instead.
transitionView.transition(UITransitionView.styles.immediate, editorView);

navItem.title = "Untitled";
navBar.pushNavigationItem(navItem);
navBar.showButtonsWithLeftTitle("Boards","Save",1);
navBar.enableAnimation();

// Handle navigation bar button events.
navBar.onButtonClicked = function(bar,button)
{
  switch (button)
  {
    case UINavigationBar.buttons.right:
      break;
    case UINavigationBar.buttons.left:
      transitionView.transition(UITransitionView.styles.shiftRight, table);
      navBar.popNavigationItem();
      navBar.hideButtons();
      table.reloadData();
      break;
  }
}

