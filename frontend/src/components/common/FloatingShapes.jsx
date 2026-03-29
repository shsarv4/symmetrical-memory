import React, { useEffect, useState } from 'react';

function FloatingShapes() {
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    // Generate 6-8 random floating shapes
    const count = 6 + Math.floor(Math.random() * 3);
    const newShapes = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 150 + Math.random() * 200,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 20,
      delay: Math.random() * 10,
      color: ['#c8b6ff', '#f8c8dc', '#b8f5e0', '#fef3c7', '#a5f3fc', '#ffd6e0'][i % 6]
    }));
    setShapes(newShapes);
  }, []);

  return (
    <div className="floating-shapes" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      {shapes.map(shape => (
        <div
          key={shape.id}
          style={{
            position: 'absolute',
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            background: `radial-gradient(circle, ${shape.color}33 0%, transparent 70%)`,
            borderRadius: '50%',
            animation: `float ${shape.duration}s ease-in-out ${shape.delay}s infinite alternate`,
            filter: 'blur(40px)',
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
}

export default FloatingShapes;
