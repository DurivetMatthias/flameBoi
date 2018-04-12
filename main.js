let background;
let platforms;
let player;
let cursors;
let camera;
let waterDrops = [];
let projectiles = [];
let outerThis;
let lastFullPercentage;
let warmthText;
let candle;

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
    warmthText = this.add.text(width*4/10, height/10, 'Warmth: 100', { fill: '#ffffff', font: '18pt Arial' });
    warmthText.setScrollFactor(0);
    updateWarmthBar();
    player.body.setGravityY(gravity);
    for(let i=0;i<1;i++){
        let drop = this.physics.add.sprite(width/2+ (i*500),height/2,'waterDrop');
        initiateWaterDrop(drop);
        waterDrops.push(drop);
    }


    this.physics.add.collider(player, platforms);
    this.physics.add.collider(waterDrops, platforms);
    this.physics.add.collider(candle, platforms);
    this.physics.add.overlap(player, projectiles, projectileContact, null, this);
    this.physics.add.overlap(platforms, projectiles, killProjectile, null, this);
    this.physics.add.overlap(player, waterDrops, creatureContact, null, this);
    this.physics.add.overlap(player, candle, lightCandle, null, this);

    //CAMERA STUFF
    camera = this.cameras.main.setSize(width, height);
    this.cameras.main.setBounds(0, 0, width*widthMultiplier, height);
    this.cameras.main.startFollow(player);
}

function update ()
{
    const playerSpeed = 300;
    const playerJumpHeight = 1000;

    if(player.warmth<=0) endGame();

    if (cursors.left.isDown)
    {
        player.setVelocityX(-playerSpeed);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(playerSpeed);
    }
    else
    {
        player.setVelocityX(0);
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
    warmthText.setText('Warmth: '+ Math.ceil(player.warmth));
}

function projectileContact(player,projectile) {
    player.warmth -= 25;
    projectile.disableBody(true,true);
}

function creatureContact(player,creature) {
    player.warmth -= 50;
    kill(creature);
}

function killProjectile(projectile,platform) {
    projectile.disableBody(true,true);
}

function kill(object) {
    object.disableBody(true,true);
    object.active = false;
}

function endGame() {
    outerThis.add.image(0,0,'gameOver').setOrigin(0).setDisplaySize(width, height);
    camera.setBounds(0, 0, width, height);
}

function winGame() {
    outerThis.add.image(0,0,'victory').setOrigin(0).setDisplaySize(width, height);
    camera.setBounds(0, 0, width, height);
}

function lightCandle() {
    let candleOn = outerThis.physics.add.sprite(candle.x,candle.y,'candle_on');
    kill(candle);
    outerThis.physics.add.collider(candleOn, platforms);
    setTimeout(winGame,2000);
}