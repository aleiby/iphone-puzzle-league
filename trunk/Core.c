#include "Core.h"
#include "stdio.h"

int prev_rand = 0;
int quickrand()
{
	prev_rand = (1664525L * prev_rand + 1013904223L);
	return prev_rand;
}

int abs(int a)
{
	return (a < 0) ? -a : a;
}

int min(int a, int b)
{
	return (a < b) ? a : b;
}

int max(int a, int b)
{
	return (a > b) ? a : b;
}

int blocks[BOARD_ROWS][BOARD_COLS];
int ticks = 0;

void PPL_Init()
{
	for (int row = 0; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
			blocks[row][col] = abs(quickrand()) % eBlockType_Max;
}

void PPL_Update(void)
{
	// decay matched blocks.
	for (int row = 0; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
		{
			int count = (blocks[row][col] & eBlockFlag_MatchMask);
			if (count)
			{
				count -= (1 << 3);
				if (count == 0)
				{
					blocks[row][col] = eBlockType_Empty;
					continue;
				}
				blocks[row][col] = count | (blocks[row][col] & ~eBlockFlag_MatchMask);
			}
		}

	// check for matches.
	for (int row = 0; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
		{
			int type = blocks[row][col];
			if (type == eBlockType_Empty)
				continue;
			if (type & ~eBlockFlag_TypeMask)
				continue;
			type = (type & eBlockFlag_TypeMask);

			// horizontal...
			{
				int low = max(col-2, 0);
				int high = min(col+3, BOARD_COLS);
				int matches = 0;
				for (int i = low; i < high; i++)
					if ((blocks[row][i] & eBlockFlag_TypeMask) == type)
					{
						if (++matches == 3)
						{
							blocks[row][col] |= eBlockFlag_MatchMask;
							goto NEXT_BLOCK;
						}
					}
					else matches = 0;
			}

			// vertical...
			{
				int low = max(row-2, 0);
				int high = min(row+3, BOARD_ROWS);
				int matches = 0;
				for (int i = low; i < high; i++)
					if ((blocks[i][col] & eBlockFlag_TypeMask) == type)
					{
						if (++matches == 3)
						{
							blocks[row][col] |= eBlockFlag_MatchMask;
							goto NEXT_BLOCK;
						}
					}
					else matches = 0;
			}

			NEXT_BLOCK:;
		}

	// propagate falling blocks.
	for (int row = 1; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
			if (blocks[row][col] == eBlockType_Empty)
			{
				//!!ARL: Read from old, write to new.
				blocks[row][col] = blocks[row-1][col];
				blocks[row-1][col] = eBlockType_Empty;
			}

	ticks++;
}

void PPL_Feed(int ticks)
{
}

int PPL_GetBlockType(int row, int col)
{
	// Blink when matched.
	if (blocks[row][col] & (1 << 3))
		return eBlockType_Empty;

	return (blocks[row][col] & eBlockFlag_TypeMask);
}

void PPL_MoveRight(int row, int col)
{
	int block = blocks[row][col];
	if (block & ~eBlockFlag_TypeMask)
		return;
	if (col == BOARD_COLS-1)
		return;
	blocks[row][col] = blocks[row][col+1];
	blocks[row][col+1] = block;
}

void PPL_MoveLeft(int row, int col)
{
	int block = blocks[row][col];
	if (block & ~eBlockFlag_TypeMask)
		return;
	if (col == 0)
		return;
	blocks[row][col] = blocks[row][col-1];
	blocks[row][col-1] = block;
}
