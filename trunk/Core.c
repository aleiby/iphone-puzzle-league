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

int DecayBlock(int* block, int mask, int inc)
{
	int count = ((*block) & mask);
	if (count)
	{
		count -= inc;
		if (count == 0)
			return 1;

		(*block) = count | ((*block) & ~mask);
	}
	return 0;
}

void PPL_Update(void)
{
	// decay matched/falling blocks.
	for (int row = 0; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
		{
			int* block = &(blocks[row][col]);
			int type = (*block) & eBlockFlag_TypeMask;
			if (type == eBlockType_Empty)
				continue;
			if (DecayBlock(block, eBlockFlag_MatchMask, (1 << MATCH_OFFSET)))
				(*block) = eBlockType_Empty;
			else if (DecayBlock(block, eBlockFlag_FallingMask, (1 << FALLING_OFFSET)))
			{
				(*block) = eBlockType_Empty;
				blocks[row+1][col] = type;
			}
		}

	// check for falling.
	for (int row = 0; row < BOARD_ROWS-1; row++)
		for (int col = 0; col < BOARD_COLS; col++)
		{
			int type = blocks[row][col];
			if (type == eBlockType_Empty)
				continue;
			if (type & ~eBlockFlag_TypeMask)
				continue;

			if (blocks[row+1][col] == eBlockType_Empty)
			{
				blocks[row][col] |= eBlockFlag_FallingMask;
				blocks[row+1][col] |= eBlockFlag_FallingMask;	// maybe use separate locked flag instead to avoid filtering Emptys above?
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

			//!! read from old, write to new instead.
			int type_matched = (type | eBlockFlag_MatchMask);

			// horizontal...
			{
				int low = max(col-2, 0);
				int high = min(col+3, BOARD_COLS);
				int matches = 0;
				for (int i = low; i < high; i++)
				{
					int block = blocks[row][i];
					if (block == type || block == type_matched)
					{
						if (++matches == 3)
						{
							blocks[row][col] |= eBlockFlag_MatchMask;
							goto NEXT_BLOCK;
						}
					}
					else matches = 0;
				}
			}

			// vertical...
			{
				int low = max(row-2, 0);
				int high = min(row+3, BOARD_ROWS);
				int matches = 0;
				for (int i = low; i < high; i++)
				{
					int block = blocks[i][col];
					if (block == type || block == type_matched)
					{
						if (++matches == 3)
						{
							blocks[row][col] |= eBlockFlag_MatchMask;
							goto NEXT_BLOCK;
						}
					}
					else matches = 0;
				}
			}

			NEXT_BLOCK:;
		}

	ticks++;
}

void PPL_Feed(int ticks)
{
}

int PPL_GetBlockType(int row, int col)
{
	// Blink when matched.
	if (blocks[row][col] & (1 << MATCH_OFFSET))
		return eBlockType_Empty;

	return (blocks[row][col] & eBlockFlag_TypeMask);
}

void PPL_MoveRight(int row, int col)
{
	if (col == BOARD_COLS-1)
		return;
	int block = blocks[row][col];
	if (block & ~eBlockFlag_TypeMask)
		return;
	int other = blocks[row][col+1];
	if (other & ~eBlockFlag_TypeMask)
		return;
	blocks[row][col] = other;
	blocks[row][col+1] = block;
}

void PPL_MoveLeft(int row, int col)
{
	if (col == 0)
		return;
	int block = blocks[row][col];
	if (block & ~eBlockFlag_TypeMask)
		return;
	int other = blocks[row][col-1];
	if (other & ~eBlockFlag_TypeMask)
		return;
	blocks[row][col] = other;
	blocks[row][col-1] = block;
}
