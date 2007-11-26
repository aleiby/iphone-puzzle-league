
enum EBlockType
{
	eBlockType_Empty,
	eBlockType_Red,
	eBlockType_Green,
	eBlockType_Blue,
	eBlockType_Yellow,
	eBlockType_Purple,
	eBlockType_Special,

	eBlockType_Max
};

enum EBlockFlag
{
	eBlockFlag_TypeMask		= (7),
	eBlockFlag_MatchMask	= (15 << 3),
	eBlockFlag_Locked		= (1 << 8),
};

#define BOARD_COLS			6
#define BOARD_ROWS			12

#define HISTORY_FRAMES		32
#define TICKS_PER_FEED		64
#define TICKS_PER_MATCH		8

void	PPL_Init			(void);
void	PPL_Update			(void);
void	PPL_Feed			(int ticks);
int		PPL_GetBlockType	(int row, int column);
void	PPL_MoveRight		(int row, int column);
void	PPL_MoveLeft		(int row, int column);
