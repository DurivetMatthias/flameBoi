
// Main Game engine systemLanguage

Game = (function(module) {
  
  module.System = function(params) {
    
    self = {};
    
    
    // Private state
    let ps = {
      
      physicsEngine : Matter.Engine.create(),
      clock : Game.Clock()
    };
    
    
    // Private API
    let physicsEngine = function() {
      
      return ps.physicsEngine;
    }
    
    let clock = function() {
      
      return ps.clock;
    }
    
    // Public interface
    self.physicsEngine = physicsEngine;
    self.clock = clock;
    
    return self;
  }
  
  
  return module;
  
})((window.Game || {}));