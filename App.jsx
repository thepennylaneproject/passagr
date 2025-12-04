import React, { useState, useMemo, useEffect } from 'react';
import { Shield, MapPin, Anchor, Heart, Feather, AlertTriangle } from 'lucide-react';

// --- MOCK DATA STRUCTURES ---
// Reflects the data structure defined for the Search Index and Country Hub
interface CountrySummary {
    id: string;
    name: string;
    iso2: string;
    lgbtq_rights_index: number; // 0-5
    abortion_access_status: string;
    last_verified_at: string;
}

const mockCountries: CountrySummary[] = [
    { id: 'c-por', name: 'Portugal', iso2: 'PT', lgbtq_rights_index: 5, abortion_access_status: 'Protected', last_verified_at: '2025-11-01' },
    { id: 'c-mex', name: 'Mexico', iso2: 'MX', lgbtq_rights_index: 4, abortion_access_status: 'Decriminalized/Regional', last_verified_at: '2025-11-10' },
    { id: 'c-can', name: 'Canada', iso2: 'CA', lgbtq_rights_index: 5, abortion_access_status: 'Protected', last_verified_at: '2025-10-25' },
    { id: 'c-pol', name: 'Poland', iso2: 'PL', lgbtq_rights_index: 1, abortion_access_status: 'Highly Restricted', last_verified_at: '2025-11-15' },
    { id: 'c-jpn', name: 'Japan', iso2: 'JP', lgbtq_rights_index: 2, abortion_access_status: 'Restricted', last_verified_at: '2025-10-15' },
    { id: 'c-arg', name: 'Argentina', iso2: 'AR', lgbtq_rights_index: 5, abortion_access_status: 'Protected', last_verified_at: '2025-11-12' },
];

// --- UTILITY FUNCTIONS ---

const getSafetyColor = (index: number) => {
    if (index === 5) return 'bg-emerald-600 text-white';
    if (index >= 4) return 'bg-green-500 text-white';
    if (index >= 2) return 'bg-yellow-500 text-gray-900';
    return 'bg-red-500 text-white';
};

const getSafetyVibe = (index: number) => {
    if (index === 5) return 'Excellent Protection';
    if (index >= 4) return 'Strong Legal Framework';
    if (index >= 2) return 'Basic Recognition';
    return 'High Caution';
};

const AbortionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let color = 'bg-gray-100 text-gray-700';
    let icon = <Feather className="w-4 h-4 mr-1" />;

    if (status.includes('Protected')) {
        color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        icon = <Heart className="w-4 h-4 mr-1" />;
    } else if (status.includes('Restricted')) {
        color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        icon = <AlertTriangle className="w-4 h-4 mr-1" />;
    } else if (status.includes('Decriminalized')) {
        color = 'bg-blue-100 text-blue-800 border-blue-300';
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${color}`}>
            {icon} {status}
        </span>
    );
};

// --- MAIN COMPONENTS ---

const CountryCard: React.FC<{ country: CountrySummary }> = ({ country }) => {
    const safetyClass = getSafetyColor(country.lgbtq_rights_index);

    // Mock link handler for demonstration
    const handleClick = () => {
        console.log(`Navigating to Visa Paths for ${country.name}`);
        // In a real app: window.location.href = `/countries/${country.id}`;
    };

    return (
        <div
            onClick={handleClick}
            className="p-6 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer bg-white flex flex-col justify-between"
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{country.name}</h3>
                <span className="text-sm text-gray-500">{country.iso2}</span>
            </div>

            <div className="space-y-3">
                <div className={`p-3 rounded-lg flex items-center justify-between ${safetyClass}`}>
                    <Shield className="w-5 h-5" />
                    <div className="text-right">
                        <p className="text-lg font-bold">{country.lgbtq_rights_index}/5</p>
                        <p className="text-xs font-medium">{getSafetyVibe(country.lgbtq_rights_index)}</p>
                    </div>
                </div>

                <div className="pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Abortion Access:</p>
                    <AbortionStatusBadge status={country.abortion_access_status} />
                </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 pt-3 border-t">
                Last Verified: {new Date(country.last_verified_at).toLocaleDateString()}
            </div>
        </div>
    );
};


const CountryFilterContainer: React.FC = () => {
    const [minLgbtqIndex, setMinLgbtqIndex] = useState(3);
    const [accessFilter, setAccessFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState < CountrySummary[] > (mockCountries);

    // In a real application, this is where you'd fetch from the public API
    // useEffect(() => {
    //     setIsLoading(true);
    //     // fetch('/public/countries').then(res => res.json()).then(setCountries).finally(() => setIsLoading(false));
    // }, []);

    const filteredCountries = useMemo(() => {
        return countries.filter(country => {
            const lgbtqMatch = country.lgbtq_rights_index >= minLgbtqIndex;
            const accessMatch = accessFilter === 'All' || country.abortion_access_status.includes(accessFilter);
            return lgbtqMatch && accessMatch;
        });
    }, [countries, minLgbtqIndex, accessFilter]);

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto">

            {/* Mission Statement and Header (Empathetic & Inspiring) */}
            <header className="text-center mb-12 py-10 bg-indigo-50 rounded-xl shadow-inner">
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight font-serif tracking-tight">
                    Your Personal Guide to <span className="text-indigo-600">Freedom</span>.
                </h1>
                <p className="mt-4 text-xl text-gray-700 max-w-3xl mx-auto">
                    We provide **verified, safety-focused** pathways built for women, the LGBTQ+ community, and people of color seeking security abroad.
                </p>
            </header>

            {/* Filter Controls (Grounded & Actionable) */}
            <div className="bg-white p-8 rounded-xl shadow-2xl mb-12 border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-indigo-600" /> Filter Destinations by Critical Safety Needs
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LGBTQ+ Safety Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum LGBTQ+ Rights Score (5 = Highest Protection)</label>
                        <select
                            value={minLgbtqIndex}
                            onChange={(e) => setMinLgbtqIndex(Number(e.target.value))}
                            className="w-full pl-3 pr-10 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value={4}>4+ (Strong Legal Protections)</option>
                            <option value={3}>3+ (Legal but Ambiguous)</option>
                            <option value={2}>2+ (Basic Recognition)</option>
                            <option value={0}>Any Score</option>
                        </select>
                    </div>

                    {/* Abortion Access Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Abortion Access Status</label>
                        <select
                            value={accessFilter}
                            onChange={(e) => setAccessFilter(e.target.value)}
                            className="w-full pl-3 pr-10 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="All">All Countries</option>
                            <option value="Protected">Protected by Law (Highest Priority)</option>
                            <option value="Decriminalized">Decriminalized/Regional (Moderate Caution)</option>
                            <option value="Restricted">Restricted/Criminalized (High Caution)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results */}
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Matching Destinations ({filteredCountries.length})
            </h2>

            {isLoading ? (
                <div className="text-center py-10 text-lg text-gray-500">Loading verified data...</div>
            ) : filteredCountries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCountries.map(country => (
                        <CountryCard key={country.id} country={country} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-xl text-gray-600 border border-dashed p-10 rounded-xl">
                    No countries match your strict safety filters. Try broadening your criteria.
                </div>
            )}

            {/* Legal Notice Footer */}
            <footer className="mt-20 pt-6 border-t border-gray-200 text-center">
                <blockquote className="text-xs text-gray-500 max-w-2xl mx-auto">
                    <AlertTriangle className="w-4 h-4 inline mr-1 -mt-0.5 text-yellow-500" />
                    **Not Legal Advice:** The content on this platform is for informational purposes only. It is built on verified public data but does not substitute for consultation with a licensed immigration attorney or government official.
                </blockquote>
            </footer>

        </div>
    );
};


// Main App component
export default function App() {
    // Setting up the React App with Tailwind aesthetics (assumed available)
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <CountryFilterContainer />
        </div>
    );
}