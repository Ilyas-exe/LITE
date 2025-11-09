import { useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function ShootingStars() {
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        if (theme !== 'space') return;

        const createShootingStar = () => {
            const star = document.createElement('div');
            star.className = 'shooting-star';

            // Random starting position (top-right area)
            star.style.top = `${Math.random() * 30}%`;
            star.style.left = `${70 + Math.random() * 30}%`;

            document.body.appendChild(star);

            // Remove after animation
            setTimeout(() => {
                star.remove();
            }, 3000);
        };

        // Create shooting stars at random intervals
        const interval = setInterval(() => {
            if (Math.random() > 0.5) {
                createShootingStar();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [theme]);

    return null;
}

export default ShootingStars;
