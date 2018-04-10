
Forge.Foundation = (function(module) {
  
  // Type modelling a single sprite image.  params is defined as...
  // {
  //    imageURL :  path of file to load
  //    callback :  async called function called when image loaded.  (w, h)
  //                of loaded sprite passed as parameters 
  // }
  module.Sprite = function(params) {
    
    var self = {};
    
    // Private state
    let ps = {
      
      spriteLoaded : false,
      image : null
    };
    
    // Private API
    let onLoaded = function() {
    
      ps.spriteLoaded = true;
      
      // Callback to host application to handle app-specific post-sprite load event
      if (params.callback !== undefined) {
              
        params.callback(ps.image.width, ps.image.height);
      }
    }
    
    // Internal state initialisation
    ps.image = new Image();
    ps.image.onload = onLoaded;
    ps.image.src = (params.imageURL || '');
    
    
    // Public interface
    
    /* Draw the sprite at the given target coordinates and scale.  target is defined as...
    {
        x : horizontal pixel position (mandatory)
        y : vertical pixel position (mandatory)
        dWidth : width of target rect to draw into
        dHeight : height of target rect to draw into
        scale : uniform scaling of sprite dimensions
    }
    Notes: dWidth and dHeight must both be defined for the target rect to be used.  scale overrides both of these - if scale is defined then the dimensions of the sprite are uniformely scaled and the aspect ratio is maintained.  If neither dWidth, dHeight or scale are defined, then a default scale of 1.0 is utilised.  (x, y) are not scaled - it is assumed any positional scaling is done by the caller.
    */
    let draw = function(context, target) {
      
      if (ps.spriteLoaded && target.x!==undefined && target.y!==undefined) {
        
        if (target.scale===undefined && target.dWidth!==undefined && target.dHeight!==undefined) {
          
          // No overriding scale defined and a valid target rect is given, render into this
          context.drawImage(ps.image, target.x, target.y, target.dWidth, target.dHeight);
          
        } else {

          // Render sprite with uniform scaling, maintaining aspect ratio
          let scale = 1;
          
          if (target.scale!==undefined) {
            
            scale = target.scale;
          }
          
          context.drawImage(ps.image, target.x, target.y, ps.image.width * scale, ps.image.height * scale);
        }
      }
    }
    
    let width = function() { return ps.image.width; }
    let height = function() { return ps.image.height; }
    let aspect = function() { return height() / width(); }
    let hasLoaded = function() { return ps.spriteLoaded; }
    let src = function() { return ps.image.src; }
    
    self.draw = draw;
    self.width = width;
    self.height = height;
    self.aspect = aspect;
    self.hasLoaded = hasLoaded;
    self.src = src;
    
    return self;
  };

  
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

  module.SpriteSheet = function(params) {
    
    // Private state
    let ps = {
      
      rows : 0,
      cols : 0, // initialised after async load of sprite sheet image
      spriteWidth : params.spriteWidth,
      spriteHeight : params.spriteHeight,
      fps : params.framesPerSecond,
      invFPS : 1 / params.framesPerSecond
    };

    // Load sprite, but override original callback to handle additional post-load sprite sheet setup
    let self = module.Sprite({
      
      imageURL : params.imageURL,
      callback : function(w, h) {
        
        // Additional async setup after sprite image has loaded
        ps.rows = h / ps.spriteHeight;
        ps.cols = w / ps.spriteWidth;
        
        // delegate original callback
        if (params.callback !== undefined) {
            
          params.callback(w, h);
        }
      }
    });
    
    
    // Public interface
    
    
    
  }
  
  return module;
  
})((Forge.Foundation || {}));
