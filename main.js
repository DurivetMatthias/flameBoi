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

var warmthLvl = 'H';

let game = new Phaser.Game(config);

function preload ()
{
    this.load.image('wall', 'assets/platform.png');
    this.load.spritesheet('waterProjectile', 'assets/waterProjectile.jpg', { frameWidth: 150, frameHeight: 150 });
    this.load.image('background', 'assets/bg.png');
    this.load.image('gameOver', 'assets/game_over.png');
    this.load.image('candle_on', 'assets/candle_on.png');
    this.load.image('candle_off', 'assets/candle_off.jpg');
    this.load.image('victory', 'assets/victory.jpg');

    this.load.spritesheet('FHappy', 'assets/FlameboiHappy.png', { frameWidth: 80, frameHeight: 115 });
    this.load.spritesheet('FNeutral', 'assets/FlameboiNeutral.png', { frameWidth: 80, frameHeight: 115 });
    this.load.spritesheet('FSad', 'assets/FlameboiSad.png', { frameWidth: 80, frameHeight: 115 });

    this.load.spritesheet('LFHappy', 'assets/LFlameboiHappy.png', { frameWidth: 96, frameHeight: 115 });
    this.load.spritesheet('LFNeutral', 'assets/LFlameboiNeutral.png', { frameWidth: 96, frameHeight: 115 });
    this.load.spritesheet('LFSad', 'assets/LFlameboiSad.png', { frameWidth: 96, frameHeight: 115 });

    this.load.spritesheet('RFHappy', 'assets/RFlameboiHappy.png', { frameWidth: 102, frameHeight: 115 });
    this.load.spritesheet('RFNeutral', 'assets/RFlameboiNeutral.png', { frameWidth: 102, frameHeight: 115 });
    this.load.spritesheet('RFSad', 'assets/RFlameboiSad.png', { frameWidth: 96, frameHeight: 115 });

    this.load.spritesheet('waterDrop', 'assets/WaterboiEnemy.png', { frameWidth: 50, frameHeight: 50 });
    this.load.spritesheet('furnace', 'assets/Furnace.png', { frameWidth: 150, frameHeight: 50 });
}

function create ()
{
    lastFullPercentage = 100;
    outerThis = this;

    background = this.add.tileSprite(700, 250, width*4, height, "background");
    cursors = this.input.keyboard.createCursorKeys();
    player = this.physics.add.sprite(width/8, height/2, 'FHappy');
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

    this.anims.create({
        key: 'leftH',
        frames: this.anims.generateFrameNumbers('LFHappy'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turnH',
        frames: this.anims.generateFrameNumbers('FHappy'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'rightH',
        frames: this.anims.generateFrameNumbers('RFHappy'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'leftN',
        frames: this.anims.generateFrameNumbers('LFNeutral'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turnN',
        frames: this.anims.generateFrameNumbers('FNeutral'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'rightN',
        frames: this.anims.generateFrameNumbers('RFNeutral'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'leftS',
        frames: this.anims.generateFrameNumbers('LFSad'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turnS',
        frames: this.anims.generateFrameNumbers('FSad'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'rightS',
        frames: this.anims.generateFrameNumbers('RFSad'),
        frameRate: 10,
        repeat: -1
    });


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

        if (warmthLvl == 'H') {
            player.anims.play('leftH', true);
        }
        else if (warmthLvl == 'N') {
            player.anims.play('leftN', true);
        }
        else {
            player.anims.play('leftS', true);
        }
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(playerSpeed);

        if (warmthLvl == 'H') {
            player.anims.play('rightH', true);
        }
        else if (warmthLvl == 'N') {
            player.anims.play('rightN', true);
        }
        else {
            player.anims.play('rightS', true);
        }
    }
    else
    {
        player.setVelocityX(0);

        if (warmthLvl == 'H') {
            player.anims.play('turnH', true);
        }
        else if (warmthLvl == 'N') {
            player.anims.play('turnN', true);
        }
        else {
            player.anims.play('turnS', true);
        }
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

    if (player.warmth > 66) {
        warmthLvl = 'H';
    }
    else if (player.warmth > 33){
        warmthLvl = 'N';
    }
    else {
        warmthLvl = 'S';
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

function refillContact(player, creature) {
    player.warmth += 25;
    killRefill(creature);
}

function killProjectile(projectile,platform) {
    projectile.disableBody(true,true);
}

function kill(object) {
    object.disableBody(true,true);
    object.active = false;
}

function killRefill(object) {
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