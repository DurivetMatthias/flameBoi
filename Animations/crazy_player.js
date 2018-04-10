Game.Animation = (function(module) {

	module.spritesheet = (module.spritesheet || {});
	module.sequence = (module.sequence || {});



	module.spritesheet['player_spritesheet'] = Game.Graphics.SpriteSheet({

		imageURL : 'Assets/Images/CrazyAnimation.png',
		frameWidth : 32,
		frameHeight : 32,
		framesPerSecond : 12
	});


	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Standing_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 0,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Standing_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 0,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Walking_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 3,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Walking_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 3,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Jumping_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 2,
		endFrame : 2,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Jumping_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 2,
		endFrame : 2,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Falling_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 1,
		endFrame : 1,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Falling_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 1,
		endFrame : 1,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	return module;

})((Game.Animation || {}));