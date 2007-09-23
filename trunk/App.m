#import <CoreFoundation/CoreFoundation.h>
#import <Foundation/Foundation.h>
#import <UIKit/UIHardware.h>

#import "App.h"

#import <UIKit/UIView-Rendering.h>
#import <LayerKit/LKLayer.h>

#ifndef GRAPHICSSERVICES_H
#define GRAPHICSSERVICES_H

#import <UIKit/UIKit.h>

struct __GSEvent;
typedef struct __GSEvent GSEvent;
typedef GSEvent *GSEventRef;

struct CGPoint;
struct CGRect;
typedef struct CGPoint CGPoint;
typedef struct CGRect CGRect;

int GSEventIsChordingHandEvent(GSEvent *ev);
int GSEventGetClickCount(GSEvent *ev);
CGRect GSEventGetLocationInWindow(GSEvent *ev);
float GSEventGetDeltaX(GSEvent *ev);
float GSEventGetDeltaY(GSEvent *ev);
CGRect  GSEventGetInnerMostPathPosition(GSEvent *ev);
CGRect GSEventGetOuterMostPathPosition(GSEvent *ev);

void GSEventVibrateForDuration(float secs);

#endif

@interface DragView : UIView
{
	UIView* _element;
}
- (void)setElement:(UIView*)element;
- (void)updatePos:(GSEvent*)event;
@end

@implementation DragView

- (void)setElement:(UIView*)element
{
	_element = element;
}

- (void)updatePos:(GSEvent*)event
{
    CGRect location = GSEventGetLocationInWindow(event);
	[(UITextLabel*)_element setText:[NSString stringWithFormat:@"drag: %f %f", location.origin.x, location.origin.y]];
	[_element setOrigin:location.origin];
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

@end


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
	mainView = [[DragView alloc] initWithFrame: mainViewRect];
    [window setContentView: mainView];

	//Set up the labels.
	CGRect labelFrame = CGRectMake(5.0f, 100.0f, mainViewRect.size.width - 5.0f, 20.0f);
	UITextLabel* testLabel = [[UITextLabel alloc] initWithFrame: labelFrame];
	[mainView addSubview: testLabel];

	[testLabel setText: @"iPhonePuzzleLeague"];

	float background[4] = {1,0,0,0.5};
	[testLabel setBackgroundColor: CGColorCreate(CGColorSpaceCreateDeviceRGB(), background)];

	[(DragView*)mainView setElement: testLabel];
}

@end
