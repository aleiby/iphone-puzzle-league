#import <UIKit/UIKit.h>
#import <GraphicsServices/GraphicsServices.h>

#import "App.h"
#import "Core.h"

@interface iBoardBase : UIView
@end

@interface iBoardView : iBoardBase
{
	UIImage* blockImages[eBlockType_Max];
}

-(void)update;

@end

@interface iDebugView : iBoardBase
{
	UIImage* lockedImage;
}

-(void)update;

@end

@interface iBoard : UIView
{
	CGPoint clicked;
	NSTimer* timer;

	iBoardView* boardView;
	iDebugView* debugView;
}

-(void)play;
-(void)step;

@end

@interface StepButton : UIView
@end

@implementation StepButton

- (void)mouseDown:(GSEvent*)event
{
	[(iBoard*)[self superview] step];
}

@end

@interface PlayButton : UIView
@end

@implementation PlayButton

- (void)mouseDown:(GSEvent*)event
{
	[(iBoard*)[self superview] play];
}

@end

@implementation iBoard

- (id)initWithFrame:(CGRect)frame
{
	self = [super initWithFrame:frame];

	frame.origin.x = 0.0f;
	frame.origin.y = 0.0f;

	boardView = [[[iBoardView alloc] initWithFrame:frame] autorelease];
	[self addSubview: boardView];

	debugView = [[[iDebugView alloc] initWithFrame:frame] autorelease];
	[self addSubview: debugView];

	float red[4] = {1,0,0,0.5};
	CGRect buttonRect = CGRectMake(0.0f, 0.0f, 64.0f, 48.0f);
	UIView* stepButton = [[[StepButton alloc] initWithFrame:buttonRect] autorelease];
	[stepButton setBackgroundColor:CGColorCreate(CGColorSpaceCreateDeviceRGB(), red)];
	[self addSubview: stepButton];

	float green[4] = {0,1,0,0.5};
	buttonRect.origin.x = frame.size.width - buttonRect.size.width;
	UIView* playButton = [[[PlayButton alloc] initWithFrame:buttonRect] autorelease];
	[playButton setBackgroundColor:CGColorCreate(CGColorSpaceCreateDeviceRGB(), green)];
	[self addSubview: playButton];

	[self play];
	return self;
}

- (void) play
{
    timer = [NSTimer
        scheduledTimerWithTimeInterval:0.1
        target: self
        selector: @selector(update)
        userInfo: nil
        repeats: YES
    ];
}

- (void) step
{
	[timer invalidate];
	timer = nil;

	[(id)self update];
}

- (void) update
{
	PPL_Update();

	[boardView update];
	[debugView update];
}

- (void)mouseDown:(GSEvent*)event
{
	clicked = GSEventGetLocationInWindow(event);
}

- (void)mouseDragged:(GSEvent*)event
{
	CGPoint location = GSEventGetLocationInWindow(event);
	float diff = location.x - clicked.x;
	if (diff > 32.0f)
	{
		CGPoint origin = [self origin];
		CGRect frame = [self frame];
		int row = (clicked.y - origin.y) / frame.size.height * BOARD_ROWS;
		int col = (clicked.x - origin.x) / frame.size.width * BOARD_COLS;
		PPL_MoveRight(row,col);
		clicked = location;
		return;
	}

	if (diff < -32.0f)
	{
		CGPoint origin = [self origin];
		CGRect frame = [self frame];
		int row = (clicked.y - origin.y) / frame.size.height * BOARD_ROWS;
		int col = (clicked.x - origin.x) / frame.size.width * BOARD_COLS;
		PPL_MoveLeft(row,col);
		clicked = location;
		return;
	}
}

@end

@implementation iBoardBase

- (id)initWithFrame:(CGRect)frame
{
	self = [super initWithFrame:frame];

	CGRect blockRect = CGRectMake(0.0f, 0.0f, 32.0f, 32.0f);
	for (int row=0; row<BOARD_ROWS; row++)
	{
		for (int col=0; col<BOARD_COLS; col++)
		{
			UIImageView* block = [[[UIImageView alloc] initWithFrame:blockRect] autorelease];
			[self addSubview:block];
			blockRect.origin.x += 32.0f;
		}
		blockRect.origin.x = 0.0f;
		blockRect.origin.y += 32.0f;
	}

	return self;
}

@end

@implementation iBoardView

- (id)initWithFrame:(CGRect)frame
{
	self = [super initWithFrame:frame];

	id imageNames[eBlockType_Max] = {@"",@"red",@"green",@"blue",@"yellow",@"pink",@"special"};
	blockImages[0] = nil;
	for (int i=1; i<eBlockType_Max; i++)
		blockImages[i] = [[UIImage imageAtPath:[[NSBundle mainBundle] pathForResource:imageNames[i] ofType:@"png"]] retain];

	return self;
}

- (void) update
{
	//!!ARL: Maybe add a callback when the type changes instead?
	NSArray* blocks = [self subviews];
	for (int i=0, row=0; row<BOARD_ROWS; row++)
	{
		for (int col=0; col<BOARD_COLS; col++)
		{
			UIImageView* block = (UIImageView*)[blocks objectAtIndex:i++];
			int type = PPL_GetBlockType(row,col);
			UIImage* image = blockImages[type];
			[block setImage:image];
		}
	}

	[self setNeedsDisplay];
}

@end

@implementation iDebugView

- (id)initWithFrame:(CGRect)frame
{
	self = [super initWithFrame:frame];

	lockedImage = [[UIImage imageAtPath:[[NSBundle mainBundle] pathForResource:@"locked" ofType:@"png"]] retain];

	return self;
}

- (void) update
{
	NSArray* blocks = [self subviews];
	for (int i=0, row=0; row<BOARD_ROWS; row++)
	{
		for (int col=0; col<BOARD_COLS; col++)
		{
			UIImageView* block = (UIImageView*)[blocks objectAtIndex:i++];
			[block setImage:PPL_IsLocked(row,col) ?
				lockedImage : nil];
		}
	}

	[self setNeedsDisplay];
}

@end

@implementation iPhonePuzzleLeague

- (void) applicationDidFinishLaunching: (id) unused
{
	UIWindow* window;
	UIView* mainView;

	CGRect windowRect;
	CGRect mainViewRect;

	PPL_Init();

	// Set up a window.
	windowRect = [UIHardware fullScreenApplicationContentRect];
	window = [[UIWindow alloc] initWithContentRect: windowRect];
	[window orderFront: self];
	[window makeKey: self];
	[window _setHidden: NO];

	//Set up the main view (for the window).
	mainViewRect = windowRect;
	mainViewRect.origin.x = 0.0f;
	mainViewRect.origin.y = -20.0f;	//accounting for status bar until I can figure out how to make it draw on top
	mainView = [[UIView alloc] initWithFrame: mainViewRect];
    [window setContentView: mainView];

	// Create background view
	UIImageView* arena = [[[UIImageView alloc] initWithFrame:CGRectMake(0.0f,0.0f,320.0f,480.0f)] autorelease];
	[arena setImage:[[UIImage imageAtPath:[[NSBundle mainBundle] pathForResource:@"arena" ofType:@"png"]] retain]];
	[mainView addSubview: arena];

	[arena setAlpha: 0.0f];
	[UIView beginAnimations:nil];
	[UIView setAnimationDuration:3.0];
	[arena setAlpha: 1.0f];
	[UIView endAnimations];

	// Create character view
	UIImageView* character = [[[UIImageView alloc] initWithFrame:CGRectMake(320.0f,0.0f,320.0f,480.0f)] autorelease];
	[character setImage:[[UIImage imageAtPath:[[NSBundle mainBundle] pathForResource:@"character" ofType:@"png"]] retain]];
	[mainView addSubview: character];

	// Slide in from right.
	[UIView beginAnimations:nil];
	[UIView setAnimationDelay:0.5];
	[UIView setAnimationDuration:2.0];
	[character setFrame:CGRectMake(48,0,320,480)];
	[UIView endAnimations];

	// Create backgrounds
	float backColor[4] = {0,0,0,0.5};
	CGColorRef backgroundColor = CGColorCreate(CGColorSpaceCreateDeviceRGB(), backColor);

	UIView* mainBack = [[[UIView alloc] initWithFrame:CGRectMake(16.0f,77.0f,192.0f,384.0f)] autorelease];
	[mainBack setBackgroundColor: backgroundColor];
	[mainView addSubview: mainBack];

	CGRect rightFrame = CGRectMake(223.0f, 132.0f, 64.0f, 128.0f);
	UIView* enemyBack = [[[UIView alloc] initWithFrame:rightFrame] autorelease];
	[enemyBack setBackgroundColor: backgroundColor];
	[mainView addSubview: enemyBack];

	rightFrame.origin.y = 276.0f;
	rightFrame.size.height = 64.0f;
	UIView* timeBack = [[[UIView alloc] initWithFrame:rightFrame] autorelease];
	[timeBack setBackgroundColor: backgroundColor];
	[mainView addSubview: timeBack];

	rightFrame.origin.y = 356.0f;
	rightFrame.size.height = 96.0f;
	UIView* livesBack = [[[UIView alloc] initWithFrame:rightFrame] autorelease];
	[livesBack setBackgroundColor: backgroundColor];
	[mainView addSubview: livesBack];

	// Create a playing board.
	CGRect playingRect = CGRectMake(16.0f,77.0f,192.0f,384.0f);
	iBoard* board = [[[iBoard alloc] initWithFrame:playingRect] autorelease];
	[mainView addSubview: board];
}

- (void)applicationWillSuspend
{
#if 0
	// Update default background for startup...
	CGImageRef defaultPNG = [self createApplicationDefaultPNG];
	NSString *pathToDefault = [NSString stringWithFormat:@"%@/Default.png", [[NSBundle mainBundle] bundlePath]];
	NSURL *urlToDefault = [NSURL fileURLWithPath:pathToDefault];
	CGImageDestinationRef dest = CGImageDestinationCreateWithURL((CFURLRef)urlToDefault, CFSTR("public.png")/*kUTTypePNG*/, 1, NULL);
	CGImageDestinationAddImage(dest, defaultPNG, NULL);
	CGImageDestinationFinalize(dest);
	CFRelease(defaultPNG);
#endif
}

@end
