
//
// Extended sprite model to manage sprite sheet arrangements
// Indexing sprites is as follows...
// 
// Row arrangement (rows = 1. cols = n)...
// [0 1 2 3 ... n]
//
// Column arrangement (rows = n, cols = 1)...
// [ 0 ]
// [ 1 ]
// [ 2 ]
// [...]
// [ n ]
//
// Rectangular (rows=n, cols = m)  For illustration, m=3, n=3
// [0 1 2]
// [3 4 5]
// [6 7 8]
//
// params is defined as...
// {
//    imageURL : filename of the spritesheet image to load
//    frameWidth : width of each frame in pixels
//    frameHeight : height of each frame in pixels
//    framesPerSecond : number of frames per second
//    (optional) callback : function to call once the spritesheet has finished loading
// }

Game.Graphics = (function(module) {

  module.SpriteSheet = function(params) {
    
    // Private state
    let ps = {
      
      frameWidth : params.frameWidth,
      frameHeight : params.frameHeight,
      fps : params.framesPerSecond,
      invFPS : 1 / params.framesPerSecond,
      
      // Derived quantities - initialised after async load of sprite sheet image
      rows : 0,
      cols : 0
    };

    // Load sprite, but override original callback to handle additional post-load sprite sheet setup
    let self = Game.Graphics.Sprite({
      
      imageURL : params.imageURL,
      callback : function(w, h) {
        
        // Additional async setup after sprite image has loaded
        ps.rows = h / ps.frameHeight;
        ps.cols = w / ps.frameWidth;
        
        // Callback to caller if callback function given
        if (params.callback !== undefined) {
            
          params.callback(w, h);
        }
      }
    });
    
    
    // Private API
    
    let frameWidth = function() {
      
      return ps.frameWidth;
    }
    
    let frameHeight = function() {
      
      return ps.frameHeight;
    }
    
    let fps = function() {
      
      return ps.fps;
    }
    
    let invFPS = function() {
      
      return ps.invFPS;
    }
    
    let rows = function() {
      
      return ps.rows;
    }
    
    let cols = function() {
      
      return ps.cols;
    }
    
    let draw = function(x, y, w, h, scale, i, context) {
    
      if (self.hasLoaded() && i>=0 && i<(ps.rows * ps.cols)) {
        
        context.drawImage(
        
          self.image(),
          (i % ps.cols) * ps.frameWidth,
          (i - (i % ps.cols)) / ps.cols * ps.frameHeight,
          ps.frameWidth,
          ps.frameHeight,
          x,
          y,
          w * scale,
          h * scale); 
      }
    }
    
    
    // Public interface
    self.frameWidth = frameWidth;
    self.frameHeight = frameHeight;
    self.fps = fps;
    self.invFPS = invFPS;
    self.rows = rows;
    self.cols = cols;
    self.draw = draw;
    
    
    return self;
  }
  
  return module;
  
})((Game.Graphics || {}));