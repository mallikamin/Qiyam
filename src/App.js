import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Prayer configurations
const PRAYERS = {
  fajr: { name: 'Fajr', arabic: 'الفجر', rakats: 2 },
  dhuhr: { name: 'Dhuhr', arabic: 'الظهر', rakats: 4 },
  asr: { name: 'Asr', arabic: 'العصر', rakats: 4 },
  maghrib: { name: 'Maghrib', arabic: 'المغرب', rakats: 3 },
  isha: { name: 'Isha', arabic: 'العشاء', rakats: 4 },
  taraweeh: { name: 'Taraweeh', arabic: 'التراويح', rakats: 20 },
  witr: { name: 'Witr', arabic: 'الوتر', rakats: 3 }
};

// Position states
const POSITIONS = {
  UNKNOWN: 'unknown',
  STANDING: 'standing',    // Qiyam
  BOWING: 'bowing',        // Ruku
  PROSTRATING: 'prostrating', // Sujood
  SITTING: 'sitting'       // Jalsa
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative'
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
    background: '#000'
  },
  video: {
    width: '100%',
    height: 'auto',
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
  rakatDisplay: {
    textAlign: 'center',
    padding: '30px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    marginBottom: '20px'
  },
  rakatNumber: {
    fontSize: '120px',
    fontWeight: '800',
    color: '#ffd700',
    lineHeight: 1
  },
  rakatLabel: {
    fontSize: '24px',
    color: '#a0a0a0',
    marginTop: '10px'
  },
  positionIndicator: {
    textAlign: 'center',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    marginBottom: '20px',
    fontSize: '20px'
  },
  button: {
    width: '100%',
    padding: '20px',
    borderRadius: '15px',
    border: 'none',
    fontSize: '20px',
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
  prayerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  prayerButton: {
    padding: '20px 15px',
    borderRadius: '15px',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    textAlign: 'center'
  },
  selectedPrayer: {
    border: '2px solid #ffd700',
    background: 'rgba(255, 215, 0, 0.2)'
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  debugInfo: {
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    fontSize: '12px',
    fontFamily: 'monospace',
    marginTop: '20px'
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  sujoodCounter: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '15px'
  },
  sujoodDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #ffd700'
  }
};

export function SalahCounter() {
  // State
  const [screen, setScreen] = useState('home');
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [currentRakat, setCurrentRakat] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(POSITIONS.UNKNOWN);
  const [sujoodInRakat, setSujoodInRakat] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [poseReady, setPoseReady] = useState(false);
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [prayerComplete, setPrayerComplete] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const lastPositionRef = useRef(POSITIONS.UNKNOWN);
  const positionHistoryRef = useRef([]);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Position detection based on landmarks
  const classifyPosition = useCallback((landmarks) => {
    if (!landmarks || landmarks.length < 33) return POSITIONS.UNKNOWN;

    const NOSE = 0;
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;
    const LEFT_KNEE = 25;
    const RIGHT_KNEE = 26;
    const LEFT_ANKLE = 27;
    const RIGHT_ANKLE = 28;

    const nose = landmarks[NOSE];
    const leftShoulder = landmarks[LEFT_SHOULDER];
    const rightShoulder = landmarks[RIGHT_SHOULDER];
    const leftHip = landmarks[LEFT_HIP];
    const rightHip = landmarks[RIGHT_HIP];
    const leftKnee = landmarks[LEFT_KNEE];
    const rightKnee = landmarks[RIGHT_KNEE];
    const leftAnkle = landmarks[LEFT_ANKLE];
    const rightAnkle = landmarks[RIGHT_ANKLE];

    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const kneeY = (leftKnee.y + rightKnee.y) / 2;
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
    const noseY = nose.y;

    const shoulderToAnkle = ankleY - shoulderY;

    const avgVisibility = (
      nose.visibility +
      leftShoulder.visibility + rightShoulder.visibility +
      leftHip.visibility + rightHip.visibility
    ) / 5;

    setConfidence(Math.round(avgVisibility * 100));

    if (avgVisibility < 0.5) return POSITIONS.UNKNOWN;

    // SUJOOD: Head very low, close to or below hips
    if (noseY > hipY + 0.05 && noseY > kneeY - 0.1) {
      return POSITIONS.PROSTRATING;
    }

    // RUKU: Back roughly horizontal
    if (Math.abs(shoulderY - hipY) < 0.15 && noseY > shoulderY - 0.05 && noseY < kneeY) {
      return POSITIONS.BOWING;
    }

    // SITTING: Hips low, shoulders above hips
    if (hipY > kneeY - 0.1 && noseY < shoulderY && shoulderY < hipY) {
      return POSITIONS.SITTING;
    }

    // STANDING: Upright
    if (noseY < shoulderY && shoulderY < hipY && shoulderToAnkle > 0.3) {
      return POSITIONS.STANDING;
    }

    return POSITIONS.UNKNOWN;
  }, []);

  // Smooth position detection
  const getStablePosition = useCallback((newPosition) => {
    positionHistoryRef.current.push(newPosition);
    if (positionHistoryRef.current.length > 5) {
      positionHistoryRef.current.shift();
    }

    const counts = {};
    positionHistoryRef.current.forEach(pos => {
      counts[pos] = (counts[pos] || 0) + 1;
    });

    let maxCount = 0;
    let stablePosition = POSITIONS.UNKNOWN;
    for (const [pos, count] of Object.entries(counts)) {
      if (count > maxCount && count >= 3) {
        maxCount = count;
        stablePosition = pos;
      }
    }

    return stablePosition;
  }, []);

  // Handle position changes
  const handlePositionChange = useCallback((newPosition) => {
    const prevPosition = lastPositionRef.current;

    if (newPosition === prevPosition || newPosition === POSITIONS.UNKNOWN) {
      return;
    }

    if (prevPosition === POSITIONS.PROSTRATING &&
        (newPosition === POSITIONS.SITTING || newPosition === POSITIONS.STANDING)) {
      setSujoodInRakat(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          setCurrentRakat(r => {
            const nextRakat = r + 1;
            if (selectedPrayer && nextRakat > PRAYERS[selectedPrayer].rakats) {
              setPrayerComplete(true);
              setIsTracking(false);
              return r;
            }
            return nextRakat;
          });
          return 0;
        }
        return newCount;
      });
    }

    lastPositionRef.current = newPosition;
    setCurrentPosition(newPosition);
  }, [selectedPrayer]);

  // Process video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !poseRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (videoRef.current.readyState >= 2) {
      try {
        await poseRef.current.pose.send({ image: videoRef.current });
      } catch (e) {
        console.error('Pose detection error:', e);
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    let mounted = true;

    const loadPose = async () => {
      try {
        const Pose = (await import('@mediapipe/pose')).Pose;
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
        console.error('Failed to load MediaPipe:', err);
        if (mounted) {
          setError('Failed to load pose detection. Please refresh.');
        }
      }
    };

    loadPose();

    return () => {
      mounted = false;
    };
  }, [classifyPosition, getStablePosition, handlePositionChange, isTracking]);

  // Start camera
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
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera access.');
    }
  }, [processFrame]);

  // Stop camera
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

  // Start prayer
  const startPrayer = useCallback((prayerKey) => {
    setSelectedPrayer(prayerKey);
    setCurrentRakat(1);
    setSujoodInRakat(0);
    setCurrentPosition(POSITIONS.UNKNOWN);
    setPrayerComplete(false);
    lastPositionRef.current = POSITIONS.UNKNOWN;
    positionHistoryRef.current = [];
    setScreen('pray');
    startCamera();
  }, [startCamera]);

  // Reset prayer
  const resetPrayer = useCallback(() => {
    setCurrentRakat(1);
    setSujoodInRakat(0);
    setCurrentPosition(POSITIONS.UNKNOWN);
    setPrayerComplete(false);
    lastPositionRef.current = POSITIONS.UNKNOWN;
    positionHistoryRef.current = [];
  }, []);

  // Exit prayer
  const exitPrayer = useCallback(() => {
    setIsTracking(false);
    stopCamera();
    setScreen('home');
  }, [stopCamera]);

  // Position display helpers
  const getPositionName = (pos) => {
    switch (pos) {
      case POSITIONS.STANDING: return 'Qiyam (Standing)';
      case POSITIONS.BOWING: return 'Ruku (Bowing)';
      case POSITIONS.PROSTRATING: return 'Sujood (Prostrating)';
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
      default: return '#888';
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
          <div style={{
            background: 'rgba(244, 67, 54, 0.2)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '20px',
          borderRadius: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>Select Prayer</h3>
          <div style={styles.prayerGrid}>
            {Object.entries(PRAYERS).map(([key, prayer]) => (
              <button
                key={key}
                style={{
                  ...styles.prayerButton,
                  ...(selectedPrayer === key ? styles.selectedPrayer : {})
                }}
                onClick={() => setSelectedPrayer(key)}
              >
                <div style={{ fontSize: '24px' }}>{prayer.arabic}</div>
                <div>{prayer.name}</div>
                <div style={{ fontSize: '14px', color: '#888' }}>{prayer.rakats} Rakats</div>
              </button>
            ))}
          </div>

          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: selectedPrayer ? 1 : 0.5
            }}
            onClick={() => selectedPrayer && startPrayer(selectedPrayer)}
            disabled={!selectedPrayer}
          >
            Start Prayer
          </button>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '20px',
          borderRadius: '15px',
          fontSize: '16px',
          lineHeight: 1.6
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>How it works</h4>
          <p style={{ margin: '5px 0', color: '#ccc' }}>1. Position your device to see your full body</p>
          <p style={{ margin: '5px 0', color: '#ccc' }}>2. The camera detects your prayer positions</p>
          <p style={{ margin: '5px 0', color: '#ccc' }}>3. Rakahs are counted automatically via Sujood</p>
          <p style={{ margin: '5px 0', color: '#888', fontSize: '14px' }}>
            All processing happens locally - no video is stored or sent anywhere.
          </p>
        </div>
      </div>
    );
  }

  // PRAYER SCREEN
  if (screen === 'pray') {
    const prayer = PRAYERS[selectedPrayer];

    return (
      <div style={styles.container}>
        {prayerComplete && (
          <div style={styles.loadingOverlay}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>✓</div>
            <h2 style={{ color: '#ffd700', fontSize: '32px', margin: '0 0 10px 0' }}>
              ما شاء الله
            </h2>
            <p style={{ fontSize: '24px', marginBottom: '30px' }}>
              {prayer.name} Complete!
            </p>
            <button
              style={{ ...styles.button, ...styles.primaryButton, width: '200px' }}
              onClick={exitPrayer}
            >
              Back to Home
            </button>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffd700',
              fontSize: '18px',
              cursor: 'pointer'
            }}
            onClick={exitPrayer}
          >
            ← Exit
          </button>
          <span style={{ color: '#ffd700', fontSize: '20px' }}>
            {prayer.arabic} - {prayer.name}
          </span>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide' : 'Debug'}
          </button>
        </div>

        <div style={styles.videoContainer}>
          <video ref={videoRef} style={styles.video} playsInline muted />
          <canvas ref={canvasRef} style={styles.canvas} />
          {!cameraReady && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px' }}>Loading Camera...</div>
            </div>
          )}
        </div>

        <div style={styles.rakatDisplay}>
          <div style={styles.rakatNumber}>{currentRakat}</div>
          <div style={styles.rakatLabel}>of {prayer.rakats} Rakats</div>
          <div style={styles.sujoodCounter}>
            <div style={{
              ...styles.sujoodDot,
              background: sujoodInRakat >= 1 ? '#ffd700' : 'transparent'
            }} />
            <div style={{
              ...styles.sujoodDot,
              background: sujoodInRakat >= 2 ? '#ffd700' : 'transparent'
            }} />
          </div>
          <div style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
            Sujood in this Rakah
          </div>
        </div>

        <div style={{
          ...styles.positionIndicator,
          borderLeft: `4px solid ${getPositionColor(currentPosition)}`
        }}>
          <span style={{ color: getPositionColor(currentPosition) }}>
            {getPositionName(currentPosition)}
          </span>
          {confidence > 0 && (
            <span style={{ color: '#888', marginLeft: '10px', fontSize: '14px' }}>
              {confidence}% confidence
            </span>
          )}
        </div>

        <button
          style={{
            ...styles.button,
            ...(isTracking ? styles.dangerButton : styles.primaryButton)
          }}
          onClick={() => setIsTracking(!isTracking)}
        >
          {isTracking ? 'Pause Tracking' : 'Start Tracking'}
        </button>

        <button
          style={{ ...styles.button, ...styles.warningButton }}
          onClick={resetPrayer}
        >
          Reset Prayer
        </button>

        {showDebug && (
          <div style={styles.debugInfo}>
            <div>Camera: {cameraReady ? 'Ready' : 'Loading'}</div>
            <div>Pose: {poseReady ? 'Ready' : 'Loading'}</div>
            <div>Tracking: {isTracking ? 'Active' : 'Paused'}</div>
            <div>Position: {currentPosition}</div>
            <div>Confidence: {confidence}%</div>
            <div>Sujood: {sujoodInRakat}/2</div>
            <div>Rakah: {currentRakat}/{prayer.rakats}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default SalahCounter;
