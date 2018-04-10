
'use strict';

// Model background images with parallax scrolling

Game = (function(module) {
  
  module.Background = function(params) {
  
    self = {}
    
    // Private state
    let ps = {
      
      n : (params.images.length || 0),
      sigma : (params.sigma || 2.0),
      images : (function() { console.log('foo'); return [];})(),
      scale : []
      
      /*
      // Fit background image to camera or allow it to 
      // scroll
      mainBackground : {
      
        // If fitToCamera is true, the main background remains
        // fixed wrt the viewport of the camera.  If true,
        // the aspect ratio can be maintained (where relevant
        // borders are added) or the image fills the entire
        // viewport of the camera
        fitToCamera : (params.fitToCamera || true),
        maintainAspect : (params.maintainAspect || true)
      },
      
      intermediateBackground : {
        
      }
      */
    }
    
    // Populate private state
    for (let i=0; i<ps.n; i++) {
      
      ps.images[i] = Game.Graphics.Sprite({ imageURL : params.images[i] })
      
      if (i<ps.n - 1) {
      
        ps.scale[i] = Math.pow(ps.sigma, -i)      
      }
      else {
        
      }
    }
    
    
    // Private API
    
    
    // Public Interface
    
    
  }
  
  console.log('bar');
  
  return module
  
})(window.Game || {})