Game.Animation = (function(module) {

	module.spritesheet = (module.spritesheet || {});
	module.sequence = (module.sequence || {});



	module.spritesheet['player_spritesheet'] = Game.Graphics.SpriteSheet({

		imageURL : 'Assets/Images/FrostAnim01b.png',
		frameWidth : 74,
		frameHeight : 86,
		framesPerSecond : 32
	});


	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Standing_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 20,
		endFrame : 20,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Standing_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 20,
		endFrame : 20,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Walking_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 26,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Walking_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 0,
		endFrame : 26,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Jumping_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 23,
		endFrame : 23,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Jumping_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 23,
		endFrame : 23,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Falling_right'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 17,
		endFrame : 17,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	module.sequence['player'] = (module.sequence['player'] || {});
	module.sequence['player']['Falling_left'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['player_spritesheet'],
		startFrame : 17,
		endFrame : 17,
		oscillate : false,
		flipHorizontal : true,
		flipVertical : false
	});

	return module;

})((Game.Animation || {}));