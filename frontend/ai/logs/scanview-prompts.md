# ScanView.vue - QR Scanning & 3D Artifact Viewing

**Update Date**: 2026-04-15
**Component**: ScanView.vue
**Status**: Completed

## Prompt

```
Create a Vue 3 component for scanning artifacts and viewing 3D models:

1. QR Code Scanner
   - Use qr-scanner library for camera-based QR detection
   - Handle camera permission requests gracefully
   - Show error states: camera not supported, permission denied, scan failures
   - Support front/back camera toggle
   - Mirror video preview option


2. 3D Model Viewer
   - Use @google/model-viewer web component
   - Support model rotation, zoom, and pan gestures
   - Show loading state while model loads
   - Display error fallback if model fails to load
   - Include model rotate badge icon indicator

3. State Management
   - Inject museum store for scanArtifact function
   - Track selected artifact ID
   - Manage chat session state (messages, sessionId, artifactId)

Use Vue 3 Composition API with <script setup>.
```

## Output Summary

Generated ScanView.vue with:
- Camera-based QR scanner with comprehensive error handling
- Interactive 3D model viewer using google-model-viewer
- Voice readout option for artifact stories

## Modifications

1. Added cameraEpoch token to handle fast tab switches and prevent stale getUserMedia calls
2. Implemented proper cleanup in onUnmounted to stop camera stream
3. Added voice synthesis for story reading with voice picker
4. Fixed mirror video CSS transform issue
5. Added debounced scroll handling for chat