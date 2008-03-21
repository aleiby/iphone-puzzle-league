// com.aleiby.ippleditor
// /Applications/iPPL Editor.app/main.js

Plugins.load("UIKit");
Plugins.load("FileManager");

include("jiggy.magic.js");
include("json2.js");

var basePath = Application.userLibraryDirectory+"/iPPL";
var boardsPath = basePath+"/Boards";
var boardsExt = ".ppl";

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
var emptyItem = new UINavigationItem();
var saving = false;
var browsing = false;
var editing = false;

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
boardView.radialMenu.set = function(name)
{
  var image = images[name];
  if (this.selected && this.selected.image != image)
  {
    this.selected.setImage(image);
    this.selected.imageName = name;
  }
}
boardView.radialMenu.show = function(row,col)
{
  boardView.addSubview(boardView.radialMenu);
  this.origin = [col*BLOCK_SIZE,row*BLOCK_SIZE];
  this.selected = boardView.blocksView.subviews[row*BOARD_COLS+col];
  this.set("empty");

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
  if (row > 4)
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

  var imageName = "empty";
  var blocks = this.subviews;
  for (var i=0; i<blocks.length; i++)
  {
    var frame = blocks[i].frame;
    if (x >= frame[0] && y >= frame[1]
      && x <= frame[0]+frame[2]
      && y <= frame[1]+frame[3])
    {
      imageName = imageNames[i+1];
    }
  }
  this.set(imageName);
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

boardView.onNew = function()
{
  var blocks = boardView.blocksView.subviews;
  for (var i=0; i<blocks.length; i++)
  {
    var block = blocks[i];
    block.setImage(images.empty);
    block.imageName = "empty";
  }
}

boardView.onSave = function(filename)
{
  if (!filename)
  {
    alert("No filename specified!");
    return;
  }
  if (!FileManager.directoryExists(basePath)
    &&!FileManager.createDirectory(basePath))
  {
    alert("Failed to create directory:\n"+ basePath);
    return;
  }
  if (!FileManager.directoryExists(boardsPath)
    &&!FileManager.createDirectory(boardsPath))
  {
    alert("Failed to create directory:\n"+boardsPath);
    return;
  }

  var board_data = [];
  var blocks = boardView.blocksView.subviews;
  for (var row=0; row<BOARD_ROWS; row++)
  {
    var row_data = [];
    for (var col=0; col<BOARD_COLS; col++)
    {
      var i = row*BOARD_COLS + col;
      var name = blocks[i].imageName;
      row_data.push(name?name:"empty");
    }
    board_data.push(row_data);
  }

  var data = new Data();
  data.loadFromString(JSON.stringify(board_data));
  var path = boardsPath+"/"+filename+boardsExt;
  if (!data.writeToFile(path))
  {
    alert("Failed to save file!\n"+path);
    return;
  }

  navItem.title = filename;
}

boardView.onLoad = function(filename)
{
  var path = boardsPath+"/"+filename+boardsExt;
  if (!FileManager.fileExists(path))
    return false;

  var data = new Data();
  data.loadFromFile(path);
  var board_data = JSON.parse(data.asString());
  var blocks = boardView.blocksView.subviews;
  for (var row=0; row<BOARD_ROWS; row++)
  {
    var row_data = board_data[row];
    for (var col=0; col<BOARD_COLS; col++)
    {
      var i = row*BOARD_COLS + col;
      var name = row_data[col];
      var image = images[name];

      var block = blocks[i];
      block.imageName = name;
      block.setImage(image);
    }
  }

  return true;
}

// Save screen for inputing name of board.
var saveView = new UIView(transitionView.bounds);
saveView.backgroundColor = [0.5,0.5,0.5,1];
var nameField = new UITextField([0,0,320,30]);
nameField.setBorderStyle(UITextField.borderStyles.rounded);
nameField.setClearButtonStyle(UITextField.viewModes.whileEditing);
nameField.setVerticallyCenterText(true);
nameField.setAutoresizesTextToFit(true);
nameField.placeholder = "Enter filename";
saveView.addSubview(nameField);

//!!ARL: Autogenerate an icon by take a screenshot of the bounds of the board.

var keyboard = new UIKeyboard("");
keyboard.preferredKeyboardType = 3;
keyboard.showPreferredLayout();
saveView.addSubview(keyboard);

//!!ARL: Recreate board list on demand (so newly saved files show up).
// (free when no longer in use)

// Placeholder list of boards.
var boardPaths = [];
if (FileManager.directoryExists(boardsPath))
{
  var contents = FileManager.directoryContents(boardsPath);
  for (var i=0; i<contents.length; i++)
  {
    var path = contents[i].path;
    var n = path.lastIndexOf('.');
    boardPaths.push(path.slice(0,n));
  }
}

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
  var filename = boardPaths[row];
  return FileManager.fileExists(boardsPath+"/"+filename+boardsExt);
}

table.onRowSelected = function(tbl,row)
{
  if (editing)
    return;

  var filename = boardPaths[row];
  if (!boardView.onLoad(filename))
  {
    alert("Failed to load: "+filename);
    return;
  }

  transitionView.transition(UITransitionView.styles. shiftLeft, editorView);
  navItem.title = filename;
  navBar.pushNavigationItem(navItem);
  navBar.showButtonsWithLeftTitle("Boards","Save",1);
  browsing = false;
}

table.onCanDeleteRow = function(tbl,row)
{
  return editing;
}

table.onRowDeleted = function(tbl,row)
{
  var filename = boardPaths[row];
  var path = boardsPath+"/"+filename+boardsExt;
  if (!FileManager.remove(path))
  {
    alert("Failed to delete file:\n"+path);
  }

  cells.splice(row,1);
  DoneEditing();
}

var boardTitle = new UINavigationItem("Boards");
navBar.pushNavigationItem(boardTitle);

// Start with the Board view active.
//!!ARL: Auto-select "new" board option instead (still needs to be immediate - no animation).
transitionView.transition(UITransitionView.styles.immediate, editorView);

navItem.title = "Untitled";
navBar.pushNavigationItem(navItem);
navBar.showButtonsWithLeftTitle("Boards","Save",1);
navBar.enableAnimation();

function DismissSaveView()
{
  transitionView.transition(UITransitionView.styles.shiftDown, editorView);
  navBar.popNavigationItem();
  navBar.showButtonsWithLeftTitle("Boards","Save",1);
  saving = false;
}

function DoneEditing()
{
  navBar.showButtonsWithStyle(
    "Edit",UINavigationBar.buttonStyles.normal,
    "New",UINavigationBar.buttonStyles.normal);

  for (var i=0; i<cells.length; i++)
  {
    var cell = cells[i];
    //!!ARL: Should probably animate this movement.
    cell.subviews[0].frame = [20,0,table.bounds[2]-40,table.rowHeight];
    cell.showDeleteOrInsertion(false,false,false,true,false);
  }

  editing = false;
  browsing = true;
}

// Handle navigation bar button events.
navBar.onButtonClicked = function(bar,button)
{
  switch (button)
  {
    case UINavigationBar.buttons.right:

      // User confirmed 'Save' button.
      if (saving)
      {
        boardView.onSave(nameField.text);
        DismissSaveView();
        break;
      }
      
      // User selected 'New' button.
      if (browsing)
      {
        boardView.onNew();
        transitionView.transition(UITransitionView.styles.shiftLeft, editorView);

        navItem.title = "Untitled";
        navBar.pushNavigationItem(navItem);
        navBar.showButtonsWithLeftTitle("Boards","Save",1);
        browsing = false;
        break;
      }

      nameField.text = (navItem.title!="Untitled")?navItem.title:"";
      transitionView.transition(UITransitionView.styles.shiftUp, saveView);
      navBar.pushNavigationItem(emptyItem);
      navBar.showButtonsWithStyle(
        "Cancel",UINavigationBar.buttonStyles.normal,
        "Save",UINavigationBar.buttonStyles.blue);
      keyboard.activate();
      //nameField.becomeFirstResponder();
      saving = true;
      break;

    case UINavigationBar.buttons.left:

      // User hit 'Cancel'.
      if (saving)
      {
        DismissSaveView();
        break;
      }

      // User hit 'Edit'.
      if (browsing)
      {
        navBar.showButtonsWithStyle(
          "Done",UINavigationBar.buttonStyles.blue,
          null,UINavigationBar.buttonStyles.normal);
          
        for (var i=0; i<cells.length; i++)
        {
          var cell = cells[i];
          //!!ARL: Should probably animate this movement.
          cell.subviews[0].frame = [40,0,table.bounds[2]-40,table.rowHeight];
          cell.showDeleteOrInsertion(true,false,false,true,false);
        }

        browsing = false;
        editing = true;
        break;
      }

      // User hit 'Done'.
      if (editing)
      {
        DoneEditing();
        break;
      }

      // User hit 'Boards' from Editor view.
      transitionView.transition(UITransitionView.styles.shiftRight, table);
      navBar.popNavigationItem();
      navBar.showButtonsWithStyle(
        "Edit",UINavigationBar.buttonStyles.normal,
        "New",UINavigationBar.buttonStyles.normal);
      table.reloadData();
      browsing = true;
      break;
  }
}

/*!!ARL: SpringBoard caches default.png, so we can't update it to show the last loaded board.
this.onUnload = function()
{
  try
  {
    var defaultPNG = Images.createApplicationDefaultPNG();
    defaultPNG.saveToFile(Bundle.bundlePath+"/Default.png");
  }
  catch(e)
  {
    alert(e);
  }
}
*/
