
'use strict';

// Main game stage

Game.Stages = (function(module) {
  
  module.MainGameStage = function(params={}) {
    
  // Setup instance based on Stage base class
    let self = Game.Stages.Stage(params);
    
    
    // Private state
    let ps = {
      
      camera : null,
      keyboard : null,
      exitMainLoop : false,
      level : 0,
      background : null,
      player : null,
      pickupArray : null,
      creaturesArray : null,
      maxTimeDelta : 0,
      maxTimeDeltaCaptureTime : 0
    };

    
    // Private API
    
    let drawHUD = function(context, canvas) {
      
      // Draw HUD
      context.fillStyle = '#FFFFFF';
      context.font = '30pt Amatic SC';
      
      let x1 = canvas.width / 8;
      let x3 = canvas.width - x1;
      
      let livesString = 'Lives : ' + ps.player.numLives();
      let scoreString = 'Score : ' + ps.player.score();
      
      let textMetrics = context.measureText(livesString);
      context.fillText(livesString, x1 - textMetrics.width / 2, 80);
      
      textMetrics = context.measureText(scoreString);
      context.fillText(scoreString, x3 - textMetrics.width / 2, 80);
      
      
      let maxBarLength = 200;
      let barX = (canvas.width / 2) - (maxBarLength / 2);
      let barY = 60;
      
      let gradient1 = context.createLinearGradient(barX, barY, barX + maxBarLength, barY);
      gradient1.addColorStop(0, '#FF0000');
      gradient1.addColorStop(0.5, '#FFFF00');
      gradient1.addColorStop(1.0, '#00FF00');
      
      
      context.strokeStyle = gradient1;
      context.beginPath();
      context.lineWidth = 20;
      context.moveTo(barX, barY);
      context.lineTo(barX + Math.max(Math.min(ps.player.strength() / 100 * maxBarLength, maxBarLength), 0), barY);
      context.stroke();
    }
    
    let drawScene = function(context, canvas) {
    
      // Clear background
      context.fillStyle = 'black';
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      context.save();
      ps.camera.applyTransform(context, canvas);
      
      
      // Draw background (main background always fixed to viewplane location in world coordinates)
      
      let vp = ps.camera.viewplane();
      let cPos = ps.camera.pos();
      
      let L = Game.Levels.Level[ps.level];
      
      let background = Game.Levels.Level[ps.level].background;
      
      if (background) {
      
        if (background.maintainAspect == true) {
        
          let w = background.image.width();
          let h = background.image.height();
          let aspect = h / w;
          let dWidth = vp.width;
          let dHeight = dWidth * aspect;
                         
          background.image.draw(context, {
            x : cPos.x - (dWidth / 2),
            y : cPos.y - (dHeight / 2),
            dWidth : dWidth,
            dHeight : dHeight });
        }
        else {
          
          background.image.draw(context, {
            x : cPos.x - (vp.width / 2),
            y : cPos.y - (vp.height / 2),
            dWidth : vp.width,
            dHeight : vp.height });
        }
      }
      
      let R = Game.Levels.Level[ps.level].renderLevels;
      
      if (R) {
 
        for (let i = R.levels.length-1; i>=0; i--) {
 
          let renderLevel = R.levels[i];
          
          let scale = (renderLevel.sigmaOverride || Math.pow(R.sigma, -(i+1)));
          let mode = (renderLevel.mode || RenderLevelImageMode.Normal);
          let offset = (renderLevel.offset || {x : 0, y : 0});
          
          // Calculate coords of top-left of viewport in world coord space
          let dx = cPos.x - (vp.width / 2);
          let dy = cPos.y - (vp.height / 2);    
          
          context.save();
          
          context.translate(dx + (-dx * scale), dy + (-dy * scale));
          context.translate(offset.x, offset.y);
          
          switch(mode) {
            
            case RenderLevelImageMode.Normal:
              
              renderLevel.image.draw(context, {
                x : 0,
                y : 0,
                dWidth : renderLevel.image.width(),
                dHeight : renderLevel.image.height()
              });
              
              break;
          
            case RenderLevelImageMode.Fill:
            
              renderLevel.image.draw(context, {
                x : 0,
                y : 0,
                dWidth : L.tileWidth * L.mapDimension.width,
                dHeight : L.tileHeight * L.mapDimension.height
              });
              
              break;
              
            case RenderLevelImageMode.Tile:
              break;
          }
          
          context.restore();
        }
      }
      /*
      let B = Game.Levels.Level[ps.level].background;
      
      if (B) {
                
        let vp = ps.camera.viewplane();
        let cPos = ps.camera.pos();
        
        let w = B.main.image.width();
        let h = B.main.image.height();
        
        // change so set dWidth and then calc dHeight w/out recipricol calc
        let aspect = h / w;
        let dHeight = vp.height;
        let dWidth = dHeight * ( 1 / aspect);
                
        
        // Draw main background
        if (B.main.alignedToCamera) {
        
          B.main.image.draw(context, { x : cPos.x - (dWidth / 2), y : 0, dWidth : dWidth, dHeight : dHeight });
        }
        else {
          
          let numImageTiles = Math.ceil(mapHExtent / dWidth);
          
          for (let j=0; j<numImageTiles; ++j) {
          
            context.save();
            
            context.translate(dWidth * j, 0);
            
            if (B.main.periodicity==2 && (j % 2)==1) { // 2N periodic so mirror every other tile
            
              context.translate(dWidth, 0);
              context.scale(-1, 1);
            }
            
            B.main.image.draw(context, { x : 0, y : 0, dWidth : dWidth, dHeight : dHeight });
          
            context.restore();
          }
        }

    
        // Draw intermediate background images
        
        for (let i=0; i<B.intermediate.length; ++i) {
          
          context.save();
          
          let dx = cPos.x - (vp.width / 2);
          
          context.translate(dx + (-dx * B.intermediate[i].pScale), 0);
          
          // Tile images along map range
          let numImageTiles = Math.ceil(mapHExtent / vp.width);
          
          for (let j=0; j<numImageTiles; ++j) {
          
            context.save();
            
            context.translate(vp.width * j, 0);
            
            if (B.intermediate[i].periodicity==2 && (j % 2)==1) { // 2N periodic so mirror every other tile
            
              context.translate(vp.width, 0);
              context.scale(-1, 1);
            }
            
            B.intermediate[i].image.draw(context, { x : 0, y : 0, dWidth : vp.width, dHeight : vp.height });
          
            context.restore();
          }
          
          context.restore();
        }
      }
      */
      
      
      // Draw static tiles
      
      
      for (let i=0; i<L.tiles.length; ++i) {
        
        let spriteIndex = L.tiles[i].sourceTile;
        let body = L.tiles[i].tileBody;
        
        context.save();
      
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);
        
        context.translate(-L.tileWidth / 2, -L.tileHeight / 2);
        
        Game.Sprites[spriteIndex].draw(context, {
        
          x : 0,
          y : 0,
          dWidth : L.tileWidth,
          dHeight : L.tileHeight
        });
        
        context.restore();
        
        // Draw bounding volume
        /*
        let vertices = body.vertices;
        
        context.beginPath();

        context.moveTo(vertices[0].x, vertices[0].y);
        
        for (let i = 1; i < vertices.length; ++i) {
        
          context.lineTo(vertices[i].x, vertices[i].y);
        }
        
        context.lineTo(vertices[0].x, vertices[0].y);
        
        context.lineWidth = 1;
        context.strokeStyle = '#FFF';
        context.stroke();
        */
      }
      
      // Draw player
      ps.player.draw(context, canvas);
      
      // Draw pickups
      for (let i=0; i<ps.pickupArray.length; ++i) {
        
        ps.pickupArray[i].draw(context);
        //ps.pickupArray[i].drawBoundingVolume(context);
      }

      // Draw creatures
      for (let i=0; i<ps.creaturesArray.length; ++i) {
        
        ps.creaturesArray[i].draw(context);
      }
      
      
      context.restore();
      
      drawHUD(context, canvas);
    }
    
    // Map / Level handling functions - merge into base level class later!
    let compileMap = function(level, world) {
      
      let C = {};
      
      let map = [];
      
      let k = 0;
      
      let w = level.tileWidth;
      let h = level.tileHeight;
      
      for (let i=0; i<level.mapDimension.width; ++i) {
        
        for (let j=0; j<level.mapDimension.height; ++j) {
          
          if (level.mapTileArray[i][j]>=1 && level.mapTileArray[i][j]<10) {
            
            let x = w * i;
            let y = h * j;
            
            map[k] = { x : x, y : y, w : w, h : h, sourceTile : level.mapTileArray[i][j] };
            ++k;
          }
          else if (level.mapTileArray[i][j]>=10 && level.mapTileArray[i][j]<20) {
            
            // Example pickup
            ps.pickupArray.push(Game.Model.PickupModel.Pickup({
              
              type : Game.PickupTypes[level.mapTileArray[i][j]],
              pos : { x : w * i, y : h * j },
              world : world,
              boundingVolumeScale : 1,
              isStatic : true
            }));
          }
          else if (level.mapTileArray[i][j]==-1) {
            
            // player pos
            C.playerPos = { x : w * i + (w / 2), y : h * j + (h / 2)};
          }
        }
      }
      
      C.map = map;
      
      return C;
    }
    
    
    // Sub-stages
    
    // Only init is exposed
    let init = function(params={}) {
      
      console.log('init');
      
      // Store current level index
      ps.level = (params.level || 0);
      
      // Setup keyboard handler
      ps.keyboard = (ps.keyboard || Game.KeyboardHandler());
      ps.keyboard.registerHandler();
      
      
      // Get physics world
      let engine = Game.system.physicsEngine();
      let world = engine.world;
      
      
      // Setup pickups array
      ps.pickupArray = [];
      ps.creaturesArray = [];
      
      
      // Setup static map tiles in physics world
      let L = Game.Levels.Level[ps.level];
      
      // Create background model
      //let background = Game.Background(L.background);
      
      let C = compileMap(L, world);
      
      L.tiles = C.map;
      
      for (let i=0; i<L.tiles.length; ++i) {
        
        L.tiles[i].tileBody = Matter.Bodies.rectangle(
          L.tiles[i].x + L.tiles[i].w / 2,
          L.tiles[i].y + L.tiles[i].h / 2,
          L.tiles[i].w,
          L.tiles[i].h,
          { isStatic : true }
        );
        
        Matter.World.add(world, L.tiles[i].tileBody);
      }
      
      // Setup additional properties
      engine.positionIterations = 10;
      world.gravity.y = 0.8; // default is 1
      
      
      
      ps.player = Game.Model.Player({
        
        id : 'player',
        pos : (C.playerPos) ? C.playerPos : { x : 128, y : -32 },
        size : { width : 32, height : 32 }, // ** SAME ASPECT OR SIZE AS SPRITESHEET FRAME SIZES **
        initState : 'StandingState'
        
      });
      
      ps.player.addToWorld(world);
      
      
      // Setup creatures
      let newMummy = Game.Model.Creature({
        
        id : 'mummy',
        pos : { x : 64, y : 192},
        size : { width : 64, height : 64 }, // ** SAME ASPECT OR SIZE AS SPRITESHEET FRAME SIZES **
        initState : 'doing_stuff'
      });
      
      ps.creaturesArray.push(newMummy);
      newMummy.addToWorld(world);
      
      
      // Setup moving platforms
      let p1 = Game.Model.Platform({
        
        id : 'oscillator',
        pos : { x : 380, y : 130},
        size : { width : 64, height : 16 }, // ** SAME ASPECT OR SIZE AS SPRITESHEET FRAME SIZES **
        initState : 'moving',
        mass : 1
      });
      
      ps.creaturesArray.push(p1);
      p1.addToWorld(world);
      
      
      // Quick test!!! - setup constraint between mummy and platform
      /*
      let constraint = Matter.Constraint.create({
          bodyA : p1.body(),
          pointA: { x: 0, y: 0 },
          bodyB: newMummy.body(),
          pointB: { x: 0, y: 0 }
      });
      
      Matter.World.add(world, constraint);
      */
      
      
      // All processing hangs off Matter.js update
      
      Matter.Events.on(engine, 'beforeUpdate', function(event) {
      
        // Handle state upates
        let world = event.source.world;
        
        // Typically the env object covers the current stage and the main game system object
        let env = {
          
          stage : self,
          system : Game.system
        };
        
        for (let i=0; i < world.bodies.length; ++i) {
        
          if (world.bodies[i].hostObject !== undefined) {
            
            let alive = true;
            
            if (world.bodies[i].hostObject.update !== undefined) {
              
              // Update object - alive is true if the object remains part of the world, otherwise false indicates the object is to be destroyed.  This is *actually* destroyed, totally removed from the environment.  Any in-game 'death' sequence has already happened.
              alive = world.bodies[i].hostObject.update(env, Game.system.clock().deltaTime());
            }
            
            if (!alive) {
              
              // Manage disposal of object
              
            } else {
              
              // Before proceeding, clear contact profile of the object so Matter.js can rebuild it for the current frame via the collisionActive event callback below.  This isn't called for non-contacting objects, so we need to clear here in case no remaining contacts exist after the above update and Matter.js simulation step have occurred.
              
              if (world.bodies[i].hostObject.resetContactProfile !== undefined) {
                
                world.bodies[i].hostObject.resetContactProfile();
              }
            } 
          }
        };
        
      });
      
      Matter.Events.on(engine, 'collisionActive', function(event) {
        
        // Extract contact points for current frame and update contact profile
        let pairs = event.pairs;
        
        for (let i=0; i<pairs.length; ++i) {
          
          let supports = pairs[i].collision.supports;
          
          // Calculate mean x contact position and standard deviation
          let meanX = supports.reduce(function(sum, val) { return sum + val.x; }, 0) / supports.length;
          let dx = supports.reduce(function(sum, val) { return sum + Math.pow(val.x - meanX, 2); }, 0) / supports.length;
          
          // Calculate mean y contact position and standard deviation
          let meanY = supports.reduce(function(sum, val) { return sum + val.y; }, 0) / supports.length;
          let dy = supports.reduce(function(sum, val) { return sum + Math.pow(val.y - meanY, 2); }, 0) / supports.length;
          
      
          // Setup contact profile for both objects in pair          
          // Note: A hostObject derives from the Entity base class / interface
          if (pairs[i].bodyA.hostObject !== undefined &&
              pairs[i].bodyA.hostObject.hasContactProfile !== undefined &&
              pairs[i].bodyA.hostObject.hasContactProfile()) {
            
            pairs[i].bodyA.hostObject.calcContactProfile(supports, meanX, dx, meanY, dy);
          }
          
          if (pairs[i].bodyB.hostObject !== undefined &&
              
              pairs[i].bodyB.hostObject.hasContactProfile()) {
              pairs[i].bodyB.hostObject.hasContactProfile !== undefined &&
              pairs[i].bodyB.hostObject.calcContactProfile(supports, meanX, dx, meanY, dy);
          }
        }
      });
      
      
      Matter.Events.on(engine, 'afterUpdate', function(event) {
        
        // Handle state transitions
        let world = event.source.world;
        
        // Typically the env object covers the current stage and the main game system object
        let env = {
          
          stage : self,
          system : Game.system
        };
        
        for (let i=0; i < world.bodies.length; ++i) {
        
          if (world.bodies[i].hostObject !== undefined) {
                        
            if (world.bodies[i].hostObject.processTransitions !== undefined) {
              
              world.bodies[i].hostObject.processTransitions(env, Game.system.clock().deltaTime());
            } 
          }
        };
      });

      // Register collision event handler to process new collisions when they occur
      Matter.Events.on(engine, 'collisionStart', function(event) {
      
        let pairs = event.pairs;
        
        for (let i=0; i<pairs.length; ++i) {
           
          if (pairs[i].bodyA.hostObject !== undefined &&
              pairs[i].bodyB.hostObject !== undefined &&
              pairs[i].bodyA.hostObject.doCollision !== undefined &&
              pairs[i].bodyB.hostObject.doCollision !== undefined) {
          
            console.log('collision!!!');
            pairs[i].bodyA.hostObject.doCollision(
              pairs[i].bodyB.hostObject,
              {
                objA : pairs[i].bodyA,
                objB : pairs[i].bodyB,
                stage : self,
                system : Game.system
              }
            ); // objA === collider of first dispatch responder
          }
        }
      });
      
      // Register continuous collision processing.  This uses a different dispatch path from doCollision which handles only *initial* collisions.  This handles continuous contact.
      Matter.Events.on(engine, "collisionActive", function(event) {
        
        let pairs = event.pairs;
        
        for (let i=0; i<pairs.length; ++i) {
           
          if (pairs[i].bodyA.hostObject !== undefined &&
              pairs[i].bodyB.hostObject !== undefined &&
              pairs[i].bodyA.hostObject.doActiveCollision !== undefined &&
              pairs[i].bodyB.hostObject.doActiveCollision !== undefined) {
          
            pairs[i].bodyA.hostObject.doActiveCollision(
              pairs[i].bodyB.hostObject,
              {
                objA : pairs[i].bodyA,
                objB : pairs[i].bodyB,
                stage : self,
                system : Game.system
              }
            ); // objA === collider of first dispatch responder
          }
        }
      });
      
      // Setup camera (aligned to player pos, but can have constraints at ends of map)
      let aspect = Game.canvas.height / Game.canvas.width;
      
      let vpWidth = 400;
      let vpHeight = vpWidth * aspect;
      
      console.log('vpHeight = ' + vpHeight);
      
      //let vpHeight = L.tileHeight * L.mapDimension.height;
      //let vpWidth = vpHeight * (1 / aspect);
      
      let pos = ps.player.position();
      
      // Resolve camera constraints
      //pos.x = Math.max(pos.x - (vpWidth / 2), 0) + (vpWidth / 2);
      //pos.x = Math.min(pos.x + (vpWidth / 2), (L.tileWidth * L.mapDimension.width) - 1) - (vpWidth / 2);
      //pos.y = (L.tileHeight * L.mapDimension.height) / 2;
      
      ps.camera = Game.Camera({ pos : { x : pos.x, y : pos.y }, viewplane : {width : vpWidth, height : vpHeight } });
      
      
      
      // Update clock before any animation begins
      Game.system.clock().tick();
      
      
      window.requestAnimationFrame(mainLoop.bind(self));
    }
    
    let mainLoop = function() {
      
      // Void frame threshold:
      // Let normal frame occur in around 16-17ms gives approx 58 - 60fps
      // On initialisation we see heavy load time giving frame time around 63ms
      // For normal runtime we don't approach this.
      // However, let's run a 'normal frame time range' between 16 and 35ms.
      // Assume <16 not possible given browser refresh rate control ** investigate further **
      // So let 'void time' threshold be 35ms
      
      const deltaThreshold = 35; // ms
      
      // Update clock
      let timeDelta = Game.system.clock().tick(deltaThreshold);

      if (Math.abs(timeDelta) > ps.maxTimeDelta) {
        
        ps.maxTimeDelta = Math.abs(timeDelta);
        ps.maxDeltaCaptureTime = Game.system.clock().actualTimeElapsed();
      }
      
      // Update physics engine state
      if (timeDelta > 0) {
        
        Matter.Engine.update(Game.system.physicsEngine(), timeDelta);
        
        
        // Have camera follow player
        
        let L = Game.Levels.Level[ps.level];
        
        let vp = ps.camera.viewplane();
        
        let cameraPos = ps.camera.pos();
        let playerPos = ps.player.position();
        
        let vpWindow = {
          
          left : cameraPos.x - (vp.width / 6),
          right : cameraPos.x + (vp.width / 6),
          top : cameraPos.y - (vp.height / 8),
          bottom : cameraPos.y + (vp.height / 8)
        };
        
        
        // Apply movement window constraints
        if (playerPos.x < vpWindow.left) {
          
          cameraPos.x -= (vpWindow.left - playerPos.x);
          
        } else if (playerPos.x > vpWindow.right) {
          
          cameraPos.x += playerPos.x - vpWindow.right;
        }
        
        if (playerPos.y < vpWindow.top) {
          
          cameraPos.y -= (vpWindow.top - playerPos.y);
          
        } else if (playerPos.y > vpWindow.bottom) {
          
          cameraPos.y += playerPos.y - vpWindow.bottom;
        }
        
        
        // Apply camera bounds constraints
        
        let vpBounds = {
        
          left : 0,
          right : (L.tileWidth * L.mapDimension.width) - 1,
          top : 0,
          bottom : (L.tileHeight * L.mapDimension.height) - 1
        };
        
        cameraPos.x = Math.max(cameraPos.x - (vp.width / 2), vpBounds.left) + (vp.width / 2);
        cameraPos.x = Math.min(cameraPos.x + (vp.width / 2), vpBounds.right) - (vp.width / 2);
        
        cameraPos.y = Math.max(cameraPos.y - (vp.height / 2), vpBounds.top) + (vp.height / 2);
        cameraPos.y = Math.min(cameraPos.y + (vp.height / 2), vpBounds.bottom) - (vp.height / 2);
        
        
        ps.camera.pos(cameraPos);
      }
      
      
      // Draw new frame
      drawScene(Game.context, Game.canvas);
      
      // Show stats
      $('#actualTime').html('Seconds elapsed = ' + Game.system.clock().actualTimeElapsed());
      $('#timeDelta').html('Time Delta = ' + Math.round(Game.system.clock().deltaTime()));
      $('#fps').html('FPS = ' + Game.system.clock().averageFPS());
      $('#spf').html('SPF = ' + Game.system.clock().averageSPF());
      $('#maxTimeDelta').html('Max time delta = ' + ps.maxTimeDelta + ' at time index : ' + ps.maxDeltaCaptureTime);
      
      
      // Process next iteration
      ps.exitMainLoop = ps.keyboard.isPressed('ESC');
      
      if (ps.exitMainLoop) {
        
        window.requestAnimationFrame(leaveStage.bind(self));
      }
      else {
        
        window.requestAnimationFrame(mainLoop.bind(self));
      }
    }
    
    let leaveStage = function() {
      
      ps.keyboard.unregisterHandler();
      
      console.log('leaveStage');
    }
    
    
    // Accessor methods
    
    let keyboard = function() {
      
      return ps.keyboard;
    }
    
    let pickupArray = function() {
    
      return ps.pickupArray;
    }
    
    
    // Public interface
    self.init = init;
    self.keyboard = keyboard;
    self.pickupArray = pickupArray;
    
    
    return self;
  }
  
  
  return module;
  
})((Game.Stages || {}));