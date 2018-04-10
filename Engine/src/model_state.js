
// Base state class on which all in-game character / entity states are based

Game.Model = (function(module) {
  
  module.State = function(params={}) {
  
    let self = {};
    
    let ps = {
      
      transitions : []
    };
    
    
    // Private API
    
    let addTransition = function(targetState, conditionFunction, actionFunction) {
  
      ps.transitions.push( { target : targetState, cond : conditionFunction, action : actionFunction } );
    }
    
    /* Evaluate transitions for the given host character / entity for frame time delta (tDelta).  Transitions (or more precisely their condition functions) are evaluated in the order they are stored when the state graph is created for the host character / entity.
    
    Note 1: State transitions do NOT result in the host being killed off - we transition to an 'end' state whose update() handler will return false (see above comment).
    
    Note 2: The 'action' method could be integrated into the sub-state function? Resolved: No!  The problem with doing this is that different transitions to a given state may need different actions *** The key here is we don't violate the conditions for entering the target state!!! ***
    
    Note 3: Each state has an 'enter' and 'exit' method that are the first and last things called before and after the state change respecitvely. */
    let evalTransitions = function(env, tDelta) {
    
      let transitionState = {
        
        stateChanged : false,
        newState : null,
        transitionAction : null
      };
      
      for (let i=0; i<ps.transitions.length && !transitionState.stateChanged; ++i) {
      
        // Evaluate condition function (returns true if condition met and we can initiate associated transition)
        if (ps.transitions[i].cond(env, tDelta)) {
        
          // Set target state
          transitionState.newState = ps.transitions[i].target;
          
          // Set transition action to perform
          if (ps.transitions[i].action !== undefined) {
          
            transitionState.transitionAction = ps.transitions[i].action;
          }
          
          // Tell caller (host object) state will change
          transitionState.stateChanged = true;
        }
      }
      
      return transitionState;
    }
    
    // Generic function to override.  This is called after a transition has completed and after the host object's currentState has changed.
    let enter = function(env, tDelta) {
    }
    
    // Generic function to override.  This is called to process the current state.  update returns true if the host character / entity is still 'alive', otherwise false is returned to indicate the character is to be disposed of.
    let update = function(env, tDelta) {
      
      return true;
    }
    
    // Generic function to override.  This is called prior to any transition occuring.
    let exit = function(env, tDelta) {
    }
  
  
    // Public interface
    self.addTransition = addTransition;
    self.evalTransitions = evalTransitions;
    self.enter = enter;
    self.update = update;
    self.exit = exit;
    
    
    return self;
  }
  
  return module;
  
})((Game.Model || {}));