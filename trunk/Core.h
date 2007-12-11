
enum EBlockType
{
	eBlockType_Empty,
	eBlockType_Red,
	eBlockType_Green,
	eBlockType_Blue,
	eBlockType_Yellow,
	eBlockType_Purple,
	eBlockType_Special,

	eBlockType_Max,
	eBlockType_Invalid = -1
};

#define MATCH_OFFSET		3
#define FALLING_OFFSET		8
#define LOCKED_OFFSET		9

enum EBlockFlag
{
	eBlockFlag_TypeMask		= (7),
	eBlockFlag_MatchMask	= (15 << MATCH_OFFSET),
	eBlockFlag_FallingMask	= (1 << FALLING_OFFSET),
	eBlockFlag_Locked		= (1 << LOCKED_OFFSET),
};

#define BOARD_COLS			6
#define BOARD_ROWS			12

#define HISTORY_FRAMES		32
#define TICKS_PER_FEED		64
#define TICKS_PER_MATCH		8

void	PPL_Init			(void);
void	PPL_Update			(void);
void	PPL_Feed			(void);
int		PPL_GetBlockType	(int row, int column);
int		PPL_IsLocked		(int row, int column);
int		PPL_IsFalling		(int row, int column);
int		PPL_MoveRight		(int row, int column);
int		PPL_MoveLeft		(int row, int column);
