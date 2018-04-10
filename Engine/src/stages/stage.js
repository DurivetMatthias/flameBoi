
// Game stage base class


Game.Stages = (function(module) {
  
  module.Stage = function(params) {
    
    let self = {};
    
    
    // Private state
    let ps = {
      
      transitionLinks : {},
      leaveStage      : { id : null, params : null }
    }
    
    
    // Private API
    
    let setTransition = function(id, target) {
      
      ps.transitionLinks[id] = target;
    }
    
    let getTransitionTarget = function(id) {
      
      return ps.transitionLinks[id];
    }
    
    
    // Public interface
    self.setTransition = setTransition;
    self.getTransitionTarget = getTransitionTarget;
    
    
    return self;
  }
  
  return module;
  
})((Game.Stages || {}));