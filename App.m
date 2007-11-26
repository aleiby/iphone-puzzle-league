#import <UIKit/UIKit.h>
#import <GraphicsServices/GraphicsServices.h>

#import "App.h"
#import "Core.h"

@interface iBlock : UIImageView
{
	int row, col;
}

- (int)row;
- (int)col;
- (void)setRow:(int)row andColumn:(int)col;

@end

@interface iBoard : UIView
{
	iBlock* selected;
	CGPoint sel_loc;
	NSTimer* timer;
	int counter;
	UIImage* blockImages[eBlockType_Max];
}

- (void)setSelected:(id)block withLocation:(CGPoint)location;
- (void)clearSelected;

@end

@implementation iBlock

- (int)row
{
	return row;
}

- (int)col
{
	return col;
}

- (void)setRow:(int)_row andColumn:(int)_col
{
	row = _row;
	col = _col;
}

- (void)mouseDown:(GSEvent*)event
{
	CGPoint location = GSEventGetLocationInWindow(event);
	[(iBoard*)[self superview] setSelected:self withLocation:location];
}

- (void)mouseUp:(GSEvent*)event
{
	[(iBoard*)[self superview] clearSelected];
}

@end

@implementation iBoard

- (id)initWithFrame:(CGRect)frame
{
	self = [super initWithFrame:frame];
    timer = [NSTimer
        scheduledTimerWithTimeInterval:0.1
        target: self
        selector: @selector(update)
        userInfo: nil
        repeats: YES
    ];

	id imageNames[eBlockType_Max] = {@"",@"red",@"green",@"blue",@"yellow",@"pink",@"special"};
	blockImages[0] = nil;
	for (int i=1; i<eBlockType_Max; i++)
		blockImages[i] = [[UIImage imageAtPath:[[NSBundle mainBundle] pathForResource:imageNames[i] ofType:@"png"]] retain];

	counter = 0;
	return self;
}

- (void) update
{
	PPL_Update();

	//!!ARL: Maybe add a callback when the type changes instead?
	NSArray* blocks = [self subviews];
	int count = [blocks count];
	for (int i=0; i<count; i++)
	{
		iBlock* block = (iBlock*)[blocks objectAtIndex:i];
		int type = PPL_GetBlockType([block row], [block col]);
		UIImage* image = blockImages[type];
		[block setImage:image];
	}

	[self setNeedsDisplay];
}

- (void)setSelected:(id)block withLocation:(CGPoint)location
{
	selected = block;
	sel_loc = location;
}

- (void)clearSelected
{
	selected = nil;
}

- (void)mouseDragged:(GSEvent*)event
{
	if (selected == nil)
		return;

	CGPoint location = GSEventGetLocationInWindow(event);
	float diff = location.x - sel_loc.x;
	if (diff > 32.0f)
	{
		PPL_MoveRight([selected row], [selected col]);
		[selected setNeedsDisplay];
		selected = nil;
		return;
	}

	if (diff < -32.0f)
	{
		PPL_MoveLeft([selected row], [selected col]);
		[selected setNeedsDisplay];
		selected = nil;
		return;
	}
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
	UIView* playingBoard = [[[iBoard alloc] initWithFrame:playingRect] autorelease];
	[mainView addSubview: playingBoard];

	// Add some blocks...
	CGRect blockRect = CGRectMake(0.0f, 0.0f, 32.0f, 32.0f);
	for (int row=0; row<BOARD_ROWS; row++)
	{
		for (int col=0; col<BOARD_COLS; col++)
		{
			iBlock* block = [[[iBlock alloc] initWithFrame:blockRect] autorelease];
			[block setRow:row andColumn:col];
			[playingBoard addSubview:block];
			blockRect.origin.x += 32.0f;
		}
		blockRect.origin.x = 0.0f;
		blockRect.origin.y += 32.0f;
	}
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
