#import <UIKit/UIKit.h>
#import <GraphicsServices/GraphicsServices.h>

#import "App.h"
#import "Core.h"

//!!ARL: Separate interface (selection, dragging, feeding) from visualization.

#define BLOCK_SIZE 34.0f

@interface iBoardBase : UIView
@end

@interface iBoardView : iBoardBase
{
	UIImage* blockImages[eBlockType_Max];
}

-(void)update;
-(void)swapRow:(int)row colA:(int)a colB:(int)b;
-(void)swapCol:(int)col rowA:(int)a rowB:(int)b;
-(void)swapBlock:(UIView*)a andBlock:(UIView*)b;

@end

@interface iDebugView : iBoardBase
{
	UIImage* lockedImage;
}

-(void)update;

@end

@interface iBoard : UIView
{
	int selectedRow, selectedCol, desiredCol;

	iBoardView* boardView;
	iDebugView* debugView;
	UIView* selectedView;

	NSTimer* timer;
}

-(void)reset;
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

	float yellow[4] = {1,1,0,1};
	CGRect selectedRect = CGRectMake(0.0f, 0.0f, 48.0f, 48.0f);
	selectedView = [[[UIView alloc] initWithFrame:selectedRect] autorelease];
	[selectedView setBackgroundColor:CGColorCreate(CGColorSpaceCreateDeviceRGB(), yellow)];
	[self addSubview: selectedView];

	[self reset];
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
	int type = PPL_GetBlockType(selectedRow, selectedCol);

	// Update dragging...
	if (selectedRow >= 0 && selectedCol >= 0 && desiredCol >=0)
	{
		if (desiredCol < selectedCol &&  PPL_MoveLeft(selectedRow, selectedCol))
		{
			int from = selectedCol--;
			[boardView swapRow:selectedRow colA:from colB:selectedCol];
		}
		else if (desiredCol > selectedCol &&  PPL_MoveRight(selectedRow, selectedCol))
		{
			int from = selectedCol++;
			[boardView swapRow:selectedRow colA:from colB:selectedCol];
		}

		float offset = BLOCK_SIZE / 4.0f;
		[selectedView setOrigin:CGPointMake(selectedCol * BLOCK_SIZE - offset, selectedRow * BLOCK_SIZE - offset)];
	}

	// Animate blocks that will fall this update...
	for (int row=0; row<BOARD_ROWS; row++)
	{
		for (int col=0; col<BOARD_COLS; col++)
		{
			if (PPL_IsFalling(row, col))
				[boardView swapCol:col rowA:row rowB:row+1];
		}
	}

	PPL_Update();

	// Release selection if type changes on us.
	if (PPL_GetBlockType(selectedRow, selectedCol) != type)
		[self reset];

	[boardView update];
	[debugView update];
}

- (void) reset
{
	selectedRow = selectedCol = desiredCol = -1;
	[selectedView setAlpha:0.0f];
}

- (CGPoint) getRelativeLocation:(GSEvent*)event
{
	CGPoint location = GSEventGetLocationInWindow(event);
	CGRect frame = [self frame];
	location.x -= frame.origin.x;
	location.y -= frame.origin.y - 16.0f;	// I'm not sure where this is coming from.
	return location;
}

- (int) colGivenX:(float)x
{
	CGRect frame = [self frame];
	return x / frame.size.width * BOARD_COLS;
}

- (int) rowGivenY:(float)y
{
	CGRect frame = [self frame];
	return y / frame.size.height * BOARD_ROWS;
}

- (void)mouseDown:(GSEvent*)event
{
	CGPoint location = [self getRelativeLocation:event];
	selectedCol = [self colGivenX:location.x];
	selectedRow = [self rowGivenY:location.y];

	desiredCol = selectedCol;

	float offset = BLOCK_SIZE / 4.0f;
	[selectedView setOrigin:CGPointMake(selectedCol * BLOCK_SIZE - offset, selectedRow * BLOCK_SIZE - offset)];
	[selectedView setAlpha:0.5f];
}

- (void)mouseDragged:(GSEvent*)event
{
	CGPoint location = [self getRelativeLocation:event];
	desiredCol = [self colGivenX:location.x];
}

@end

@implementation iBoardBase

- (id)initWithFrame:(CGRect)frame
{
	self = [super initWithFrame:frame];

	CGRect blockRect = CGRectMake(0.0f, 0.0f, BLOCK_SIZE, BLOCK_SIZE);
	for (int row=0; row<BOARD_ROWS; row++)
	{
		for (int col=0; col<BOARD_COLS; col++)
		{
			UIImageView* block = [[[UIImageView alloc] initWithFrame:blockRect] autorelease];
			[block setAlpha:0.75f];
			[self addSubview:block];
			blockRect.origin.x += BLOCK_SIZE;
		}
		blockRect.origin.x = 0.0f;
		blockRect.origin.y += BLOCK_SIZE;
	}

	return self;
}

@end

@implementation iBoardView

- (id)initWithFrame:(CGRect)frame
{
	self = [super initWithFrame:frame];

#if 1 //DEBUG - UIView animations don't get updated unless rendered.
	id imageNames[eBlockType_Max] = {@"locked",@"red",@"green",@"blue",@"yellow",@"pink",@"special"};
	for (int i=0; i<eBlockType_Max; i++)
#else
	id imageNames[eBlockType_Max] = {@"",@"red",@"green",@"blue",@"yellow",@"pink",@"special"};
	blockImages[0] = nil;
	for (int i=1; i<eBlockType_Max; i++)
#endif
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

- (void) swapRow:(int)row colA:(int)a colB:(int)b
{
	NSArray* blocks = [self subviews];

	int offset = row * BOARD_COLS;
	UIView* viewA = (UIView*)[blocks objectAtIndex:offset + a];
	UIView* viewB = (UIView*)[blocks objectAtIndex:offset + b];

	[self swapBlock:viewA andBlock:viewB];
}

- (void) swapCol:(int)col rowA:(int)a rowB:(int)b
{
	NSArray* blocks = [self subviews];

	UIView* viewA = (UIView*)[blocks objectAtIndex:a * BOARD_COLS + col];
	UIView* viewB = (UIView*)[blocks objectAtIndex:b * BOARD_COLS + col];

	[self swapBlock:viewA andBlock:viewB];
}

- (void) swapBlock:(UIView*)a andBlock:(UIView*)b
{
	CGPoint originA = [a origin];
	CGPoint originB = [b origin];

	[a setOrigin:originB];
	[b setOrigin:originA];

	[UIView beginAnimations:nil];
	[UIView setAnimationDelay:0.0];
	[UIView setAnimationDuration:0.1];
	[a setOrigin:originA];
	[b setOrigin:originB];
	[UIView endAnimations];
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
	PPL_Feed();

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

	CGRect mainRect = CGRectMake(12.0f,32.0f,BLOCK_SIZE*BOARD_COLS,BLOCK_SIZE*BOARD_ROWS);
	UIView* mainBack = [[[UIView alloc] initWithFrame:mainRect] autorelease];
	[mainBack setBackgroundColor: backgroundColor];
	[mainView addSubview: mainBack];
/*
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
*/
	// Create a playing board.
	iBoard* board = [[[iBoard alloc] initWithFrame:mainRect] autorelease];
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
