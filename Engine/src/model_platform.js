
'use strict';

Game.Model = (function(module) {

  module.Platform = function(params) {
    
    let self = Game.Model.Entity(params);
    
    // Private attributes
    
    let ps = {
    
      body : Matter.Bodies.rectangle(params.pos.x, params.pos.y, params.size.width, params.size.height, { id : params.id, isStatic : true, isSensor : false }),
      mass : (params.mass || Game.config.default_platform_mass),
      size : params.size,
      contactProfile : 0,
      scale : (params.scale || Game.config.default_platform_sprite_scale),
      boundingVolumeScale : (params.boundingVolumeScale || 1.0),
      
      stateGraph : {},
      currentState : null,
      currentAnimationSequence : null
    };
    
    
    // -----------------------------------------
    
    
    // Private states
    
    let moving = function(params = {}) {
      
      let self = Game.Model.State(params);
      
      let state_ps = {
        
        theta : 0,
        initPos : {},
        posCurrent : {}
      };
      
      // Public interface
      
      self.enter = function(env, tDelta) {
      
        console.log("Platform starting moving state...");
        
        ps.currentAnimationSequence = Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['moving']});
        
        state_ps.theta = 0;
        state_ps.initPos = ps.body.position;
        state_ps.posCurrent = ps.body.position;
      }
      
      self.update = function(env, tDelta) {
        
        ps.currentAnimationSequence.updateFrame(tDelta / 1000);
        
        let y_ = state_ps.initPos.y + Math.sin(state_ps.theta) * 2;
        Matter.Body.setPosition(ps.body, {x : state_ps.initPos.x, y : y_});
        state_ps.theta += ((Math.PI / 180.0) * 5.0);
                
        return true;
      }
      
      self.exit = function(env, tDelta) {
      
        console.log("...Playform ending moving");
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
    
    ps.stateGraph['moving'] = moving();
    
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
    }
    
    let update = function(env, tDelta) {
      
      return ps.currentState.update(env, tDelta);
    }
    
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
    }
    
    let addToWorld = function(world) {
    
       Matter.World.add(world, ps.body);
    }
    
    
    // Accessors
    
    let body = function() {
      
      return ps.body;
    }
    
    
    
    
    // Collision interface
    
    let doCollision = function(otherBody, env) {
      
      if (otherBody.collideWithPlatform) {
      
        otherBody.collideWithPlatform(this, {
          
          objA : env.objB,
          objB : env.objA,
          stage : env.stage,
          system : env.system
        });
      };
    }
    
    let collideWithPlayer = function(player, env) {
    
      if (player.collideWithPlatform) {
        
        // triple dispatch (avoid duplicate functionality)
        player.collideWithPlatform(this, {
          
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
    
    // Accessors
    self.body = body;    
    
    // Collision interface
    self.doCollision = doCollision;
    self.collideWithPlayer = collideWithPlayer;
    
    
    // Inital state entry
    ps.currentState.enter(self, params.env, params.tDelta);
    
    
    return self;
  }
  
  return module;

})((Game.Model || {}));
