#include "Core.h"
#include "stdio.h"
#include <string.h>
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

// Need to be able to support multiple board instances.  (Maybe, see networking remarks below.)
// Board memory is finite.
// Keep track of current frame (write-only?).
// Keep track of previous frame (read-only).
// Need ability to flush when full.
// Need ability to lock frames.
// When flushing, must copy locked frames into clean buffer and update references.
// Keep track of copied frames so they don't get serialized twice.
// Will need ability to network (both to and from) - might only need latest state for rendering, not full history.
// Use RLE and XOR to serialize history?
// Ability to scrub backwards?

struct Board
{
	Board(int rows, int cols, int frames=2)
	: rows(rows)
	, cols(cols)
	, span(rows * cols)
	{
		//assert(frames > 1, "Cannot support both a previous and current board without two or more frames of history!");
		
		buffer_size = (span * frames);
		buffer = new int[buffer_size];
		
		current = buffer;
		memset(current, eBlockType_Empty, span * sizeof(int));
		Advance();
	}
	
	void Advance()
	{
		previous = current;
		current += span;
		
		//!!ARL: Memcpy prev to cur, or let Update take care of copying all values over?
		
		if (current >= (buffer + buffer_size))
			Flush();
	}
	
	void Flush()
	{
		//!!ARL: Deal with locked frames.
		
		//!!ARL: Assert no overlap - use memmove instead?
		current = buffer;
		memcpy(current, previous, span * sizeof(int));
		Advance();
	}
	
	int* buffer;
	int* current;
	int* previous;
	int rows;
	int cols;
	int span; // blocks per frame
	int buffer_size;
};

struct EachBlock
{
	EachBlock(Board* board, int skip=0) // optionally start at row x
	{
		read = board->previous + (skip * BOARD_COLS);
		write = board->current + (skip * BOARD_COLS);
		end = write + board->span;
	}
	
	inline operator bool() const
	{
		return (write < end);
	}
	
	inline EachBlock& operator++()
	{
		++read;
		++write;
		return *this;
	}
	
	inline int operator*() const
	{
		return (*read);
	}
	
	inline int GetType() const
	{
		return (*read) & eBlockFlag_TypeMask;
	}
	
	inline void SetType(int type)
	{
		(*write) = type;
	}
	
	inline void ClearFlag(int flag)
	{
		(*write) = (*read) & ~flag;
	}
	
	inline int Decay(int mask, const int offset)
	{
		int count = (*read) & mask;
		if (count)
		{
			count -= (1 << offset); // push bit-shift up a level to ensure folding? (this whole function will probably go away shortly anyway)
			if (count == 0)
				return 1;
			
			(*write) = count | ((*read) & ~mask);
		}
		return 0;
	}
	
	const int* read;
	int* write;

	int const* end; // of write
};

struct EachFreeBlock // skips empty and locked blocks
{
	EachFreeBlock(Board* board)
	: board(board)
	{
		i = board->previous - 1;
		end = board->previous + board->span;
		++(*this); // scan to first valid block
	}
	
	inline operator bool() const
	{
		return (i < end);
	}
	
	inline EachFreeBlock& operator++()
	{
		for (++i; (*this); ++i)
		{
			const int block = (*i);
			
			if (block == eBlockType_Empty)
				continue;
			if (block & ~eBlockFlag_TypeMask)
				continue;
			
			break;
		}
		const int offset = i - board->previous;
		row = offset / board->span;
		col = offset % BOARD_COLS;
		return *this;
	}

	inline int GetType() const
	{
		return (*i); // no need to mask since we skip non-masked in the increment
	}
	
	inline void SetType(int type)
	{
		board->current[row * BOARD_COLS + col] = type;
	}
	
	const int* i;
	int const* end;

	int row, col;
	Board* board;
};

struct EachColConst // read-only
{
	EachColConst(Board* board, int row, int min=0, int max=BOARD_COLS)
	: i(&board->previous[row * BOARD_COLS + ::max(min, 0)])
	, end(&board->previous[row * BOARD_COLS + ::min(max, BOARD_COLS)])
	{}
	
	inline operator bool() const
	{
		return (i < end);
	}
	
	inline EachColConst& operator++()
	{
		++i;
		return *this;
	}
	
	inline int operator*() const
	{
		return (*i);
	}

	const int* i;
	const int* const end;
};

struct EachRowConst // read-only
{
	EachRowConst(Board* board, int col, int min=0, int max=BOARD_ROWS)
	: i(&board->previous[::max(min, 0) * BOARD_COLS + col])
	, end(&board->previous[::min(max, BOARD_ROWS) * BOARD_COLS + col])
	{}
	
	inline operator bool() const
	{
		return (i < end);
	}
	
	inline EachRowConst& operator++()
	{
		i += BOARD_COLS;
		return *this;
	}
	
	inline int operator*() const
	{
		return (*i);
	}
	
	const int* i;
	const int* const end;
};

struct EachBlockR // for reverse
{
	EachBlockR(Board* board, int skip=0) // optionally skip x bottom rows
	{
		const int last = (board->span - 1) - (skip * BOARD_COLS);
		read = &board->previous[last];
		write = &board->current[last];
		end = board->current;
	}
	
	inline operator bool() const
	{
		return (write >= end);
	}
	
	inline EachBlockR& operator--()
	{
		--read;
		--write;
		return *this;
	}
	
	inline int operator*() const
	{
		return (*read);
	}
	
	inline int GetType() const
	{
		return (*read) & eBlockFlag_TypeMask;
	}
	
	inline void SetType(int type)
	{
		(*write) = type;
	}
		
	const int* read;
	int* write;
	
	int const* end; // of write
};

static Board* board = NULL;

void PPL_Init()
{
	//!!ARL: Pass in seed?
	struct timeval t;
	gettimeofday(&t,0);
	prev_rand = t.tv_sec;
	
	if (board)
		delete board;
	
	board = new Board(BOARD_ROWS,BOARD_COLS);
}

void PPL_Update(void)
{
	//!!ARL: Need to change how matching / breaking is done.  Store off a set, and work our way through it.
	// Kill the blocks one at a time (left->right, top->bottom).  Use two separate flags.  Start as matched,
	// change to cleared.  Don't actually clear the 'cleared' flag until the entire set has been matched.
	// Allow multiple sets at once, but keep independent.
	// After clear flag is removed, blocks must hang for a frame to give interface code a chance to move a block
	// before they start falling.
	
	//!!ARL: Instead of storing separately, keep track of the board that the combo was made on, and use it as
	// a sort of template for working through and clearing the blocks on the "current" board.
	
	//!!ARL: Falling happens over a single frame.  The visualization is always a frame behind, so we need to
	// move the block, and then mark it on the same frame so the visualization can animate it.  (Unless we
	// start using callbacks instead.)  The next frame when we check to see if a given block needs to fall or
	// not, then we can simple clear the flag in the "or not" case.
	
	board->Advance();
	
	// decay matched/falling blocks.
	for (EachBlock block(board); block; ++block)
	{
		int type = block.GetType();
		if (type == eBlockType_Empty)
			continue;
		if (block.Decay(eBlockFlag_Matching, MATCHING_OFFSET))
			block.SetType(eBlockType_Empty);
		else if (block.Decay(eBlockFlag_Falling, FALLING_OFFSET))
			block.SetType(type); // clear the flag, done falling.
	}
	
	// update falling blocks (by raising empty blocks to the top).
	for (EachBlockR block(board,1), below(board); block; --block, --below)
	{
		//!!ARL: Move to IsEmpty and IsLocked?  (EachFreeBlockR?)
		if ((*block) == eBlockType_Empty)
			continue;
		if ((*block) & ~eBlockFlag_TypeMask)
			continue;

		if ((*below) == eBlockType_Empty)
		{
			below.SetType((*block) | eBlockFlag_Falling);
			block.SetType(eBlockType_Empty);
		}
	}
	
	// check for matches.
	int matches;
	for (EachFreeBlock block(board); block; ++block)
	{
		int type = block.GetType();
		
		matches = 0;
		for (EachColConst i(board,block.row,block.col-2,block.col+3); i; ++i)
		{
			if ((*i) == type)
			{
				if (++matches == 3)
				{
					block.SetType(type | eBlockFlag_Matching);
					goto NEXT_BLOCK;
				}
			}
			else matches = 0;
		}

		matches = 0;
		for (EachRowConst i(board,block.col,block.row-2,block.row+3); i; ++i)
		{
			if ((*i) == type)
			{
				if (++matches == 3)
				{
					block.SetType(type | eBlockFlag_Matching);
					goto NEXT_BLOCK;
				}
			}
			else matches = 0;
		}

		NEXT_BLOCK:;
	}
}

int PPL_Feed(void)
{
	// Check for GameOver state (blocks about to be pushed off the top row).
	for (EachColConst block(board,0); block; ++block)
		if ((*block) != eBlockType_Empty)
			return 0;

	// Unlock old bottom row.
	for (EachBlock block(board,BOARD_ROWS-1); block; ++block)
		block.ClearFlag(eBlockFlag_Locked);

	// Move rows up one.
	for (EachBlock block(board), below(board,1); below; ++block, ++below)
		block.SetType(*below);

	// Fill in new bottom row and lock it.  (!!ARL: Make sure there are no matches.)
	for (EachBlock block(board,BOARD_ROWS-1); block; ++block)
		block.SetType(randRange(eBlockType_Empty+1, eBlockType_Max) | eBlockFlag_Locked);

	// Success!
	return 1;
}

//!!ARL: Push these accessors to Board members?

void PPL_SetBlockType(int row, int col, int type)
{
	if (row < 0 || row >= BOARD_ROWS)
		return;
	if (col < 0 || col >= BOARD_COLS)
		return;
	if (type < 0 || type >= eBlockType_Max)
		return;

	board->current[row * BOARD_COLS + col] = type;
}

int PPL_GetBlockType(int row, int col)
{
	if (row < 0 || row >= BOARD_ROWS)
		return eBlockType_Invalid;
	if (col < 0 || col >= BOARD_COLS)
		return eBlockType_Invalid;

	return (board->current[row * BOARD_COLS + col] & eBlockFlag_TypeMask);
}

int PPL_IsLocked(int row, int col)
{
	int block = board->current[row * BOARD_COLS + col];
	return (block & ~eBlockFlag_TypeMask);
}

int PPL_IsFalling(int row, int col)
{
	int block = board->current[row * BOARD_COLS + col];
	return (block & eBlockFlag_Falling);
}

int PPL_IsBreaking(int row, int col)
{
	int block = board->current[row * BOARD_COLS + col];
	return (block & eBlockFlag_Matching);
}

int PPL_MoveRight(int row, int col)
{
	if (col == BOARD_COLS-1)
		return 0;

	int block = board->current[row * BOARD_COLS + col];
	if (block & ~eBlockFlag_TypeMask)
		return 0;

	int other = board->current[row * BOARD_COLS + col+1];
	if (other & ~eBlockFlag_TypeMask)
		return 0;

	board->previous[row * BOARD_COLS + col] = other;
	board->previous[row * BOARD_COLS + col+1] = block;
	return 1;
}

int PPL_MoveLeft(int row, int col)
{
	if (col == 0)
		return 0;

	int block = board->current[row * BOARD_COLS + col];
	if (block & ~eBlockFlag_TypeMask)
		return 0;

	int other = board->current[row * BOARD_COLS + col-1];
	if (other & ~eBlockFlag_TypeMask)
		return 0;

	board->previous[row * BOARD_COLS + col] = other;
	board->previous[row * BOARD_COLS + col-1] = block;
	return 1;
}
