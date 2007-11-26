CC=arm-apple-darwin-cc
CFLAGS=-g -O2 -Wall -std=gnu99
LD=$(CC)
LDFLAGS=-lobjc -framework CoreFoundation -framework Foundation -framework UIKit -framework LayerKit \
	-framework CoreGraphics -framework GraphicsServices

all:	iPhonePuzzleLeague install

iPhonePuzzleLeague:	main.o App.o Core.o
	$(LD) $(LDFLAGS) -o $@ $^

%.o:	%.m
		$(CC) -c $(CFLAGS) $(CPPFLAGS) $< -o $@

install: iPhonePuzzleLeague
		cp iPhonePuzzleLeague iPPL.app
		
upload: install
		echo -e "-mkdir /Applications/iPPL.app\n-put ./iPPL.app/* /Applications/iPPL.app/" |sftp root@192.168.1.100 -b-

clean:
		rm -f *.o iPhonePuzzleLeague
		rm -f *~ iPhonePuzzleLeague
