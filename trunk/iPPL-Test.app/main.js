// com.aleiby.ippltest
// /Applications/iPPL-Test.app/main.js

Plugins.load("UIKit");
Plugins.load("iPPLcore");
Plugins.load("FileManager");
include("json2.js");

var basePath = Application.userLibraryDirectory+"/iPPL";
var boardsPath = basePath+"/Boards";
var boardsExt = ".ppl";

iPPLcore.Init();

// Some constants.
var BOARD_COLS = 6;
var BOARD_ROWS = 12;

var maxBlocks = 0;
var blocks = {empty:null, red:null, green:null, blue:null, yellow:null, pink:null, special:null};
for (var name in blocks)
  blocks[name] = maxBlocks++;

function LoadBoard(filename)
{
  var path = boardsPath+"/"+filename+boardsExt;
  if (!FileManager.fileExists(path))
    throw new Error("[LoadBoard] Specified board does not exist: "+path);

  var data = new Data();
  data.loadFromFile(path);
  var board_data = JSON.parse(data.asString());
  for (var row=0; row<BOARD_ROWS; row++)
  {
    var row_data = board_data[row];
    for (var col=0; col<BOARD_COLS; col++)
    {
      var name = row_data[col];
      iPPLcore.SetBlockType(row,col,blocks[name]);
    }
  }
}

function assert(result,msg)
{
  if (!result)
    throw new Error(msg);
}

function assertMatched(row,col)
{
  assert(iPPLcore.IsBreaking(row,col),"Block ["+row+","+col+"] did not form a proper match.");
}

function assertUnmatched(row,col)
{
  assert(!iPPLcore.IsBreaking(row,col),"Block ["+row+","+col+"] should not have matched yet.");
}

function assertFalling(row,col)
{
  assert(iPPLcore.IsFalling(row,col),"Block ["+row+","+col+"] should be falling.");
}

function assertNotFalling(row,col)
{
  assert(!iPPLcore.IsFalling(row,col),"Block ["+row+","+col+"] should not be falling.");
}

function assertType(type,row,col)
{
  assert(iPPLcore.GetBlockType(row,col)==blocks[type],"Expected "+type+" block in slot ["+row+","+col+"].");
}

Reasons = {
  IsBreaking : "did not form a proper match.",
  IsFalling : "should be falling.",
};

function assertState(state,row,col)
{
  assert(iPPLcore[state](row,col),"Block ["+row+","+col+"] "+Reasons[state]);
}

NotReasons = {
  IsBreaking : "should not have matched yet.",
  IsFalling : "should not be falling.",
};

function assertNotState(state,row,col)
{
  assert(!iPPLcore[state](row,col),"Block ["+row+","+col+"] "+Reasons[state]);
}

var Tests = {

  // Test two blocks falling on two blocks to form a vertical four block chain.
  TwoFallsOnTwo:function()
  {
    LoadBoard("TwoFallsOnTwo");
    assert(iPPLcore.GetBlockType(5,3)==blocks.red,"Expected red block in slot [5,3].");
    assert(iPPLcore.GetBlockType(6,3)==blocks.red,"Expected red block in slot [6,3].");
    assert(iPPLcore.GetBlockType(10,3)==blocks.red,"Expected red block in slot [10,3].");
    assert(iPPLcore.GetBlockType(11,3)==blocks.red,"Expected red block in slot [11,3].");
    
    var result = iPPLcore.MoveLeft(8,4);
    assert(result,"Unable to move block!");
    assert(!iPPLcore.IsBreaking(8,3),"Should not have matched yet.");
    
    // Wait for matching to finish.
    iPPLcore.Update();
    assert(iPPLcore.IsBreaking(8,3),"Failed to match blues!");
    while (iPPLcore.IsBreaking(8,3))
    {
      iPPLcore.Update();
    }

    // Allow three updates for blocks to fall.
    //!!ARL: Maybe poll for falling to stop, and match against expected update count?
    for (var i=0; i<3; i++)
    {
      iPPLcore.Update();
    }

    // Make sure they made it into position.
    assert(iPPLcore.GetBlockType(8,3)==blocks.red,"Expected fallen red block in slot [8,3] instead of "+iPPLcore.GetBlockType(8,3));
    assert(iPPLcore.GetBlockType(9,3)==blocks.red,"Expected fallen red block in slot [9,3] instead of "+iPPLcore.GetBlockType(9,3));

    // Make sure they haven't matched yet.
    assert(!iPPLcore.IsBreaking(8,3),"Block [8,3] should not have matched yet.");
    assert(!iPPLcore.IsBreaking(9,3),"Block [9,3] should not have matched yet.");
    assert(!iPPLcore.IsBreaking(10,3),"Block [10,3] should not have matched yet.");
    assert(!iPPLcore.IsBreaking(11,3),"Block [11,3] should not have matched yet.");

    iPPLcore.Update();
    assert(iPPLcore.IsBreaking(8,3),"Block [8,3] did not form a proper match.");
    assert(iPPLcore.IsBreaking(9,3),"Block [9,3] did not form a proper match.");
    assert(iPPLcore.IsBreaking(10,3),"Block [10,3] did not form a proper match.");
    assert(iPPLcore.IsBreaking(11,3),"Block [11,3] did not form a proper match.");
  },
  
  SimpleMatchThree:function()
  {
    LoadBoard("SimpleMatchThree");

    iPPLcore.MoveLeft(10,1);
    assertUnmatched(9,0);
    assertUnmatched(10,0);
    assertUnmatched(11,0);
    
    iPPLcore.Update();
    assertMatched(9,0);
    assertMatched(10,0);
    assertMatched(11,0);
  },
  
  SimpleMatchFour:function()
  {
    LoadBoard("SimpleMatchFour");

    iPPLcore.MoveLeft(10,1);
    assertUnmatched(8,0);
    assertUnmatched(9,0);
    assertUnmatched(10,0);
    assertUnmatched(11,0);
    
    iPPLcore.Update();
    assertMatched(8,0);
    assertMatched(9,0);
    assertMatched(10,0);
    assertMatched(11,0);
  },
  
  SimpleMatchFive:function()
  {
    LoadBoard("SimpleMatchFive");

    iPPLcore.MoveLeft(9,1);
    assertUnmatched(7,0);
    assertUnmatched(8,0);
    assertUnmatched(9,0);
    assertUnmatched(10,0);
    assertUnmatched(11,0);
    
    iPPLcore.Update();
    assertMatched(7,0);
    assertMatched(8,0);
    assertMatched(9,0);
    assertMatched(10,0);
    assertMatched(11,0);
  },
  
  SimpleMatchTen:function()
  {
    LoadBoard("SimpleMatchTen");

    iPPLcore.MoveLeft(9,1);

    assertUnmatched(7,0);
    assertUnmatched(8,0);
    assertUnmatched(9,0);
    assertUnmatched(10,0);
    assertUnmatched(11,0);
     
    assertUnmatched(7,1);
    assertUnmatched(8,1);
    assertUnmatched(9,1);
    assertUnmatched(10,1);
    assertUnmatched(11,1);
 
    iPPLcore.Update();
 
    assertMatched(7,0);
    assertMatched(8,0);
    assertMatched(9,0);
    assertMatched(10,0);
    assertMatched(11,0);

    assertMatched(7,1);
    assertMatched(8,1);
    assertMatched(9,1);
    assertMatched(10,1);
    assertMatched(11,1);
  },

  RobertsManeuver:function()
  {
    LoadBoard("RobertsManeuver");

    iPPLcore.MoveRight(10,1);
    iPPLcore.Update();

    assertMatched(9,2);
    assertMatched(10,2);
    assertMatched(11,2);

    while (iPPLcore.IsBreaking(10,2))
    {
      var moved = iPPLcore.MoveRight(10,1);
      assert(!moved,"Should not be able to move block [10,1] until finished matching.");
      iPPLcore.Update();
    }
    
    var moved = iPPLcore.MoveRight(10,1);
    assert(moved,"Failed to move block [10,1] after matching completed.");
    
    iPPLcore.Update();
    assert(iPPLcore.GetBlockType(10,1)==blocks.red,"Middle red block failed to fall into place.");
    assert(!iPPLcore.IsBreaking(10,1),"Middle red block matched prematurely.");
    assert(iPPLcore.GetBlockType(11,2)==blocks.green,"Pulled block failed to fall into place.");
    
    iPPLcore.Update();
    assert(iPPLcore.GetBlockType(10,2)==blocks.red,"Right red block failed to fall into place.");
    assertMatched(10,0);
    assertMatched(10,1);
    assertMatched(10,2);
  },
  
  HorizontalMatchFall:function()
  {
    LoadBoard("HorizontalMatchFall");
    
    var moved = iPPLcore.MoveRight(11,2);
    assert(moved,"Failed to move key block!");
    
    iPPLcore.Update();
    
    // Make sure the whole bottom row matched.
    for (var col=0; col<BOARD_COLS; col++)
      assertMatched(11,col);
    
    // Wait for it to finish matching.
    while (iPPLcore.IsBreaking(11,0))
    {
      iPPLcore.Update();
    }
    
    // The blocks should hang in the air for a frame.
    for (var col=0; col<BOARD_COLS; col++)
    {
      assertNotFalling(9,col);
      assertNotFalling(10,col);
    }
    
    assert(false,"Remaining code needs testing.");
    
    iPPLcore.Update();
    
    // Verify all blocks moved at once.
    for (var col=0; col<BOARD_COLS; col++)
    {
      if (col % 2)
      {
        assertType("yellow",10,col);
        assertType("green",11,col);
      }
      else
      {
        assertType("green",10,col);
        assertType("yellow",11,col);
      }
      
      assertType("empty",9,col);
      assertFalling(10,col);
      assertFalling(11,col);
    }    
  },
  
  VerticalMatchFall:function()
  {
    LoadBoard("VerticalMatchFall");
    
    //!!ARL: Test that blocks fall one row at a time (as a single unit).
    //!!ARL: Comments like the above should be part of the test metadata.
    
    var moved = iPPLcore.MoveRight(10,0);
    assert(moved,"Failed to move key block!");
    
    iPPLcore.Update();
    
    assertMatched(9,0);
    assertMatched(10,0);
    assertMatched(11,0);

    assertMatched(9,1);
    assertMatched(10,1);
    assertMatched(11,1);
    
    // Wait to finish breaking.
    while (iPPLcore.IsBreaking(10,0))
    {
      iPPLcore.Update();
    }
    
    // Let hang for a frame.
    assertNotFalling(7,0);
    assertNotFalling(7,1);

    assertNotFalling(8,0);
    assertNotFalling(8,1);
    
    assert(false,"Haven't tested beyond this point.");
    
    iPPLcore.Update();
    
    assertType("empty",7,0);
    assertType("empty",7,1);
    
    assertType("yellow",8,0);
    assertType("green",8,1);

    assertType("green",9,0);
    assertType("yellow",9,1);

    assertType("empty",10,0);
    assertType("empty",10,1);

    assertFalling(8,0);
    assertFalling(8,0);
    assertFalling(9,1);
    assertFalling(9,1);

    iPPLcore.Update();
    
    assertType("empty",8,0);
    assertType("empty",8,1);
    
    assertType("yellow",9,0);
    assertType("green",9,1);

    assertType("green",10,0);
    assertType("yellow",10,1);

    assertType("empty",11,0);
    assertType("empty",11,1);

    assertFalling(9,0);
    assertFalling(9,0);
    assertFalling(10,1);
    assertFalling(10,1);

    iPPLcore.Update();
    
    assertType("empty",9,0);
    assertType("empty",9,1);
    
    assertType("yellow",10,0);
    assertType("green",10,1);

    assertType("green",11,0);
    assertType("yellow",11,1);

    // Still falling this frame (since they moved from the last frame).
    assertFalling(10,0);
    assertFalling(10,0);
    assertFalling(11,1);
    assertFalling(11,1);

    iPPLcore.Update();

    assertType("yellow",10,0);
    assertType("green",10,1);

    assertType("green",11,0);
    assertType("yellow",11,1);

    // Done falling now.
    assertNotFalling(10,0);
    assertNotFalling(10,0);
    assertNotFalling(11,1);
    assertNotFalling(11,1);
  },
  
  //!!ARL: Add variations of too soon and too late and make sure they fail.
  ShoveItIn:function()
  {
    LoadBoard("ShoveItIn");
    
    var moved = iPPLcore.MoveLeft(10,2);
    assert(moved,"Failed to move key block!");
    
    iPPLcore.Update();
    
    assertMatched(8,1);
    assertMatched(9,1);
    assertMatched(10,1);
    assertMatched(11,1);
    
    while (iPPLcore.IsBreaking(10,1))
    {
      iPPLcore.Update();
    }
    
    assertType("red",7,1);

    iPPLcore.Update();
    assertType("red",8,1);

    iPPLcore.Update();
    assertType("red",9,1);
    
    assertUnmatched(9,0);
    assertUnmatched(9,1);
    assertUnmatched(9,2);
    
    moved = iPPLcore.MoveRight(10,0);
    assert(moved,"Failed to move secondary block!");

    iPPLcore.Update();
        
    assertMatched(9,0);
    assertMatched(9,1);
    assertMatched(9,2);
    
    //!!ARL: Also need to check for successful combo.
  },
};

//!!ARL: Probably should require 'Test' prefix so we can separately support Setup/Teardown (fixtures).

log("Running tests...");
var numTests = 0, failedTests = 0;
for (var name in Tests)
{
  ++numTests;
  print("Test #"+numTests+": "+name);
  try
  {
    Tests[name]();
    print(" [Success]\n");
  }
  catch (e)
  {
    ++failedTests;
    print(" [Failed] - "+e+"\n");  //!!ARL: Figure out how to include line numbers.
    //!!ARL: Would also make coming up with error strings easier if assert condition was included automatically.
  }
}
var passedTests = (numTests - failedTests);
log("Done! "+passedTests+" out of "+numTests+" passed.");

