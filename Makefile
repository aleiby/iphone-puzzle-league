CC=arm-apple-darwin-cc
LD=$(CC)
LDFLAGS=-lobjc -framework CoreFoundation -framework Foundation -framework UIKit -framework LayerKit

all:	iPhonePuzzleLeague install

iPhonePuzzleLeague:	main.o App.o
	$(LD) $(LDFLAGS) -o $@ $^

%.o:	%.m
		$(CC) -c $(CFLAGS) $(CPPFLAGS) $< -o $@

install: 
		cp iPhonePuzzleLeague iPPL.app
		
upload:
		echo -e "-mkdir /Applications/iPPL.app\n-put ./iPPL.app/* /Applications/iPPL.app/" |sftp root@192.168.1.102 -b-

clean:
		rm -f *.o iPhonePuzzleLeague
