Game.Animation = (function(module) {

	module.spritesheet = (module.spritesheet || {});
	module.sequence = (module.sequence || {});



	module.spritesheet['mummy'] = Game.Graphics.SpriteSheet({

		imageURL : 'Assets/Images/Mummy-sprite-Sheet.png',
		frameWidth : 250,
		frameHeight : 250,
		framesPerSecond : 12
	});


	module.sequence['mummy'] = (module.sequence['mummy'] || {});
	module.sequence['mummy']['doing_stuff'] = Game.Graphics.AnimationSequence({

		spriteSheet : module.spritesheet['mummy'],
		startFrame : 0,
		endFrame : 9,
		oscillate : true,
		flipHorizontal : false,
		flipVertical : false
	});

	return module;

})((Game.Animation || {}));