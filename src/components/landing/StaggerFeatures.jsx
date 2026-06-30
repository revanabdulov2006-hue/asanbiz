import { useState, useEffect } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import './StaggerFeatures.css';

const SQRT_5000 = Math.sqrt(5000);

export default function StaggerFeatures({ items = [] }) {
  const [cardSize, setCardSize] = useState(365);
  const [list, setList] = useState(() => items.map((item, i) => ({ ...item, _key: i })));

  const handleMove = (steps) => {
    const newList = [...list];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, _key: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, _key: Math.random() });
      }
    }
    setList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      setCardSize(window.matchMedia('(min-width: 640px)').matches ? 365 : 290);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="sf-container">
      {list.map((item, index) => {
        const position =
          list.length % 2
            ? index - (list.length + 1) / 2
            : index - list.length / 2;
        const isCenter = position === 0;

        return (
          <div
            key={item._key}
            className={`sf-card${isCenter ? ' center' : ''}`}
            onClick={() => handleMove(position)}
            style={{
              width: cardSize,
              height: cardSize,
              clipPath:
                'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
              transform: `
                translate(-50%, -50%)
                translateX(${(cardSize / 1.5) * position}px)
                translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
                rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
              `,
              boxShadow: isCenter
                ? '0px 8px 0px 4px rgba(0,0,0,0.08)'
                : '0px 0px 0px 0px transparent',
              zIndex: isCenter ? 10 : 0,
            }}
          >
            <span className="sf-corner" style={{ width: SQRT_5000 }} />
            <div className="sf-icon">{item.icon}</div>
            <h3 className="sf-title">{item.title}</h3>
            <p className="sf-desc">{item.desc}</p>
          </div>
        );
      })}

      <div className="sf-nav">
        <button className="sf-btn" onClick={() => handleMove(-1)} aria-label="Əvvəlki">
          <CaretLeft size={20} weight="bold" />
        </button>
        <button className="sf-btn" onClick={() => handleMove(1)} aria-label="Növbəti">
          <CaretRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
