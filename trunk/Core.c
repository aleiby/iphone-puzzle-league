#include "Core.h"
#include "stdio.h"
#include <sys/time.h>

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

int randRange(int a, int b)
{
	return a + (abs(quickrand()) % (b - a));
}

int blocks[BOARD_ROWS][BOARD_COLS];
int ticks = 0;

void PPL_Init()
{
	struct timeval t;
	gettimeofday(&t,0);
	prev_rand = t.tv_sec;

	// Clear first half of board.
	int filledRows = BOARD_ROWS / 2;
	for (int row = 0; row < filledRows; row++)
		for (int col = 0; col < BOARD_COLS; col++)
			blocks[row][col] = eBlockType_Empty;

	// Fill in the rest with normal blocks (not special).
	for (int row = filledRows; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
			blocks[row][col] = randRange(eBlockType_Empty, eBlockType_Special);

	// Update until the blocks settle.
	TRY_AGAIN:	PPL_Update();
	for (int row = 0; row < BOARD_ROWS; row++)
		for (int col = 0; col < BOARD_COLS; col++)
			if (blocks[row][col] & ~eBlockFlag_TypeMask)
				goto TRY_AGAIN;
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

	++ticks;
}

int PPL_Feed(void)
{
	// Check for GameOver state (blocks about to be pushed off the top row).
	for (int col = 0; col < BOARD_COLS; col++)
		if (blocks[0][col] != eBlockType_Empty)
			return 0;

	// Unlock old bottom row.
	for (int col = 0; col < BOARD_COLS; col++)
		blocks[BOARD_ROWS-1][col] &= ~eBlockFlag_Locked;

	// Move rows up one.
	for (int row = 0; row < BOARD_ROWS-1; row++)
		for (int col = 0; col < BOARD_COLS; col++)
			blocks[row][col] = blocks[row+1][col];

	// Fill in new bottom row and lock it.  (!!ARL: Make sure there are no matches.)
	for (int col = 0; col < BOARD_COLS; col++)
		blocks[BOARD_ROWS-1][col] = randRange(eBlockType_Empty+1, eBlockType_Max) | eBlockFlag_Locked;

	// Success!
	return 1;
}

int PPL_GetBlockType(int row, int col)
{
	if (row < 0 || row >= BOARD_ROWS)
		return eBlockType_Invalid;
	if (col < 0 || col >= BOARD_COLS)
		return eBlockType_Invalid;

	// Blink when matched.
	if (blocks[row][col] & (1 << MATCH_OFFSET))
		return eBlockType_Empty;

	return (blocks[row][col] & eBlockFlag_TypeMask);
}

int PPL_IsLocked(int row, int col)
{
	return (blocks[row][col] & ~eBlockFlag_TypeMask);
}

int PPL_IsFalling(int row, int col)
{
	int block = blocks[row][col];
	if (block & eBlockFlag_FallingMask)
	{
		int type = (block & eBlockFlag_TypeMask);
		return (type != eBlockType_Empty);
	}
	return 0;
}

int PPL_IsBreaking(int row, int col)
{
	int block = blocks[row][col];
	return (block & eBlockFlag_MatchMask);
}

int PPL_MoveRight(int row, int col)
{
	if (col == BOARD_COLS-1)
		return 0;

	int block = blocks[row][col];
	if (block & ~eBlockFlag_TypeMask)
		return 0;

	int other = blocks[row][col+1];
	if (other & ~eBlockFlag_TypeMask)
		return 0;

	blocks[row][col] = other;
	blocks[row][col+1] = block;
	return 1;
}

int PPL_MoveLeft(int row, int col)
{
	if (col == 0)
		return 0;

	int block = blocks[row][col];
	if (block & ~eBlockFlag_TypeMask)
		return 0;

	int other = blocks[row][col-1];
	if (other & ~eBlockFlag_TypeMask)
		return 0;

	blocks[row][col] = other;
	blocks[row][col-1] = block;
	return 1;
}
