let background;
let platforms;
let player;
let cursors;
let camera;
let waterDrops = [];
let projectiles = [];
let sinks = [];
let outerThis;
let lastFullPercentage;
let warmthText;
let candle;
let warmthBarBackground;
let warmthBar;
let gameEnded = false;

const projectileSpeed = 750;
const bounce = 0.1;
const gravity = 1000;
const warmthDecreasePerSecond = 1;
const width = 1500;
const height = 600;
const theoreticalFramesPerSecond = 60;

const widthMultiplier = 2;

const config = {
    type: Phaser.AUTO,
    width: width*widthMultiplier,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload ()
{
    this.load.image('fire', 'assets/fire.jpg');
    this.load.image('wall', 'assets/grey.jpg');
    this.load.image('waterDrop', 'assets/water.png');
    this.load.image('waterProjectile', 'assets/waterProjectile.jpg');
    this.load.image('background', 'assets/background.jpg');
    this.load.image('gameOver', 'assets/game_over.png');
    this.load.image('candle_on', 'assets/candle_on.png');
    this.load.image('candle_off', 'assets/candle_off.jpg');
    this.load.image('victory', 'assets/victory.jpg');
    this.load.image('bar', 'assets/warmth_bar.jpg');
    this.load.image('bar_back', 'assets/black.jpg');
    this.load.image('sink', 'assets/sink.png');
}

function create ()
{
    lastFullPercentage = 100;
    outerThis = this;

    background = this.add.image(0,0,'background').setScale(widthMultiplier, 1).setOrigin(0);
    cursors = this.input.keyboard.createCursorKeys();
    player = this.physics.add.sprite(width/8, height/2, 'fire');
    platforms = this.physics.add.staticGroup();
    candle = this.physics.add.sprite(width*widthMultiplier * 9 / 10, 0, 'candle_off');
    platforms.create(0,height*3/4, 'wall').setOrigin(0,0).setDisplaySize(width*widthMultiplier, height/4).refreshBody();
    player.setBounce(bounce);
    player.setCollideWorldBounds(true);
    player.warmth = 100;

    warmthBarBackground = this.add.image(width/2, height/10, 'bar_back').setDisplaySize(404,44).setScrollFactor(0);
    warmthBarBackground.scaleX = 0.255;
    warmthBar = this.add.image(width/2, height/10, 'bar').setDisplaySize(400,40).setScrollFactor(0);
    warmthText = this.add.text(width/2, height/10, 'Warmth: 100', { fill: '#ffffff', font: '18pt Arial' }).setOrigin(0.5,0.5).setScrollFactor(0);
    updateWarmthBar();
    player.body.setGravityY(gravity);

    for(let i=0;i<1;i++){
        let drop = this.physics.add.sprite(width/2+ (i*500),height/2,'waterDrop');
        initiateWaterDrop(drop);
        waterDrops.push(drop);
    }
    for(let i=0;i<1;i++){
        let sink = this.physics.add.sprite(width/2+ (i*500),height/2,'sink').setDisplaySize(200,50);
        sinks.push(sink);
    }

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(waterDrops, platforms);
    this.physics.add.collider(candle, platforms);
    this.physics.add.collider(sinks, platforms);
    this.physics.add.overlap(player, projectiles, projectileContact, null, this);
    this.physics.add.overlap(platforms, projectiles, killProjectile, null, this);
    this.physics.add.overlap(player, waterDrops, creatureContact, null, this);
    this.physics.add.overlap(player, candle, lightCandle, null, this);
    this.physics.add.overlap(player, sinks, sinkCollision, null, this);

    //CAMERA STUFF
    camera = this.cameras.main.setSize(width, height);
    this.cameras.main.setBounds(0, 0, width*widthMultiplier, height);
    this.cameras.main.startFollow(player);
}

function update ()
{
    const playerSpeed = 300;
    const playerJumpHeight = 1000;
    const playerSpeedIncrement = 150;
    const playerFriction = 1.1;

    if(gameEnded) return null;

    if(player.warmth<=0) loseGame();

    if (cursors.left.isDown)
    {
        if(player.body.velocity.x>-playerSpeed) player.body.velocity.x -= playerSpeedIncrement
    }
    else if (cursors.right.isDown)
    {
        if(player.body.velocity.x<playerSpeed) player.body.velocity.x += playerSpeedIncrement
    }
    else
    {
        player.body.velocity.x = Math.floor(player.body.velocity.x/playerFriction);
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-playerJumpHeight);
    }

    //WARMTH DECREASE

    player.warmth -= warmthDecreasePerSecond / theoreticalFramesPerSecond;
    if(Math.ceil(player.warmth) !== lastFullPercentage){
        updateWarmthBar();
    }
    lastFullPercentage = Math.ceil(player.warmth);

    waterDrops.forEach(function (child) {
        const speed = 50;
        const secondsToJump = 1.5;
        const secondsToFire = 2;
        const jumpHeight = 1000;
        const facingLeft = player.x - child.x < 0;


        if(child.active) {
            //JUMP COUNTER

            if (facingLeft) {
                child.setVelocityX(-speed);
            } else {
                child.setVelocityX(speed);
            }

            if (child.jumpCounter === secondsToJump * theoreticalFramesPerSecond) {
                if (child.body.touching.down)child.setVelocityY(-jumpHeight);
                child.jumpCounter = 0;
            }
            child.jumpCounter += 1;

            //FIRE COUNTER
            if (child.fireCounter === secondsToFire * theoreticalFramesPerSecond) {
                let projectile = outerThis.physics.add.sprite(child.x, child.y, 'waterProjectile');
                initiateWaterProjectile(projectile, facingLeft);
                child.fireCounter = 0;
            }
            child.fireCounter += 1;
        }
    });
}

function initiateWaterDrop(drop) {
    drop.setGravity(gravity);
    drop.setBounceY(bounce*5);
    let random = Math.ceil(Math.random() * theoreticalFramesPerSecond);
    drop.fireCounter = random;
    drop.jumpCounter = random;
    drop.active = true;
}

function initiateWaterProjectile(projectile, left) {
    projectile.body.setGravityY(-gravity*9/10);
    if(left)projectile.setVelocityX(-projectileSpeed);
    else projectile.setVelocityX(projectileSpeed);
    projectiles.push(projectile);
}

function updateWarmthBar() {
    let warmth = Math.ceil(player.warmth);
    warmthText.setText('Warmth: '+ warmth);
    warmthBar.scaleX = warmth/400;
}

function projectileContact(player,projectile) {
    loseWarmth(25);
    projectile.disableBody(true,true);
}

function creatureContact(player,creature) {
    loseWarmth(50);
    kill(creature);
    player.setVelocityX(-2000);
}

function killProjectile(projectile,platform) {
    projectile.disableBody(true,true);
}

function kill(object) {
    object.disableBody(true,true);
    object.active = false;
}

function destroyAll() {
    waterDrops = [];
    projectiles = null;
    sinks = [];
}

function loseGame() {
    outerThis.add.image(0,0,'gameOver').setOrigin(0).setDisplaySize(width, height);
    camera.setBounds(0, 0, width, height);
    destroyAll();
    gameEnded = true;
}

function winGame() {
    outerThis.add.image(0,0,'victory').setOrigin(0).setDisplaySize(width, height);
    camera.setBounds(0, 0, width, height);
    destroyAll();
    gameEnded = true;
}

function lightCandle() {
    let candleOn = outerThis.physics.add.sprite(candle.x,candle.y,'candle_on');
    kill(candle);
    outerThis.physics.add.collider(candleOn, platforms);
    setTimeout(winGame,2000);
}

function sinkCollision() {
    loseWarmth(5);
}

function loseWarmth(amount) {
    player.warmth -= amount;
}