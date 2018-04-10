Game.Animation = (function(module) {

	module.spritesheet = (module.spritesheet || {});
	module.sequence = (module.sequence || {});



	module.spritesheet['oscillator'] = Game.Graphics.SpriteSheet({

		imageURL : 'Assets/Images/platform1.png',
		frameWidth : 64,
		frameHeight : 16,
		framesPerSecond : 1
	});


	module.sequence['oscillator'] = (module.sequence['oscillator'] || {});
	module.sequence['oscillator']['moving'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['oscillator'],
		startFrame : 0,
		endFrame : 0,
		oscillate : false,
		flipHorizontal : false,
		flipVertical : false
	});

	return module;

})((Game.Animation || {}));