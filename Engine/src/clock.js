
'use strict';

// In-game clock

/*

Notes on dealing with long time delta values...

Clock update

Get time delta

If > threshold then don't update frame (since physics likely to go wrong)


Options:

1) Pass tick() a threshold value - if time delta > threshold then don't update clock (this tick is 'void' and everything is lost)

Pros : Easy and clock + game time remain consistent
Cons : Frames-per-second tracking loses this, so no longer accurate reflection.  *** A time lost like this needs to be reflected ***


2) tick() as normal and just ignore frame if time delta > threshold

Pros : frames-per-second tracked
Cons : Game-time and actual on-screen game activity no-longer tally.  Not ideal if we want to have an accurate track.


3) Introduce a 'void time' counter in additon to stop time.  When we call tick(), if the clock is not stopped we calculate time updates and frames-per-second as normal, but if the time delta > given threshold, we add this to a 'void time' counter.  Now, when game time is elapsed, we factor in void time so game time and on-screen activity correspond correctly.

Pros: keep clock tracking and frames per second tracking as normal, and game-time is reported accurately

Cons: ???

*/

Game = (function(module) {
  
  let FrameCounter = function() {

    this.frame = 0;
    this.fpsRefTimeIndex = 0;
    this.fpsCounts = 0;
    
    this.framesPerSecond = 0;
    this.minFPS = 0;
    this.maxFPS = 0;
    this.averageFPS = 0;
    
    this.secondsPerFrame = 0;
    this.minSPF = 0;
    this.maxSPF = 0;
    this.averageSPF = 0;
    
    this.resetCounter = function() {
    
      this.frame = 0;
      this.fpsRefTimeIndex = 0;
      this.fpsCounts = 0;
      
      this.framesPerSecond = 0, this.minFPS = 0, this.maxFPS = 0, this.averageFPS = 0;
      this.secondsPerFrame = 0, this.minSPF = 0, this.maxSPF = 0, this.averageSPF = 0;
    }
    
    this.updateFrameCounterForElapsedTime = function(gameTimeElapsed) {
    
      this.frame = this.frame + 1;
      
      var time_delta = gameTimeElapsed - this.fpsRefTimeIndex;
      
      if (time_delta >= 1.0) {
      
        this.framesPerSecond = this.frame / time_delta;
        this.secondsPerFrame = 1 / this.framesPerSecond;
        
        if (this.fpsCounts==0) {
        
          this.minFPS = this.framesPerSecond;
          this.maxFPS = this.framesPerSecond;
          this.averageFPS = this.framesPerSecond;
          
          this.minSPF = this.secondsPerFrame;
          this.maxSPF = this.secondsPerFrame;
          this.averageSPF = this.secondsPerFrame;
        }
        else {
        
          // Update min, max and average frames-per-second
          if (this.framesPerSecond < this.minFPS) {
          
            this.minFPS = this.framesPerSecond;
          }
          else if (this.framesPerSecond > this.maxFPS) {
          
            this.maxFPS = this.framesPerSecond;
          }
          
          this.averageFPS = this.averageFPS + this.framesPerSecond;
          
          // Update min, max and average seconds-per-frame
          if (this.secondsPerFrame < this.minSPF) {
          
            this.minSPF = this.secondsPerFrame;
          }
          else if (this.secondsPerFrame > this.maxSPF) {
          
            this.maxSPF = this.secondsPerFrame;
          }
          
          this.averageSPF = this.averageSPF + this.secondsPerFrame;
        }
        
        this.frame = 0;
        this.fpsRefTimeIndex = gameTimeElapsed;
        this.fpsCounts = this.fpsCounts + 1;
      }
    }
    
    this.calcAverageFPS = function() {
    
      return this.averageFPS / this.fpsCounts;
    }
    
    this.calcAverageSPF = function() {
    
      return this.averageSPF / this.fpsCounts;
    }
  }
  
  
  module.Clock = function(params={ performanceFreq : 1000 }) {
  
    self = {};
    
    let tIndex = window.performance.now();
    
    // Private state
    let ps = {
      
      performanceFreq : params.performanceFreq,
      timeRecip : 1 / params.performanceFreq,
      baseTime : tIndex,
      prevTimeIndex : tIndex,
      currentTimeIndex : 0,
      deltaTime : 0,
      stopTimeIndex : 0,
      totalStopTime : 0,
      clockStopped : false,
      voidTime : 0, // Tracks time intervals for frames the client will ignore (for whatever reason)
      frameCounter : (new FrameCounter())
    };
    
    // Private API
    
    let actualTime = function() {
      
      return window.performance.now();
    }
    
    let convertTimeIntervalToSeconds = function(t) {
    
      return t * ps.timeRecip;
    }
    
    let resetClockAttributes = function() {
    
      ps.baseTime = actualTime();
      ps.prevTimeIndex = ps.baseTime;
      ps.deltaTime = 0;
      ps.stopTimeIndex = 0;
      ps.totalStopTime = 0;
      ps.clockStopped = false;
      ps.voidTime = 0;
      ps.frameCounter = new FrameCounter();
    }
        
    let start = function() {
    
      if (ps.clockStopped) {
      
        let restartTimeIndex = actualTime();
        
        ps.totalStopTime = ps.totalStopTime + (restartTimeIndex - ps.stopTimeIndex);
        ps.prevTimeIndex = restartTimeIndex;
        ps.clockStopped = false;
      }
    }
    
    let stop = function() {
    
      if (!ps.clockStopped) {
      
        ps.stopTimeIndex = actualTime();
        ps.clockStopped = true;
      }
    }
    
    // Update the clock and frames-per-second counter.  voidFrameThreshold is passed in from the client to tell the clock what time delta threshold is the largest before the host client will ignore the frame (for stability purposes).  If defined, deltaTime is checked against this and 'void time' is increased accordingly and deltaTime is set to -deltaTime to indicate a 'void' tick has occurred.  If not defined, 'void time' is ignored.
    let tick = function(voidFrameThreshold) {
    
      if (ps.clockStopped) {
      
        ps.deltaTime = 0;
      }
      else {
      
        ps.currentTimeIndex = actualTime();
        ps.deltaTime = ps.currentTimeIndex - ps.prevTimeIndex;
        ps.prevTimeIndex = ps.currentTimeIndex;
        
        if (ps.frameCounter) {
        
          // Update frames-per-second counter for actual time elapsed
          let t = (ps.currentTimeIndex - ps.baseTime) - ps.totalStopTime;
          ps.frameCounter.updateFrameCounterForElapsedTime(convertTimeIntervalToSeconds(t));
        }
        
        // Calculate against void frame threshold
        if (voidFrameThreshold && ps.deltaTime >= voidFrameThreshold) {
          
          ps.voidTime += ps.deltaTime;
          
          // Return -deltaTime to indicate a 'void' frame has occured wrt. voidFrameThreshold
          ps.deltaTime = -ps.deltaTime;
        }
      }
      
      return ps.deltaTime;
    }
    
    let reset = function() {
    
      resetClockAttributes();
      
      if (ps.frameCounter) {
      
        ps.frameCounter.resetCounter();
      }
    }
    
    let actualTimeElapsed = function() {
    
      return convertTimeIntervalToSeconds(actualTime() - ps.baseTime);
    }
    
    let gameTimeElapsed = function() {
    
      let t = (((ps.clockStopped) ? ps.stopTimeIndex : actualTime()) - ps.baseTime) - ps.totalStopTime - ps.voidTime;
      return convertTimeIntervalToSeconds(t);
    }
    
    let deltaTime = function() {
      
      return ps.deltaTime;
    }
    
    // Don't expose frameCounter directly, but provude accessor methods for its properties
    let averageFPS = function() {
      
      return ps.frameCounter.calcAverageFPS();
    }
    
    let averageSPF = function() {
      
      return ps.frameCounter.calcAverageSPF();
    }
    
    // Public interface
    self.actualTime = actualTime;
    self.convertTimeIntervalToSeconds = convertTimeIntervalToSeconds;
    self.start = start;
    self.stop = stop;
    self.tick = tick;
    self.reset = reset;
    self.actualTimeElapsed = actualTimeElapsed;
    self.gameTimeElapsed = gameTimeElapsed;
    self.deltaTime = deltaTime;
    self.averageFPS = averageFPS;
    self.averageSPF = averageSPF;
    
    return self;
  }
  
  
  return module;
  
})((window.Game || {}));