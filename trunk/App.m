#import <UIKit/UIKit.h>
#import <GraphicsServices/GraphicsServices.h>

#import "App.h"

//- (id)initWithFrame:(CGRect)frame

/*
- (void)updatePos:(GSEvent*)event
{
	CGPoint location = GSEventGetLocationInWindow(event);
	[_element setOrigin:location];
	[_element setNeedsDisplay];
}

- (void)mouseDragged:(GSEvent*)event
{
	[self updatePos:event];
}

- (void)mouseDown:(GSEvent*)event
{
	[self updatePos:event];
}
*/

@implementation iPhonePuzzleLeague

- (void) applicationDidFinishLaunching: (id) unused
{
	UIWindow* window;
	UIView* mainView;

	CGRect windowRect;
	CGRect mainViewRect;

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
	arena = [[[UIImageView alloc] initWithFrame:CGRectMake(0.0f,0.0f,320.0f,480.0f)] autorelease];
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

    timer = [NSTimer
        scheduledTimerWithTimeInterval:0.033
        target: self
        selector: @selector(update)
        userInfo: nil
        repeats: YES
    ];
}

- (void) update
{
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
	[timer invalidate];
}

@end
