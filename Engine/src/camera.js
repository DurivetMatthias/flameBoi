

// 2D camera model

Game = (function(module) {
  
  module.Camera = function(params) {
    
    self = {};
    
    
    // Private state
    let ps = {
      
      // Camera position (viewplane centre)
      pos : (params.pos || { x : 0, y : 0 }),
      
      // Camera rotation angle (radians)
      theta : 0, 
      
      // Camera zoom
      scale : 1,
      
      // Camera viewplane dimensions in world coordinates
      viewplane : (params.viewplane || { width : 0, height : 0 })
      
      
    };
    
    
    // Private API
    
    let pos = function(value = null) {
      
      if (value!==null) {
        
        ps.pos.x = value.x;
        ps.pos.y = value.y;
      }
      
      return { x : ps.pos.x, y : ps.pos.y };
    }
    
    let viewplane = function(value = null) {
      
      if (value!==null) {
        
        pos.viewplane.width = value.width;
        pos.viewplane.height = value.height;
      }
      
      return { width : ps.viewplane.width, height : ps.viewplane.height };
    };
    
    let move = function(dx, dy) {
    
      ps.pos.x += dx;
      ps.pos.y += dy;
      
      return { x : ps.pos.x, y : ps.pos.y };
    }
    
    let scaleViewplane = function(sigma) {
      
      ps.viewplane.width *= sigma;
      ps.viewplane.height *= sigma;
      
      return { width : ps.viewplane.width, height : ps.viewplane.height };
    }
    
    
    // Private state for transforms
    
    // Build matrices at initialisation time
    let C = mat3.create();
    let P = mat3.create();
    let T = mat3.create();
    let R = mat3.create();
    let S = mat3.create();
    
    let applyTransform = function(context, canvas) {
      
      mat3.fromScaling(P, vec2.fromValues(canvas.width / ps.viewplane.width, canvas.height / ps.viewplane.height));
      
      mat3.fromTranslation(T, vec2.fromValues(-(ps.pos.x - (ps.viewplane.width / 2)), -(ps.pos.y - (ps.viewplane.height / 2))));
      
      mat3.fromRotation(R, ps.theta);
      
      mat3.fromScaling(S, vec2.fromValues(ps.scale, ps.scale));
      
      
      mat3.mul(C, P, mat3.mul(C, T, mat3.mul(C, R, S)));
      
      context.transform(C[0], C[1], C[3], C[4], C[6], C[7]);
    }
    
    // Public interface
    self.pos = pos;
    self.viewplane = viewplane;
    self.move = move;
    self.scaleViewplane = scaleViewplane;
    self.applyTransform = applyTransform;
    
    return self;
  }
  
  
  return module;
  
})((window.Game || {}));