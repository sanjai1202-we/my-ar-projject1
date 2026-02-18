// Camera Module for AR Project
// Handles camera access, permissions, and stream management

class CameraModule {
  constructor(options = {}) {
    this.stream = null;
    this.isActive = false;
    this.constraints = options.constraints || {
      video: {
        facingMode: options.facingMode || 'environment',
        width: { ideal: options.width || 1280 },
        height: { ideal: options.height || 720 }
      },
      audio: false
    };
    this.errorCallback = options.onError || null;
    this.successCallback = options.onSuccess || null;
  }

  // Request camera access
  async requestAccess() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      this.isActive = true;
      
      if (this.successCallback) {
        this.successCallback(this.stream);
      }
      
      console.log('✓ Camera access granted');
      return this.stream;
    } catch (error) {
      this.isActive = false;
      console.error('✗ Camera access denied:', error.message);
      
      if (this.errorCallback) {
        this.errorCallback(error);
      }
      
      throw error;
    }
  }

  // Stop camera stream
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.isActive = false;
      console.log('✓ Camera stopped');
    }
  }

  // Check if camera is currently active
  getStatus() {
    return {
      isActive: this.isActive,
      stream: this.stream,
      constraints: this.constraints
    };
  }

  // Switch camera (front/back)
  async switchCamera(facingMode = 'user') {
    this.stopCamera();
    this.constraints.video.facingMode = facingMode;
    return await this.requestAccess();
  }

  // Attach stream to video element
  attachToVideo(videoElement) {
    if (videoElement && this.stream) {
      videoElement.srcObject = this.stream;
      console.log('✓ Stream attached to video element');
      return true;
    }
    console.error('✗ Unable to attach stream - video element or stream missing');
    return false;
  }
}

// Export for use in HTML
window.CameraModule = CameraModule;