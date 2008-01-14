
PLUGIN_NAME=iPPLcore

#------------------------------------------------------------------------------

JSI_CLASSES+=$(PLUGIN_NAME)

PLUGIN_SOURCE=$(PLUGIN_NAME).mm

PLUGIN_OBJECT=$(PLUGIN_NAME).o
	
BINARY=jiggy.$(PLUGIN_NAME)

SOURCES+=$(PLUGIN_SOURCE) Core.c
	
#------------------------------------------------------------------------------

include makefile.common

#------------------------------------------------------------------------------

LDFLAGS+=-ljs -ljiggy -dynamiclib -fvisibility=hidden -install_name $(BINARY)

#------------------------------------------------------------------------------

all:$(BINARY) 

$(PLUGIN_OBJECT): $(JSI_GEN_FILES)

$(BINARY): $(OBJECTS) 
	$(LD) $(LDFLAGS) -o $(BINARY) $(OBJECTS) 
	
#------------------------------------------------------------------------------

clean:
	$(RM) $(JSI_GEN_TEMP_DIR) $(OBJECTS) $(BINARY)
	
