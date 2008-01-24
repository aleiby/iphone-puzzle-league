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

-(int)GetBlockType:(int)_row col:(int)_col
{
	return PPL_GetBlockType(_row, _col);
}

-(bool)IsLocked:(int)_row col:(int)_col
{
	return PPL_IsLocked(_row, _col);
}

-(bool)IsFalling:(int)_row col:(int)_col
{
	return PPL_IsFalling(_row, _col);
}

-(bool)MoveRight:(int)_row col:(int)_col
{
	return PPL_MoveRight(_row, _col);
}

-(bool)MoveLeft:(int)_row col:(int)_col
{
	return PPL_MoveLeft(_row, _col);
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


