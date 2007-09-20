#import <CoreFoundation/CoreFoundation.h>
#import <Foundation/Foundation.h>
#import <UIKit/UIHardware.h>

#import "App.h"

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
	mainViewRect.origin.y = 0.0f;
	mainView = [[UIView alloc] initWithFrame: mainViewRect];
    [window setContentView: mainView];

	//Set up the labels.
	CGRect labelFrame = CGRectMake(5.0f, 100.0f, mainViewRect.size.width - 5.0f, 20.0f);
	UITextLabel* testLabel = [[UITextLabel alloc] initWithFrame: labelFrame];
	[mainView addSubview: testLabel];

	[testLabel setText: @"iPhonePuzzleLeague"];
}

@end
