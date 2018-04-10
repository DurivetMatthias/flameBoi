
// Keyboard handler

Game = (function(module) {
  
  module.Keys = {
    
    RETURN : 13,
    ESC : 27,
    SPACE : 32,
    PGUP : 33,
    PGDOWN : 34,
    END : 35,
    HOME : 36,
    
    LEFT : 37,
    UP : 38,
    RIGHT : 39,
    DOWN : 40,
    
    DEL : 46,
  
    K_0 : 48, K_1 : 49, K_2 : 50, K_3 : 51, K_4 : 52, K_5 : 53, K_6 : 54,
    K_7 : 55, K_8 : 56, K_9 : 57, 
    
    A : 65, B : 66, C : 67, D : 68, E : 69, F : 70, G : 71, H : 72, I : 73,
    J : 74, K : 75, L : 76, M : 77, N : 78, O : 79, P : 80, Q : 81, R : 82,
    S : 83, T : 84, U : 85, V : 86, W : 87, X : 88, Y : 89, Z : 90
  };
  
  
  module.KeyboardHandler = function(params) {
    
    self = {};
    
    
    // Private state
    let ps = {
      
      keyState : [],
      eventTarget : null
    };
    
    
    // Private API
    
    let clearKeyState = function() {
      
      for (let i=0; i<256; ++i) {
        
        ps.keyState[i] = false;
      }
    }
    
    let onKeyDown = function(e) {
      
      e = (e || window.event);
      ps.keyState[e.keyCode] = true;
    }
    
    let onKeyUp = function(e) {
      
      e = (e || window.event);
      ps.keyState[e.keyCode] = false;
    }
    
    let registerHandler = function(target = $(document)) {
      
      // Clear any existing handlers
      unregisterHandler();
      
      // Reset keyboard state
      clearKeyState();

      // Assign event handlers to new target
      target.on('keydown', onKeyDown);
      target.on('keyup', onKeyUp);
      
      ps.eventTarget = target;
    }
    
    let unregisterHandler = function() {
      
      if (ps.eventTarget!==null) {
        
        ps.eventTarget.off('keydown');
        ps.eventTarget.off('keyup');
        
        ps.eventTarget = null;
      }
    }
    
    // Return true if the key identified by the key's character 'key' is pressed, otherwise return false
    let isPressed = function(keyChar) {
      
      return ps.keyState[Game.Keys[keyChar]];
    }
    
    
    // Public interface
    self.registerHandler = registerHandler;
    self.unregisterHandler = unregisterHandler;
    self.isPressed = isPressed;
    
    return self;
  }
  
  
  return module;
  
})((window.Game || {}));