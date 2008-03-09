/*
  This file defines "constants" for most of the magic numbers used by Jiggy Runtime 0.23 and its Plugins
  This should be backwards compatible with previous versions of Jiggy
*/
var animated,   enabled,  allowed,    hightLighted,   hide,     show      = true;
var unanimated, disabled, notAllowed, notHighLighted, dontHide, dontShow  = false;


if (typeof(gc) !== "undefined") {
  gc.forcedLogged = 0;
  gc.forced = 1;
  gc.maybe = 2;
}

// ****************************************
//           UIKit magic numbers         
// ****************************************
if (typeof(Application) !== "undefined") {
  Application.statusBarModes = {
    white : 0,
    blackTransparent : 1,
    removed : 2,
    black : 3,
    transparent : 4,
    flashingGreen : 5,
    redTransparent : 6
  };
  Application.statusBarAnimations = {
    fade : 0,
    fromBottom : 1,
    toBottom : 2,
    outFromTop : 3,
    inFromTop : 4,
    none : 5
  };
}


if (typeof(Images) !== "undefined") {
  Images.cache = true;
  Images.dontCache = false;
  
  // http://developer.apple.com/documentation/Cocoa/Reference/ApplicationKit/Classes/NSImage_Class/Reference/Reference.html#//apple_ref/doc/c_ref/NSCompositingOperation
  Images.operations = {
    clear : 0,
    copy : 1,
    sourceOver: 2,
    sourceIn : 3,
    sourceOut : 4,
    sourceAtop : 5,
    destinationOver : 6,
    destinationIn : 7,
    destinationOut : 8,
    destinationAtop : 9,
    xOR : 10,
    plusDarker : 11,
    highlight : 12,
    plusLighter : 13
  };
}

if (typeof(UIKeyboard) !== "undefined") {
  UIKeyboard.keyboardTypes = {
    defaultQwerty : 0,
    numericPunctuation : 1,
    phoneKeypad : 2,
    url : 3,
    sms : 4
  };
  UIKeyboard.returnKeyTypes = {
    returnGray : 0,
    go : 1,
    google : 2,
    join : 3,
    next : 4,
    route : 5,
    search : 6,
    send : 7,
    yahoo : 8
  };
}

if (typeof(UIView) !== "undefined") {
  UIView.autoResizingMasks = {
    notSizable : 0,
    minXMargin : 1,
    widthSizable : 2,
    maxXMargin : 4,
    minYMargin : 8,
    heightSizable : 16,
    maxYMargin : 32
  };
  UIView.controlTints = {
    defaultTint : 0,
    blue : 1,
    graphite : 6,
    clear : 7
  };
  UIView.contentsPositions = {
    // Could not find docs
  };
}

if (typeof(UINavigationBar) !== "undefined") {
  UINavigationBar.barStyles = {
    normal : 0,
    dark : 1,
    darkTransparent : 2
  };
  UINavigationBar.buttonStyles = {
    normal : 0,
    red : 1,
    back : 2,
    blue : 3
  };
  UINavigationBar.buttons = {
    right : 0,
    left : 1
  };
  UINavigationBar.defaultHeight = 44;
  UINavigationBar.defaultShadowColor = [0, 0, 0, 0.5];
  UINavigationBar.defaultShadowOffset = [0, -1];
  if (typeof(Font) !== "undefined") {
    UINavigationBar.defaultFont = new Font("Arial", 2, 20);
  }
}


if (typeof(UITextField) !== "undefined") {
  UITextField.borderStyles = {
    none : 0,
    line : 1,
    bezel : 2,
    rounded : 3
  };
  UITextField.buttonStyles = {
    roundedBezel           : 1,
    regularSquareBezel     : 2,
    thickSquareBezel       : 3,
    thickerSquareBezel     : 4,
    disclosureBezel        : 5,
    shadowlessSquareBezel  : 6,
    circularBezel          : 7,
    texturedSquareBezel    : 8,
    helpButtonBezel        : 9,
    smallSquareBezel       : 10,
    texturedRoundedBezel   : 11,
    roundRectBezel         : 12,
    recessedBezel          : 13,
    roundedDisclosureBezel : 14   
  };
  UITextField.viewModes = {
    never : 0,
    whileEditing : 1,
    always : 2
  };
  UITextField.ellipsisStyles = {
    none : 0,
    showEnd : 1,
    showStart : 2,
    showBoth : 3
  };
}



if (typeof(UIScroller) !== "undefined") {
  UIScroller.scrollerIndicatorStyles = {
    // Could not find docs
  };

}

if (typeof(UIPushButton) !== "undefined") {
  UIPushButton.states = {
    up : 0,
    down : 1
  };
}

if (typeof(UIAnimation) !== "undefined") {
  UIViewAnimation.curves = {
    easeInOut : 0,
    easeIn : 1,
    easeOut : 2,
    linear : 3
  };
}

if (typeof(UITextTraits) !== "undefined") {
  UITextTraits.autoCapsTypes = {
    noAutoCaps : 0,
    autoCaps : 1
  };
  UITextTraits.autoCorrectionTypes = {
    // Could not find docs
  };
  UITextTraits.initialSelectionBehaviors = {
    caretBeforeText : 0,
    caretAfterText : 1
  };
  UITextTraits.returnKeyTypes = {
    // Could not find docs
  };
  UITextTraits.textDomains = {
    // Could not find docs
  };
  UITextTraits.textLoupeVisibility = {
    visible : 0,
    notVisible : 1
  };
}


if (typeof(Font) !== "undefined") {
  Font.traits = {
    none : 0,
    italic : 1,
    bold : 2,
    boldItalic : 3
  };
  
  // http://daringfireball.net/misc/2007/07/iphone-osx-fonts
  Font.names = {
    AmericanTypewriter : "American Typewriter",
    AndaleMono : "Andale Mono",
    AppleChancery : "Apple Chancery", 
    Arial : "Arial",
    ArialBlack : "Arial Black",
    ArialNarrow : "Arial Narrow",
    ArialRoundedMTBold : "Arial Rounded MT Bold",
    Baskerville : "Baskerville",
    BigCaslon : "BigCaslon",
    BrushScriptMT : "Brush Script MT",
    Chalkboard : "Chalkboard",
    Cochin : "Cochin",
    ComicSansMS : "Comic Sans MS",
    Copperplate : "Copperplate",
    Courier : "Courier",
    CourierNew : "Courier New",
    Didot  : "Didot",
    Futura : "Futura",
    Geneva : "Geneva",
    Georgia : "Georgia",
    GillSans : "Gill Sans",
    Helvetica : "Helvetica",
    HelveticaNeue : "Helvetica Neue",
    HelveticaNeueLight : "Helvetica Neue Light",
    HelveticaNeueUltraLight : "Helvetica Neue UltraLight",
    HelveticaNeueCondensedBold : "Helvetica Neue Condensed Bold",
    HelveticaNeueCondensedBlack : "Helvetica Neue Condensed Black",
    Herculanum : "Herculanum",
    HoeflerText : "Hoefler Text",
    Impact : "Impact",
    LucidaGrande : "Lucida Grande",
    MarkerFelt : "Marker Felt",
    Monaco : "Monaco",
    Optima : "Optima",
    Papyrus : "Papyrus",
    Skia : "Skia",
    Times : "Times",
    TimesNewRoman : "Times New Roman",
    TrebuchetMS : "Trebuchet MS",
    Verdana : "Verdana",
    Zapfino : "Zapfino"
  };
}


if (typeof(UITableCell) !== "undefined") {
  UITableCell.separatorStyles = {
    none : 0,
    singleLine : 1
  };
  UITableCell.selectionStyles = {
    brightBlue : 0,
    red : 1,
    gray : 2,
    green : 3,
    blue : 4,
    // darkBlue : 5,  // Reported to cause a crash
    darkBlue : 6
  };
  UITableCell.disclosureStyles = {
    gray : 0,
    blueLargeArrow : 1,   // Blue with a large arrow
    graySmallArrow : 2    // Gray with a small arrow
  };
}

if (typeof(UITable) !== "undefined") {
  UITable.separatorStyles = {
    none : 0,
    thinSolidLine : 1,
    thickSolidLine : 2
  };
  UITable.disclosureStyles = {
    gray : 0,
    blue : 1
  };
}

if (typeof(UITransitionView) !== "undefined") {
  UITransitionView.styles = {
    immediate : 0,
    shiftLeft : 1,
    shiftRight : 2,
    shiftUp : 3,
    fade : 6,
    shiftDown : 7
  };
}

if (typeof(UIProgressIndicator) !== "undefined") {
  UIProgressIndicator.styles = {
    white : 0,
    gray : 1
  };
}

if (typeof(UIProgressBar) !== "undefined") {
  // Assumed these are the same as UIProgressIndicator
  UIProgressBar.styles = {
    white : 0,
    gray : 1
  };
}

if (typeof(UIAlertSheet) !== "undefined") {
  UIAlertSheet.alertSheetStyles = {
    // No docs
  };
}


var Event;
if (typeof(Event) === "undefined") {
  Event = {};
}

Event.swipeDirections = {
  up : 1,
  down : 2,
  rightToLeft : 4,
  leftToRight : 8
};

// *****************************
//         UIHardware
// *****************************
if (typeof(UIHardware) !== "undefined") {
  UIHardware.ringerStates = {
    silent : 0,
    normal : 1
  };
  UIHardware.orientations = {
    portrait : 0,
    landscape : 1
  };
}


// *******************************
//             Data
// *******************************
if (typeof(Data) !== "undefined") {
  Data.encodings = {
    ascii : 1,
    isoLatin : 5,
    nonLossyAscii : 7,
    isoLatin2 : 9
  };
}


// ****************************
//            Globals
// ****************************
if (typeof(log) !== "undefined") {
  log.normal = 0;
  log.informational = 1;
  log.warning = 2;
  // Could not find docs for others
}

if (typeof(debug) !== "undefined") {
  debug.on = true;
  debug.off = false;
}

if (typeof(openURL) !== "undefined") {
  openURL.openAsPanel = true;
  openURL.dontOpenAsPanel = false;
}

// ********************************
//           Plugins
// ********************************
if (typeof(Plugins) !== "undefined") {
  Plugins.FileManager = "FileManager";
  Plugins.HttpServer = "HttpServer";
  Plugins.Socket = "Socket";
  Plugins.SQLite = "SQLite";
  Plugins.XmlHttpRequest = "XmlHttpRequest";
  Plugins.UIKit = "UIKit";
}

// **********************************
//           XmlHttpRequest
// *********************************
if (typeof(XmlHttpRequest) !== "undefined") {
  XmlHttpRequest.readyStates = {
    uninitialized : 0,
    loading : 1,
    loaded : 2,
    interactive : 3,
    complete : 4
  };
  XmlHttpRequest.status = {
    ok : 200,
    created : 201,
    accepted : 202,
    notModified : 304,
    badRequest : 400,
    unauthorized : 401,
    forbidden : 403,
    notFound : 404,
    proxyAuthenticationRequired : 407,
    serverError : 500,
    serviceUnavailable : 503
    
  };
}

// **********************************
//           Socket
// *********************************
var ports = {
  ftp: 21,
  ssh: 22,
  telnet: 23,
  smtp: 25,
  dns: 53,
  tftp: 69,
  gopher: 70,
  finger: 79,
  http: 80,
  pop3: 110,
  ident: 113,
  sftp: 115,  // Simple FTP
  nntp: 119,
  ntp: 123,
  image: 143,
  snmp: 161,
  snmptrap: 162,
  ldap: 389,
  https: 443,
  httpAlt: 8080
};
if (typeof(Socket) !== "undefined") {
  Socket.ports = ports;
}

// **********************************
//           HttpServer
// **********************************
if (typeof(HttpServer) !== "undefined") {
  HttpServer.ports = ports;
}

if (typeof(HttpServerRequest) !== "undefined") {
  HttpServerRequest.methods = {
    get : "GET",
    post: "POST",
    put : "PUT",
    head: "HEAD",
    options : "OPTIONS",
    deleteMethod : "DELETE",
    trace : "TRACE",
    connect : "CONNECT"
  };
}
delete this.ports;

if (typeof(FileManager) !== "undefined") {
  // ******
  // These values are untested
  // ******
  FileManager.types = {
    file : "f",
    directory : "d"
  };
  
}


if (typeof(LKAnimation) !== "undefined") {
  LKAnimation.types = {
    oglFlip : "oglFlip",
    pageCurl : "pageCurl",
    pageUnCurl : "pageUnCurl",
    suckEffect : "suckEffect",
    spewEffect : "spewEffect",
    genieEffect : "genieEffect",
    unGenieEffect : "unGenieEffect",
    twist : "twist",
    tubey : "tubey",
    swirl : "swirl",
    cameraIris : "cameraIris",
    cameraIrisHollow : "cameraIrisHollow",
    cameraIrisHollowOpen : "cameraIrisHollowOpen",
    cameraIrisHollowClose : "cameraIrisHollowClose",
    charminUltra : "charminUltra",
    zoomyIn : "zoomyIn",
    zoomyOut : "zoomyOut",
    oglApplicationSuspend : "oglApplicationSuspend"
  };
  LKAnimation.subTypes = {
    fromLeft : "fromLeft",
    fromTop : "fromTop",
    fromBottom : "fromBottom",
    fromRight : "fromRight"
  };
  LKAnimation.curves = {
    easeInEaseOut : 0,
    easeIn : 1,
    easeOut : 2,
    linear : 3
  };
  LKAnimation.fillModes = {
    extended : "extended"
  };
  LKAnimation.defaultFlag = 15;

}

if (typeof(UISegmentedControl) !== "undefined") {
  UISegmentedControl.styles = {
    whiteButtonsGrayBorder : 0,
    whiteButtonsBlackBorder : 1,
    smallGrayButtons : 2
  };
}

if (typeof(UIPreferencesTableCell) !== "undefined") {
  UIPreferencesTableCell.checkStyles = {
    // No docs
  };
}

if (typeof(UISectionList) !== "undefined") {
  UISectionList.sectionListStyles = {
    // No docs
  };
}

