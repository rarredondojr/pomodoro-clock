/**Dependencies: https://www.npmjs.com/package/accurate-interval - Allows for more accurate Intervals */
import React, { Component } from 'react';
import './App.css';
var accurateInterval = require('accurate-interval');
class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      sessionLength:25,
      breakLength:5,
      timeLeft:1500,
      breakLeft:300,
      mode:"Stopped",
      interval:'',
      timerColor:{color: '#99cc00'}
    }
    this.start_stopSession = this.start_stopSession.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.sec2human = this.sec2human.bind(this);
    this.handleSessionLength = this.handleSessionLength.bind(this);
    this.handleBreakLength = this.handleBreakLength.bind(this);
    this.handleMode = this.handleMode.bind(this);
    this.decrementBreakTime = this.decrementBreakTime.bind(this);
    this.continueBreak = this.continueBreak.bind(this);
    this.decrementSessionTime = this.decrementSessionTime.bind(this);
    this.continueSession = this.continueSession.bind(this);
  }

  
  sec2human(timer) {
    let minutes = Math.floor(timer / 60);
    let seconds = timer - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return minutes + ':' + seconds;
  }

  handleSessionLength(operation){
    if(this.state.mode =="Stopped")
      switch(operation){
        case "add":
        if(this.state.sessionLength < 60)
          this.setState({ timeLeft:(this.state.sessionLength + 1)*60,sessionLength:this.state.sessionLength + 1})
        break;
        case "sub":
          if(this.state.sessionLength > 1)
            this.setState({ timeLeft:(this.state.sessionLength - 1)*60,sessionLength:this.state.sessionLength - 1})
          break;
        default:
          break;
      }
   
  }

  handleBreakLength(operation){
    if(this.state.mode == "Stopped")
      switch(operation){
        case "add":
          if(this.state.breakLength < 60)
            this.setState({ breakLength:this.state.breakLength + 1})
          break;
        case "sub":
          if(this.state.breakLength > 1)
            this.setState({ breakLength:this.state.breakLength - 1})
          break;
        default:
      }
  }

  handleReset(){
    this.setState({
      sessionLength:25,
      breakLength:5,
      timeLeft:1500,
      breakLeft:300,
      mode:"Stopped",
      interval:'',
      timerColor:{color: '#99cc00'}
    })
    this.state.interval && this.state.interval.clear();
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }

  handleMode(){
    if(this.state.timeLeft < 0 && this.state.mode == "Session"){
      this.audioBeep.play();
      this.state.interval.clear();
      this.setState({
        mode:"Break",
        breakLeft:this.state.breakLength * 60,
        timerColor : {color: '#dc3545'}
      })
      this.continueBreak()
    }
    else if(this.state.breakLeft < 0 && this.state.mode == "Break"){
      this.audioBeep.play();
      this.state.interval.clear();
      this.setState({
        mode:"Session",
        timeLeft:this.state.sessionLength * 60,
        timerColor : {color: '#99cc00'}
      })
      this.continueSession()
    }
  }

  decrementBreakTime(){
    this.setState({breakLeft:this.state.breakLeft - 1});
  }

  continueBreak(){
    this.setState({
      interval: accurateInterval(() => {
        this.decrementBreakTime();
        this.handleMode();
    }, 1000)
   })
  }

  decrementSessionTime(){
    this.setState({timeLeft:this.state.timeLeft - 1});
  }
  continueSession(){
    this.setState({
        interval: accurateInterval(() => {
          this.decrementSessionTime();
          this.handleMode();
        }, 1000)
    });
  }
  
  start_stopSession(){
    if(this.state.mode == "Stopped"){
      this.setState({ mode:"Session",timeLeft:this.state.sessionLength*60,breakLeft:this.state.breakLeft*60})
      this.continueSession()
    }
    else if(this.state.mode == "Session Pause"){
      this.setState({ mode:"Session"});
      this.continueSession();
    }
    else if(this.state.mode == "Session"){
      this.state.interval.clear();
      this.setState({ mode:"Session Pause"})
    }
    else if(this.state.mode == "Break Pause"){
      this.setState({ mode:"Break"});
      this.continueBreak();
    }
    else if(this.state.mode == "Break"){
      this.state.interval.clear();
      this.setState({ mode:"Break Pause"})
    }
 
  }
  render() {
    return (
      <div className="App">
        <div className="container" id="pomodoro">
          <audio id="beep" preload="auto" src="https://instaud.io/_/2GSK.mp3" ref={(audio) => { this.audioBeep = audio; }}/>
          <div className="row">
            <div class="col-sm-6">
              <div id="break-container">
                <h2  id="break-label" class="text-center">Break Length</h2>
                <span id="break-decrement" class="modify" onClick={() => this.handleBreakLength("sub")}><i class="fa fa-chevron-circle-down fa-3x" aria-hidden="true"></i></span>
                <span id="break-length" class="amount text-center">{this.state.breakLength}</span>
                <span id="break-increment" class="modify" onClick={() =>this.handleBreakLength("add")}><i class="fa fa-chevron-circle-up fa-3x" aria-hidden="true"></i></span>
              </div>
            </div>
            <div class="col-sm-6">
              
              <div id="session-container">
                <h2  id="session-label" class="text-center">Session Length</h2>
                <span id="session-decrement" class="modify" onClick={() =>this.handleSessionLength("sub")}><i class="fa fa-chevron-circle-down fa-3x" aria-hidden="true"></i></span>
                <span id="session-length" class="amount text-center">{this.state.sessionLength}</span>
                <span id="session-increment" class="modify" onClick={() =>this.handleSessionLength("add")}><i class="fa fa-chevron-circle-up fa-3x"></i></span>
              </div>
            </div>
          </div>
          <div className="row">
            <div id="session-container">
              <div id="timer-label" class="text-center">{this.state.mode}</div>
              <div id="time-left" style={this.state.timerColor} class="text-center">{(this.state.mode == "Session" || this.state.mode == "Stopped" || this.state.mode =="Session Pause") ? this.sec2human(this.state.timeLeft) : this.sec2human(this.state.breakLeft) }</div>
            </div>
          </div>
          <div className="row">
            <div id="controls-container">
              <div id="start_stop" class="text-center" onClick={this.start_stopSession}>Play</div>
              <div id="start_stop" class="text-center" onClick={this.start_stopSession}>Pause</div>
              <div id="reset" class="text-center" onClick={this.handleReset}>Reset</div>
            </div>        
          </div>
          <div className="row">
             <div id="author" class="text-center">Built with React by Ramon Arredondo</div>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
