let background;
let player;
let cursors;
let camera;
let waterDrops = [];
let projectiles = [];
let sinks = [];
let refils = [];
let fans = [];
let platforms = [];
let outerThis;
let lastFullPercentage;
let warmthText;
let candle;
let warmthBarBackground;
let warmthBar;
let gameEnded = false;
let endingScene;

const projectileSpeed = 750;
const bounce = 0.1;
const gravity = 1000;
const warmthDecreasePerSecond = 1;
const width = 1500;
const height = 600;
const theoreticalFramesPerSecond = 60;
const groundY = height*8/10;

const widthMultiplier = 3;

const levelJSON =
    [   {width: width*widthMultiplier, height: height/10, x:0, y: height*9/10},
        {width: 200, height: 20, x:900, y: 400},
        {width: 200, height: 20, x:1100, y: 250},
        {width: 200, height: 20, x:1300, y: 400},
        {width: 300, height: 20, x:2200, y: 400},
        {width: 20, height: 200, x:2200, y: 400},
        {width: 20, height: 400, x:2500, y: 200},
        {width: 100, height: 20, x:2400, y: 200},
        {width: 200, height: 20, x:2800, y: 400},
        {width: 200, height: 20, x:3200, y: 400},
        {width: 200, height: 20, x:3600, y: 400}];
const sinksJSON =
    [   {x:2075, y: groundY}];
const waterdropsJSON =
    [   {x:1000, y: 350},
        {x:1400, y: 350},
        {x:3100, y: groundY},
        {x:3200, y: groundY},
        {x:3300, y: groundY}
        ];
const fansJSON =
    [   {x:2400, y: 200}];
const refilJSON =
    [   {x:1200, y: 200}];
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

let warmthLvl = 'H';

let game = new Phaser.Game(config);

function preload ()
{
    this.load.image('wall', 'assets/platform.png');
    this.load.image('background', 'assets/bg.png');
    this.load.image('gameOver', 'assets/game_over.png');
    this.load.image('bar', 'assets/warmth_bar.jpg');
    this.load.image('bar_back', 'assets/black.jpg');
    this.load.image('waterProjectile', 'assets/waterProjectile.png');

    this.load.spritesheet('sink', 'assets/sink.png', { frameWidth: 250, frameHeight: 60 });
    this.load.spritesheet('fan', 'assets/fan.png', { frameWidth: 600, frameHeight: 600});
    this.load.spritesheet('refil', 'assets/Furnace.png', { frameWidth: 150, frameHeight: 50 });
    this.load.image('usedRefil', 'assets/DeadFurnace.png');

    this.load.spritesheet('candle_off', 'assets/FinalCandleEmpty.png', { frameWidth: 600, frameHeight: 600 });
    this.load.spritesheet('candle_on', 'assets/Win.png', { frameWidth: 600, frameHeight: 600 });
    this.load.spritesheet('candle_stay', 'assets/FinalCandleFull.png', { frameWidth: 600, frameHeight: 600 });

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
}

function create ()
{
    lastFullPercentage = 100;
    outerThis = this;
    background = this.add.tileSprite(0, 0, width*widthMultiplier, height, "background").setOrigin(0,0);
    cursors = this.input.keyboard.createCursorKeys();
    player = this.physics.add.sprite(width/8, groundY, 'FHappy');
    candle = this.physics.add.sprite(width*widthMultiplier * 9 / 10, 0, 'candle_off').setDisplaySize(450,450);
    candle.used = false;
    player.setBounce(bounce);
    player.setCollideWorldBounds(true);
    player.warmth = 100;
    warmthBarBackground = this.add.image(width/2, height/10, 'bar_back').setDisplaySize(404,44).setScrollFactor(0);
    warmthBarBackground.scaleX = 0.255;
    warmthBar = this.add.image(width/2, height/10, 'bar').setDisplaySize(400,40).setScrollFactor(0);
    warmthText = this.add.text(width/2, height/10, 'Warmth: 100', { fill: '#ffffff', font: '18pt Arial' }).setOrigin(0.5,0.5).setScrollFactor(0);
    updateWarmthBar();
    player.body.setGravityY(gravity);

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

    this.anims.create({
        key: 'candle_on_anim',
        frames: this.anims.generateFrameNumbers('candle_on', { start: 7, end: 21, first: 7 }),
        frameRate: 10,
        onComplete: winGame
    });

    this.anims.create({
        key: 'candle_stays_anim',
        frames: this.anims.generateFrameNumbers('candle_stay'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'candle_off_anim',
        frames: this.anims.generateFrameNumbers('candle_off'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'sink_anim',
        frames: this.anims.generateFrameNumbers('sink'),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'refil_anim',
        frames: this.anims.generateFrameNumbers('refil'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'fan_anim',
        frames: this.anims.generateFrameNumbers('fan'),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'waterDrop_anim',
        frames: this.anims.generateFrameNumbers('waterDrop'),
        frameRate: 10,
        repeat: -1
    });


    levelJSON.forEach(function (positionObject) {
        let plat = outerThis.physics.add.sprite(positionObject.x,positionObject.y, 'wall').setOrigin(0,0).setGravityY(-gravity);
        plat.setDisplaySize(positionObject.width,positionObject.height);
        plat.width = positionObject.width;
        plat.height = positionObject.height;
        plat.body.immovable = true;
        platforms.push(plat);
    });

    waterdropsJSON.forEach(function (positionObject) {
        let drop = outerThis.physics.add.sprite(positionObject.x,positionObject.y,'waterDrop');
        initiateWaterDrop(drop);
        waterDrops.push(drop);
        drop.play('waterDrop_anim');
    });
    sinksJSON.forEach(function (positionObject) {
        let sink = outerThis.physics.add.sprite(positionObject.x,positionObject.y,'sink');
        sinks.push(sink);
        sink.play('sink_anim');
    });
    fansJSON.forEach(function (positionObject) {
        let fan = outerThis.physics.add.sprite(positionObject.x,positionObject.y,'fan');
        fans.push(fan);
        fan.setScale(0.25,0.25);
        fan.width /= 4;
        fan.height /= 4;
        fan.play('fan_anim');
     });
    refilJSON.forEach(function (positionObject) {
        let refil = outerThis.physics.add.sprite(positionObject.x,positionObject.y,'refil');
        refil.used = false;
        refils.push(refil);
        refil.play('refil_anim')
    });
    candle.play('candle_off_anim');

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(waterDrops, platforms);
    this.physics.add.collider(candle, platforms);
    this.physics.add.collider(sinks, platforms);
    this.physics.add.collider(refils, platforms);
    this.physics.add.collider(fans, platforms);
    this.physics.add.overlap(player, projectiles, projectileContact, null, this);
    this.physics.add.overlap(projectiles, platforms, killProjectile, null, this);
    this.physics.add.overlap(player, waterDrops, waterDropCollision, null, this);
    this.physics.add.overlap(player, candle, lightCandle, null, this);
    this.physics.add.overlap(player, sinks, sinkCollision, null, this);
    this.physics.add.overlap(player, fans, fanCollision, null, this);
    this.physics.add.overlap(player, refils, refilCollision, null, this);

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
        if(player.body.velocity.x>-playerSpeed) player.body.velocity.x -= playerSpeedIncrement;

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
        if(player.body.velocity.x<playerSpeed) player.body.velocity.x += playerSpeedIncrement;

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
        player.body.velocity.x = Math.round(player.body.velocity.x/playerFriction);

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
        const speed = 100;
        const secondsToJump = 1.5;
        const secondsToFire = 2;
        const secondsToPatrol = 2;
        const jumpHeight = 1000;
        const distanceToPlayer = player.x - child.x;
        const facingLeft = distanceToPlayer < 0;

        if(child.active) {
            //PATROLL COUNTER
            if(child.patrolCounter<secondsToPatrol*theoreticalFramesPerSecond){
                child.setVelocityX(-speed);
                child.patrolCounter++;
            }else if(child.patrolCounter<secondsToPatrol*theoreticalFramesPerSecond*2){
                child.setVelocityX(speed);
                child.patrolCounter++;
            }else{
                child.patrolCounter = 0;
            }
            //JUMP COUNTER
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
    drop.patrolCounter = 0;
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
    kill(projectile);
}

function waterDropCollision(player,waterDrop) {
    loseWarmth(50);
    kill(waterDrop);
    waterDrop.active = false;
}

function sinkCollision() {
    loseWarmth(3);
}

function refilCollision(player, refil) {
    if(!refil.used){
        gainWarmth(25);
        kill(refil);
        let usedRefil = outerThis.physics.add.sprite(refil.x,refil.y+(refil.height/2),'usedRefil');
        usedRefil.used = true;
        refils.push(usedRefil);
    }
}

function fanCollision() {
    player.setVelocityX(-2000);
    loseWarmth(10);
}

function kill(object) {
    object.disableBody(true,true);
}

function killProjectile(projectile) {
    kill(projectile)
}

function lightCandle() {
    player.warmth = 100;
    if (!candle.used) {
        destroyAll();
        outerThis.add.image(0,0,'background').setOrigin(0).setDisplaySize(width, height).setScrollFactor(0);
        endingScene = outerThis.add.sprite(width/2,height/2, 'candle_on').setScrollFactor(0);
        endingScene.play('candle_on_anim');
        candle.used = true;
    }
}

function loseWarmth(amount) {
    player.warmth -= amount;
}

function gainWarmth(amount) {
    player.warmth += amount;
    if(player.warmth>100) player.warmth = 100;
}

function destroyAll() {
    waterDrops = [];
    projectiles = [];
    sinks = [];
}

function loseGame() {
    outerThis.add.image(0,0,'gameOver').setOrigin(0).setDisplaySize(width, height).setScrollFactor(0);
    destroyAll();
    gameEnded = true;
}

function winGame(){
    gameEnded = true;
    endingScene.play('candle_stays_anim');
}