import { useEffect, useRef } from 'react';

function StarfieldBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let stars = [];

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        // Create stars
        const initStars = () => {
            stars = [];
            const numStars = Math.floor((canvas.width * canvas.height) / 3000);

            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5,
                    opacity: Math.random() * 0.5 + 0.3,
                    twinkleSpeed: Math.random() * 0.02 + 0.005,
                    twinklePhase: Math.random() * Math.PI * 2
                });
            }
        };

        // Animation loop
        const animate = () => {
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars with twinkling effect
            stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed;
                const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
                ctx.fill();

                // Add glow for larger stars
                if (star.radius > 1) {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(59, 130, 246, ${star.opacity * twinkle * 0.3})`;
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
}

export default StarfieldBackground;
