
import React from 'react';

interface InsigniaProps {
  size?: number;
  className?: string;
}

export const EscuelaInsignia: React.FC<InsigniaProps> = ({ size = 60, className = "" }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size * 1.25 }}>
      <svg 
        viewBox="0 0 400 500" 
        className="w-full h-full drop-shadow-2xl"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cuerpo del Escudo (Heraldry Shape) */}
        <path 
          d="M10 10H390V340C390 410 280 475 200 490C120 475 10 410 10 340V10Z" 
          fill="#1A2B4B" 
          stroke="#EAB308" 
          strokeWidth="14"
        />
        {/* Línea interior decorativa del borde */}
        <path 
          d="M25 25H375V340C375 400 275 460 200 475C125 460 25 400 25 340V25Z" 
          stroke="#2563EB" 
          strokeWidth="3"
          opacity="0.5"
        />
        
        {/* Texto Superior: TINGUIRIRICA */}
        <text 
          x="200" 
          y="75" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="system-ui, sans-serif"
          fontWeight="500"
          fontSize="48"
          style={{ letterSpacing: '4px' }}
        >
          TINGUIRIRICA
        </text>

        {/* Siglas Centrales: LQT (Separadas para control total de proporciones) */}
        {/* Letra L */}
        <text 
          x="110" 
          y="275" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="serif" 
          fontWeight="900"
          fontSize="160"
        >
          L
        </text>

        {/* Letra Q (El centro) */}
        <text 
          x="200" 
          y="275" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="serif" 
          fontWeight="900"
          fontSize="190"
        >
          Q
        </text>

        {/* Letra T */}
        <text 
          x="300" 
          y="275" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="serif" 
          fontWeight="900"
          fontSize="160"
        >
          T
        </text>

        {/* Laurel / Emblema dentro de la Q */}
        <g transform="translate(200, 225) scale(0.9)">
          {/* Círculo central punteado */}
          <circle r="38" stroke="#EAB308" strokeWidth="3" strokeDasharray="4 4" />
          {/* Hojas de Laurel simplificadas */}
          <path d="M-25 15 Q-40 -10 0 -30 Q40 -10 25 15" stroke="#EAB308" strokeWidth="4" fill="none" />
          <path d="M-15 10 Q-25 0 0 -20 Q25 0 15 10" stroke="#EAB308" strokeWidth="3" fill="none" opacity="0.7" />
          {/* El fruto rojo central */}
          <circle cy="25" r="10" fill="#EF4444" />
        </g>

        {/* Texto Inferior: ESCUELA */}
        <text 
          x="200" 
          y="350" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="30"
          style={{ letterSpacing: '2px' }}
        >
          ESCUELA
        </text>

        {/* Texto Inferior: LAS QUEZADAS */}
        <text 
          x="200" 
          y="388" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="30"
          style={{ letterSpacing: '2px' }}
        >
          LAS QUEZADAS
        </text>

        {/* Identificador: F-413 */}
        <text 
          x="200" 
          y="445" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="44"
        >
          F-413
        </text>
      </svg>
    </div>
  );
};
