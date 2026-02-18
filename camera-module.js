/**
 * Camera Module for AR Application
 * Handles camera access, permissions, and status management
 */

const CameraModule = {
  // Camera stream object
  stream: null,
  
  // Camera status
  isActive: false,
  
  /**
   * Initialize camera access
   * Requests user permission and accesses the device camera
   */
  initializeCamera: async function() {
    try {
      console.log('Initializing camera...');
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported by this browser');
      }
      
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      this.isActive = true;
      console.log('Camera initialized successfully');
      this.logCameraStatus('Camera ready');
      
      return this.stream;
      
    } catch (error) {
      this.isActive = false;
      console.error('Camera initialization error:', error);
      this.logCameraStatus('Camera access denied or unavailable');
      throw error;
    }
  },
  
  /**
   * Stop camera stream
   */
  stopCamera: function() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.isActive = false;
      console.log('Camera stopped');
      this.logCameraStatus('Camera stopped');
    }
  },
  
  /**
   * Get camera status
   */
  getCameraStatus: function() {
    return {
      isActive: this.isActive,
      hasStream: this.stream !== null
    };
  },
  
  /**
   * Log camera status to console and UI
   */
  logCameraStatus: function(message) {
    const timestamp = new Date().toLocaleTimeString();
    const statusMessage = `[${timestamp}] ${message}`;
    console.log(statusMessage);
    
    // Optional: Display status in UI
    if (window.statusElement) {
      window.statusElement.textContent = statusMessage;
    }
  },
  
  /**
   * Check device camera compatibility
   */
  isCompatible: function() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
};

// Export for global use
window.CameraModule = CameraModule;