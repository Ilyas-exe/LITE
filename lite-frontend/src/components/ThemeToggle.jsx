import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function ThemeToggle() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'space' ? 'Dark' : 'Space'} Theme`}
        >
            {theme === 'space' ? '🌙 DARK' : '🌌 SPACE'}
        </button>
    );
}

export default ThemeToggle;
