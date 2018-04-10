

// Contact model

Game.Model = (function(module) {
  
  module.Contact = {
    
    bottom : 0b0001,
    top    : 0b0010,
    left   : 0b0100,
    right  : 0b1000,
     
    // Return the contact profile flag given the supporting contact points between two objects.
    calcProfile : function(pos, supports, meanX, dx, meanY, dy) {
              
      if (supports.length >= 2) {
        
        if (dx >= dy) {
          
          // Horizontally oriented contact
          if (meanY < pos.y) {
            
            return Game.Model.Contact.top;
          }
          else {
            
            return Game.Model.Contact.bottom;
          }
        }
        else {
          
          // Vertically oriented contact
          //console.log('vc : (%d, %d)', meanY, dy);
          
          if (meanX < pos.x) {
            
            return Game.Model.Contact.left;
          }
          else {
            
            return Game.Model.Contact.right;
          }
        }
        
      } else { // must be 1 - special corner contact case
      
        if (supports[0].y < pos.y) {
          
          return Game.Model.Contact.top;
        }
        else {
          
          Game.Model.Contact.bottom;
        }            
      }
    }
     
  };
  
  
  module.CollisionModel = {
    
    StaticScene : {
      
      Category :  0b00001,
      Mask :      0b00010
    },
    
    Player : {
      
      Category :  0b00010,
      Mask :      0b11111
    },
    
    Projectile : {
      
      Category :  0b00100,
      Mask :      0b10110
    },
    
    Pickup : {
      
      Category :  0b01000,
      Mask :      0b00110
    },
    
    // Collision filter for ANY NPC
    NPC : {
      
      Category :  0b10000,
      Mask :      0b00110
    }
  };
  
  
  
  return module;
  
})((Game.Model || {}));