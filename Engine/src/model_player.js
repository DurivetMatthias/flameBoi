
'use strict';


// Main player entity

Game.Model = (function(module) {
  
  module.Player = function(params) {
  
    let self = Game.Model.Entity(params);
    
    module.FacingDirection = (module.FacingDirection || { Left : 0, Right : 1 });
    
    let ps = {
    
      body : Matter.Bodies.rectangle(params.pos.x, params.pos.y, params.size.width, params.size.height, { id : params.id }),
      mass : (params.mass || Game.config.player_mass),
      size : params.size,
      contactProfile : 0,
      scale : (params.scale || Game.config.player_sprite_scale),
      boundingVolumeScale : (params.boundingVolumeScale || 1.0),
      
      direction : (params.direction || Game.Model.FacingDirection.Right),
      
      stateGraph : {},
      currentState : null,
      currentAnimationSequence : null,
      
      strength : (params.strength || 100),
      numLives : (params.numLives || 3),
      score : 0
      
    };
    
    
    // -----------------------------------------
    
    
    // Private (default) states

    let StandingState = function(params = {}) {
      
      let self = Game.Model.State(params);
      
      let state_ps = {
      
        standLeft : ps.currentAnimationSequence = Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Standing_left']}),
        
        standRight : ps.currentAnimationSequence = Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Standing_right']})
      };
      
      // Public interface
      
      self.enter = function(env, tDelta) {
        
        if (ps.direction==Game.Model.FacingDirection.Right) {
        
          ps.currentAnimationSequence = state_ps.standRight;
          ps.currentAnimationSequence.reset();
        }
        else {
          
          ps.currentAnimationSequence = state_ps.standLeft;
          ps.currentAnimationSequence.reset();
        }
      }
      
      self.update = function(env, tDelta) {
        
        ps.currentAnimationSequence.updateFrame(tDelta / 1000);
        
        return true;
      }
      
      // Note: no need to override exit - does nothing for this state
      
      return self;
    }
    
    
    let WalkingState = function(params = {}) {
      
      let self = Game.Model.State(params);
      
      let state_ps = {
      
        walkingLeft : Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Walking_left']}),
        
        walkingRight : Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Walking_right']})
      };
      
      // Public interface
      
      self.enter = function(env, tDelta) {
        
        if (ps.direction==Game.Model.FacingDirection.Right) {
          
          ps.currentAnimationSequence = state_ps.walkingRight.reset();
        }
        else {
          
          ps.currentAnimationSequence = state_ps.walkingLeft.reset();
        }
      }
      
      self.update = function(env, tDelta) {
        
        if (env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft)) {
          
          Matter.Body.translate(ps.body, { x : -Game.config.player_move_speed, y : 0 } );
          
          // Manage change in 'sub-state' ie. change direction
          if (ps.direction!=Game.Model.FacingDirection.Left) {
            
            ps.direction = Game.Model.FacingDirection.Left;
            ps.currentAnimationSequence = state_ps.walkingLeft.reset();
          }
        }
        else if (env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)) {
          
          Matter.Body.translate(ps.body, { x : Game.config.player_move_speed, y : 0 } );
          
          if (ps.direction!=Game.Model.FacingDirection.Right) {
            
            ps.direction = Game.Model.FacingDirection.Right;
            ps.currentAnimationSequence = state_ps.walkingRight.reset();
          }
        }
        
        ps.currentAnimationSequence.updateFrame(tDelta / 1000);
        
        return true;
      }
             
      return self;
    }
    
    let JumpingState = function(params = {}) {
      
      let self = Game.Model.State(params);
      
      let state_ps = {
        
        jumpingLeft : Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Jumping_left']}),
        
        jumpingRight : Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Jumping_right']})
      };
      
      // Public interface
      
      self.enter = function(env, tDelta) {
              
        if (ps.direction==Game.Model.FacingDirection.Right) {
          
          ps.currentAnimationSequence = state_ps.jumpingRight.reset();
        }
        else {
          
          ps.currentAnimationSequence = state_ps.jumpingLeft.reset();
        }
        
        ps.body.friction = 0;
        Matter.Body.setVelocity(ps.body, { x : ps.body.velocity.x, y : -Game.config.player_jump_speed });
      }
      
      self.update = function(env, tDelta) {
        
        if (env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft)) {
          
          Matter.Body.translate(ps.body, { x : -Game.config.player_move_speed, y : 0 } );
          
          if (ps.direction!=Game.Model.FacingDirection.Left) {
            
            ps.direction = Game.Model.FacingDirection.Left;
            ps.currentAnimationSequence = state_ps.jumpingLeft.reset();
          }
        }
        else if (env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)) {
          
          Matter.Body.translate(ps.body, { x : Game.config.player_move_speed, y : 0 } );
          
          if (ps.direction!=Game.Model.FacingDirection.Right) {
            
            ps.direction = Game.Model.FacingDirection.Right;
            ps.currentAnimationSequence = state_ps.jumpingRight.reset();
          }
        }
        
        ps.currentAnimationSequence.updateFrame(tDelta / 1000);
        
        return true;
      }
      
      self.exit = function(env, tDelta) {
      
        // Restore friction coefficient for body
        ps.body.friction = 0.1;
      }
      
      return self;
    }
    
    let FallingState = function(params = {}) {
      
      let self = Game.Model.State(params);
      
      let state_ps = {
      
        fallingLeft : Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Falling_left']}),
        
        fallingRight : Game.Graphics.SequenceInstance({animationSequence : Game.Animation.sequence[ps.body.id]['Falling_right']})
      };
      
      // Public interface
      
      self.enter = function(env, tDelta) {
      
        if (ps.direction==Game.Model.FacingDirection.Right) {
          
          ps.currentAnimationSequence = state_ps.fallingRight.reset();
        }
        else {
          
          ps.currentAnimationSequence = state_ps.fallingLeft.reset();
        }
        
        ps.body.friction = 0;
      }
      
      self.update = function(env, tDelta) {
                
        if (env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft)) {
          
          Matter.Body.translate(ps.body, { x : -Game.config.player_move_speed, y : 0 } );
          
          if (ps.direction!=Game.Model.FacingDirection.Left) {
            
            ps.direction = Game.Model.FacingDirection.Left;
            ps.currentAnimationSequence = state_ps.fallingLeft.reset();
          }
        }
        else if (env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)) {
          
          Matter.Body.translate(ps.body, { x : Game.config.player_move_speed, y : 0 } );
          
          if (ps.direction!=Game.Model.FacingDirection.Right) {
            
            ps.direction = Game.Model.FacingDirection.Right;
            ps.currentAnimationSequence = state_ps.fallingRight.reset();
          }
        }
        
        ps.currentAnimationSequence.updateFrame(tDelta / 1000);
        
        return true;
      }
      
      self.exit = function(env, tDelta) {
              
        // Restore friction coefficient for body
        ps.body.friction = 0.1;
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
    
    ps.stateGraph['StandingState'] = StandingState();
    ps.stateGraph['WalkingState'] = WalkingState();
    ps.stateGraph['JumpingState'] = JumpingState();
    ps.stateGraph['FallingState'] = FallingState();
    ps.stateGraph['EndState'] = EndState();
    
    // Standing->Walking
    ps.stateGraph['StandingState'].addTransition(
    
      ps.stateGraph['WalkingState'],
      function(env, tDelta) {
        
        return ((ps.contactProfile & Game.Model.Contact.bottom)==Game.Model.Contact.bottom && (env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft) || env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)));
      }
    );
    
    // Walking->Standing
    ps.stateGraph['WalkingState'].addTransition(
    
      ps.stateGraph['StandingState'],
      function(env, tDelta) {
        
        return ((ps.contactProfile & Game.Model.Contact.bottom)==Game.Model.Contact.bottom && (!env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft) && !env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)));
      }
    );
    
    // Standing->Jumping
    ps.stateGraph['StandingState'].addTransition(
    
      ps.stateGraph['JumpingState'],
      function(env, tDelta) {
        
        return env.stage.keyboard().isPressed(Game.config.player_controls.jump);
      }
    );
    
    // Walking->Jumping
    ps.stateGraph['WalkingState'].addTransition(
    
      ps.stateGraph['JumpingState'],
      function(env, tDelta) {
        
        return env.stage.keyboard().isPressed(Game.config.player_controls.jump);
      }
    );
    
    // Standing->Falling
    ps.stateGraph['StandingState'].addTransition(
    
      ps.stateGraph['FallingState'],
      function(env, tDelta) {
        
        return (ps.contactProfile & Game.Model.Contact.bottom)==0;
      }
    );
    
    // Walking->Falling
    ps.stateGraph['WalkingState'].addTransition(
    
      ps.stateGraph['FallingState'],
      function(env, tDelta) {
        
        return (ps.contactProfile & Game.Model.Contact.bottom)==0;
      }
    );
    
    // Jumping->Standing
    ps.stateGraph['JumpingState'].addTransition(
    
      ps.stateGraph['StandingState'],
      function(env, tDelta) {
        
        return ((ps.contactProfile & Game.Model.Contact.bottom)==Game.Model.Contact.bottom && (!env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft) && !env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)));
      }
    );
    
    // Jumping->Walking
    ps.stateGraph['JumpingState'].addTransition(
    
      ps.stateGraph['WalkingState'],
      function(env, tDelta) {
        
        return ((ps.contactProfile & Game.Model.Contact.bottom)==Game.Model.Contact.bottom && (env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft) || env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)));
      }
    );
    
    // Jumping->Falling
    ps.stateGraph['JumpingState'].addTransition(
    
      ps.stateGraph['FallingState'],
      function(env, tDelta) {
        
        let colliderMask = Game.Model.Contact.top /*| Game.Model.Contact.left | Game.Model.Contact.right*/ ;
        
        return (ps.contactProfile & colliderMask) != 0;
      }
    );

    // Falling->Standing
    ps.stateGraph['FallingState'].addTransition(
    
      ps.stateGraph['StandingState'],
      function(env, tDelta) {
        
        return ((ps.contactProfile & Game.Model.Contact.bottom)==Game.Model.Contact.bottom && (!env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft) && !env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)));
      }
    );
    
    // Falling->Walking
    ps.stateGraph['FallingState'].addTransition(
    
      ps.stateGraph['WalkingState'],
      function(env, tDelta) {
        
        return ((ps.contactProfile & Game.Model.Contact.bottom)==Game.Model.Contact.bottom && (env.stage.keyboard().isPressed(Game.config.player_controls.moveLeft) || env.stage.keyboard().isPressed(Game.config.player_controls.moveRight)));
      }
    );
    
    
    
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
      
        context.lineWidth = 4;
        context.strokeStyle = '#F00';
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
    
    let position = function() {
      
      return { x : ps.body.position.x, y : ps.body.position.y };
    }
    
    let score = function() { 
    
      return ps.score;
    }
    
    let strength = function() {
      
      return ps.strength;
    }
    
    let numLives = function() {
      
      return ps.numLives;
    }
    
    let addPoints = function(delta) {
      
      ps.score += delta;
    }
    
    let addStrength = function(delta) {
      
      ps.strength += delta;
    }
    
    let addExtraLife = function() {
    
      ps.numLives = ps.numLives + 1;
    }
    
    
    // Contact profile interface
    let hasContactProfile = function() { return true; }
    
    let contactProfile = function() {
      
      return ps.contactProfile;
    }
    
    let calcContactProfile = function(supports, meanX, dx, meanY, dy) {
      
      ps.contactProfile = ps.contactProfile | Game.Model.Contact.calcProfile(position(), supports, meanX, dx, meanY, dy);
    }
    
    let resetContactProfile = function() {
      
      ps.contactProfile = 0;
    }
    
    
    // Collision interface
    
    let doCollision = function(otherBody, env) {
      
      if (otherBody.collideWithPlayer) {
      
        otherBody.collideWithPlayer(this, {
          
          objA : env.objB,
          objB : env.objA,
          stage : env.stage,
          system : env.system
        });
      };
    }
    
    let collideWithPickup = function(pickup, env) {
    
      if (pickup.collideWithPlayer) {
      
        pickup.collideWithPlayer(this, {
          
          objA : env.objB,
          objB : env.objA,
          stage : env.stage,
          system : env.system
        });
      }
    }
    
    let collideWithCreature = function(creature, env) {
    
      console.log('ouch!');
      ps.strength = Math.max(ps.strength - creature.damage(), 0);
    }
    
    let collideWithPlatform = function(platform, env) {
    
      console.log('platform ahoy!');
      
    }
    
    // Pubic interface
    self.draw = draw;
    self.update = update;
    self.processTransitions = processTransitions;
    self.addToWorld = addToWorld;
    self.position = position;
    self.score = score;
    self.strength = strength;
    self.numLives = numLives;
    self.addPoints = addPoints;
    self.addStrength = addStrength;
    self.addExtraLife = addExtraLife;
    
    // Contact profile interface
    self.hasContactProfile = hasContactProfile;
    self.contactProfile = contactProfile;
    self.calcContactProfile = calcContactProfile;
    self.resetContactProfile = resetContactProfile;
    
    // Collision interface
    self.doCollision = doCollision;
    self.collideWithPickup = collideWithPickup;
    self.collideWithCreature = collideWithCreature;
    self.collideWithPlatform = collideWithPlatform;
    
    // Inital state entry
    ps.currentState.enter(self, params.env, params.tDelta);
    
    return self;
  }
  
  
  return module;
  
})((Game.Model || {}));