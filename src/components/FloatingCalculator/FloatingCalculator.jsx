import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  History, 
  Trash2, 
  Copy, 
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import './FloatingCalculator.css';

export const FloatingCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 294, y: window.innerHeight - 434 });
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('calc_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  // Keep window in bounds on resize
  useEffect(() => {
    const handleResize = () => {
      if (isMaximized) return;
      const width = 270;
      const height = 410;
      
      setPosition(prev => {
        const x = Math.max(10, Math.min(window.innerWidth - width - 10, prev.x));
        const y = Math.max(10, Math.min(window.innerHeight - height - 10, prev.y));
        return { x, y };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  // Adjust initial position based on window size once loaded
  useEffect(() => {
    if (isMaximized) return;
    const width = 270;
    const height = 410;
    setPosition({
      x: window.innerWidth - width - 24,
      y: window.innerHeight - height - 24
    });
  }, [isOpen]);

  // Handle keyboard inputs
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Prevent capturing keys if typing in an input element
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable ||
        e.target.closest('.modal-content')
      ) {
        return;
      }

      const key = e.key;

      if (/[0-9]/.test(key)) {
        handleKeyPress(key);
      } else if (key === '+') {
        handleKeyPress('+');
      } else if (key === '-') {
        handleKeyPress('-');
      } else if (key === '*') {
        handleKeyPress('×');
      } else if (key === '/') {
        handleKeyPress('÷');
      } else if (key === '%' || key === '(' || key === ')') {
        handleKeyPress(key);
      } else if (key === '^') {
        handleKeyPress('^');
      } else if (key === '.') {
        handleKeyPress('.');
      } else if (key === ',') {
        handleKeyPress('.');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (key.toLowerCase() === 's' || key.toLowerCase() === 'r') {
        handleKeyPress('√(');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, input, isEvaluated, result]);

  // Custom drag handler (mouse)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left-click
    if (isMaximized) return; // Disable dragging when maximized!
    if (e.target.closest('.window-control-btn')) return; // Avoid drag on button clicks
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = position.x;
    const initialY = position.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const width = 270;
      const height = 410;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      // Bound within viewport
      newX = Math.max(10, Math.min(window.innerWidth - width - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - height - 10, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Custom drag handler (touch)
  const handleTouchStart = (e) => {
    if (isMaximized) return; // Disable dragging when maximized!
    if (e.target.closest('.window-control-btn')) return;
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const initialX = position.x;
    const initialY = position.y;

    const handleTouchMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      const deltaX = moveTouch.clientX - startX;
      const deltaY = moveTouch.clientY - startY;

      const width = 270;
      const height = 410;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      newX = Math.max(10, Math.min(window.innerWidth - width - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - height - 10, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleKeyPress = (val) => {
    const operators = ['+', '-', '×', '÷', '%', '^', '²'];
    
    if (isEvaluated) {
      setIsEvaluated(false);
      if (operators.includes(val)) {
        if (result && result !== 'Xəta' && result !== 'Sıfıra bölmə xətası') {
          setInput(result + val);
          setResult('');
          return;
        }
      } else if (val === '.') {
        setInput('0.');
        setResult('');
        return;
      } else {
        setInput(val);
        setResult('');
        return;
      }
    }

    const lastChar = input.slice(-1);
    const consecutiveOperators = ['+', '-', '×', '÷', '%', '.', '^', '²'];
    
    if (consecutiveOperators.includes(val) && consecutiveOperators.includes(lastChar)) {
      if (val === '-' && lastChar !== '-') {
        // Allow negative sign after some operators
      } else {
        return;
      }
    }

    setInput(prev => prev + val);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setIsEvaluated(false);
  };

  const handleBackspace = () => {
    if (isEvaluated) {
      setIsEvaluated(false);
      setResult('');
      return;
    }
    setInput(prev => prev.slice(0, -1));
  };

  const handleEvaluate = () => {
    if (!input) return;
    
    try {
      let expr = input
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/²/g, '**2')
        .replace(/\^/g, '**');

      // Check for division by zero
      if (expr.includes('/0')) {
        setResult('Sıfıra bölmə xətası');
        setIsEvaluated(true);
        return;
      }

      // Safe validation
      let validateExpr = expr.replace(/Math\.sqrt/g, '').replace(/\*\*/g, '*');
      if (!/^[0-9+\-*/().\s]+$/.test(validateExpr)) {
        setResult('Xəta');
        setIsEvaluated(true);
        return;
      }

      const evalFn = new Function(`return (${expr});`);
      const val = evalFn();
      
      if (val === undefined || isNaN(val) || !isFinite(val)) {
        setResult('Xəta');
        setIsEvaluated(true);
      } else {
        const finalVal = Number(val.toFixed(8)).toString();
        setResult(finalVal);
        setIsEvaluated(true);
        
        // Add to history
        setHistory(prev => [
          { id: Date.now(), expression: input, result: finalVal },
          ...prev.slice(0, 19) // Keep last 20
        ]);
      }
    } catch (err) {
      setResult('Xəta');
      setIsEvaluated(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const insertFromHistory = (val) => {
    setInput(prev => prev + val);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button 
          className="calculator-fab glass-panel pulse"
          onClick={() => setIsOpen(true)}
          title="Kalkulyatoru Aç"
          aria-label="Kalkulyator"
        >
          <Calculator size={24} />
        </button>
      )}

      {/* Floating Calculator Window */}
      {isOpen && (
        <div 
          className={`calculator-window glass-panel ${isMaximized ? 'maximized' : ''}`}
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
          {/* Header (Draggable) */}
          <div 
            className="calculator-header"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="header-title">
              <Calculator size={16} />
              <span>Kalkulyator</span>
            </div>
            
            <div className="header-controls">
              <button 
                className="window-control-btn"
                onClick={() => setShowHistory(!showHistory)}
                title="Tarixçə"
              >
                <History size={14} />
              </button>
              
              <button 
                className="window-control-btn"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Kiçilt" : "Böyüt"}
              >
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              
              <button 
                className="window-control-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="Gizlə"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="calculator-body-wrapper">
            {/* Main Calculator Screen */}
            <div className="calculator-screen">
              <div className="screen-expression">{input || '0'}</div>
              <div className="screen-result">{result ? `= ${result}` : ''}</div>
            </div>

            {/* Layout Grid */}
            <div className="calculator-content">
              {/* Button Pad */}
              <div className="calculator-keypad">
                <button className="key-btn operator" onClick={() => handleKeyPress('(')}>(</button>
                <button className="key-btn operator" onClick={() => handleKeyPress(')')}>)</button>
                <button className="key-btn operator" onClick={() => handleKeyPress('√(')}>√</button>
                <button className="key-btn operator" onClick={() => handleKeyPress('^')}>^</button>

                <button className="key-btn action" onClick={handleClear}>C</button>
                <button className="key-btn action" onClick={handleBackspace}>⌫</button>
                <button className="key-btn operator" onClick={() => handleKeyPress('%')}>%</button>
                <button className="key-btn operator" onClick={() => handleKeyPress('÷')}>÷</button>
                
                <button className="key-btn number" onClick={() => handleKeyPress('7')}>7</button>
                <button className="key-btn number" onClick={() => handleKeyPress('8')}>8</button>
                <button className="key-btn number" onClick={() => handleKeyPress('9')}>9</button>
                <button className="key-btn operator" onClick={() => handleKeyPress('×')}>×</button>
                
                <button className="key-btn number" onClick={() => handleKeyPress('4')}>4</button>
                <button className="key-btn number" onClick={() => handleKeyPress('5')}>5</button>
                <button className="key-btn number" onClick={() => handleKeyPress('6')}>6</button>
                <button className="key-btn operator" onClick={() => handleKeyPress('-')}>-</button>
                
                <button className="key-btn number" onClick={() => handleKeyPress('1')}>1</button>
                <button className="key-btn number" onClick={() => handleKeyPress('2')}>2</button>
                <button className="key-btn number" onClick={() => handleKeyPress('3')}>3</button>
                <button className="key-btn operator" onClick={() => handleKeyPress('+')}>+</button>
                
                <button className="key-btn number double" onClick={() => handleKeyPress('0')}>0</button>
                <button className="key-btn number" onClick={() => handleKeyPress('.')}>.</button>
                <button className="key-btn equals" onClick={handleEvaluate}>
                  <CornerDownLeft size={16} />
                </button>
              </div>

              {/* History Drawer */}
              {showHistory && (
                <div className="calculator-history-panel fade-in">
                  <div className="history-header">
                    <h4>Tarixçə</h4>
                    {history.length > 0 && (
                      <button className="clear-history-btn" onClick={clearHistory} title="Tarixçəni Təmizlə">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="history-list">
                    {history.length > 0 ? (
                      history.map(item => (
                        <div key={item.id} className="history-item">
                          <div className="history-item-formula">{item.expression}</div>
                          <div className="history-item-result-row">
                            <span className="history-item-result">= {item.result}</span>
                            <div className="history-item-actions">
                              <button 
                                onClick={() => insertFromHistory(item.result)} 
                                title="Kalkulyatora daxil et"
                                className="history-action-btn"
                              >
                                <ChevronRight size={12} />
                              </button>
                              <button 
                                onClick={() => copyToClipboard(item.result)} 
                                title="Kopyala"
                                className="history-action-btn"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="history-empty">Tarixçə boşdur</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCalculator;
