

Game.Graphics = (function(module) {

  // Animation Sequence - immutable model of an animation sequence based on a given spritesheet
  module.AnimationSequence = function(params) {
    
    let self = {};
    
    let ps = {
      
      spriteSheet : params.spriteSheet, // Actual spritesheet object, not just a URI
      startFrame : params.startFrame,
      endFrame : params.endFrame,
      oscillate : (params.oscillate || false),
      flipHorizontal : (params.flipHorizontal || false),
      flipVertical : (params.flipVertical || false)
    };
    
    
    // Private API
    
    let spriteSheet = function() {
      
      return ps.spriteSheet;
    }
    
    let startFrame = function() {
      
      return ps.startFrame;
    }
    
    let endFrame = function() {
      
      return ps.endFrame;
    }
    
    let oscillate = function() {
      
      return ps.oscillate;
    }
    
    let flipHorizontal = function() {
      
      return ps.flipHorizontal;
    }
    
    let flipVertical = function() {
      
      return ps.flipVertical;
    }
    
    
    // Public interface
    self.spriteSheet = spriteSheet;
    self.startFrame = startFrame;
    self.endFrame = endFrame;
    self.oscillate = oscillate;
    self.flipHorizontal = flipHorizontal;
    self.flipVertical = flipVertical;
    
    
    return self;
  }
  
  
  
  // Animation sequence that tracks a current animation cycle for a given object/character state.  SequenceInstance is 'throw-away', we create a new one each time an animation sequence starts / state change occurs for the associated object/character.
  module.SequenceInstance = function(params) {
    
    let self = {};
    
    let ps = {
      
      sequence : params.animationSequence, // Reference to immutable animation sequence object
      fStart : params.animationSequence.startFrame(),
      fEnd : params.animationSequence.endFrame(),
      fCurrent : 0,
      frameDelta : 0,
      
      timeIndex : 0,
      frameIndex : 0,
      
      fInterval : 0
    };
    
    ps.fCurrent = ps.fStart;
    ps.frameDelta = (ps.fEnd >= ps.fStart) ? 1 : -1;
    ps.fInterval = ps.sequence.spriteSheet().invFPS();
    
    
    // Private API
    
    let sequence = function() {
      
      return ps.sequence;
    }
    
    let currentFrame = function() {
      
      return ps.fCurrent;
    }
    
    let updateFrame = function(timeDelta) {
      
      let timeIndexNew = ps.timeIndex + timeDelta;
      let frameIndexNew = Math.floor(timeIndexNew / ps.fInterval);
      
      //console.log(this.timeIndex);
      
      // Update animation frame (fCurrent).  If frameIndexNew = this.frameIndex, we advance
      // by 0 frames.  Typically we advance by no more than 1 frame.
      let numFramesToAdvance = frameIndexNew - ps.frameIndex;
      
      while (numFramesToAdvance > 0) {
      
        if (ps.fCurrent == ps.fEnd) {
        
          // Need to loop
          if (ps.sequence.oscillate() == true) {
            
            // bitonic sequence so swap order we proceed through sequence
            let temp = ps.fStart;
            ps.fStart = ps.fEnd;
            ps.fEnd = temp;
            
            ps.frameDelta = ps.frameDelta * -1;
            
            ps.fCurrent = ps.fCurrent + ps.frameDelta;
          }
          else {
            
            // Simple monotonic increments of frame index - simply set fCurrent back to fStart
            ps.fCurrent = ps.fStart;
          }
        }
        else {
          
          // Simply update frame
          ps.fCurrent = ps.fCurrent + ps.frameDelta;
        }
        
        numFramesToAdvance--;
      }
      
      // Update timeIndex
      ps.timeIndex = timeIndexNew;
      
      // Update frameIndex
      // *** For now increate monotonically - may trap an upper-bound and cycle
      // but number ranges we're talking about are fine ***
      ps.frameIndex = frameIndexNew;
    }
    
    let drawCurrentFrame = function(size, scale, context) {

      let currentSpriteSheet = ps.sequence.spriteSheet();
      
      let w = (size!==null) ? size.width : currentSpriteSheet.frameWidth();
      let h = (size!==null) ? size.height : currentSpriteSheet.frameHeight();
      
      context.scale((ps.sequence.flipHorizontal()) ? -1 : 1, (ps.sequence.flipVertical()) ? -1 : 1);
      context.translate(-w * scale / 2, -h * scale / 2);
      
      currentSpriteSheet.draw(0, 0, w, h, scale, ps.fCurrent, context);
    }
    
    let reset = function() {
      
      ps.fStart = ps.sequence.startFrame();
      ps.fEnd = ps.sequence.endFrame();
      ps.fCurrent = ps.fStart;
      ps.frameDelta = (ps.fEnd >= ps.fStart) ? 1 : -1;
      
      ps.timeIndex = 0;
      ps.frameIndex = 0;
      
      ps.fInterval = ps.sequence.spriteSheet().invFPS();
      
      return self;
    }
    
    
    // Public interface
    self.sequence = sequence;
    self.currentFrame = currentFrame;
    self.updateFrame = updateFrame;
    self.drawCurrentFrame = drawCurrentFrame;
    self.reset = reset;
    
    
    return self;
  }
  
  
  return module;
  
})((Game.Graphics || {}));