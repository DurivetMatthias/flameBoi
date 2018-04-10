

// Main game bootstrap

Game = (function(module) {
  
  module.bootstrap = function(params) {
      
    console.log('bootstrap');
      
    Game.canvas = $('#canvas')[0];
    Game.context = Game.canvas.getContext('2d');
    Game.system = Game.System();
    
    
    
    // Create and run game stage graph        
    let mainGame = Game.Stages.MainGameStage();
    
    Game.stageGraph = mainGame;
    Game.stageGraph.init( { level : 0 } );
  } 
  
  return module;
  
})((window.Game || {}));
