/**
 * ProfileCard Component
 * Displays user profile information.
 * 
 * @param {Object} props
 * @param {Object} props.user - User object with name, creditScore, tier
 */
export default function ProfileCard({ user = {} }) {
    const { name = 'User', creditScore = 0, tier = 'Free' } = user;

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Get initial for avatar
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="card h-full flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                {initial}
            </div>

            <div>
                <p className="text-sm text-slate-500">{getGreeting()},</p>
                <h2 className="text-lg font-semibold">{name}</h2>

                <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        Credit: {creditScore}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full ${tier === 'Pro'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                        {tier}
                    </span>
                </div>
            </div>
        </div>
    );
}
