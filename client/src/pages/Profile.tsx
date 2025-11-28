import HealthGraph from '../components/HealthGraph';

export default function Profile() {
    return (
        <div className="w-full">
            {/* You can add more profile-specific things here if needed, 
                but for now we are moving the Dashboard UI (HealthGraph) here as requested. */}
            <HealthGraph />
        </div>
    );
}
