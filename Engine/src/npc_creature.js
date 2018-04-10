
// Example NPC entity

Game.Model = (function(module) {
  
  module.Creature = function(params) {
  
    let self = Game.Model.Entity(params);
    
    module.FacingDirection = (module.FacingDirection || { Left : 0, Right : 1 });
    
    let ps = {
    
      body : Matter.Bodies.rectangle(params.pos.x, params.pos.y, params.size.width, params.size.height, { id : params.id, isStatic : true, isSensor : true }),
      mass : (params.mass || Game.config.default_creature_mass),
      size : params.size,
      //contactProfile : 0,
      scale : (params.scale || Game.config.default_creature_sprite_scale),
      boundingVolumeScale : (params.boundingVolumeScale || 1.0),
      
      //direction : (params.direction || Game.Model.FacingDirection.Right),
      
      stateGraph : {},
      currentState : null,
      currentAnimationSequence : null,
      
      damage : (params.damage || Game.config.default_creature_damage)      
    };
    
    
    // -----------------------------------------
    
    
    // Private states

    let doing_stuff = function(params = {}) {
      
      let self = Game.Model.State(params);
      
      // Public interface
      
      self.enter = function(env, tDelta) {
      
        console.log("Creature starting doing_stuff...");
        
        ps.currentAnimationSequence = Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['doing_stuff']});
      }
      
      self.update = function(env, tDelta) {
        
        ps.currentAnimationSequence.updateFrame(tDelta / 1000);
        
        return true;
      }
      
      self.exit = function(env, tDelta) {
      
        console.log("...Creature ending doing_stuff");
      }
            
      return self;
    }
    
    
    // EndState typically terminates a host character / entity.  This provides a convinient realisation of state terminator in a state diagram.
    let EndState = function(params = {}) {
      
      let self = Game.Model.State(params);
      
      // Public interface
      
      self.update = function(env, tDelta) {
        
        return false;
      }
      
      return self;
    }
  
    
    
    // -----------------------------------------
    
    // Private API
    
    ps.stateGraph['doing_stuff'] = doing_stuff();

    // Add state transitions here - see model_player for examples
    
    ps.currentState = ps.stateGraph[params.initState];
    
    Matter.Body.setMass(ps.body, ps.mass);
    Matter.Body.setInertia(ps.body, Number.POSITIVE_INFINITY);
    
    ps.body.hostObject = self;
    
    
    let draw = function(context, canvas) {
      
      // Draw main image rect
      context.save();
      
      context.translate(ps.body.position.x, ps.body.position.y);
      context.rotate(ps.body.angle);
      
      
      if (ps.currentAnimationSequence) {
        
        ps.currentAnimationSequence.drawCurrentFrame(ps.size, ps.scale, context);
        
      } else {
      
        context.fillStyle = 'rgb(0, 255, 0)';
        context.fillRect(-ps.size.width/2, -ps.size.height/2, ps.size.width, ps.size.height);
      }
      
      context.restore();
      
      
      if (Game.config.show_bounding_volume) {
      
        // Draw bounding volume (no model transform needed since already in world coords)
        
        let vertices = ps.body.vertices;
        
        context.beginPath();

        context.moveTo(vertices[0].x, vertices[0].y);
        
        for (let i = 1; i < vertices.length; ++i) {
        
          context.lineTo(vertices[i].x, vertices[i].y);
        }
        
        context.lineTo(vertices[0].x, vertices[0].y);
        
        context.lineWidth = 1;
        context.strokeStyle = '#FFF';
        context.stroke();
        
              
        // Draw player contact profile (again, already in world coords so no transform needed)
        
        context.beginPath();
        
        //console.log(ps.player.contactProfile);
        
        if ((ps.contactProfile & Game.Model.Contact.top) == Game.Model.Contact.top) {
          
          context.moveTo(ps.body.position.x - (ps.size.width / 2), ps.body.position.y - (ps.size.height / 2));
          context.lineTo(ps.body.position.x + (ps.size.width / 2), ps.body.position.y - (ps.size.height / 2));
        }
        if ((ps.contactProfile & Game.Model.Contact.bottom) == Game.Model.Contact.bottom) {
          
          context.moveTo(ps.body.position.x - (ps.size.width / 2), ps.body.position.y + (ps.size.height / 2));
          context.lineTo(ps.body.position.x + (ps.size.width / 2), ps.body.position.y + (ps.size.height / 2));
        }
        if ((ps.contactProfile & Game.Model.Contact.left) == Game.Model.Contact.left) {
          
          context.moveTo(ps.body.position.x - (ps.size.width / 2), ps.body.position.y - (ps.size.height / 2));
          context.lineTo(ps.body.position.x - (ps.size.width / 2), ps.body.position.y + (ps.size.height / 2));
        }
        if ((ps.contactProfile & Game.Model.Contact.right) == Game.Model.Contact.right) {
          
          context.moveTo(ps.body.position.x + (ps.size.width / 2), ps.body.position.y - (ps.size.height / 2));
          context.lineTo(ps.body.position.x + (ps.size.width / 2), ps.body.position.y + (ps.size.height / 2));
        }
        
        context.lineWidth = 8;
        context.strokeStyle = '#FFF';
        context.stroke();
      }
      
    };
    
    let update = function(env, tDelta) {
      
      return ps.currentState.update(env, tDelta);
    };
    
    let processTransitions = function(env, tDelta) {
      
      let transitionState = ps.currentState.evalTransitions(env, tDelta);
      
      if (transitionState.stateChanged) {
        
        // Process exit of current state
        ps.currentState.exit(env, tDelta);
        
        // Call the action function if defined for the transition that's occuring
        if (transitionState.transitionAction) {
        
          transitionState.transitionAction(env, tDelta);
        }
        
        // After existing state exit and transition actions have been performed, perform actual state change
        ps.currentState = transitionState.newState;
        
        // Once transition is complete, the first thing we do is call the new state's 'enter' method
        ps.currentState.enter(env, tDelta);
      }
    };
    
    let addToWorld = function(world) {
    
       Matter.World.add(world, ps.body);
    }
    
    let body = function() {
    
      return ps.body;
    }
    
    let position = function() {
      
      return { x : ps.body.position.x, y : ps.body.position.y };
    }
    
    let damage = function() {
      
      return ps.damage;
    }
    
    
    // Collision interface
    
    let doCollision = function(otherBody, env) {
      
      if (otherBody.collideWithCreature) {
      
        otherBody.collideWithCreature(this, {
          
          objA : env.objB,
          objB : env.objA,
          stage : env.stage,
          system : env.system
        });
      };
    }
    
    let collideWithPlayer = function(player, env) {
    
      if (player.collideWithCreature) {
        
        player.collideWithCreature(this, {
          
          objA : env.objB,
          objB : env.objA,
          stage : env.stage,
          system : env.system
        });
      }
    }
    
    
    
    // Pubic interface
    self.draw = draw;
    self.update = update;
    self.processTransitions = processTransitions;
    self.addToWorld = addToWorld;
    self.body = body;
    self.position = position;
    self.damage = damage;

    // Collision interface
    self.doCollision = doCollision;
    self.collideWithPlayer = collideWithPlayer;
    
    
    // Inital state entry
    ps.currentState.enter(self, params.env, params.tDelta);
    
    return self;
  }
  
  
  return module;
  
})((Game.Model || {}));