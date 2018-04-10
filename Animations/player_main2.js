Game.Animation = (function(module) {

	module.spritesheet = (module.spritesheet || {});
	module.sequence = (module.sequence || {});



	module.spritesheet['player_spritesheet'] = Game.Graphics.SpriteSheet({

		imageURL : 'Assets/Images/run-sprite-sheet.png',
		frameWidth : 100,
		frameHeight : 150,
		framesPerSecond : 12
	});


	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Standing_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 2,
		endFrame : 2,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Standing_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 2,
		endFrame : 2,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Walking_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 9,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Walking_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 9,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Jumping_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 6,
		endFrame : 6,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Jumping_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 6,
		endFrame : 6,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Falling_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 6,
		endFrame : 6,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Falling_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 6,
		endFrame : 6,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	return module;

})((Game.Animation || {}));