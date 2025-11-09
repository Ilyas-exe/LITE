import { useEffect, useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function FloatingParticles() {
    const { theme } = useContext(ThemeContext);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (theme !== 'space') {
            setParticles([]);
            return;
        }

        // Generate particles
        const newParticles = [];
        const numParticles = 20;

        for (let i = 0; i < numParticles; i++) {
            newParticles.push({
                id: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
                size: `${2 + Math.random() * 3}px`
            });
        }

        setParticles(newParticles);
    }, [theme]);

    if (theme !== 'space') return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-1">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: particle.left,
                        top: particle.top,
                        animationDelay: particle.animationDelay,
                        animationDuration: particle.animationDuration,
                        width: particle.size,
                        height: particle.size
                    }}
                />
            ))}
        </div>
    );
}

export default FloatingParticles;
