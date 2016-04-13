// MAIN STATE

Game.__defineSetter__('status', function(val) {
    Game.realStatus = val;
    console.log('Game status: ' + val);
});

Game.__defineGetter__('status', function() {
    return Game.realStatus;
});

Game.Main = function (game) {
    this.background     = null;
    this.miniBackground = null;

    this.backgroundCover = null;

    this.plasmaBackground = null;

    this.pentominos    = null;
    this.nextPentomino = null;

    this.grid = null;

    this.fallTimeElapsed = null;

    this.speed   = INITIAL_SPEED;
    this.speedUp = 0;

    this.score = 0;
    this.lines = 0;

    this.texts = {
        score:         null,
        scoreValue:    null,
        topScore:      null,
        topScoreValue: null,
        lines:         null,
        linesValue:    null
    };

    this.gameover = null;
};


// variables used to detect and manage swipes
var startX;
var startY;
var endX;
var endY;

Game.Main.prototype = {
    init: function() {
        this.debugMode = DEBUG_MODE;

        if (this.debugMode) {
            game.add.plugin(Phaser.Plugin.Debug);
        }
    },
    preload: function () {
        this.game.time.advancedTiming = true;
        this.game.stage.backgroundColor = '#000';
    },
    create: function () {
        this.goFullScreen();

        // hide the real canvas and setup the scaled up one that will be visible
        // http://www.photonstorm.com/phaser/pixel-perfect-scaling-a-phaser-game
        if (RETRO_LOOK) {
            game.canvas.style['display'] = 'none';

            pixel.canvas = Phaser.Canvas.create(this, game.width * pixel.scale, game.height * pixel.scale);
            // enableDebug = true
            pixel.canvas.style['display'] = 'block';
            pixel.canvas.style['touch-action'] = 'none';
            pixel.canvas.style['-webkit-user-select'] = 'none';
            pixel.canvas.style['-webkit-tap-highlight-color'] = 'rgba(0, 0, 0, 0)';

            pixel.context = pixel.canvas.getContext('2d');
            Phaser.Canvas.addToDOM(pixel.canvas);
            //Phaser.Canvas.setSmoothingEnabled(pixel.context, false);
            //Phaser.Canvas.setSmoothingEnabled(game.canvas.getContext('2d'), false);
            pixel.width = pixel.canvas.width;
            pixel.height = pixel.canvas.height;
            // pixel.canvas.style['width'] = window.innerWidth;
            // pixel.canvas.style['height'] = window.innerHeight;

            this.overlayGame = new Phaser.Game({width: window.innerWidth, height: window.innerHeight, renderType: Phaser.CANVAS, forceSetTimeOut: true, state: {}});

            this.overlayGame.canvas.style['position'] = 'fixed';
            this.overlayGame.canvas.style['top'] = '0';
            this.overlayGame.canvas.style['left'] = '0';
            this.overlayGame.canvas.style['z-index'] = '2';
            this.overlayGame.canvas.style['opacity'] = '0';
            this.overlayGame.renderType = Phaser.HEADLESS;
            this.overlayGame.lockRender = true;
            this.overlayGame.stage.disableVisibilityChange = true;
            // this.overlayGame.canvas.style['width'] = '100%';
            // this.overlayGame.canvas.style['height'] = '100%';
        } else {
            this.overlayGame = game;
            game.canvas.style['width'] = '100%';
            game.canvas.style['height'] = '100%';
        }

        // setup background plasma effect
        this.background = this.add.image(0, 0, this.add.bitmapData(game.canvas.width / PLASMA_CELL_SIZE * 2, game.canvas.height / PLASMA_CELL_SIZE * 2));
        this.plasmaBackground = new Game.PlasmaBackground(this.background.key);

        // cover background image
        this.backgroundCover = this.add.image(0, 0, Game.assets.images.backgroundCoverData);
        this.backgroundCover.alpha = 0.8;


        // image to display the next pentomino that will fall
        this.nextPentomino = this.add.image(NEXT_PENTOMINO_X, NEXT_PENTOMINO_Y, this.add.bitmapData(NEXT_PENTOMINO_WIDTH, NEXT_PENTOMINO_HEIGHT));

        // setup the main grid with the falling pentomino
        this.pentominos = this.add.image(GRID_X, GRID_Y, this.add.bitmapData(GRID_SIZE_W * GRID_CELL_SIZE, GRID_SIZE_H * GRID_CELL_SIZE));
        this.grid = new Game.Grid(this);

        // ** texts **//
        // score
        this.texts.score      = this.add.retroFont('yellowredfont', TEXTS.yellowredfontWidth, TEXTS.yellowredfontHeight, TEXTS.yellowredfontCharset);
        this.texts.score.text = 'SCORE';
        this.add.image(TEXTS.scoreX, TEXTS.scoreY, this.texts.score);

        this.texts.scoreValue            = this.add.retroFont('yellowredfont', TEXTS.yellowredfontWidth, TEXTS.yellowredfontHeight, TEXTS.yellowredfontCharset);
        this.texts.scoreValue.align      = Phaser.RetroFont.ALIGN_CENTER;
        this.texts.scoreValue.fixedWidth = TEXTS.scoreValueWidth;
        this.texts.scoreValue.text       = '0';
        this.add.image(TEXTS.scoreValueX, TEXTS.scoreValueY, this.texts.scoreValue);

        // top score
        this.texts.topScore      = this.add.retroFont('yellowredfont', TEXTS.yellowredfontWidth, TEXTS.yellowredfontHeight, TEXTS.yellowredfontCharset);
        this.texts.topScore.text = 'TOP SCORE';
        this.add.image(TEXTS.topScoreX, TEXTS.topScoreY, this.texts.topScore);

        this.texts.topScoreValue            = this.add.retroFont('yellowredfont', TEXTS.yellowredfontWidth, TEXTS.yellowredfontHeight, TEXTS.yellowredfontCharset);
        this.texts.topScoreValue.align      = Phaser.RetroFont.ALIGN_CENTER;
        this.texts.topScoreValue.fixedWidth = TEXTS.topScoreValueWidth;
        if (window.localStorage !== undefined && localStorage.getItem('pentrisTopScore') !== null)
            this.texts.topScoreValue.text       = String(localStorage.getItem('pentrisTopScore'));
        else
            this.texts.topScoreValue.text       = '0';

        this.add.image(TEXTS.topScoreValueX, TEXTS.topScoreValueY, this.texts.topScoreValue);

        // completed lines
        this.texts.lines      = this.add.retroFont('yellowredfont', TEXTS.yellowredfontWidth, TEXTS.yellowredfontHeight, TEXTS.yellowredfontCharset);
        this.texts.lines.text = 'LINES';
        this.add.image(TEXTS.linesX, TEXTS.linesY, this.texts.lines);

        this.texts.linesValue            = this.add.retroFont('yellowredfont', TEXTS.yellowredfontWidth, TEXTS.yellowredfontHeight, TEXTS.yellowredfontCharset);
        this.texts.linesValue.align      = Phaser.RetroFont.ALIGN_CENTER;
        this.texts.linesValue.fixedWidth = TEXTS.linesValueWidth;
        this.texts.linesValue.text       = '0';
        this.add.image(TEXTS.linesValueX, TEXTS.linesValueY, this.texts.linesValue);

        // used not to upgrade the falling pentomino each this.speed time
        this.fallTimeElapsed  = this.time.time;

        Game.status = STATUS_COUNTDOWN;
        window.setTimeout(this.countdown.bind(this), COUNTDOWN.startDelay);

        // setup input
        this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(this.grid.rotatePentomino.bind(this.grid), this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(this.grid.movePentomino.bind(this.grid, -1), this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(this.grid.movePentomino.bind(this.grid, 1), this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(function () { this.speedUp = this.speed / 1.2; }, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onUp.add(function () { this.speedUp = 0; }, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onUp.add(function () {
            if (Game.status == STATUS_GAMEOVER || Game.status == STATUS_READY || Game.status == STATUS_WAITING) {
                return;
            }

            Game.status = STATUS_FORCE_FALL, this.speedUp = this.speed * 2;
        }, this);

        this.debugKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        this.debugKey.onDown.add(this.toggleDebug, this);

        this.game.input.keyboard.enabled = false;

        // once the level has been created, we wait for the player to touch or click, then we call
        // beginSwipe function
        this.overlayGame.input.onDown.add(this.beginSwipe, this);

        this.plasmaBackground.update();


        // Controls

        this.leftControl = this.add.image(CONTROLS.leftArrow.x, CONTROLS.leftArrow.y, this.add.bitmapData(CONTROLS.leftArrow.rect.width, CONTROLS.leftArrow.rect.height));
        this.leftControl.key.copyRect('images', CONTROLS.leftArrow.rect, 0, 0);
        this.leftControl.anchor.setTo(0.5);
        this.leftControl.alpha = 1;
        this.leftControl.inputEnabled = true;
        this.leftControl.events.onInputDown.add(this.grid.movePentomino.bind(this.grid, -1), this);
        this.rightControl = this.add.image(CONTROLS.rightArrow.x, CONTROLS.rightArrow.y, this.add.bitmapData(CONTROLS.rightArrow.rect.width, CONTROLS.rightArrow.rect.height));
        this.rightControl.key.copyRect('images', CONTROLS.rightArrow.rect, 0, 0);
        this.rightControl.anchor.setTo(0.5);
        this.rightControl.alpha = 1;
        this.rightControl.inputEnabled = true;
        this.rightControl.events.onInputDown.add(this.grid.movePentomino.bind(this.grid, 1), this);
        this.rotateControl = this.add.image(CONTROLS.rotateArrow.x, CONTROLS.rotateArrow.y, this.add.bitmapData(CONTROLS.rotateArrow.rect.width, CONTROLS.rotateArrow.rect.height));
        this.rotateControl.key.copyRect('images', CONTROLS.rotateArrow.rect, 0, 0);
        this.rotateControl.anchor.setTo(0.5);
        this.rotateControl.alpha = 1;
        this.rotateControl.inputEnabled = true;
        this.rotateControl.events.onInputDown.add(this.grid.rotatePentomino.bind(this.grid), this);
        this.dropControl = this.add.image(0, 0, this.add.bitmapData(CONTROLS.dropArrow.rect.width, CONTROLS.dropArrow.rect.height));
        this.dropControl.anchor.setTo(0.5);
        this.dropControl.alpha = 1;
        this.dropControl.x = CONTROLS.dropArrow.x;
        this.dropControl.y = CONTROLS.dropArrow.y;
        this.dropControl.key.copyRect('images', CONTROLS.dropArrow.rect, 0, 0);
        this.dropControl.inputEnabled = true;
        this.dropControl.events.onInputDown.add(function () {
            if (Game.status == STATUS_GAMEOVER || Game.status == STATUS_READY || Game.status == STATUS_WAITING) {
                return;
            }

            Game.status = STATUS_FORCE_FALL, this.speedUp = this.speed * 2;
        }, this);
        //setInterval(function() { this.plasmaBackground.update(); }.bind(this), 200);
    },
    update: function () {
        // this.plasmaBackground.update();

        //  Just renders out the pointer data when you touch the canvas
        // game.debug.pointer(this.overlayGame.input.mousePointer);
        // game.debug.pointer(this.overlayGame.input.pointer1);
        // game.debug.pointer(this.overlayGame.input.pointer2);
        // game.debug.pointer(this.overlayGame.input.pointer3);
        // game.debug.pointer(this.overlayGame.input.pointer4);
        // game.debug.pointer(this.overlayGame.input.pointer5);
        // game.debug.pointer(this.overlayGame.input.pointer6);

        switch (Game.status) {
            case STATUS_COUNTDOWN:
                return;
            break;
            case STATUS_GAMEOVER:
                // the state just enterd
                if (this.gameover == null) {
                    this.gameover = this.add.image(GAMEOVER.x, GAMEOVER.y, this.add.bitmapData(GAMEOVER.width, GAMEOVER.height));
                    this.gameover.scale.x = GAMEOVER.scale;
                    this.gameover.scale.y = GAMEOVER.scale;
                    this.gameover.key.copyRect('images', GAMEOVER.rect, 0, 0);

                    this.gameoverShakeCount = 20;
                }

                this.gameoverShakeCount--;
                if (this.gameoverShakeCount > 0) {
                    this.grid.shake(true);
                } else if (this.gameoverShakeCount === 0) {
                    this.grid.postShakePositionsReset();
                }

                this.grid.updateGameOverExplosions();

                var pentrisTopScore = localStorage.getItem('pentrisTopScore');
                if (!pentrisTopScore || this.score > parseInt(pentrisTopScore)) {
                    this.texts.topScoreValue.text = String(this.score);
                    localStorage.setItem('pentrisTopScore', String(this.score));
                }

            break;
            case STATUS_READY:
                this.overlayGame.input.onTap.add(this.reset, this);

                Game.status = STATUS_WAITING;
            default:
                // only update the falling pentomino once in a while (tetris style!)
                if (this.time.time - this.fallTimeElapsed >= this.speed - this.speedUp) {
                    this.fallTimeElapsed = this.time.time;
                    this.grid.update();
                }

                // remove complete lines
                this.grid.updateRemovingLines();

                // update texts
                this.texts.scoreValue.text = String(this.score);
                this.texts.linesValue.text = String(this.lines);
            break;
        }

    },
    reset: function() {
        this.overlayGame.input.onTap.remove(this.reset, this);

        this.speedUp = 0;
        this.gameover.destroy();
        this.gameover = null;

        Game.status = STATUS_COUNTDOWN;
        window.setTimeout(this.countdown.bind(this), COUNTDOWN.startDelay);
    },
    render: function () {
        if (this.debugMode) {
            this.displayDebugInfo();
        }
        // this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
        // this.game.debug.text(this.score || '--', 20, 14, "#00ff00");

            // game.canvas.style['width'] = '100%';
            // game.canvas.style['height'] = '100%';
        // copy the canvas content to the scaled-up version
        if (RETRO_LOOK) pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
    },
    toggleDebug: function() {
        this.debugMode = !this.debugMode;
        if (!this.debugMode) {
            this.game.debug.reset();
        }
    },
    displayDebugInfo: function() {
        this.game.debug.start(32, 32);
        this.game.debug.line(`Touch: ${this.overlayGame.input.pointer1.x}/${this.overlayGame.input.pointer1.worldY}`);
        this.game.debug.line(`Touch: ${this.overlayGame.input.pointer2.x}/${this.overlayGame.input.pointer2.worldY}`);
        // this.game.debug.line(`Touch: ${this.overlayGame.input.pointer3.x}/${this.overlayGame.input.pointer3.worldY}`);
        // this.game.debug.line(`Touch: ${this.overlayGame.input.pointer4.x}/${this.overlayGame.input.pointer4.worldY}`);
        // this.game.debug.line(`Touch: ${this.overlayGame.input.pointer5.x}/${this.overlayGame.input.pointer5.worldY}`);
        // this.game.debug.line(`Touch: ${this.overlayGame.input.pointer6.x}/${this.overlayGame.input.pointer6.worldY}`);
        // this.game.debug.line(`Health: ${this.plane.health}/${this.plane.maxHealth}`);
        // this.game.debug.line(`FireTimer: ${this.plane.fireTimer}`);
        // this.game.debug.line(`Gun Sound: ${this.plane.sounds.gun.currentTime} Playing: ${this.plane.sounds.gun.isPlaying}`);
        // this.game.debug.line(`Plane Loc: (${this.plane.x}, ${this.plane.y})`);
        // var body = this.plane.body;
        // this.game.debug.line(`plane body: [${body.x.toFixed(2)}, ${body.y.toFixed(2)}] width: ${body.width} height: ${body.height}`);
        // this.game.debug.line(`kills: ran into ${this.plane.score.killsByCollision} and shot ${this.plane.score.killsByShooting}`);
        this.game.debug.stop();

        // this.game.debug.body(this.plane);

        // this.game.debug.text('anchor', this.plane.x + 4, this.plane.y, 'red');
        // this.game.debug.pixel(this.plane.x, this.plane.y, 'red', 4);
    },
    countdown: function () {
        var countdown,
            tweet1, tween2, tween3;

        countdown = this.add.image(COUNTDOWN.x, COUNTDOWN.y, this.add.bitmapData(COUNTDOWN.width, COUNTDOWN.height));
        countdown.key.copyRect('images', COUNTDOWN.number3Rect, 0, 0);
        countdown.anchor.setTo(0.5);
        countdown.scale.set(COUNTDOWN.initialSize);
        tween3 = game.add.tween(countdown.scale).to( { x: COUNTDOWN.scaleFactor, y: COUNTDOWN.scaleFactor }, COUNTDOWN.duration, Phaser.Easing.Bounce.Out, false, COUNTDOWN.startDelay);
        tween3.onComplete.add(function () {
            countdown.key.clear();
            countdown.scale.set(COUNTDOWN.initialSize);
            countdown.key.copyRect('images', COUNTDOWN.number2Rect, 0, 0);
        });
        tween2 = game.add.tween(countdown.scale).to( { x: COUNTDOWN.scaleFactor, y: COUNTDOWN.scaleFactor }, COUNTDOWN.duration, Phaser.Easing.Bounce.Out, false, COUNTDOWN.startDelay);
        tween2.onComplete.add(function () {
            countdown.key.clear();
            countdown.scale.set(COUNTDOWN.initialSize);
            countdown.key.copyRect('images', COUNTDOWN.number1Rect, 0, 0);
        });
        tween1 = game.add.tween(countdown.scale).to( { x: COUNTDOWN.scaleFactor, y: COUNTDOWN.scaleFactor }, COUNTDOWN.duration, Phaser.Easing.Bounce.Out, false, COUNTDOWN.startDelay);
        tween1.onComplete.add(function () {
            countdown.destroy();
            setTimeout(function () {
                Game.status = STATUS_PLAYING;
                game.input.keyboard.enabled = true;
            }, COUNTDOWN.duration);
        });

        tween3.chain(tween2);
        tween2.chain(tween1);

        tween3.start();
    },
    // function to scale up the game to full screen
    goFullScreen: function() {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        //this.game.scale.setScreenSize(true);
    },
    // when the player begins to swipe we only save mouse/finger coordinates, remove the touch/click
    // input listener and add a new listener to be fired when the mouse/finger has been released,
    // then we call endSwipe function
    beginSwipe: function() {
        startX = this.overlayGame.input.worldX;
        startY = this.overlayGame.input.worldY;
        this.overlayGame.input.onDown.remove(this.beginSwipe, this);
        this.overlayGame.input.onUp.add(this.endSwipe, this);
    },
    // function to be called when the player releases the mouse/finger
    endSwipe: function() {
        // saving mouse/finger coordinates
        endX = this.overlayGame.input.worldX;
        endY = this.overlayGame.input.worldY;
        // determining x and y distance travelled by mouse/finger from the start
        // of the swipe until the end
        var distX = startX-endX;
        var distY = startY-endY;
        // in order to have an horizontal swipe, we need that x distance is at least twice the y distance
        // and the amount of horizontal distance is at least 10 pixels
        if(Math.abs(distX)>Math.abs(distY)*2 && Math.abs(distX)>10){
            // moving left, calling move function with horizontal and vertical tiles to move as arguments
            if(distX>0){
                    console.log('left');
                    this.grid.movePentomino.bind(this.grid)(-1);
               }
               // moving right, calling move function with horizontal and vertical tiles to move as arguments
               else{
                console.log('right');
                    this.grid.movePentomino.bind(this.grid)(1);
               }
        }
        // in order to have a vertical swipe, we need that y distance is at least twice the x distance
        // and the amount of vertical distance is at least 10 pixels
        if(Math.abs(distY)>Math.abs(distX)*2 && Math.abs(distY)>10){
            // moving up, calling move function with horizontal and vertical tiles to move as arguments
            if(distY>0){
                console.log('up');
                    this.grid.rotatePentomino(this.grid);
               }
               // moving down, calling move function with horizontal and vertical tiles to move as arguments
               else{
                console.log('down');
                    Game.status = STATUS_FORCE_FALL, this.speedUp = this.speed * 2;
               }
        }
        // stop listening for the player to release finger/mouse, let's start listening for the player to click/touch
        this.overlayGame.input.onDown.add(this.beginSwipe, this);
        this.overlayGame.input.onUp.remove(this.endSwipe, this);
    }
};
