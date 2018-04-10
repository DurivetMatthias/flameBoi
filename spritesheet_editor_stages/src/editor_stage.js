
// SpriteSheet editor stage

// Module contains data model types used throughout Forge
Forge.Model = (function(module, canvas, context) { // Module

  module.SpriteSheetModel = function(params={}) {
    
    let self = {};
    
    // Private state
    let ps = {
      
      edited : false,
      
      uniqueIdentifier : (params.uniqueIdentifier || ''),
      
      // Spritesheet image - this can be loaded and setup before any other model data is defined...
      spriteImage : (params.spriteImage || null),
      
      // Per-sprite width and height (0 means no spritesheet data defined - ie. rows, cols and sequences)
      frameWidth : (params.frameWidth || 0),
      frameHeight : (params.frameHeight || 0),
      fps : (params.fps || 0),
      
      // Derived quantities - number of rows and columns
      rows : (params.rows || 0),
      cols : (params.cols || 0),
      
      sequences : (params.sequences || [])
    };
    
    console.log('***');
    console.log(ps);
    
    // Private API

    let uniqueIdentifier = function(value) {
      
      if (value!==undefined) {
        
        ps.uniqueIdentifier = value;
        ps.edited = true;
      }
      
      return ps.uniqueIdentifier;
    }
    
    let spriteImage = function() {
      
      return ps.spriteImage;
    };
    
    let frameWidth = function(value) {
    
      if (value!==undefined) {
        
        ps.frameWidth = value;
        ps.cols = ps.spriteImage.width() / ps.frameWidth;
        ps.edited = true;
      }
      
      return ps.frameWidth;
    }
    
    let frameHeight = function(value) {
    
      if (value!==undefined) {
        
        ps.frameHeight = value;
        ps.rows = ps.spriteImage.height() / ps.frameHeight;
        ps.edited = true;
      }
      
      return ps.frameHeight;
    }
    
    let rows = function() {
      
      return ps.rows;
    }
    
    let cols = function() {
    
      return ps.cols;
    }
    
    let fps = function(value) {
    
      if (value!==undefined) {
        
        ps.fps = value;
        ps.edited = true;
      }
      
      return ps.fps;
    }
    
    let sequences = function() {
      
      return ps.sequences;
    }
    
    
    // Return the edited status of the model.  If value is defined, the edited status is changed to equal value.  value must be true or false.
    let edited = function(value) {
      
      if (value!==undefined) {
        
        ps.edited = value;
      }
      
      return ps.edited;
    }
    
    let render = function(canvas, context) {
      
      if (ps.spriteImage===null || ps.spriteImage.hasLoaded()===false) {
      
        context.fillStyle = '#000';
        context.font = '18px Arial';
        
        let messageString = '--- No image loaded ---';
        var textMetrics = context.measureText(messageString);
        context.fillText(messageString, (canvas.width / 2) - (textMetrics.width / 2), canvas.height / 2);
      
      } else {
      
        // Render sprite image
        
        let target = {};
        
        let a = ps.spriteImage.aspect();
        let b = canvas.height / canvas.width;
        
        if (a <= b) {
        
          target.dWidth = canvas.width;
          target.dHeight = a * canvas.width; 
        }
        else {
          
          target.dWidth = (1 / a) * canvas.height;
          target.dHeight = canvas.height;
        }
        
        target.x = (canvas.width - target.dWidth) / 2;
        target.y = (canvas.height - target.dHeight) / 2;
        
        ps.spriteImage.draw(context, target);
        
        // Overlay frame grid
        
        if (ps.frameWidth>0) { // frameHeight MUST also be >0 as per config dialog validation (see below)
        
          let cols = ps.spriteImage.width() / ps.frameWidth;
          let rows = ps.spriteImage.height() / ps.frameHeight;
          
          let xDelta = target.dWidth / cols;
          let yDelta = target.dHeight / rows;
          
          context.beginPath();
          
          // Render horizontal gridlines
          let y = target.y;
          for (let i=0; i<=rows; i++, y += yDelta) {
            
            context.moveTo(target.x, y);
            context.lineTo(target.x + target.dWidth, y);
          }
          
          // Render vertical gridlines
          let x = target.x;
          for (let i=0; i<=cols; i++, x += xDelta) {
            
            context.moveTo(x, target.y);
            context.lineTo(x, target.y + target.dHeight);
          }
          
          context.stroke();
          
          
          // Render per-frame indices

          context.font = '8pt Consolas';
          let maxTextWidth = context.measureText(new String(cols * rows - 1)).width; 
          
          for (let i=0; i<rows*cols; i++) {
            
            let x = target.x + (i % cols) * xDelta;
            let y = target.y + Math.floor(i / cols) * yDelta;
            
            // Render rect behind index label
            context.fillStyle = '#000';
            context.fillRect(x, y, maxTextWidth + 4, 14);
            
            // Render index label
            let indexLabel = new String(i);
            let textMetrics = context.measureText(indexLabel);
            context.fillStyle = '#FFF';
            context.fillText(indexLabel, x + 2, y + 10);
          }
          
        }
      }
    }
    
    // hasImageDependentData returns true if any of the sprite dimensions, (and implicitly rows, cols are set - see above comments), or sequences are set.  These can only be set/changed when a spritesheet image is present.
    let hasImageDependentData = function() {
      
      return ps.frameWidth > 0 || ps.frameHeight > 0 || ps.fps > 0 || ps.sequences.length > 0;
    }
    
    // loadImage loads a new spritesheet image and resets all other sprite dimension and animation state data.  clientCallback is a function the loadImage delegates to so client-specific post-load code can be called.  The client callback can take a reference to the model object that just loaded (not the image directly since this violates encapsulation).
    let loadImage = function(filename, clientCallback, clearProperties=true) {
      
      ps.spriteImage = Forge.Foundation.Sprite( {
        
        imageURL : filename,
        
        callback : function(w, h) {
          
          if (clearProperties) {
          
            // Reset sprite / animation state data
            ps.frameWidth = 0;
            ps.frameHeight = 0;
            ps.fps = 0;
            ps.rows = 0;
            ps.cols = 0;
            ps.sequences = [];
          }
          
          ps.edited = true;
          
          if (clientCallback!==undefined && clientCallback!==null) {
            
            clientCallback(self);
          }
        }
      } );
    }
    
    // Add a new sequence to the array and return it's index (always length - 1 since sequences added to end of array)
    let addNewSequence = function(seq) {
      
      ps.sequences.push(seq);
      ps.edited = true;
      
      return ps.sequences.length - 1;
    }
    
    let numSequences = function() {
      
      return ps.sequences.length;
    }
    
    let getSequence = function(index) {
      
      return ps.sequences[index];
    }

    let deleteSequence = function(index) {
      
      ps.sequences.splice(index, 1);
      ps.edited = true;
      
      console.log(ps.sequences);
    }
    
    let removeAllSequences = function() {
      
      ps.sequences = [];
      ps.edited = true;
    }
    
    let getIndexForGuiId = function(id) {
      
      let returnIndex = -1;
      
      for (let i=0; i<ps.sequences.length && returnIndex==-1; ++i) {
        
        if (ps.sequences[i].guiListID == id) {
          
          returnIndex = i;
        }
      }
      
      return returnIndex;
    }
    
    
    // Public interface
    self.uniqueIdentifier = uniqueIdentifier;
    self.spriteImage = spriteImage;
    self.frameWidth = frameWidth;
    self.frameHeight = frameHeight;
    self.rows = rows;
    self.cols = cols;
    self.fps = fps;
    self.sequences = sequences;
    self.edited = edited;
    self.render = render;
    self.hasImageDependentData = hasImageDependentData;
    self.loadImage = loadImage;
    self.addNewSequence = addNewSequence;
    self.numSequences = numSequences;
    self.getSequence = getSequence;
    self.deleteSequence = deleteSequence;
    self.removeAllSequences = removeAllSequences;
    self.getIndexForGuiId = getIndexForGuiId;
    
    
    return self;
  }

  return module;
  
})((Forge.Model || {}), Forge.canvas, Forge.context);


Forge.Stages = (function(lib, canvas, context) { // Module
  
  // Stage base-class
  lib.Stage = function(params) {
    
    let self = {};
    
    // Private state
    let ps = {
      
      transitionLinks : {},
      leaveStage      : { id : null, params : null }
    }
    
    // Methods exposed by Stage
    
    let setTransition = function(id, target) {
      
      ps.transitionLinks[id] = target;
    }
    
    let getTransitionTarget = function(id) {
      
      return ps.transitionLinks[id];
    }
    
    // Stage interface
    self.setTransition = setTransition;
    self.getTransitionTarget = getTransitionTarget;
    
    return self;
  }
  
  // Editor class (follows functional pattern)
  lib.Editor = function(params) {
    
    let sgn = function(x) {
      
      if (x < 0) {
        
        return -1;
      }
      else if (x > 0) {
        
        return 1;
      }
      else {
        
        return 0;
      }
    }
    
    let fract = function(x) {
      
      return x - Math.floor(x);
    }
    
    
    // Setup instance based on Stage base class
    let self = Forge.Stages.Stage(params);
    
    // Private state
    let ps = {
      
      elementActivationMap  : [],
      model                 : (params.model || null),
      seqCounter            : 0,
      bootstrapEditor       : true
    };
    
    // Initialise relevant private state
    
    ps.elementActivationMap['#li_navNew'] = function(env) {
      
      $('#li_navNew').attr('class', null);
      return true;
    }
    
    ps.elementActivationMap['#li_navOpen'] = function(env) {
      
      $('#li_navOpen').attr('class', null);
      return true;
    }
    
    ps.elementActivationMap['#li_navSave'] = function(env) {
      
      let model = env.get_model();
      let isEnabled = (model !== undefined && model !== null && model.edited() === true);
      
      $('#li_navSave').attr('class', isEnabled ? null : 'disabled');
      
      return isEnabled;
    }
    
    ps.elementActivationMap['#li_navDelete'] = function(env) {
      
      let model = env.get_model();
      var isEnabled = (model !== undefined && model !== null);
      
      $('#li_navDelete').attr('class', isEnabled ? null : 'disabled');
      
      return isEnabled;
    }
    
    ps.elementActivationMap['#li_navExport'] = function(env) {
      
      let model = env.get_model();
      var isEnabled = (model !== undefined && model !== null);
      
      $('#li_navExport').attr('class', isEnabled ? null : 'disabled');
      
      return isEnabled;
    }
    
    ps.elementActivationMap['#spsKeyLabel'] = function(env) {
      
      let model = env.get_model();
      
      var isEnabled = (model != null);
      var colorString = (isEnabled) ? '#000' : '#888';
      $('#spsKeyLabel').css('color',  colorString);
      
      return isEnabled;
    };
    
    ps.elementActivationMap['#spsKeyField'] = function(env) {
      
      let model = env.get_model();
       
      var isEnabled = (model != null);
      $('#spsKeyField').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    ps.elementActivationMap['#spsImageImportButton'] = function(env) {
      
      let model = env.get_model();
      
      var isEnabled = (model != null);
      $('#spsImageImportButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    ps.elementActivationMap['#spsImageURILabel'] = function(env) {
      
      let model = env.get_model();
      
      var isEnabled = (model != null);
      var colorString = (isEnabled) ? '#000' : '#888';
      $('#spsImageURILabel').css('color',  colorString);
      
      return isEnabled;
    };
    
    ps.elementActivationMap['#spsConfigButton'] = function(env) {
      
      let model = env.get_model();
      
      var isEnabled = (model!=null && model.spriteImage()!=null);
      $('#spsConfigButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    ps.elementActivationMap['#newSequenceButton'] = function(env) {
      
      let model = env.get_model();
      
      var isEnabled = (model!=null && model.frameWidth() > 0 && model.frameHeight() > 0);
      $('#newSequenceButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    
    // -------------------------------------------
    
    
    // Private methods
    
    let enableElements = function() {
    
      let map = ps.elementActivationMap;
      Object.keys(map).forEach( function(key) { map[key](self); } );
    }
    
    let updateStatusUI = function() {
      
      let D = {
        
        spsWidth : 0,
        spsHeight : 0,
        frameWidth : 0,
        frameHeight : 0,
        fps : 0
      }
      
      if (ps.model!==null) {
      
        if (ps.model.spriteImage()!==null) {
        
          D.spsWidth = ps.model.spriteImage().width();
          D.spsHeight = ps.model.spriteImage().height();
        }
        
        D.frameWidth = ps.model.frameWidth();
        D.frameHeight = ps.model.frameHeight();
        D.fps = ps.model.fps();
      }
      
      $('#spsDimension').html('(' + D.spsWidth + ', ' + D.spsHeight + ')px');
      $('#frameDimension').html('(' + D.frameWidth + ', ' + D.frameHeight + ')px');
      $('#spsFPS').html(D.fps + ' fps');
    }
    
    let clearSequenceListUI = function() {
      
      // Clear UI
      var listNode = document.getElementById('sequenceList');
      
      while (listNode.firstChild) {
        
        listNode.removeChild(listNode.firstChild);
      }
    }
    
    let drawCanvas = function() {
      
      context.fillStyle = 'white';
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      if (ps.model) {
        
        ps.model.render(canvas, context);
      }
    }
    
    let resizeCanvas = function() {
      
      let w = $('#canvasHost').width();
      let h = $('#canvasHost').height();
      
      canvas.width = w;
      canvas.height = h;
    }
    
    
    // -------------------------------------------
    
    
    // Event handlers
    
    let windowResizeHandler = function() {
      
      resizeCanvas();
    }
    
    let newSpriteSheet = function(event) {
      
      console.log('new');
      
      let proceed = true;
      
      if (ps.model && ps.model.edited()===true) {
        
        proceed = window.confirm('You\'re creating a new spritesheet model.  Any changes made to the current spritesheet will be lost.  Do you want to proceed?');
      }
      
      if (proceed) {
        
        ps.model = Forge.Model.SpriteSheetModel();
        
        $('#spsKeyField').val('');
        $('#spsImageURILabel').html('(No Spritesheet Loaded)');
        
        updateStatusUI();
        clearSequenceListUI();
        enableElements();
      }
    }
    
    let preloadModel = function(event) {
      
      let proceed = true;
      
      if (ps.model!=null && ps.model.edited()==true) {
        
        proceed = window.confirm('You\'re loading a new spritesheet model.  Any changes made to the current spritesheet model will be lost.  Do you want to proceed?');
      }
      
      if (!proceed) {
        
          event.preventDefault();
      }
    }
    
    let loadModel = function(event) {
      
      var imageURL = document.getElementById('loadSpsModelInput').value;
      var pathElements = imageURL.split('\\');
      var filename = 'Models\\' + pathElements[pathElements.length - 1];
      
      var rawFile = new XMLHttpRequest();
      
      rawFile.open("GET", filename, true);
      rawFile.responseType = "text";
      rawFile.onload = function() {
        
        loadModelCompleted(rawFile.responseText);
      };
      
      rawFile.send();
      
      return false; // Once async load started, don't let the anchor link to anywhere
    }
    
    let loadModelCompleted = function(jsonString) {
    
      var loadModel = JSON.parse(jsonString);
      console.log(loadModel);
      
      // Rebuild model
      loadModel.spriteImage = null;
      ps.model = Forge.Model.SpriteSheetModel(loadModel);
      
      // Extract filename and load image.  Pass 'false' to loadImage clearProperties flag since we're not loading a new image to replace an existing one - we want to keep the properties we've just loaded.
      let filename = 'Assets\\Images\\' + loadModel.imageFilename;
      
      ps.model.loadImage(filename, function() {
        
        $('#spsImageURILabel').html(loadModel.imageFilename);
        enableElements();

      }, false);
      
      
      // Update UI
      
      $('#spsKeyField').val(loadModel.uniqueIdentifier);
      
      updateStatusUI();
      rebuildSequenceListUI(loadModel.sequences);
      enableElements();
    }
    
    let saveSpriteSheet = function(event) {
      
      console.log('save');
      
      let filename = prompt('Enter the name of the file to save', '');
      
      if (filename!==undefined && filename!=null && filename!='') {
        
        filename += '.forge.sps.json';
        
        // Build model to save
        
        let imageURL = ps.model.spriteImage().src();
        let pathElements = imageURL.split('/');
        let imageFilename = pathElements[pathElements.length - 1];
      
        let saveModel = {
          
          uniqueIdentifier : ps.model.uniqueIdentifier(),
          imageFilename : imageFilename,
          frameWidth : ps.model.frameWidth(),
          frameHeight : ps.model.frameHeight(),
          fps : ps.model.fps(),
          rows : ps.model.rows(),
          cols : ps.model.cols(),
          sequences : ps.model.sequences()
        };
        
        let dataString = JSON.stringify(saveModel);
        
        let a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(dataString));
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        ps.model.edited(false);
        enableElements();
        
        // Return true to allow anchor to proceed with link to url
        return false;
      }
    }
    
    let deleteSpriteSheet = function(event) {
      
      console.log('delete');
    }
    
    let exportSpriteSheet = function(event) {
      
      console.log('export');
      
      let filename = prompt('Export spritesheet to script file');
      
      if (filename != null) {
        
        filename += '.js';
        
        // Build export string
        
        // Module header
        let exportString = 'Game.Animation = (function(module) {' + '\n\n';
        
        // Animation objects
        exportString += '\t' + 'module.spritesheet = (module.spritesheet || {});' + '\n';
        exportString += '\t' + 'module.sequence = (module.sequence || {});' + '\n';
        exportString += '\n\n\n';

        
        // Spritesheet model
        exportString += '\t' + 'module.spritesheet[\'' + ps.model.uniqueIdentifier() + '\'] = Game.Graphics.SpriteSheet({' + '\n\n';
        
        let imageURL = ps.model.spriteImage().src();
        let pathElements = imageURL.split('/');
        let imageFilename = pathElements[pathElements.length - 1];
        
        exportString += '\t\t' + 'imageURL : \'Assets/Images/' + imageFilename + '\',' + '\n';
        exportString += '\t\t' + 'frameWidth : ' + ps.model.frameWidth() + ',' + '\n';
        exportString += '\t\t' + 'frameHeight : ' + ps.model.frameHeight() + ',' + '\n';
        exportString += '\t\t' + 'framesPerSecond : ' + ps.model.fps() + '\n';
        
        exportString += '\t' + '});' + '\n\n\n';
        
        
        // Sequences
        let sequences = ps.model.sequences();
        
        for (let i=0; i<sequences.length; ++i) {
          
          let seq = sequences[i];
          
          exportString += '\t' + 'module.sequence[\'' + seq.targetObject + '\'] = (module.sequence[\'' + seq.targetObject + '\'] || {});' + '\n';
          
          exportString += '\t' + 'module.sequence[\'' + seq.targetObject + '\'][\'' + seq.sequenceName + '\'] = Game.Graphics.AnimationSequence({' + '\n\n';
          
          exportString += '\t\t' + 'spriteSheet : module.spritesheet[\'' + ps.model.uniqueIdentifier() + '\'],' + '\n';
          exportString += '\t\t' + 'startFrame : ' + seq.startFrame + ',' + '\n';
          exportString += '\t\t' + 'endFrame : ' + seq.endFrame + ',' + '\n';
          exportString += '\t\t' + 'oscillate : ' + seq.oscillate + ',' + '\n';
          exportString += '\t\t' + 'flipHorizontal : ' + seq.flipHorizontal + ',' + '\n';
          exportString += '\t\t' + 'flipVertical : ' + seq.flipVertical + '\n';
          
          exportString += '\t' + '});' + '\n\n';
        }
        
        // Module footer
        exportString += '\t' + 'return module;' + '\n\n';
        exportString += '})((Game.Animation || {}));';
        
        let blob = new Blob([exportString], { type : 'text/plain;charset=utf-8' } );
        let url = URL.createObjectURL(blob, { oneTimeOnly : true } );
        
        let a = event.currentTarget;  
        a.download = filename;
        a.href = url;
        
        // Return true to allow anchor to proceed with link to url
        return true;
      }
    }
    
    let preloadImage = function(event) {
      
      var proceed = true;
      
      if (ps.model.hasImageDependentData()) {
        
        proceed = window.confirm('You\'re loading a new spritesheet image.  The existing image and any associated animation sequences will be lost.  Do you want to proceed?');
      }
      
      if (!proceed) {
        
          event.preventDefault();
      }
    }
    
    let loadImage = function(event) {
      
      let imageURL = $('#loadSpsImageInput').val();
      let pathElements = imageURL.split('\\');
      let filename = 'Assets\\Images\\' + pathElements[pathElements.length - 1];
      
      ps.model.loadImage(filename, function() {
        
        $('#spsImageURILabel').html(pathElements[pathElements.length - 1]);
        
        updateStatusUI();
        clearSequenceListUI();
        enableElements();
      });
    }
    
    let updateSpriteSheetIdentifier = function(event) {
      
      ps.model.uniqueIdentifier($('#spsKeyField').val());
      
      enableElements();
    }
    
    // -------------------------------------------
    
    
    //
    // Spritesheet config dialog
    //
    
    // Setup config dialog when opened
    let initConfigSpritesheet = function(event) {
      
      $('#configFrameWidthField').val(ps.model.frameWidth());
      $('#configFrameHeightField').val(ps.model.frameHeight());
      $('#configFPSField').val(ps.model.fps());
      
      setConfigFrameWidthCSS();
      setConfigFrameHeightCSS();
      setConfigFPSCSS();
      
      validateConfigOkayButton();
    }

    // Store new config data and update UI
    let applyConfigSpritesheet = function(event) {
      
      ps.model.frameWidth($('#configFrameWidthField').val());
      ps.model.frameHeight($('#configFrameHeightField').val());
      ps.model.fps( $('#configFPSField').val());
      
      ps.model.removeAllSequences();
            
      updateStatusUI();
      clearSequenceListUI();
      enableElements();
    }
    
    // isValidFrameWidth returns true if the given width value >=2 (the minimum frame size) and even divides into the main spritesheet width.
    let isValidFrameWidth = function(frameWidth) {
      
      return (frameWidth >= 2 && fract(ps.model.spriteImage().width() / frameWidth)==0);
    }
    
    let isValidFrameHeight = function(frameHeight) {
      
      return (frameHeight >= 2 && fract(ps.model.spriteImage().height() / frameHeight)==0);
    }
    
    let isValidSpritesheetFPS = function(value) {
      
      return (value >= 1);
    }
    
    let setConfigFrameWidthCSS = function() {
      
      if (isValidFrameWidth($('#configFrameWidthField').val())) {
        
        $('#configFrameWidthField').css('color', 'black');
      }
      else {
        
        $('#configFrameWidthField').css('color', 'red');
      }
    }
    
    let setConfigFrameHeightCSS = function() {
      
      if (isValidFrameHeight($('#configFrameHeightField').val())) {
        
        $('#configFrameHeightField').css('color', 'black');
      }
      else {
        
        $('#configFrameHeightField').css('color', 'red');
      }
    }
    
    let setConfigFPSCSS = function() {
      
      if (isValidSpritesheetFPS($('#configFPSField').val())) {
        
        $('#configFPSField').css('color', 'black');
      }
      else {
        
        $('#configFPSField').css('color', 'red');
      }
    }
    
    let validateFrameWidth = function() {
      
      setConfigFrameWidthCSS();
      validateConfigOkayButton();
    }
    
    let validateFrameHeight = function() {
      
      setConfigFrameHeightCSS();
      validateConfigOkayButton();
    }
    
    let validateSpritesheetFPS = function() {
      
      setConfigFPSCSS();
      validateConfigOkayButton();
    }
    
    let validateConfigOkayButton = function() {
            
      if (isValidFrameWidth($('#configFrameWidthField').val()) &&
          isValidFrameHeight($('#configFrameHeightField').val()) &&
          isValidSpritesheetFPS($('#configFPSField').val())) {
        
        $('#configDialogOkayButton').attr('class', 'btn btn-primary');
        $('#configDialogOkayButton').prop('disabled', false);
      }
      else {
        
        $('#configDialogOkayButton').attr('class', 'btn btn-primary disabled');
        $('#configDialogOkayButton').prop('disabled', true);
      }
    }
    
    
    // -------------------------------------------
    
    //
    // New sequence dialog
    //
    
    let deleteAnimationSequence = function(event) {
      
      let id = event.target.value;
      let i = ps.model.getIndexForGuiId(id);
      
      console.log('delete ' + id + ' at index ' + i);
      
      if (i==-1) {
        
        console.log('index error');
      }
      else {
      
        // Remove from sequence array and UI
        ps.model.deleteSequence(i);
        document.getElementById(id).remove();
      }
    }
    
    let initNewSequenceDialog = function(event) {
      
      $('#seqObjectIdField').val('');
      $('#seqNameField').val('');
      $('#seqStartFrameField').val(0);
      $('#seqEndFrameField').val(0);
      $('#seqOscillateFlag').prop('checked', false);
      $('#seqFlipHorizFlag').prop('checked', false);
      $('#seqFlipVerticalFlag').prop('checked', false);
    }
    
    let buildSequenceListElement = function(seq) {
    
      let listElement = document.createElement('li');
      listElement.setAttribute('class', 'list-group-item');
      listElement.setAttribute('id', seq.guiListID);
      
      let rowElement = document.createElement('div');
      rowElement.setAttribute('class', 'row fg');
      
      
      let colElement1 = document.createElement('div');
      colElement1.setAttribute('class', 'col-sm-10');
      
      let label = document.createElement('label');
      let textNode = document.createTextNode(seq.targetObject + '.' + seq.sequenceName + ' : ' + seq.startFrame + '->' + seq.endFrame);
      label.appendChild(textNode);
      
      
      let colElement2 = document.createElement('div');
      colElement2.setAttribute('class', 'col-sm-2');
      
      let buttonElement = document.createElement('button');
      buttonElement.setAttribute('type', 'button');
      buttonElement.setAttribute('class', 'btn btn-default btn-sm');
      buttonElement.setAttribute('id', 'delseq' + ps.seqCounter);
      buttonElement.setAttribute('value', seq.guiListID);
      buttonElement.addEventListener('click', deleteAnimationSequence);
      
      let spanElement = document.createElement('span');
      spanElement.setAttribute('class', 'glyphicon glyphicon-trash');
      spanElement.setAttribute('aria-hidden', 'true');

      
      // Build element tree (bottom-up)
      colElement1.appendChild(label);
      
      buttonElement.appendChild(spanElement);
      colElement2.appendChild(buttonElement);
      
      rowElement.appendChild(colElement1);
      rowElement.appendChild(colElement2);
      
      listElement.appendChild(rowElement);
      
      document.getElementById('sequenceList').appendChild(listElement);
    }
    
    let createNewSequence = function(event) {
      
      let seq = {
        
        guiListID : 'seq' + ps.seqCounter, // links element to UI list entry
        targetObject : $('#seqObjectIdField').val(),
        sequenceName : $('#seqNameField').val(),
        startFrame : $('#seqStartFrameField').val(),
        endFrame : $('#seqEndFrameField').val(),
        oscillate : $('#seqOscillateFlag').prop('checked'),
        flipHorizontal : $('#seqFlipHorizFlag').prop('checked'),
        flipVertical : $('#seqFlipVerticalFlag').prop('checked')
      }
      
      ps.model.addNewSequence(seq);
      
      buildSequenceListElement(seq);
      ps.seqCounter++; // Increase monotonically - should be okay wrt number ranges we're working with (unlikely to get overflow)
      
      enableElements();
    }
    
    let rebuildSequenceListUI = function(sequences) {
      
      clearSequenceListUI();
      
      // Reset seqCounter and associated GUI ids - ensure consistency for current UI
      ps.seqCounter = 0;
      
      for (let i=0; i<sequences.length; ++i) {
        
        let seq = sequences[i];
        
        seq.guiListID = 'seq' + ps.seqCounter;
        
        buildSequenceListElement(seq);
        ps.seqCounter++; // Increase monotonically - should be okay wrt number ranges we're working with (unlikely to get overflow)
      }
    }
    
    
    // -------------------------------------------


    
    // States implemented by Editor
    
    // Init is called when the editor state is entered.  Init is part of the public interface since called by the host webpage and other states
    let init = function() {
      
      console.log('Editor.init');
      
      if (ps.bootstrapEditor) {
        
        // Setup event handlers for UI that do not change between stages
        $('#navNew').click(newSpriteSheet);
        $('#navSave').click(saveSpriteSheet);
        $('#navDelete').click(deleteSpriteSheet);
        $('#navExport').click(exportSpriteSheet);
        
        $('#loadSpsModelInput').click(preloadModel);
        $('#loadSpsModelInput').change(loadModel);
        
        $('#loadSpsImageInput').click(preloadImage);
        $('#loadSpsImageInput').change(loadImage);
        
        $('#spsKeyField').change(updateSpriteSheetIdentifier);
        
        $('#spsConfigButton').click(initConfigSpritesheet);
        $('#configDialogOkayButton').click(applyConfigSpritesheet);
        $('#configFrameWidthField')[0].oninput = validateFrameWidth;
        $('#configFrameHeightField')[0].oninput = validateFrameHeight;
        $('#configFPSField')[0].oninput = validateSpritesheetFPS;
        
        $('#newSequenceButton').click(initNewSequenceDialog);
        $('#sequenceDialogOkayButton').click(createNewSequence);
        
        ps.bootstrapEditor = false;
      }
      
      // Setup stage-specific event handlers
      $(window).resize(windowResizeHandler);
      
      // Since the editor is the only stage, setup additional resources usually shared between stages
      
      enableElements();
      
      resizeCanvas();
      
      window.requestAnimationFrame(mainLoop.bind(self));
    }
    
    
    // Other states are private - only mainLoop is required since we don't transition to other states in the spritesheet tool
    let mainLoop = function() {
      
      // Redraw canvas elements (including playing animations)
      drawCanvas();
      
      window.requestAnimationFrame(mainLoop.bind(self));
    }
    

    
    // Public interface
    
    // Accessor methods
    let get_model = function() { return ps.model; }
    
    self.init = init;
    self.get_model = get_model;
    
    return self;
  }

  return lib;
  
})((Forge.Stages || {}), Forge.canvas, Forge.context);
