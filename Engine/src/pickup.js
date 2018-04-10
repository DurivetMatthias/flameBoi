
// Pickups

Game.Model = (function(module) {
  
  module.PickupModel = (module.PickupModel || {});
  
  module.PickupModel.PickupType = function(params) {
    
    self = {};
    
    let ps = {
      
      handler : params.handler,
      collisionGroup : params.collisionGroup,
      sprite : Game.Graphics.Sprite({imageURL : params.spriteURI})
    };
    
    // Private API
    
    let handler = function() {
      
      return ps.handler;
    }
    
    let collisionGroup = function() {
      
      return ps.collisionGroup;
    }
    
    let sprite = function() { 
    
      return ps.sprite;
    }
    
    // Public interface
    self.handler = handler;
    self.collisionGroup = collisionGroup;
    self.sprite = sprite;
    
    return self;
  }
  
  
  module.PickupModel.Pickup = function(params) {
    
    let self = {};
    
    
    // Private state
    let type = params.type;
    
    let scale = params.scale || Game.config.pickup_sprite_scale;
    
    let size = {
      
      width : type.sprite().image().width * scale * params.boundingVolumeScale,
      
      height : type.sprite().image().height * scale * params.boundingVolumeScale
    };
               
    let mBody = Matter.Bodies.rectangle(
                              
                              params.pos.x,
                              params.pos.y,
                              size.width,
                              size.height,
                              {
                                  isStatic : params.isStatic,
                                  isSensor : true/*,
                                  collisionFilter : {
                                    group : type.collisionGroup(),
                                    category : Game.Model.CollisionModel.Pickup.Category,
                                    mask : Game.Model.CollisionModel.Pickup.Mask }*/
                              });
    
    Matter.Body.setMass(mBody, 0);  
    mBody.hostObject = self;
  
    Matter.World.add(params.world, mBody);
      
    
    let ps = {
      
      type : type,
      scale : scale,
      size : size,
      mBody : mBody
    };
    
    
    // Private API
    
    let draw = function(context) {
    
      if (ps.mBody) {
        
        context.save();
        
        var pos = ps.mBody.position;
        
        context.translate(pos.x, pos.y);
        context.translate(-ps.type.sprite().image().width * ps.scale / 2, -ps.type.sprite().image().height * ps.scale / 2);
        ps.type.sprite().draw(context, { x : 0, y : 0, scale : ps.scale });
        
        context.restore();
      }
    }
  
    let drawBoundingVolume = function(context) {
      
      if (ps.mBody) {
        
        // Record path of mBody geometry
        context.beginPath();

        var vertices = ps.mBody.vertices;
        
        context.moveTo(vertices[0].x, vertices[0].y);
        
        for (var j = 1; j < vertices.length; ++j) {
        
          context.lineTo(vertices[j].x, vertices[j].y);
        }
        
        context.lineTo(vertices[0].x, vertices[0].y);
            
        // Render geometry
        context.lineWidth = 1;
        context.strokeStyle = '#FFFFFF';
        context.stroke();
      }
    }
  
  
    // Collision interface
    
    let doCollision = function(otherBody, env) {
      
      if (otherBody.collideWithPickup) {
      
        otherBody.collideWithPickup(this, {
          
          objA : env.objB,
          objB : env.objA,
          stage : env.stage,
          system : env.system
        });
      }      
    }
    
    let collideWithPlayer = function(player, env) {
      
      let handlerFn = ps.type.handler();
      
      handlerFn(player);
      
      // Remove from collections
      Matter.World.remove(Game.system.physicsEngine().world, ps.mBody);
      env.stage.pickupArray().splice(env.stage.pickupArray().indexOf(self), 1);
    }
    
    
    // Public interface
    self.draw = draw;
    self.drawBoundingVolume = drawBoundingVolume;
    self.doCollision = doCollision;
    self.collideWithPlayer = collideWithPlayer;
    
    
    return self;
  }
  
  
  // General pickup processing function called every game loop to handle any pickup creation
  module.PickupModel.processPickups = function() {
    
  }
  
  
  return module;
  
})((Game.Model || {}));