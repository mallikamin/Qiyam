import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Prayer data with all components (Sunnah, Farz, Nafl, Witr)
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
  SITTING: 'sitting'
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
    padding: '20px',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffd700',
    margin: '0 0 5px 0'
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto 20px',
    borderRadius: '20px',
    overflow: 'hidden',
    background: '#000',
    aspectRatio: '4/3'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: 'scaleX(-1)'
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transform: 'scaleX(-1)'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '15px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  rakatDisplay: {
    textAlign: 'center',
    padding: '20px'
  },
  rakatNumber: {
    fontSize: '100px',
    fontWeight: '800',
    color: '#ffd700',
    lineHeight: 1
  },
  rakatLabel: {
    fontSize: '22px',
    color: '#a0a0a0',
    marginTop: '10px'
  },
  button: {
    width: '100%',
    padding: '18px',
    borderRadius: '15px',
    border: 'none',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'all 0.3s ease'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    color: '#fff'
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    color: '#fff'
  },
  dangerButton: {
    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
    color: '#fff'
  },
  warningButton: {
    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    color: '#fff'
  },
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
  componentBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px'
  },
  positionIndicator: {
    textAlign: 'center',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    marginBottom: '15px',
    fontSize: '18px'
  },
  progressBar: {
    width: '100%',
    height: '12px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '6px',
    overflow: 'hidden',
    marginTop: '15px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
    transition: 'width 0.5s ease',
    borderRadius: '6px'
  },
  sujoodCounter: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  sujoodDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #ffd700'
  },
  componentList: {
    marginTop: '10px'
  },
  componentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    marginBottom: '8px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '12px'
  },
  slider: {
    width: '100%',
    height: '6px',
    marginTop: '10px'
  },
  debugInfo: {
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    fontSize: '11px',
    fontFamily: 'monospace',
    marginTop: '15px'
  },
  completeOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#ffd700',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '10px',
    marginBottom: '15px'
  },
  smallText: {
    fontSize: '13px',
    color: '#888'
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

  // Tuning parameters
  const [sensitivity, setSensitivity] = useState(50);
  const [stabilityFrames, setStabilityFrames] = useState(4);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const lastPositionRef = useRef(POSITIONS.UNKNOWN);
  const positionHistoryRef = useRef([]);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Position classification with tunable thresholds
  const classifyPosition = useCallback((landmarks) => {
    if (!landmarks || landmarks.length < 33) return POSITIONS.UNKNOWN;

    // Sensitivity affects thresholds (0-100 scale)
    const sens = sensitivity / 100;
    const sujoodThreshold = 0.02 + (0.08 * (1 - sens));
    const rukuThreshold = 0.10 + (0.10 * (1 - sens));

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const kneeY = (leftKnee.y + rightKnee.y) / 2;
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
    const noseY = nose.y;

    const avgVisibility = (
      nose.visibility +
      leftShoulder.visibility + rightShoulder.visibility +
      leftHip.visibility + rightHip.visibility
    ) / 5;

    setConfidence(Math.round(avgVisibility * 100));

    if (avgVisibility < 0.4) return POSITIONS.UNKNOWN;

    // SUJOOD: Nose below or near hip level
    if (noseY > hipY + sujoodThreshold) {
      return POSITIONS.PROSTRATING;
    }

    // RUKU: Back roughly horizontal, nose lowered
    if (Math.abs(shoulderY - hipY) < rukuThreshold && noseY > shoulderY) {
      return POSITIONS.BOWING;
    }

    // SITTING: Hips near knee level
    if (Math.abs(hipY - kneeY) < 0.15 && noseY < hipY) {
      return POSITIONS.SITTING;
    }

    // STANDING: Vertical posture
    if (noseY < shoulderY && shoulderY < hipY && hipY < kneeY) {
      return POSITIONS.STANDING;
    }

    return POSITIONS.UNKNOWN;
  }, [sensitivity]);

  // Stable position with tunable frames
  const getStablePosition = useCallback((newPosition) => {
    positionHistoryRef.current.push(newPosition);
    if (positionHistoryRef.current.length > stabilityFrames + 2) {
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

  // Handle position changes for rakah counting
  const handlePositionChange = useCallback((newPosition) => {
    const prevPosition = lastPositionRef.current;

    if (newPosition === prevPosition || newPosition === POSITIONS.UNKNOWN) {
      return;
    }

    // Detect sujood completion
    if (prevPosition === POSITIONS.PROSTRATING &&
        (newPosition === POSITIONS.SITTING || newPosition === POSITIONS.STANDING)) {
      setSujoodInRakat(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          // Rakah complete
          setCurrentRakat(r => {
            if (r >= totalRakats) {
              setShowComplete(true);
              setIsTracking(false);
              return r;
            }
            return r + 1;
          });
          return 0;
        }
        return newCount;
      });
    }

    lastPositionRef.current = newPosition;
    setCurrentPosition(newPosition);
  }, [totalRakats]);

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
        console.error('Pose error:', e);
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
          const video = videoRef.current;

          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            // Draw skeleton
            const poseModule = require('@mediapipe/pose');
            drawingUtils.drawConnectors(ctx, results.poseLandmarks, poseModule.POSE_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2
            });
            drawingUtils.drawLandmarks(ctx, results.poseLandmarks, {
              color: '#FF0000',
              lineWidth: 1,
              radius: 3
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
        console.error('MediaPipe error:', err);
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
    lastPositionRef.current = POSITIONS.UNKNOWN;
    positionHistoryRef.current = [];
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
      lastPositionRef.current = POSITIONS.UNKNOWN;
      positionHistoryRef.current = [];
    } else {
      exitPrayer();
    }
  };

  const resetPrayer = () => {
    setCurrentRakat(1);
    setSujoodInRakat(0);
    setShowComplete(false);
    setCurrentPosition(POSITIONS.UNKNOWN);
    lastPositionRef.current = POSITIONS.UNKNOWN;
    positionHistoryRef.current = [];
  };

  const exitPrayer = () => {
    setIsTracking(false);
    stopCamera();
    setScreen('home');
  };

  // Manual increment (fallback)
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

  // Position helpers
  const getPositionName = (pos) => {
    switch (pos) {
      case POSITIONS.STANDING: return 'Qiyam (Standing)';
      case POSITIONS.BOWING: return 'Ruku (Bowing)';
      case POSITIONS.PROSTRATING: return 'Sujood';
      case POSITIONS.SITTING: return 'Jalsa (Sitting)';
      default: return 'Detecting...';
    }
  };

  const getPositionColor = (pos) => {
    switch (pos) {
      case POSITIONS.STANDING: return '#4CAF50';
      case POSITIONS.BOWING: return '#2196F3';
      case POSITIONS.PROSTRATING: return '#9C27B0';
      case POSITIONS.SITTING: return '#FF9800';
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
            <button
              key={key}
              style={styles.prayerButton}
              onClick={() => setScreen('select-' + key)}
            >
              <div>
                <div style={{ fontSize: '20px' }}>{prayer.name}</div>
                <div style={styles.smallText}>
                  {prayer.components.map(c => `${c.rakats} ${c.type}`).join(' • ')}
                </div>
              </div>
              <div style={{ fontSize: '24px' }}>{prayer.arabic}</div>
            </button>
          ))}
        </div>

        <div style={{ ...styles.card, background: 'rgba(255, 215, 0, 0.1)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd700', fontSize: '16px' }}>Detection Tuning</h4>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Sensitivity</span>
              <span>{sensitivity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={styles.slider}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              <span>Less sensitive</span>
              <span>More sensitive</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Stability Frames</span>
              <span>{stabilityFrames}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={stabilityFrames}
              onChange={(e) => setStabilityFrames(Number(e.target.value))}
              style={styles.slider}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
              <span>Faster (less stable)</span>
              <span>Slower (more stable)</span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, background: 'rgba(255,255,255,0.03)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd700', fontSize: '16px' }}>How it works</h4>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#ccc' }}>1. Position device to see your full body</p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#ccc' }}>2. AI detects Standing, Bowing, Sujood, Sitting</p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#ccc' }}>3. Rakahs counted automatically (2 Sujood = 1 Rakah)</p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>All processing is local - no data sent anywhere</p>
        </div>
      </div>
    );
  }

  // PRAYER SELECTION SCREEN
  if (screen.startsWith('select-')) {
    const prayerKey = screen.replace('select-', '');
    const prayer = PRAYERS[prayerKey];

    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => setScreen('home')}>
          ← Back
        </button>

        <div style={styles.header}>
          <p style={{ fontSize: '32px', color: '#ffd700', margin: '0 0 5px 0' }}>{prayer.arabic}</p>
          <h2 style={{ ...styles.title, fontSize: '24px' }}>{prayer.name}</h2>
        </div>

        <div style={styles.card}>
          <h4 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>Select Component</h4>
          {prayer.components.map((comp, idx) => (
            <button
              key={idx}
              style={{
                ...styles.prayerButton,
                borderLeft: `4px solid ${comp.color}`
              }}
              onClick={() => startPrayer(prayer, idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ ...styles.dot, background: comp.color }} />
                <span>{comp.type}</span>
              </div>
              <span>{comp.rakats} Rakats</span>
            </button>
          ))}
        </div>

        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={() => startPrayer(prayer, 0)}
        >
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
        {/* Complete Overlay */}
        {showComplete && (
          <div style={styles.completeOverlay}>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>✓</div>
            <h2 style={{ color: '#ffd700', fontSize: '28px', margin: '0 0 10px 0' }}>ما شاء الله</h2>
            <p style={{ fontSize: '22px', marginBottom: '20px' }}>{component.type} Complete!</p>
            <p style={{ fontSize: '16px', color: '#888', marginBottom: '25px' }}>
              {totalRakats} Rakats • {totalRakats * 2} Sujood
            </p>

            {currentComponent < selectedPrayer.components.length - 1 ? (
              <button
                style={{ ...styles.button, ...styles.primaryButton, width: '250px' }}
                onClick={nextComponent}
              >
                Next: {selectedPrayer.components[currentComponent + 1].type}
              </button>
            ) : (
              <button
                style={{ ...styles.button, ...styles.primaryButton, width: '250px' }}
                onClick={exitPrayer}
              >
                Complete - Back Home
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button style={{ ...styles.backButton, marginBottom: 0 }} onClick={exitPrayer}>
            ← Exit
          </button>
          <span style={{ color: '#ffd700', fontSize: '16px' }}>
            {selectedPrayer.name} - {selectedPrayer.arabic}
          </span>
          <button
            style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide' : 'Debug'}
          </button>
        </div>

        {/* Component Badge */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ ...styles.componentBadge, background: component.color }}>
            {component.type}
          </span>
        </div>

        {/* Video Feed */}
        <div style={styles.videoContainer}>
          <video ref={videoRef} style={styles.video} playsInline muted />
          <canvas ref={canvasRef} style={styles.canvas} />
          {!cameraReady && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              Loading Camera...
            </div>
          )}
        </div>

        {/* Rakat Display */}
        <div style={styles.card}>
          <div style={styles.rakatDisplay}>
            <div style={styles.rakatNumber}>{currentRakat}</div>
            <div style={styles.rakatLabel}>of {totalRakats} Rakats</div>

            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>

            <div style={styles.sujoodCounter}>
              <div style={{ ...styles.sujoodDot, background: sujoodInRakat >= 1 ? '#ffd700' : 'transparent' }} />
              <div style={{ ...styles.sujoodDot, background: sujoodInRakat >= 2 ? '#ffd700' : 'transparent' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>Sujood: {sujoodInRakat}/2</div>
          </div>
        </div>

        {/* Position Indicator */}
        <div style={{ ...styles.positionIndicator, borderLeft: `4px solid ${getPositionColor(currentPosition)}` }}>
          <span style={{ color: getPositionColor(currentPosition) }}>{getPositionName(currentPosition)}</span>
          {confidence > 0 && <span style={{ color: '#888', marginLeft: '10px', fontSize: '14px' }}>{confidence}%</span>}
        </div>

        {/* Controls */}
        <button
          style={{ ...styles.button, ...(isTracking ? styles.dangerButton : styles.primaryButton) }}
          onClick={() => setIsTracking(!isTracking)}
        >
          {isTracking ? '⏹ Pause Tracking' : '▶ Start Tracking'}
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ ...styles.button, ...styles.secondaryButton, flex: 1 }} onClick={manualSujood}>
            👆 Manual Sujood
          </button>
          <button style={{ ...styles.button, ...styles.warningButton, flex: 1 }} onClick={resetPrayer}>
            🔄 Reset
          </button>
        </div>

        {/* Component Progress */}
        {selectedPrayer.components.length > 1 && (
          <div style={{ ...styles.card, marginTop: '10px' }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Prayer Progress</div>
            {selectedPrayer.components.map((comp, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.componentItem,
                  opacity: idx < currentComponent ? 0.5 : 1,
                  border: idx === currentComponent ? '1px solid #ffd700' : '1px solid transparent'
                }}
              >
                <div style={{ ...styles.dot, background: comp.color }} />
                <span style={{ flex: 1 }}>{comp.type}</span>
                <span style={{ color: '#888', fontSize: '13px' }}>{comp.rakats} Rakats</span>
                {idx < currentComponent && <span style={{ marginLeft: '8px' }}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* Debug Info */}
        {showDebug && (
          <div style={styles.debugInfo}>
            <div>Camera: {cameraReady ? '✓' : '...'} | Pose: {poseReady ? '✓' : '...'}</div>
            <div>Tracking: {isTracking ? 'ON' : 'OFF'} | Position: {currentPosition}</div>
            <div>Confidence: {confidence}% | Sensitivity: {sensitivity}%</div>
            <div>Stability: {stabilityFrames} frames | Sujood: {sujoodInRakat}/2</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default SalahCounter;
