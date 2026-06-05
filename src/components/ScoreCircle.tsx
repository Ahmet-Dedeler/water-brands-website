import { scoreTier, SCORE_COLORS } from '@/lib/format';

interface ScoreCircleProps {
    score: number;
    size?: number; // px, default 96
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, size = 96 }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
    const colors = SCORE_COLORS[scoreTier(score)];

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${colors.stroke} transition-[stroke-dashoffset] duration-500`}
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className={`absolute font-bold ${colors.text}`} style={{ fontSize: size * 0.26 }}>
                {score}
            </span>
        </div>
    );
};

export default ScoreCircle;
