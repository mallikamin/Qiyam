import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Prayer data with all details
const PRAYERS = {
  fajr: {
    name: 'Fajr',
    arabic: 'الفجر',
    components: [
      { type: 'Sunnah', rakats: 2, color: '#4CAF50' },
      { type: 'Farz', rakats: 2, color: '#2196F3' }
    ]
  },
  zuhr: {
    name: 'Zuhr',
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

// Styles moved outside component to prevent recreation on every render
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
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffd700',
    margin: '0 0 5px 0',
    textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'
  },
  subtitle: {
    fontSize: '18px',
    color: '#a0a0a0',
    margin: 0
  },
  arabicTitle: {
    fontSize: '42px',
    color: '#ffd700',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '25px',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  prayerButton: {
    width: '100%',
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
    color: '#fff',
    fontSize: '22px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
  },
  bigButton: {
    width: '100%',
    padding: '25px 40px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '24px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '15px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    color: '#fff'
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    color: '#fff'
  },
  warningButton: {
    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    color: '#fff'
  },
  dangerButton: {
    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
    color: '#fff'
  },
  counterDisplay: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  bigNumber: {
    fontSize: '120px',
    fontWeight: '800',
    color: '#ffd700',
    lineHeight: 1,
    textShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
  },
  label: {
    fontSize: '24px',
    color: '#a0a0a0',
    marginTop: '10px'
  },
  progressBar: {
    width: '100%',
    height: '20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '20px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
    transition: 'width 0.5s ease',
    borderRadius: '10px'
  },
  componentBadge: {
    display: 'inline-block',
    padding: '10px 25px',
    borderRadius: '30px',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    padding: '20px',
    borderRadius: '15px',
    marginTop: '20px',
    fontSize: '18px'
  },
  pulse: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite'
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#ffd700',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '10px',
    marginBottom: '20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  smallText: {
    fontSize: '14px',
    color: '#888'
  },
  completeOverlay: {
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
    zIndex: 1000,
    padding: '20px'
  },
  checkmark: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    boxShadow: '0 0 60px rgba(76, 175, 80, 0.5)'
  },
  inputNumber: {
    width: '100px',
    padding: '15px',
    fontSize: '28px',
    textAlign: 'center',
    borderRadius: '15px',
    border: '2px solid rgba(255, 215, 0, 0.5)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontWeight: '700'
  },
  componentList: {
    marginTop: '15px'
  },
  componentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    marginBottom: '10px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)'
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '15px'
  },
  tapZone: {
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.1) 100%)',
    borderRadius: '30px',
    padding: '60px 20px',
    marginTop: '20px',
    textAlign: 'center',
    border: '3px dashed rgba(76, 175, 80, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export function SalahCounter() {
  const [screen, setScreen] = useState('home'); // home, select, pray, custom
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [currentComponent, setCurrentComponent] = useState(0);
  const [currentRakat, setCurrentRakat] = useState(1);
  const [sujoodCount, setSujoodCount] = useState(0);
  const [totalRakats, setTotalRakats] = useState(0);
  const [customRakats, setCustomRakats] = useState(2);
  const [isMotionActive, setIsMotionActive] = useState(false);
  const [motionStatus, setMotionStatus] = useState('idle');
  const [lastMotion, setLastMotion] = useState(null);
  const [showComplete, setShowComplete] = useState(false);
  const [sensitivity, setSensitivity] = useState(15);

  const lastZRef = useRef(0);
  const sujoodDetectedRef = useRef(false);
  const cooldownRef = useRef(false);

  // Motion detection handler
  const handleMotion = useCallback((event) => {
    if (!isMotionActive || cooldownRef.current) return;
    
    const { z } = event.accelerationIncludingGravity || {};
    if (z === null || z === undefined) return;
    
    const zChange = Math.abs(z - lastZRef.current);
    lastZRef.current = z;
    
    // Detect significant downward motion (sujood)
    if (zChange > sensitivity && z < -5 && !sujoodDetectedRef.current) {
      sujoodDetectedRef.current = true;
      setMotionStatus('sujood');
      setLastMotion(new Date().toLocaleTimeString());
      
      // Cooldown to prevent multiple detections
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
        sujoodDetectedRef.current = false;
        setMotionStatus('waiting');
      }, 2000);
      
      setSujoodCount(prev => {
        const newCount = prev + 1;
        // Every 2 sujood = 1 rakat complete
        if (newCount % 2 === 0) {
          const newRakat = Math.floor(newCount / 2) + 1;
          if (newRakat <= totalRakats) {
            setCurrentRakat(newRakat);
          }
          if (newCount / 2 >= totalRakats) {
            setShowComplete(true);
            setIsMotionActive(false);
          }
        }
        return newCount;
      });
    }
  }, [isMotionActive, sensitivity, totalRakats]);

  // Setup motion listener
  useEffect(() => {
    if (isMotionActive && typeof DeviceMotionEvent !== 'undefined') {
      // Request permission for iOS 13+
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
              setMotionStatus('waiting');
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
        setMotionStatus('waiting');
      }
    }
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isMotionActive, handleMotion]);

  const startPrayer = (prayer, componentIndex = 0) => {
    setSelectedPrayer(prayer);
    setCurrentComponent(componentIndex);
    setCurrentRakat(1);
    setSujoodCount(0);
    setTotalRakats(prayer.components[componentIndex].rakats);
    setShowComplete(false);
    setScreen('pray');
  };

  const startCustomPrayer = () => {
    const customPrayer = {
      name: 'Custom',
      arabic: 'مخصوص',
      components: [{ type: 'Custom', rakats: customRakats, color: '#607D8B' }]
    };
    startPrayer(customPrayer, 0);
  };

  const nextComponent = () => {
    if (currentComponent < selectedPrayer.components.length - 1) {
      startPrayer(selectedPrayer, currentComponent + 1);
    } else {
      setScreen('home');
    }
  };

  const manualIncrement = () => {
    setSujoodCount(prev => {
      const newCount = prev + 1;
      if (newCount % 2 === 0) {
        const newRakat = Math.floor(newCount / 2) + 1;
        if (newRakat <= totalRakats) {
          setCurrentRakat(newRakat);
        }
        if (newCount / 2 >= totalRakats) {
          setShowComplete(true);
          setIsMotionActive(false);
        }
      }
      return newCount;
    });
  };

  const resetPrayer = () => {
    setCurrentRakat(1);
    setSujoodCount(0);
    setShowComplete(false);
    setMotionStatus('idle');
  };

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.arabicTitle}>بِسْمِ اللَّهِ</p>
          <h1 style={styles.title}>Salah Counter</h1>
          <p style={styles.subtitle}>Track your Rakats with ease</p>
        </div>

        <div style={styles.card}>
          <button 
            style={{...styles.bigButton, ...styles.primaryButton}}
            onClick={() => setScreen('select')}
          >
            🕌 &nbsp; Start Prayer
          </button>
          
          <button 
            style={{...styles.bigButton, ...styles.secondaryButton}}
            onClick={() => setScreen('custom')}
          >
            ✨ &nbsp; Custom Rakats
          </button>
        </div>

        <div style={styles.card}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#ffd700' }}>
            📖 Quick Guide
          </h3>
          <p style={{ margin: '10px 0', fontSize: '18px', lineHeight: 1.6, color: '#ccc' }}>
            1. Select your prayer
          </p>
          <p style={{ margin: '10px 0', fontSize: '18px', lineHeight: 1.6, color: '#ccc' }}>
            2. Place phone on prayer mat
          </p>
          <p style={{ margin: '10px 0', fontSize: '18px', lineHeight: 1.6, color: '#ccc' }}>
            3. App counts your Sujood
          </p>
          <p style={{ margin: '10px 0', fontSize: '18px', lineHeight: 1.6, color: '#ccc' }}>
            4. Or tap manually to count
          </p>
        </div>

        <div style={{ ...styles.card, background: 'rgba(255, 215, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#ffd700' }}>
            ⚙️ Motion Sensitivity
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '16px' }}>Low</span>
            <input
              type="range"
              min="8"
              max="25"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={{ flex: 1, height: '8px' }}
            />
            <span style={{ fontSize: '16px' }}>High</span>
          </div>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '10px', textAlign: 'center' }}>
            Adjust if motion detection is too sensitive or not sensitive enough
          </p>
        </div>
      </div>
    );
  }

  // PRAYER SELECTION SCREEN
  if (screen === 'select') {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => setScreen('home')}>
          ← Back
        </button>
        
        <div style={styles.header}>
          <h1 style={{ ...styles.title, fontSize: '28px' }}>Select Prayer</h1>
          <p style={styles.subtitle}>Choose your Salah</p>
        </div>

        {Object.entries(PRAYERS).map(([key, prayer]) => (
          <button
            key={key}
            style={styles.prayerButton}
            onClick={() => startPrayer(prayer, 0)}
          >
            <div>
              <div style={{ fontSize: '24px' }}>{prayer.name}</div>
              <div style={styles.smallText}>
                {prayer.components.map(c => `${c.rakats} ${c.type}`).join(' • ')}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontFamily: 'Arial' }}>{prayer.arabic}</div>
          </button>
        ))}
      </div>
    );
  }

  // CUSTOM RAKATS SCREEN
  if (screen === 'custom') {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => setScreen('home')}>
          ← Back
        </button>
        
        <div style={styles.header}>
          <h1 style={{ ...styles.title, fontSize: '28px' }}>Custom Prayer</h1>
          <p style={styles.subtitle}>Set your own Rakat count</p>
        </div>

        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', marginBottom: '20px' }}>Number of Rakats</p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <button
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f44336',
                  color: '#fff',
                  fontSize: '36px',
                  cursor: 'pointer'
                }}
                onClick={() => setCustomRakats(Math.max(1, customRakats - 1))}
              >
                −
              </button>
              
              <input
                type="number"
                value={customRakats}
                onChange={(e) => setCustomRakats(Math.max(1, parseInt(e.target.value) || 1))}
                style={styles.inputNumber}
              />
              
              <button
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#4CAF50',
                  color: '#fff',
                  fontSize: '36px',
                  cursor: 'pointer'
                }}
                onClick={() => setCustomRakats(customRakats + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          <button 
            style={{...styles.bigButton, ...styles.primaryButton}}
            onClick={startCustomPrayer}
          >
            Start Prayer
          </button>
        </div>

        <div style={styles.card}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#ffd700' }}>
            Common Custom Prayers
          </h3>
          <div style={styles.grid}>
            {[2, 4, 8, 12].map(num => (
              <button
                key={num}
                style={{
                  padding: '20px',
                  borderRadius: '15px',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '22px',
                  cursor: 'pointer'
                }}
                onClick={() => setCustomRakats(num)}
              >
                {num} Rakats
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PRAYER IN PROGRESS SCREEN
  if (screen === 'pray') {
    const component = selectedPrayer.components[currentComponent];
    const progress = ((currentRakat - 1) / totalRakats) * 100;

    return (
      <div style={styles.container}>
        {/* Complete Overlay */}
        {showComplete && (
          <div style={styles.completeOverlay}>
            <div style={styles.checkmark}>
              <span style={{ fontSize: '60px' }}>✓</span>
            </div>
            <h2 style={{ fontSize: '32px', color: '#ffd700', margin: '0 0 10px 0' }}>
              ما شاء الله
            </h2>
            <p style={{ fontSize: '24px', marginBottom: '30px' }}>
              {component.type} Complete!
            </p>
            <p style={{ fontSize: '18px', color: '#888', marginBottom: '30px' }}>
              {totalRakats} Rakats • {sujoodCount} Sujood
            </p>
            
            {currentComponent < selectedPrayer.components.length - 1 ? (
              <button 
                style={{...styles.bigButton, ...styles.primaryButton, width: '280px'}}
                onClick={nextComponent}
              >
                Next: {selectedPrayer.components[currentComponent + 1].type}
              </button>
            ) : (
              <button 
                style={{...styles.bigButton, ...styles.primaryButton, width: '280px'}}
                onClick={() => setScreen('home')}
              >
                🏠 Back to Home
              </button>
            )}
          </div>
        )}

        <button style={styles.backButton} onClick={() => setScreen('home')}>
          ← Exit Prayer
        </button>

        {/* Prayer Info */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span 
            style={{
              ...styles.componentBadge,
              background: component.color
            }}
          >
            {selectedPrayer.name} - {component.type}
          </span>
        </div>

        {/* Main Counter */}
        <div style={styles.card}>
          <div style={styles.counterDisplay}>
            <div style={styles.bigNumber}>{currentRakat}</div>
            <div style={styles.label}>of {totalRakats} Rakats</div>
            
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '18px', color: '#888' }}>
              Sujood: {sujoodCount} / {totalRakats * 2}
            </div>
          </div>
        </div>

        {/* Motion Control */}
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button
              style={{
                ...styles.bigButton,
                ...(isMotionActive ? styles.dangerButton : styles.primaryButton),
                flex: 1,
                marginTop: 0
              }}
              onClick={() => {
                setIsMotionActive(!isMotionActive);
                if (!isMotionActive) {
                  setMotionStatus('waiting');
                } else {
                  setMotionStatus('idle');
                }
              }}
            >
              {isMotionActive ? '⏹ Stop Sensor' : '📱 Start Sensor'}
            </button>
          </div>

          {isMotionActive && (
            <div 
              style={{
                ...styles.statusIndicator,
                background: motionStatus === 'sujood' 
                  ? 'rgba(76, 175, 80, 0.2)' 
                  : 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <div 
                style={{
                  ...styles.pulse,
                  background: motionStatus === 'sujood' ? '#4CAF50' : '#ffd700'
                }}
              />
              <span>
                {motionStatus === 'waiting' && 'Waiting for Sujood...'}
                {motionStatus === 'sujood' && '✓ Sujood Detected!'}
              </span>
            </div>
          )}

          {lastMotion && (
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '10px' }}>
              Last detection: {lastMotion}
            </p>
          )}
        </div>

        {/* Manual Tap Zone */}
        <div 
          style={styles.tapZone}
          onClick={manualIncrement}
        >
          <span style={{ fontSize: '48px' }}>👆</span>
          <p style={{ fontSize: '20px', marginTop: '15px', color: '#4CAF50' }}>
            Tap here after each Sujood
          </p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
            Use if motion sensor is not available
          </p>
        </div>

        {/* Reset Button */}
        <button
          style={{
            ...styles.bigButton,
            ...styles.warningButton,
            marginTop: '20px'
          }}
          onClick={resetPrayer}
        >
          🔄 Reset This Prayer
        </button>

        {/* Component Progress */}
        {selectedPrayer.components.length > 1 && (
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#888' }}>
              Prayer Progress
            </h4>
            {selectedPrayer.components.map((comp, idx) => (
              <div 
                key={idx}
                style={{
                  ...styles.componentItem,
                  opacity: idx < currentComponent ? 0.5 : 1,
                  border: idx === currentComponent ? '2px solid #ffd700' : 'none'
                }}
              >
                <div style={{ ...styles.dot, background: comp.color }} />
                <span style={{ flex: 1 }}>{comp.type}</span>
                <span style={{ color: '#888' }}>{comp.rakats} Rakats</span>
                {idx < currentComponent && <span style={{ marginLeft: '10px' }}>✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default SalahCounter;