/**
 * Face Detection Utility using face-api.js
 * 
 * This module handles loading the face-api.js models and providing
 * face detection/descriptor extraction functions.
 * 
 * Models must be placed in /public/models/ directory.
 * Required model files (download from face-api.js repo):
 * - tiny_face_detector_model-weights_manifest.json + shard files
 * - face_landmark_68_model-weights_manifest.json + shard files
 * - face_recognition_model-weights_manifest.json + shard files
 */

let faceApiLoaded = false;
let faceApi: typeof import('face-api.js') | null = null;

export const loadFaceApi = async (): Promise<boolean> => {
  if (faceApiLoaded && faceApi) return true;

  try {
    faceApi = await import('face-api.js');
    const MODEL_URL = '/models';

    await Promise.all([
      faceApi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceApi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    faceApiLoaded = true;
    console.log('✅ face-api.js models loaded successfully.');
    return true;
  } catch (err) {
    console.warn('⚠️ face-api.js models could not be loaded. Face verification will be skipped.', err);
    faceApiLoaded = false;
    return false;
  }
};

export const detectFaceFromVideo = async (
  videoElement: HTMLVideoElement
): Promise<{ detected: boolean; descriptor?: Float32Array; box?: any }> => {
  if (!faceApi || !faceApiLoaded) {
    return { detected: false };
  }

  try {
    const detection = await faceApi
      .detectSingleFace(videoElement, new faceApi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      return {
        detected: true,
        descriptor: detection.descriptor,
        box: detection.detection.box
      };
    }
    return { detected: false };
  } catch (err) {
    console.error('Face detection error:', err);
    return { detected: false };
  }
};

export const compareFaceDescriptors = (
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold: number = 0.6
): { match: boolean; distance: number } => {
  if (!faceApi) return { match: false, distance: 1.0 };

  const distance = faceApi.euclideanDistance(descriptor1, descriptor2);
  return {
    match: distance < threshold,
    distance
  };
};

export const isFaceApiReady = () => faceApiLoaded;
