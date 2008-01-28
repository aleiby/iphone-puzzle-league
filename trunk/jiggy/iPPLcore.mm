#import "jiggy.h"
#import "Core.h"

@interface jsiPPLcore : JSIObject
@end

@implementation jsiPPLcore

-(void)Init
{
	PPL_Init();
}

-(void)Update
{
	PPL_Update();
}

-(bool)Feed
{
	return PPL_Feed();
}

-(int)GetBlockType:(int)row col:(int)col
{
	return PPL_GetBlockType(row, col);
}

-(bool)IsLocked:(int)row col:(int)col
{
	return PPL_IsLocked(row, col);
}

-(bool)IsFalling:(int)row col:(int)col
{
	return PPL_IsFalling(row, col);
}

-(bool)IsBreaking:(int)row col:(int)col
{
	return PPL_IsBreaking(row, col);
}

-(bool)MoveRight:(int)row col:(int)col
{
	return PPL_MoveRight(row, col);
}

-(bool)MoveLeft:(int)row col:(int)col
{
	return PPL_MoveLeft(row, col);
}

#import "jsi/iPPLcore.mi"

@end

JIGGY_EXPORT
int Jigglin( JSIContext * jsi )
{
    [jsiPPLcore
		defineAsJSPropertyWithFlags:JSPROP_ENUMERATE|JSPROP_READONLY 
		andPrototype:NULL 
		called:"iPPLcore" 
		withScope:[jsi global] 
		inContext:jsi];
		
	return 0;
}


