
// Base class for character / entity types within the game

Game.Model = (function(module) {
  
  module.Entity = function(params = {}) {
    
    let self = {};
    
    
    // Public interface
    
    // Functions to override in sub-classes
    
    // Draw entity
    self.draw = function(context, canvas) {};
    
    // Update entity - called before any Matter.js updates occur
    self.update = function(env, tDelta) { return true; };
    
    // Manage entity state transitions - called after Matter.js updates occur
    self.processTransitions = function(env, tDelta) {};
    
    // Function to indicate object implements the contact profile interface / model.  Override to return true and implement relevant functions and state
    self.hasContactProfile = function() { return false; };
    
    
    return self;
  }
  
  
  return module;
  
})((Game.Model || {}));