
// Render level modes

let RenderLevelImageMode = Object.freeze({
  "Normal"    : 1,
  "Tile"      : 2,
  "Fill"      : 3   // Fit to world coordinates
});


// Example level

Game.Levels = (function(module) {
  
  // Sprites
  Game.Sprites = (Game.Sprites || []);
  
  Game.Sprites[1] = Game.Graphics.Sprite({ imageURL : 'Assets/Images/cobblestone.jpg' });
  Game.Sprites[2] = Game.Graphics.Sprite({ imageURL : 'Assets/Images/grass_tile.png' });
  
  
  // Pickups
  Game.PickupTypes = (Game.PickupTypes || []);
  

  Game.PickupTypes[10] = Game.Model.PickupModel.PickupType( {
    
    spriteURI : 'Assets//Images//pickup_points.png',  
    collisionGroup : 0,
    handler : function(collector) {
    
      collector.addPoints(50);
    }
  });
  
  Game.PickupTypes[11] = Game.Model.PickupModel.PickupType( {
    
    spriteURI : 'Assets//Images//pickup_energy.png',
    collisionGroup : 0,
    handler : function(collector) {
    
      collector.addStrength(20);
    }
  });
  
  Game.PickupTypes[12] = Game.Model.PickupModel.PickupType( {
    
    spriteURI : 'Assets//Images//pickup_extralife.png',
    collisionGroup : 0,
    handler : function(collector) {
    
      collector.addExtraLife();
    }
  });

  
  
  
  module.Level = (module.Level || []);
  
  // Private state
  let tileWidth = 32;
  let tileHeight = 32;
  
  // Number of tiles to fit on the screen of size (1024 x 768) with tile sizes of 32x32
  let mapWidth = 32;
  let mapHeight = 12;
  
  
  
  module.Level[0] = {
    
    name : 'Spooky level 1',
    
    // background provides a viewport aligned image
    background : {
      
      image : Game.Graphics.Sprite( {imageURL:'Assets/Images/FullMoon.jpg'} ),
      maintainAspect : true
    },
    
    renderLevels : {
      
      sigma : 2.0,
      
      // Render layers ordered front-to-back
      levels : [
    
        {
          image : Game.Graphics.Sprite({ imageURL : 'Assets/Images/Clouds2.png' }),
          mode : RenderLevelImageMode.Normal, // default
          sigmaOverride : 0.35
          //periodicity : 2 
        },
        
        {
          image : Game.Graphics.Sprite({ imageURL : 'Assets/Images/SpookyCreatures01.png' }),
          mode : RenderLevelImageMode.Normal,
          offset : { x : -400, y : -200 },
          sigmaOverride : 0.5
          //periodicity : 1
        }
    
      ]
    },
    
    /*
    background : {
      
      main : {
        
        image : Game.Graphics.Sprite({ imageURL : 'Assets/Images/FullMoon.jpg' }),
        
        alignedToCamera : true,
        periodicity : 1
      },
      
      intermediate : [
      
        { image : Game.Graphics.Sprite({ imageURL : 'Assets/Images/Clouds.png' }), pScale : 0.25, periodicity : 2 },
        
        { image : Game.Graphics.Sprite({ imageURL : 'Assets/Images/SpookyCreatures01.png' }), pScale : 0.5, periodicity : 1 }
      
      ]
    },
    */
    
    tileWidth : tileWidth,
    tileHeight : tileHeight,
    mapDimension : { width : mapWidth, height : mapHeight },
    mapTileArray : (function() {
    
      let mapImage = [
      
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0,
      1, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
      1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 11, 0, 0,
      2, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
      
      ];
      
      
      let map = [];
      
      for (let i=0; i<mapWidth; ++i) {
        
        map[i] = [];
        
        for (let j=0; j<mapHeight; ++j) {
                    
          map[i][j] = mapImage[j * mapWidth + i];
        }
      }
      
      /*
      // Procedurally generate tile map data - stored in column major format
      for (let i=0; i<mapWidth; ++i) {
        
        map[i] = [];
        
        for (let j=0; j<mapHeight; ++j) {
                    
          map[i][j] = (Math.random() < 0.1) ? 1 : 0; // 0 indicates an empty map tile
        }
      }
      
      // Add floor
      for (let i=0; i<mapWidth; ++i) {
      
        map[i][mapHeight - 1] = 2;
      }
      */
      
      
      return map;
      
    })()
    
    
  };
  
  
  return module;
  
})((Game.Levels || {}));