import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Prayer data with all components
const PRAYERS = {
  fajr: {
    name: 'Fajr',
    arabic: 'الفجر',
    components: [
      { type: 'Sunnah', rakats: 2, color: '#4CAF50' },
      { type: 'Farz', rakats: 2, color: '#2196F3' }
    ]
  },
  dhuhr: {
    name: 'Dhuhr',
    arabic: 'الظهر',
    components: [
      { type: 'Sunnah', rakats: 4, color: '#4CAF50' },
      { type: 'Farz', rakats: 4, color: '#2196F3' },
      { type: 'Sunnah', rakats: 2, color: '#4CAF50' },
      { type: 'Nafl', rakats: 2, color: '#9C27B0' }
    ]
  },
  asr: {
    name: 'Asr',
    arabic: 'العصر',
    components: [
      { type: 'Sunnah', rakats: 4, color: '#4CAF50' },
      { type: 'Farz', rakats: 4, color: '#2196F3' }
    ]
  },
  maghrib: {
    name: 'Maghrib',
    arabic: 'المغرب',
    components: [
      { type: 'Farz', rakats: 3, color: '#2196F3' },
      { type: 'Sunnah', rakats: 2, color: '#4CAF50' },
      { type: 'Nafl', rakats: 2, color: '#9C27B0' }
    ]
  },
  isha: {
    name: 'Isha',
    arabic: 'العشاء',
    components: [
      { type: 'Sunnah', rakats: 4, color: '#4CAF50' },
      { type: 'Farz', rakats: 4, color: '#2196F3' },
      { type: 'Sunnah', rakats: 2, color: '#4CAF50' },
      { type: 'Witr', rakats: 3, color: '#FF9800' },
      { type: 'Nafl', rakats: 2, color: '#9C27B0' }
    ]
  },
  jummah: {
    name: 'Jummah',
    arabic: 'الجمعة',
    components: [
      { type: 'Sunnah', rakats: 4, color: '#4CAF50' },
      { type: 'Farz', rakats: 2, color: '#2196F3' },
      { type: 'Sunnah', rakats: 4, color: '#4CAF50' },
      { type: 'Sunnah', rakats: 2, color: '#4CAF50' }
    ]
  },
  taraweeh: {
    name: 'Taraweeh',
    arabic: 'التراويح',
    components: [
      { type: 'Taraweeh', rakats: 20, color: '#00BCD4' }
    ]
  },
  tahajjud: {
    name: 'Tahajjud',
    arabic: 'التهجد',
    components: [
      { type: 'Nafl', rakats: 8, color: '#9C27B0' },
      { type: 'Witr', rakats: 3, color: '#FF9800' }
    ]
  }
};

// Position states
const POSITIONS = {
  UNKNOWN: 'unknown',
  STANDING: 'standing',
  BOWING: 'bowing',
  PROSTRATING: 'prostrating',
  SITTING: 'sitting',
  SALAM_RIGHT: 'salam_right',
  SALAM_LEFT: 'salam_left'
};

// Styles (kept concise)
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
    padding: '20px',
    boxSizing: 'border-box'
  },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#ffd700', margin: '0 0 5px 0' },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto 15px',
    borderRadius: '20px',
    overflow: 'hidden',
    background: '#000',
    aspectRatio: '4/3'
  },
  video: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' },
  canvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '15px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  rakatNumber: { fontSize: '90px', fontWeight: '800', color: '#ffd700', lineHeight: 1, textAlign: 'center' },
  rakatLabel: { fontSize: '20px', color: '#a0a0a0', marginTop: '10px', textAlign: 'center' },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '15px',
    border: 'none',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'all 0.3s ease'
  },
  primaryButton: { background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: '#fff' },
  secondaryButton: { background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: '#fff' },
  dangerButton: { background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: '#fff' },
  warningButton: { background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: '#fff' },
  prayerButton: {
    width: '100%',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '15px',
    border: 'none',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  componentBadge: { display: 'inline-block', padding: '8px 20px', borderRadius: '25px', fontSize: '16px', fontWeight: '600' },
  positionIndicator: {
    textAlign: 'center',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '15px',
    fontSize: '18px'
  },
  progressBar: { width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', marginTop: '12px' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #4CAF50, #8BC34A)', transition: 'width 0.5s ease', borderRadius: '5px' },
  sujoodDot: { width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #ffd700' },
  componentItem: { display: 'flex', alignItems: 'center', padding: '10px 12px', marginBottom: '8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', marginRight: '12px' },
  slider: { width: '100%', height: '6px', marginTop: '10px' },
  debugInfo: { padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', fontSize: '10px', fontFamily: 'monospace', marginTop: '10px' },
  completeOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px'
  },
  backButton: { background: 'transparent', border: 'none', color: '#ffd700', fontSize: '18px', cursor: 'pointer', padding: '10px', marginBottom: '15px' },
  smallText: { fontSize: '13px', color: '#888' },
  inferenceAlert: {
    background: 'rgba(255, 152, 0, 0.2)',
    border: '1px solid rgba(255, 152, 0, 0.5)',
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '10px',
    fontSize: '13px',
    color: '#ffb74d'
  }
};

export function SalahCounter() {
  // Screen state
  const [screen, setScreen] = useState('home');

  // Prayer state
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [currentComponent, setCurrentComponent] = useState(0);
  const [currentRakat, setCurrentRakat] = useState(1);
  const [sujoodInRakat, setSujoodInRakat] = useState(0);
  const [totalRakats, setTotalRakats] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  // CV state
  const [currentPosition, setCurrentPosition] = useState(POSITIONS.UNKNOWN);
  const [isTracking, setIsTracking] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [poseReady, setPoseReady] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [error, setError] = useState(null);

  // Intelligent inference state
  const [inferenceLog, setInferenceLog] = useState([]);
  const [salamDetected, setSalamDetected] = useState({ right: false, left: false });
  const [autoCorrections, setAutoCorrections] = useState(0);

  // Tuning
  const [sensitivity, setSensitivity] = useState(50);
  const [stabilityFrames, setStabilityFrames] = useState(3);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const lastPositionRef = useRef(POSITIONS.UNKNOWN);
  const positionHistoryRef = useRef([]);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Intelligent tracking refs
  const landmarkVectorsRef = useRef({}); // Store landmark vectors for consistency
  const positionTimelineRef = useRef([]); // Timeline of all positions
  const lastStandingTimeRef = useRef(null); // When did we last see standing
  const lastSittingTimeRef = useRef(null); // When did we last see sitting
  const expectedRakatRef = useRef(1); // What rakah we expect based on inference
  const missedSujoodRef = useRef(0); // Track potentially missed sujoods

  // Log inference event
  const logInference = useCallback((message) => {
    setInferenceLog(prev => [...prev.slice(-4), { time: new Date().toLocaleTimeString(), msg: message }]);
  }, []);

  // Calculate landmark vector ID for consistent tracking
  const calculateLandmarkVector = useCallback((landmarks, indices) => {
    if (!landmarks) return null;

    const vectors = {};
    indices.forEach(idx => {
      if (landmarks[idx] && landmarks[idx].visibility > 0.3) {
        vectors[idx] = {
          x: landmarks[idx].x,
          y: landmarks[idx].y,
          z: landmarks[idx].z || 0,
          visibility: landmarks[idx].visibility
        };
      }
    });

    return vectors;
  }, []);

  // Detect salam (face turning)
  const detectSalam = useCallback((landmarks) => {
    if (!landmarks || !landmarks[0]) return null;

    const nose = landmarks[0];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!leftEar || !rightEar || !leftShoulder || !rightShoulder) return null;

    // Calculate face direction based on ear positions relative to nose
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const earDiff = leftEar.x - rightEar.x;
    const noseOffset = nose.x - shoulderCenterX;

    // Face turned right (looking over right shoulder)
    if (noseOffset > 0.08 && earDiff < 0.05) {
      return 'right';
    }
    // Face turned left (looking over left shoulder)
    if (noseOffset < -0.08 && earDiff < 0.05) {
      return 'left';
    }

    return null;
  }, []);

  // Intelligent position classification
  const classifyPosition = useCallback((landmarks) => {
    if (!landmarks || landmarks.length < 33) return POSITIONS.UNKNOWN;

    // Store landmark vectors for tracking
    const keyIndices = [0, 7, 8, 11, 12, 23, 24, 25, 26, 27, 28]; // Key body parts
    const currentVectors = calculateLandmarkVector(landmarks, keyIndices);
    landmarkVectorsRef.current = currentVectors;

    const sens = sensitivity / 100;
    const sujoodThreshold = 0.02 + (0.06 * (1 - sens));
    const rukuThreshold = 0.08 + (0.08 * (1 - sens));

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    // Check visibility - use available landmarks even if some are occluded
    const visibleCount = [nose, leftShoulder, rightShoulder, leftHip, rightHip]
      .filter(l => l && l.visibility > 0.3).length;

    if (visibleCount < 3) return POSITIONS.UNKNOWN;

    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const kneeY = (leftKnee.y + rightKnee.y) / 2;
    const noseY = nose.y;

    const avgVisibility = visibleCount / 5;
    setConfidence(Math.round(avgVisibility * 100));

    // Check for salam
    const salamDir = detectSalam(landmarks);
    if (salamDir) {
      return salamDir === 'right' ? POSITIONS.SALAM_RIGHT : POSITIONS.SALAM_LEFT;
    }

    // SUJOOD
    if (noseY > hipY + sujoodThreshold) {
      return POSITIONS.PROSTRATING;
    }

    // RUKU
    if (Math.abs(shoulderY - hipY) < rukuThreshold && noseY > shoulderY - 0.02) {
      return POSITIONS.BOWING;
    }

    // SITTING
    if (Math.abs(hipY - kneeY) < 0.18 && noseY < hipY) {
      return POSITIONS.SITTING;
    }

    // STANDING
    if (noseY < shoulderY && shoulderY < hipY && hipY < kneeY) {
      return POSITIONS.STANDING;
    }

    return POSITIONS.UNKNOWN;
  }, [sensitivity, calculateLandmarkVector, detectSalam]);

  // Get stable position
  const getStablePosition = useCallback((newPosition) => {
    positionHistoryRef.current.push(newPosition);
    if (positionHistoryRef.current.length > stabilityFrames + 3) {
      positionHistoryRef.current.shift();
    }

    const counts = {};
    positionHistoryRef.current.forEach(pos => {
      counts[pos] = (counts[pos] || 0) + 1;
    });

    let maxCount = 0;
    let stablePosition = POSITIONS.UNKNOWN;
    for (const [pos, count] of Object.entries(counts)) {
      if (count > maxCount && count >= stabilityFrames) {
        maxCount = count;
        stablePosition = pos;
      }
    }

    return stablePosition;
  }, [stabilityFrames]);

  // Intelligent inference for missed detections
  const applyIntelligentInference = useCallback((currentPos, prevPos) => {
    const now = Date.now();

    // Record position in timeline
    positionTimelineRef.current.push({ position: currentPos, time: now });
    if (positionTimelineRef.current.length > 100) {
      positionTimelineRef.current.shift();
    }

    // Track standing/sitting times
    if (currentPos === POSITIONS.STANDING) {
      lastStandingTimeRef.current = now;
    }
    if (currentPos === POSITIONS.SITTING) {
      lastSittingTimeRef.current = now;
    }

    // INFERENCE 1: Salam detection = prayer complete
    if (currentPos === POSITIONS.SALAM_RIGHT) {
      setSalamDetected(prev => ({ ...prev, right: true }));
    }
    if (currentPos === POSITIONS.SALAM_LEFT && salamDetected.right) {
      // Both salams done - prayer is complete
      logInference('Salam detected - Prayer complete');

      // Auto-correct to final rakah if we're behind
      if (currentRakat < totalRakats) {
        const missed = totalRakats - currentRakat;
        logInference(`Auto-correcting ${missed} missed rakah(s)`);
        setCurrentRakat(totalRakats);
        setAutoCorrections(prev => prev + missed);
      }

      setShowComplete(true);
      setIsTracking(false);
      return;
    }

    // INFERENCE 2: Standing after sitting (not sujood) = new rakah likely started
    if (currentPos === POSITIONS.STANDING && prevPos === POSITIONS.SITTING) {
      const expectedRakat = expectedRakatRef.current;

      // If we're behind expected rakah, we likely missed detections
      if (currentRakat < expectedRakat) {
        logInference(`Standing detected - Auto-advancing to rakah ${expectedRakat}`);
        setCurrentRakat(expectedRakat);
        setSujoodInRakat(0);
        setAutoCorrections(prev => prev + 1);
      }

      // Update expected rakah for next cycle
      expectedRakatRef.current = Math.min(currentRakat + 1, totalRakats);
    }

    // INFERENCE 3: If we see sitting → standing → sitting pattern, a rakah was completed
    const timeline = positionTimelineRef.current;
    if (timeline.length >= 10) {
      const recent = timeline.slice(-10).map(t => t.position);
      const pattern = recent.filter(p => p !== POSITIONS.UNKNOWN);

      // Look for: SITTING -> ... -> STANDING -> ... -> SITTING (indicates rakah boundary)
      let foundSitting1 = false;
      let foundStanding = false;
      let foundSitting2 = false;

      for (const pos of pattern) {
        if (!foundSitting1 && pos === POSITIONS.SITTING) foundSitting1 = true;
        else if (foundSitting1 && !foundStanding && pos === POSITIONS.STANDING) foundStanding = true;
        else if (foundStanding && !foundSitting2 && pos === POSITIONS.SITTING) foundSitting2 = true;
      }

      if (foundSitting1 && foundStanding && foundSitting2) {
        // This pattern suggests a rakah boundary was crossed
        if (sujoodInRakat === 1) {
          // We only saw 1 sujood but pattern suggests rakah complete
          logInference('Pattern inference: Completing rakah (1 sujood detected + sitting-standing-sitting pattern)');
          setSujoodInRakat(0);
          if (currentRakat < totalRakats) {
            setCurrentRakat(r => r + 1);
            setAutoCorrections(prev => prev + 1);
          }
        }
      }
    }

    // INFERENCE 4: Long time in sitting after sujoods = likely tashahhud/end position
    if (currentPos === POSITIONS.SITTING && lastSittingTimeRef.current) {
      const sittingDuration = now - lastSittingTimeRef.current;
      // If sitting for > 5 seconds and we have 1 sujood, might be mid-rakah sitting
      // If sitting for > 10 seconds, might be final sitting
      if (sittingDuration > 10000 && currentRakat === totalRakats && sujoodInRakat >= 1) {
        // Likely final sitting before salam
        logInference('Extended sitting detected - Likely final tashahhud');
      }
    }

  }, [currentRakat, totalRakats, sujoodInRakat, salamDetected, logInference]);

  // Handle position changes with intelligent tracking
  const handlePositionChange = useCallback((newPosition) => {
    const prevPosition = lastPositionRef.current;

    if (newPosition === prevPosition) return;

    // Apply intelligent inference
    if (newPosition !== POSITIONS.UNKNOWN) {
      applyIntelligentInference(newPosition, prevPosition);
    }

    if (newPosition === POSITIONS.UNKNOWN) return;

    // Direct sujood counting
    if (prevPosition === POSITIONS.PROSTRATING &&
        (newPosition === POSITIONS.SITTING || newPosition === POSITIONS.STANDING)) {
      setSujoodInRakat(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          // Rakah complete via direct detection
          setCurrentRakat(r => {
            if (r >= totalRakats) {
              setShowComplete(true);
              setIsTracking(false);
              return r;
            }
            expectedRakatRef.current = r + 2; // Expect next rakah
            return r + 1;
          });
          return 0;
        }
        return newCount;
      });
    }

    lastPositionRef.current = newPosition;
    setCurrentPosition(newPosition);
  }, [totalRakats, applyIntelligentInference]);

  // Process frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !poseRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (videoRef.current.readyState >= 2) {
      try {
        await poseRef.current.pose.send({ image: videoRef.current });
      } catch (e) {
        // Silent error handling
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    let mounted = true;

    const loadPose = async () => {
      try {
        const { Pose } = await import('@mediapipe/pose');
        const drawingUtils = await import('@mediapipe/drawing_utils');

        if (!mounted) return;

        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
          if (!canvasRef.current || !videoRef.current) return;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            const poseModule = require('@mediapipe/pose');

            // Draw with colors based on visibility
            results.poseLandmarks.forEach((landmark, idx) => {
              const color = landmark.visibility > 0.5 ? '#00FF00' : '#FF6600';
              ctx.beginPath();
              ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            });

            drawingUtils.drawConnectors(ctx, results.poseLandmarks, poseModule.POSE_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2
            });

            if (isTracking) {
              const rawPosition = classifyPosition(results.poseLandmarks);
              const stablePosition = getStablePosition(rawPosition);
              handlePositionChange(stablePosition);
            }
          }
        });

        poseRef.current = { pose, drawingUtils };
        setPoseReady(true);
      } catch (err) {
        if (mounted) setError('Failed to load pose detection.');
      }
    };

    loadPose();
    return () => { mounted = false; };
  }, [classifyPosition, getStablePosition, handlePositionChange, isTracking]);

  // Camera controls
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    } catch (err) {
      setError('Camera access denied.');
    }
  }, [processFrame]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraReady(false);
  }, []);

  // Prayer controls
  const startPrayer = (prayer, componentIndex = 0) => {
    setSelectedPrayer(prayer);
    setCurrentComponent(componentIndex);
    setCurrentRakat(1);
    setSujoodInRakat(0);
    setTotalRakats(prayer.components[componentIndex].rakats);
    setShowComplete(false);
    setCurrentPosition(POSITIONS.UNKNOWN);
    setInferenceLog([]);
    setSalamDetected({ right: false, left: false });
    setAutoCorrections(0);
    lastPositionRef.current = POSITIONS.UNKNOWN;
    positionHistoryRef.current = [];
    positionTimelineRef.current = [];
    expectedRakatRef.current = 1;
    missedSujoodRef.current = 0;
    lastStandingTimeRef.current = null;
    lastSittingTimeRef.current = null;
    setScreen('pray');
    startCamera();
  };

  const nextComponent = () => {
    if (currentComponent < selectedPrayer.components.length - 1) {
      const nextIdx = currentComponent + 1;
      setCurrentComponent(nextIdx);
      setCurrentRakat(1);
      setSujoodInRakat(0);
      setTotalRakats(selectedPrayer.components[nextIdx].rakats);
      setShowComplete(false);
      setCurrentPosition(POSITIONS.UNKNOWN);
      setInferenceLog([]);
      setSalamDetected({ right: false, left: false });
      positionTimelineRef.current = [];
      expectedRakatRef.current = 1;
    } else {
      exitPrayer();
    }
  };

  const resetPrayer = () => {
    setCurrentRakat(1);
    setSujoodInRakat(0);
    setShowComplete(false);
    setCurrentPosition(POSITIONS.UNKNOWN);
    setInferenceLog([]);
    setSalamDetected({ right: false, left: false });
    setAutoCorrections(0);
    lastPositionRef.current = POSITIONS.UNKNOWN;
    positionHistoryRef.current = [];
    positionTimelineRef.current = [];
    expectedRakatRef.current = 1;
  };

  const exitPrayer = () => {
    setIsTracking(false);
    stopCamera();
    setScreen('home');
  };

  const manualSujood = () => {
    setSujoodInRakat(prev => {
      const newCount = prev + 1;
      if (newCount >= 2) {
        setCurrentRakat(r => {
          if (r >= totalRakats) {
            setShowComplete(true);
            return r;
          }
          return r + 1;
        });
        return 0;
      }
      return newCount;
    });
  };

  const manualNextRakah = () => {
    if (currentRakat < totalRakats) {
      setCurrentRakat(r => r + 1);
      setSujoodInRakat(0);
      logInference('Manual: Advanced to next rakah');
    }
  };

  // Position helpers
  const getPositionName = (pos) => {
    switch (pos) {
      case POSITIONS.STANDING: return 'Qiyam (Standing)';
      case POSITIONS.BOWING: return 'Ruku (Bowing)';
      case POSITIONS.PROSTRATING: return 'Sujood';
      case POSITIONS.SITTING: return 'Jalsa (Sitting)';
      case POSITIONS.SALAM_RIGHT: return 'Salam (Right)';
      case POSITIONS.SALAM_LEFT: return 'Salam (Left)';
      default: return 'Detecting...';
    }
  };

  const getPositionColor = (pos) => {
    switch (pos) {
      case POSITIONS.STANDING: return '#4CAF50';
      case POSITIONS.BOWING: return '#2196F3';
      case POSITIONS.PROSTRATING: return '#9C27B0';
      case POSITIONS.SITTING: return '#FF9800';
      case POSITIONS.SALAM_RIGHT:
      case POSITIONS.SALAM_LEFT: return '#00BCD4';
      default: return '#666';
    }
  };

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={{ fontSize: '36px', color: '#ffd700', margin: '0 0 10px 0' }}>بِسْمِ اللَّهِ</p>
          <h1 style={styles.title}>Qiyam</h1>
          <p style={{ color: '#a0a0a0', margin: 0 }}>AI-Powered Salah Counter</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,67,54,0.2)', padding: '12px', borderRadius: '10px', marginBottom: '15px', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <div style={styles.card}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffd700', fontSize: '18px' }}>Select Prayer</h3>
          {Object.entries(PRAYERS).map(([key, prayer]) => (
            <button key={key} style={styles.prayerButton} onClick={() => setScreen('select-' + key)}>
              <div>
                <div style={{ fontSize: '20px' }}>{prayer.name}</div>
                <div style={styles.smallText}>{prayer.components.map(c => `${c.rakats} ${c.type}`).join(' • ')}</div>
              </div>
              <div style={{ fontSize: '24px' }}>{prayer.arabic}</div>
            </button>
          ))}
        </div>

        <div style={{ ...styles.card, background: 'rgba(255, 215, 0, 0.1)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd700', fontSize: '16px' }}>Detection Settings</h4>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Sensitivity</span><span>{sensitivity}%</span>
            </div>
            <input type="range" min="20" max="80" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} style={styles.slider} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Stability</span><span>{stabilityFrames} frames</span>
            </div>
            <input type="range" min="2" max="6" value={stabilityFrames} onChange={(e) => setStabilityFrames(Number(e.target.value))} style={styles.slider} />
          </div>
        </div>

        <div style={{ ...styles.card, background: 'rgba(76, 175, 80, 0.1)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50', fontSize: '16px' }}>Smart Features</h4>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#ccc' }}>✓ Salam detection (auto-complete)</p>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#ccc' }}>✓ Auto-correction for missed sujoods</p>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#ccc' }}>✓ Pattern inference for rakah boundaries</p>
          <p style={{ margin: '5px 0', fontSize: '13px', color: '#ccc' }}>✓ Landmark tracking in low light</p>
        </div>
      </div>
    );
  }

  // PRAYER SELECTION
  if (screen.startsWith('select-')) {
    const prayerKey = screen.replace('select-', '');
    const prayer = PRAYERS[prayerKey];

    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => setScreen('home')}>← Back</button>
        <div style={styles.header}>
          <p style={{ fontSize: '32px', color: '#ffd700', margin: '0 0 5px 0' }}>{prayer.arabic}</p>
          <h2 style={{ ...styles.title, fontSize: '24px' }}>{prayer.name}</h2>
        </div>

        <div style={styles.card}>
          <h4 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>Select Component</h4>
          {prayer.components.map((comp, idx) => (
            <button key={idx} style={{ ...styles.prayerButton, borderLeft: `4px solid ${comp.color}` }} onClick={() => startPrayer(prayer, idx)}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ ...styles.dot, background: comp.color }} />
                <span>{comp.type}</span>
              </div>
              <span>{comp.rakats} Rakats</span>
            </button>
          ))}
        </div>

        <button style={{ ...styles.button, ...styles.primaryButton }} onClick={() => startPrayer(prayer, 0)}>
          Start Full Prayer
        </button>
      </div>
    );
  }

  // PRAYER SCREEN
  if (screen === 'pray' && selectedPrayer) {
    const component = selectedPrayer.components[currentComponent];
    const progress = ((currentRakat - 1) / totalRakats) * 100;

    return (
      <div style={styles.container}>
        {showComplete && (
          <div style={styles.completeOverlay}>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>✓</div>
            <h2 style={{ color: '#ffd700', fontSize: '28px', margin: '0 0 10px 0' }}>ما شاء الله</h2>
            <p style={{ fontSize: '22px', marginBottom: '15px' }}>{component.type} Complete!</p>
            {autoCorrections > 0 && (
              <p style={{ fontSize: '14px', color: '#ffb74d', marginBottom: '15px' }}>
                ({autoCorrections} auto-correction{autoCorrections > 1 ? 's' : ''} applied)
              </p>
            )}
            <p style={{ fontSize: '16px', color: '#888', marginBottom: '25px' }}>{totalRakats} Rakats</p>

            {currentComponent < selectedPrayer.components.length - 1 ? (
              <button style={{ ...styles.button, ...styles.primaryButton, width: '250px' }} onClick={nextComponent}>
                Next: {selectedPrayer.components[currentComponent + 1].type}
              </button>
            ) : (
              <button style={{ ...styles.button, ...styles.primaryButton, width: '250px' }} onClick={exitPrayer}>
                Complete - Back Home
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button style={{ ...styles.backButton, marginBottom: 0 }} onClick={exitPrayer}>← Exit</button>
          <span style={{ color: '#ffd700', fontSize: '16px' }}>{selectedPrayer.name}</span>
          <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }} onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? 'Hide' : 'Debug'}
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ ...styles.componentBadge, background: component.color }}>{component.type}</span>
        </div>

        <div style={styles.videoContainer}>
          <video ref={videoRef} style={styles.video} playsInline muted />
          <canvas ref={canvasRef} style={styles.canvas} />
          {!cameraReady && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>Loading...</div>
          )}
        </div>

        {/* Inference alerts */}
        {inferenceLog.length > 0 && (
          <div style={styles.inferenceAlert}>
            <strong>AI:</strong> {inferenceLog[inferenceLog.length - 1]?.msg}
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.rakatNumber}>{currentRakat}</div>
          <div style={styles.rakatLabel}>of {totalRakats} Rakats</div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
            <div style={{ ...styles.sujoodDot, background: sujoodInRakat >= 1 ? '#ffd700' : 'transparent' }} />
            <div style={{ ...styles.sujoodDot, background: sujoodInRakat >= 2 ? '#ffd700' : 'transparent' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '5px', textAlign: 'center' }}>Sujood: {sujoodInRakat}/2</div>
        </div>

        <div style={{ ...styles.positionIndicator, borderLeft: `4px solid ${getPositionColor(currentPosition)}` }}>
          <span style={{ color: getPositionColor(currentPosition) }}>{getPositionName(currentPosition)}</span>
          <span style={{ color: '#888', marginLeft: '10px', fontSize: '14px' }}>{confidence}%</span>
        </div>

        <button style={{ ...styles.button, ...(isTracking ? styles.dangerButton : styles.primaryButton) }} onClick={() => setIsTracking(!isTracking)}>
          {isTracking ? '⏹ Pause' : '▶ Start Tracking'}
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }} onClick={manualSujood}>👆 Sujood</button>
          <button style={{ ...styles.button, ...styles.warningButton, flex: 1 }} onClick={manualNextRakah}>→ Next Rakah</button>
          <button style={{ ...styles.button, background: '#555', color: '#fff', flex: 1 }} onClick={resetPrayer}>↺ Reset</button>
        </div>

        {selectedPrayer.components.length > 1 && (
          <div style={{ ...styles.card, marginTop: '10px' }}>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Progress</div>
            {selectedPrayer.components.map((comp, idx) => (
              <div key={idx} style={{ ...styles.componentItem, opacity: idx < currentComponent ? 0.5 : 1, border: idx === currentComponent ? '1px solid #ffd700' : 'none' }}>
                <div style={{ ...styles.dot, background: comp.color }} />
                <span style={{ flex: 1, fontSize: '14px' }}>{comp.type}</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{comp.rakats}</span>
                {idx < currentComponent && <span style={{ marginLeft: '8px' }}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {showDebug && (
          <div style={styles.debugInfo}>
            <div>Pose: {poseReady ? '✓' : '...'} | Track: {isTracking ? 'ON' : 'OFF'} | Pos: {currentPosition}</div>
            <div>Conf: {confidence}% | Sens: {sensitivity}% | Stab: {stabilityFrames}f</div>
            <div>Salam: R={salamDetected.right ? '✓' : '-'} L={salamDetected.left ? '✓' : '-'} | AutoFix: {autoCorrections}</div>
            {inferenceLog.slice(-2).map((log, i) => (
              <div key={i} style={{ color: '#ffb74d' }}>{log.time}: {log.msg}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default SalahCounter;
