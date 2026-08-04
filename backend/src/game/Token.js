class Token {
  constructor(id, color) {
    this.id = id;
    this.color = color;
    this.position = -1; // -1 = in base
    this.isActive = false;
    this.isFinished = false;
    this.stepsToHome = null;
  }

  reset() {
    this.position = -1;
    this.isActive = false;
    this.isFinished = false;
    this.stepsToHome = null;
  }

  getPosition() {
    return this.position;
  }

  isInBase() {
    return this.position === -1;
  }

  isOnPath() {
    return this.position >= 0 && this.position < 52;
  }

  isInHomeColumn() {
    return this.position >= 52 && this.position < 57;
  }

  isAtHome() {
    return this.isFinished;
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      isActive: this.isActive,
      isFinished: this.isFinished
    };
  }
}

export default Token;
