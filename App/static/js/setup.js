var GAME_W               = 256,
    GAME_H               = 473,

    DEBUG_MODE           = false,

    GRID_SIZE_W          = 10,
    GRID_SIZE_H          = 20,
    GRID_X               = 76,
    GRID_Y               = 10,
    GRID_CELL_SIZE       = 10,
    GRID_CELL_FALL_SPEED = 1,

    NEXT_PENTOMINO_X      = 13,
    NEXT_PENTOMINO_Y      = 105
    NEXT_PENTOMINO_WIDTH  = 50
    NEXT_PENTOMINO_HEIGHT = 60,

    PLASMA_CELL_SIZE     = 2,

    INITIAL_SPEED        = 650,

    STATUS_PLAYING        = 0,
    STATUS_REMOVING_LINES = 1,
    STATUS_FORCE_FALL     = 2,
    STATUS_COUNTDOWN      = 3,
    STATUS_GAMEOVER       = 4,
    STATUS_READY          = 5,
    STATUS_WAITING        = 6,

    STATUS_EXPLODING_START   = 0,
    STATUS_EXPLODING         = 1,
    STATUS_EXPLODING_FALLING = 3,

    STATUS_GAMEOVER_EXPLODING_START   = 0,
    STATUS_GAMEOVER_EXPLODING         = 1,
    STATUS_GAMEOVER_EXPLODING_FALLING = 3,

    TEXTS = {
        yellowredfontWidth:   6,
        yellowredfontHeight:  5,
        yellowredfontCharset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',

        scoreX: 202,
        scoreY: 32,

        scoreValueX:     190,
        scoreValueY:     45,
        scoreValueWidth: 50,

        topScoreX: 189,
        topScoreY: 93,

        topScoreValueX:     189,
        topScoreValueY:     105,
        topScoreValueWidth: 50,

        linesX: 25,
        linesY: 32,

        linesValueX:     15,
        linesValueY:     45,
        linesValueWidth: 50,
    },

    COUNTDOWN = {
        x:      125,
        y:      100,
        width:  27,
        height: 27,

        number3Rect: new Phaser.Rectangle(311, 0, 27, 27),
        number2Rect: new Phaser.Rectangle(284, 0, 27, 27),
        number1Rect: new Phaser.Rectangle(257, 0, 27, 27),

        duration:   500,
        delay:      200,
        startDelay: 100,

        initialSize: 0.1,
        scaleFactor: 4
    },

    GAMEOVER = {
        x:      8,
        y:      40,
        width:  119,
        height: 62,
        rect:   new Phaser.Rectangle(0, 477, 119, 62),
        scale:  2
    },

    CONTROLS = {
        leftArrow: { x: 200, y: 160, rect: new Phaser.Rectangle(265, 40, 34, 34)},
        rightArrow: { x: 230, y: 160, rect: new Phaser.Rectangle(304, 40, 34, 34)},
        rotateArrow: { x: 200, y: 188, rect: new Phaser.Rectangle(265, 80, 34, 34)},
        dropArrow: { x: 230, y: 188, rect: new Phaser.Rectangle(304, 80, 34, 34)}
    },

    RETRO_LOOK = false,

    game = new Phaser.Game({width: GAME_W, height: GAME_H, renderType: Phaser.WEBGL, parent: '', preserveDrawingBuffer: true, transparent: false, antialias: false}),
    pixel = { scale: 375 / GAME_W, canvas: null, context: null, width: 0, height: 0 },

    Game = {
        status: STATUS_PLAYING,
        start: function () {
            // GAME SETUP
            game.state.add('Main', Game.Main);
            game.state.add('Splash', Game.Splash);

            game.state.start('Splash');
        },
        assets: {
            images: {}
        }
    };
