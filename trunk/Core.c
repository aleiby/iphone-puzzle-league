#include "Core.h"

int blocks[BOARD_ROWS][BOARD_COLS];
int ticks = 0;

void PPL_Init()
{
	for (int row = 0; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
			blocks[row][col] = eBlockType_Empty;
}

void PPL_Update(void)
{
	int col = ticks % BOARD_COLS;
	int row = (ticks / BOARD_COLS) % BOARD_ROWS;
	blocks[row][col] = ticks % eBlockType_Max;
	ticks++;
}

void PPL_Feed(int ticks)
{
}

int PPL_GetBlockType(int row, int col)
{
	return blocks[row][col];
}
