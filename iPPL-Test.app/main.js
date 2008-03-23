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

