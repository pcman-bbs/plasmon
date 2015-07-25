NAME := $(shell node -e "console.log(require('./package').name)")
VERSION := $(shell node -e "console.log(require('./package').version)")
ELECTRON_VERSION := 0.30.1

#
# Binaries.
#

BIN := node_modules/.bin
ELECTRON := $(BIN)/electron
BROWSERIFY := $(BIN)/browserify
PACKAGER := $(BIN)/electron-packager

#
# Files.
#

SRC := $(shell find lib -type f -name '*.js')
SCRIPT := build/script.js
ENTRY := lib/app.js

#
# Tasks.
#

start: clean build
	@$(ELECTRON) .

pack: clean build
	@$(PACKAGER) . $(NAME) \
		--platform=darwin \
		--arch=x64 \
		--version=$(ELECTRON_VERSION) \
		--out build

build: $(SCRIPT)

clean:
	@rm -rf build

#
# Targets.
#

$(SCRIPT): $(SRC)
	@-mkdir -p $(@D)
	@$(BROWSERIFY) $(ENTRY) \
		--ignore-missing \
		-t strictify \
		-t babelify \
		--outfile $@

.PHONY: build test
