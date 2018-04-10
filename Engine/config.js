
'use strict';

//
// Engine configuration
//

Game = (function(module) {

  module.config = {

    playerName : 'Player 1',

    player_mass : 18,

    player_move_speed : 2,

    player_top_speed : 6,

    player_jump_speed : 8,
    
    player_sprite_scale : 1,

    player_controls : { moveLeft : 'LEFT', moveRight : 'RIGHT', jump : 'SPACE' },
    
    
    pickup_sprite_scale : 0.75, // Bigger number = larger sprite!

    pickup_time_delay : 5, // Delay (in seconds) between pickups appearing

    frictionCoeff : 0.025,
    
    default_creature_mass : 18,
    default_creature_sprite_scale : 1,
    default_creature_damage : 10,
    
    default_platform_mass : 20,
    default_platform_sprite_scale : 1,
    
    show_bounding_volume : true
  };
  
  
  return module;
  
})((window.Game || {}));

