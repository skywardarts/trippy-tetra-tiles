Game.FallingPentomino = function () {
    this.y     = 0;
    this.x     = Math.floor(GRID_SIZE_W / 2 - 2.5);
    this.color = _.sample(['#77DD77', '#B39EB5', '#C23B22', '#FFB347', '#FDFD96', '#836953', '#779ECB', '#FFD1DC']);
    this.shape = _.sample(Game.PENTOMINO_SHAPES); // Game.PENTOMINO_SHAPES[2];
    this.width = this.getDimensions().width;
    this.height = this.getDimensions().height;
};

Game.FallingPentomino.prototype = {
    rotate: function () {
        // transpose the shape and then reverses each row http://stackoverflow.com/questions/42519/how-do-you-rotate-a-two-dimensional-array
        this.shape = _.map(Utils.transpose(this.shape), function (row) { return row.reverse(); });
    },
    reset: function (shape) {
        this.y     = 0;
        this.x     = Math.floor(GRID_SIZE_W / 2 - 2.5);
        this.shape = shape !== undefined ? _.cloneDeep(shape) : _.sample(Game.PENTOMINO_SHAPES);
    },
    getDimensions: function() {
        var result = {width: 0, height: 0};

        for(var row = 0; row < this.shape.length; row++) {
            var width = 0;

            for(var col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col] != 0) {
                    this.shape[row][col] = this.color;
                    width += 1;
                }
            }

            if (result.width < width) {
                result.width = width;
            }
        }

        for(var row = 0; row < this.shape.length; row++) {
            var height = 0;

            for(var col = 0; col < this.shape[row].length; col++) {
                if (this.shape[col][row] != 0) {
                    this.shape[col][row] = this.color;
                    height += 1;
                }
            }

            if (result.height < height) {
                result.height = height;
            }
        }

        return result;
    }
}

// GRID
Game.Grid = function (state) {
    var self      = this;

    // returns a new bidimensional array sized w * h with each cell set to 0
    this.makeGrid = function (w, h) {
        return _.map(_.range(h), function () { return _.map(_.range(w), function () { return 0;});});
    };

    this.makePentominoGrid = _.partial(this.makeGrid, GRID_SIZE_W, GRID_SIZE_H);
    this.makeFallingGrid   = _.partial(this.makeGrid, GRID_SIZE_W, GRID_SIZE_H + 5);

    this.pentominosData    = state.pentominos.key
    this.grid              = this.makePentominoGrid();

    // parent state (Phaser.State)
    this.state = state;

    this.pentomino     = new Game.FallingPentomino();
    this.nextPentomino = new Game.FallingPentomino();
    this.drawNextPentomino();

    // variables for the "exploding row" animation
    this.explodingGroup     = null; // Phaser.Group with the exploding particles
    this.explodingStatus    = null; // current status of the explosion animation
    this.explodingFallCount = null; // counter for the "falling top-half" animation

    // stores the state of the explosion animations during th gameover screen
    this.gameoverStatus = null;

    // original position of the plasma background to be used to return to it after the shaking
    this.shakeBackgroundOriginal = {
        x: this.state.background.x,
        y: this.state.background.y
    };
    // original position of the falling pentomino to be used to return to it after the shaking
    this.shakePentominosOriginal = {
        x: this.state.pentominos.x,
        y: this.state.pentominos.y
    };
};

Game.Grid.prototype = {
    update: function (fall) {
        // skip if during the "remove line / explode" animation
        if (Game.status == STATUS_REMOVING_LINES || Game.status == STATUS_GAMEOVER || Game.status == STATUS_READY || Game.status == STATUS_WAITING) return;

        // fall defaults to true
        if (fall === undefined) fall = true;

        var self        = this,
            fallingGrid = this.makeFallingGrid();

        // make the pentomino fall only if fall == true
        if (fall) this.pentomino.y++;

        // check if any of the pentomino cells is on the floor or overlaps any other piece on the board.
        // if so, don't make it fall down but place it on the board and create a new falling pentomino
        if (self.pentominoCollides(true)) {
            // revert the fall
            self.pentomino.y--;

            // gameover?
            if (_.any(this.pentomino.shape, function (row, y) {
                return _.any(row, function (cell, x) {
                    if (cell != 0) {
                        return self.pentomino.y + y - 5 < 0;
                    }
                });
            })) {
                Game.status = STATUS_GAMEOVER;
            }

            if (Game.status == STATUS_GAMEOVER || Game.status == STATUS_READY || Game.status == STATUS_WAITING) return;

            // draw the pentomino on the board
            _.each(this.pentomino.shape, function (row, y) {
                _.each(row, function (cell, x) {
                    if (cell != 0) {
                        self.grid[self.pentomino.y + y - 5][self.constrainCell(self.pentomino.x + x, self.pentomino.width)] = self.pentomino.color;
                    }
                });
            });

            // reset the state to "new pentomino is falling"
            Game.status        = STATUS_PLAYING;
            this.state.speedUp = 0;

            this.pentomino = this.nextPentomino; //.reset(this.nextPentomino.shape);
            this.nextPentomino = new Game.FallingPentomino();//null//.reset();

            this.drawNextPentomino();
        }

        // update falling pentomino by drawing it on the new, lower position
        _.each(this.pentomino.shape, function (row, y) {
            _.each(row, function (cell, x) {
                if (cell != 0) {
                    fallingGrid[self.pentomino.y + y][self.constrainCell(self.pentomino.x + x, self.pentomino.width)] = self.pentomino.color;
                }
            });
        });

        this.drawGrid(fallingGrid);

        // check for complete lines and if found, freeze the game and start the "explode" animation
        if (_.any(this.grid, function (row, y) {
            return _.all(row, function (cell) { return cell != 0; });
        }))
        {
            Game.status          = STATUS_REMOVING_LINES;
            this.explodingStatus = STATUS_EXPLODING_START;
        }


    },

    // utility function that wraps a cell x value around the grid
    // so that it never gets outside the grid but appears on the other side
    //  |.....xxx..|  -> |.....xxx..|
    //  |........xx|x -> |x.......xx|
    // x|xx........| - > |xx.......x|
    wrapCell: function (cellX) {
        if (cellX >= GRID_SIZE_W) return (cellX - GRID_SIZE_W) % GRID_SIZE_W;
        if (cellX < 0) return ((cellX % GRID_SIZE_W) + GRID_SIZE_W) % GRID_SIZE_W; // modulo fix found here http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
        return cellX;
    },

    // utility function that constrains a cell x value around the grid
    // so that it never gets outside the grid
    constrainCell: function (cellX, width) {
        if (cellX >= GRID_SIZE_W) return cellX - width;
        if (cellX <= 0 - width) return -width;
        return cellX;
    },

    createExplodingParticles: function (lineNum, row) {
        var self = this;

        // create a Phaser.Group for all the particles of the explosion
        self.explodingGroup = self.state.add.group();
        self.explodingGroup.enableBody = true;
        self.explodingGroup.physicsBodyType = Phaser.Physics.ARCADE;

        // create two rows of particles to take the place of the removed line
        _.times(2, function (y) {
            _.each(row, function (cell, x) {
                if (cell != 0) {
                    // create a black square as gfx for the particles
                    var explodingRect = game.make.bitmapData(GRID_CELL_SIZE / 2, GRID_CELL_SIZE / 2);
                    explodingRect.ctx.fillStyle = _.sample(['#77DD77', '#B39EB5', '#C23B22', '#FFB347', '#FDFD96', '#836953', '#779ECB', '#FFD1DC']);
                    explodingRect.ctx.fillRect(0, 0, GRID_CELL_SIZE / 2, GRID_CELL_SIZE / 2);

                    var explodingSprite = new Phaser.Sprite(self.state.game, (x * GRID_CELL_SIZE) + GRID_X, ((y * GRID_CELL_SIZE / 2) + lineNum * GRID_CELL_SIZE) + GRID_Y, explodingRect);
                    self.explodingGroup.add(explodingSprite);

                    explodingSprite = new Phaser.Sprite(self.state.game, (x * GRID_CELL_SIZE) + (GRID_CELL_SIZE / 2) + GRID_X, ((y * GRID_CELL_SIZE / 2) + lineNum * GRID_CELL_SIZE) + GRID_Y, explodingRect);
                    self.explodingGroup.add(explodingSprite);
                }
            });
        });

        // setup the animation for the particles. make them "jump" by setting a negative velocity
        // and set timeout to make the blink before being finally destroyed
        self.explodingGroup.forEach(function (sprite) {
            sprite.body.gravity.y = 35;
            sprite.body.velocity.setTo(_.random(-20, 20), _.random(-35, -50));

            setTimeout(function () {
                sprite.visible = false;
                setTimeout(function () {
                    sprite.visible = true;
                    setTimeout(function () {
                        sprite.destroy();
                    }, 100);
                }, 100);
            }, 1000);
        });

    },

    // lower by one row all the rows above the removed line
    makeTheRowFall: function (lineNum) {
        // create a bitmap as storage for the temporary pantomino image
        var newPentominosData = game.make.bitmapData(this.pentominosData.width, this.pentominosData.height);

        // copy into the temp bitmap all the lower part of the pentomino grid (down the deleted line)
        // .........
        // .........
        // .........
        // .....11..
        //            <- deleted line
        // .....111.  <- COPY FROM HERE
        // ...11111.  <- TO HERE
        newPentominosData.copyRect(this.pentominosData,
            new Phaser.Rectangle(0, lineNum * GRID_CELL_SIZE, GRID_SIZE_W * GRID_CELL_SIZE, GRID_SIZE_H * GRID_CELL_SIZE - lineNum * GRID_CELL_SIZE),
            0, lineNum * GRID_CELL_SIZE);

        // copy into the temp bitmap all the upper part of the pentomino grid (up the deleted line)
        // but copy it a bit lower, to simulate the fall
        // .........  <- COPY FROM HERE
        // .........
        // .........
        // .....11..  <- TO HERE
        //            <- deleted line
        // .....111.
        // ...11111.
        newPentominosData.copyRect(this.pentominosData,
            new Phaser.Rectangle(0, 0, GRID_SIZE_W * GRID_CELL_SIZE, (lineNum + 1) * GRID_CELL_SIZE),
            0, GRID_CELL_FALL_SPEED);

        // draw the temporary bitmap as actual bitmap
        this.pentominosData.clear()
        this.pentominosData.copy(newPentominosData);
    },

    updateRemovingLines: function () {
        // skip if *not* during the "remove line / explode" animation
        if (Game.status != STATUS_REMOVING_LINES) return;

            var self = this,

            // find the first complete line and remove it
            removeFirstLine = function () {
                var lineToRemove = _.findIndex(self.grid, function (row) {
                        return _.all(row, function (cell) { return cell != 0; });
                    });

                // return if there are no complete lines
                if (lineToRemove == -1) {
                    return;
                }

                // draw the grid without the line to remove
                self.drawGrid(null, lineToRemove);

                self.createExplodingParticles(lineToRemove, self.grid[lineToRemove]);

                // set the "falling" status after a short bit (to give time for the initial "exploding" status)
                // and set the counter for "falling rows"
                setTimeout(function () {
                    self.explodingStatus    = STATUS_EXPLODING_FALLING;
                    self.explodingFallCount = GRID_CELL_SIZE / GRID_CELL_FALL_SPEED;
                }, 100);

                self.explodingStatus = STATUS_EXPLODING;
            };

            // lower by one row all the rows above the removed line
            // makeTheRowFall = function () {
            //     // find the line that is being removed
            //     var removedLine = _.findIndex(self.grid, function (row) {
            //             return _.all(row, function (cell) { return cell != 0; });
            //         }),

            //         // create a bitmap as storage for the temporary pantomino image
            //         newPentominosData = game.make.bitmapData(self.pentominosData.width, self.pentominosData.height);

            //     // block to be executed when the rows have finished falling
            //     if (self.explodingFallCount == 0) {
            //         // remove the row from the grid-map and insert an empty one as the first row
            //         self.grid.splice(removedLine, 1);
            //         self.grid = [_.map(_.range(GRID_SIZE_W), function () { return 0; })].concat(self.grid);

            //         self.postShakePositionsReset();

            //         // reset the status to the normal one
            //         Game.status = STATUS_PLAYING;

            //         return;
            //     }

            //     // copy into the temp bitmap all the lower part of the pentomino grid (down the deleted line)
            //     // .........
            //     // .........
            //     // .........
            //     // .....11..
            //     //            <- deleted line
            //     // .....111.  <- COPY FROM HERE
            //     // ...11111.  <- TO HERE
            //     newPentominosData.copyRect(self.pentominosData,
            //         new Phaser.Rectangle(0, removedLine * GRID_CELL_SIZE, GRID_SIZE_W * GRID_CELL_SIZE, GRID_SIZE_H * GRID_CELL_SIZE - removedLine * GRID_CELL_SIZE),
            //         0, removedLine * GRID_CELL_SIZE);

            //     // copy into the temp bitmap all the upper part of the pentomino grid (up the deleted line)
            //     // but copy it a bit lower, to simulate the fall
            //     // .........  <- COPY FROM HERE
            //     // .........
            //     // .........
            //     // .....11..  <- TO HERE
            //     //            <- deleted line
            //     // .....111.
            //     // ...11111.
            //     newPentominosData.copyRect(self.pentominosData,
            //         new Phaser.Rectangle(0, 0, GRID_SIZE_W * GRID_CELL_SIZE, (removedLine + 1) * GRID_CELL_SIZE),
            //         0, GRID_CELL_FALL_SPEED);

            //     // draw the temporary bitmap as actual bitmap
            //     self.pentominosData.clear()
            //     self.pentominosData.copy(newPentominosData);

            //     // one less step to go!
            //     self.explodingFallCount--;
            // };

        // call functions according to the current exploding state
        switch(this.explodingStatus) {
            case STATUS_EXPLODING_START:
                this.state.speed += 2;
                this.state.score += Math.round(this.state.speed / 10);
                this.state.lines++;
                removeFirstLine();
            break;
            case STATUS_EXPLODING_FALLING:
                var removedLine = _.findIndex(self.grid, function (row) {
                        return _.all(row, function (cell) { return cell != 0; });
                    });

                this.shake();

                if (this.explodingFallCount == 0) {
                    // remove the row from the grid-map and insert an empty one as the first row
                    this.grid.splice(removedLine, 1);
                    this.grid = [_.map(_.range(GRID_SIZE_W), function () { return 0; })].concat(this.grid);

                    this.postShakePositionsReset();

                    // reset the status to playing status
                    Game.status = STATUS_PLAYING;

                    return;
                }

                // one less step to go!
                this.explodingFallCount--;

                this.makeTheRowFall(removedLine);
            break;
        }
    },

    // exploding lines animation during the gameover screen
    updateGameOverExplosions: function () {
        // STATUS_GAMEOVER_EXPLODING_START   = 0,
        // STATUS_GAMEOVER_EXPLODING         = 1,
        // STATUS_GAMEOVER_EXPLODING_FALLING = 3,

        if (this.gameoverStatus == null) {
            this.gameoverStatus = STATUS_GAMEOVER_EXPLODING_START;
        }

        if (this.explodingFallCount == 0) {
            this.gameoverStatus = STATUS_GAMEOVER_EXPLODING_START;

            // remove the row from the grid-map and insert an empty one as the first row
            this.grid.splice(GRID_SIZE_H - 1, 1);
            this.grid = [_.map(_.range(GRID_SIZE_W), function () { return 0; })].concat(this.grid);

        }

        switch (this.gameoverStatus) {
            case STATUS_GAMEOVER_EXPLODING_START:
                // check if the last line has at least one black cell
                if (_.any(this.grid[GRID_SIZE_H - 1], function (cell) { return cell != 0; })) {
                    // replace each black cell with 4 exploding pieces
                    this.createExplodingParticles(GRID_SIZE_H - 1, this.grid[GRID_SIZE_H - 1])

                    // draw the grid without the last line
                    this.drawGrid(null, GRID_SIZE_H - 1);

                    this.explodingFallCount = GRID_CELL_SIZE / GRID_CELL_FALL_SPEED

                    this.gameoverStatus = STATUS_GAMEOVER_EXPLODING;
                } else {
                    // reset the status to the normal one
                    Game.status = STATUS_READY;
                    this.gameoverStatus = null;
                }
            break;
            case STATUS_GAMEOVER_EXPLODING:
                this.makeTheRowFall(GRID_SIZE_H - 1);

                // one less step to go!
                this.explodingFallCount--;
            break;
        }
    },

    // shake effect accompanying the explosion or gameover
    shake: function (force) {
        // shake on alternate call, not to make it so fast it's not visible
        if (force !== true && self.explodingFallCount % 2 == 0) return;

        // random x and y shake offset
        var rndX = _.random(-5, 5);
        var rndY = _.random(-5, 5);

        // set the new position for the plasma background and the pentomino grid
        this.state.background.x      = this.shakeBackgroundOriginal.x + rndX;
        this.state.background.y      = this.shakeBackgroundOriginal.y + rndY;
        this.state.pentominos.x      = this.shakePentominosOriginal.x + rndX;
        this.state.pentominos.y      = this.shakePentominosOriginal.y + rndY;
        this.state.backgroundCover.x = rndX;
        this.state.backgroundCover.y = rndY;
    },

    // restore the plasma background and the pentominos grid the original position
    // that may have changed because of the shaing
    postShakePositionsReset: function () {
        this.state.background.x      = this.shakeBackgroundOriginal.x;
        this.state.background.y      = this.shakeBackgroundOriginal.y;
        this.state.pentominos.x      = this.shakePentominosOriginal.x;
        this.state.pentominos.y      = this.shakePentominosOriginal.y;
        this.state.backgroundCover.x = 0;
        this.state.backgroundCover.y = 0;
    },

    // check if any cell of the falling pentomino in the current position overlaps any cell
    // of the already drawn pentomino grid
    // can optionally also check if any cell is outiside the lower bound of the grid (> grid height)
    pentominoCollides: function (checkOutBounds) {
        if (checkOutBounds === undefined) checkOutBounds = true;

        var self = this;

        return _.any(this.pentomino.shape, function (row, y) {
            return _.any(row, function (cell, x) {
                if (!(cell != 0)) {
                    return;
                }

                if (checkOutBounds && (y + self.pentomino.y - 5) >= GRID_SIZE_H) {
                    return true;
                }

                if (checkOutBounds && (self.pentomino.x) <= -3) {
                    return true;
                }

                if (checkOutBounds && (x + self.pentomino.x) >= GRID_SIZE_W) {
                    return true;
                }

                if (self.pentomino.y + y - 5 >= 0 
                    && self.pentomino.y + y - 5 < GRID_SIZE_H 
                    && self.grid[self.pentomino.y + y - 5][self.constrainCell(self.pentomino.x + x, self.pentomino.width)] != 0
                ) {
                    return true;
                }

                return false;
            });
        })
    },

    // draw the next pentomino that will fall
    drawNextPentomino: function () {
        var self = this;

        this.state.nextPentomino.key.clear();

        _.each(this.nextPentomino.shape, function (row, y) {
            _.each(row, function (cell, x) {
                if (cell != 0) {
                    self.state.nextPentomino.key.rect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE, self.nextPentomino.color);
                }
            });
        });
    },

    // actually draw the black pentominos
    drawGrid: function (fallingGrid, skip) {
        var self = this;

        this.pentominosData.clear();

        // loop through rows and cells of the pentomino main grid *and* the falling pentomino grid
        // and if the cell is "1", draw a black square
        _.each(this.grid, function (row, y) {
            if (skip == y) return;

            _.each(row, function (cell, x) {
                if (cell != 0) {
                    self.pentominosData.rect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE, cell);
                }
                if (fallingGrid ? fallingGrid[y+5][x] != 0 : false) {
                    self.pentominosData.rect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE, fallingGrid[y+5][x]);
                }
            });
        });

    },

    // don't allow rotation if rotating makes the pentomino overlap any already drawn cell on the pentomino grid
    rotatePentomino: function () {
        if (Game.status != STATUS_PLAYING) return;

        var currentShape = _.cloneDeep(this.pentomino.shape);

        this.pentomino.rotate();

        // revert to previous shape if rotating the shape is illegal
        if (this.pentominoCollides(true)) this.pentomino.shape = currentShape;

        this.pentomino.width = this.pentomino.getDimensions().width;
        this.pentomino.height = this.pentomino.getDimensions().height;
        console.log(this.pentomino.width, this.pentomino.height);
        this.update(false);
    },

    // move the falling pentomino left or right.
    movePentomino: function (direction) {
        if (Game.status != STATUS_PLAYING) return;

        var self = this;

        this.pentomino.x += direction;

        // if the movement makes it collide with a full cell of the pentomino grid, reset the position
        // preventing the movement
        if (this.pentominoCollides(true)) {
            this.pentomino.x -= direction;
            return;
        }

        this.update(false);
    },
};
