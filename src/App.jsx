import React, { useState, useMemo, useEffect } from 'react';
import { Shield, MapPin, Anchor, Heart, AlertTriangle, Loader2, ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import './index.css';

// --- UTILITY FUNCTIONS ---

const getSafetyColor = (index) => {
    if (index === 5) return 'bg-secondary-600 text-white';
    if (index >= 4) return 'bg-secondary-500 text-white';
    if (index >= 2) return 'bg-accent-500 text-surface-900';
    return 'bg-red-500 text-white';
};

const getSafetyVibe = (index) => {
    if (index === 5) return 'Excellent Protection';
    if (index >= 4) return 'Strong Legal Framework';
    if (index >= 2) return 'Basic Recognition';
    return 'High Caution';
};

const AbortionStatusBadge = ({ status }) => {
    let color = 'bg-surface-100 text-surface-700';
    let icon = <AlertTriangle className="w-3 h-3 mr-1" />;

    if (status && (status.includes('Legal') || status.includes('Protected'))) {
        color = 'bg-secondary-100 text-secondary-800 border-secondary-200';
        icon = <Heart className="w-3 h-3 mr-1" />;
    } else if (status && status.includes('Restricted')) {
        color = 'bg-accent-100 text-accent-800 border-accent-200';
        icon = <AlertTriangle className="w-3 h-3 mr-1" />;
    } else if (status && status.includes('Decriminalized')) {
        color = 'bg-primary-100 text-primary-800 border-primary-200';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${color}`}>
            {icon} {status || 'Unknown'}
        </span>
    );
};

// --- COMPONENTS ---

const CountryCard = ({ country, onClick }) => {
    const safetyClass = getSafetyColor(country.lgbtq_rights_index);

    return (
        <div
            onClick={() => onClick(country)}
            className="group p-6 border border-surface-200 rounded-xl shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white flex flex-col justify-between"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-serif font-bold text-primary-900 group-hover:text-primary-600 transition-colors">
                        {country.name}
                    </h3>
                    <span className="text-sm font-sans text-surface-500 font-medium tracking-wide">{country.iso2}</span>
                </div>
                {country.regions && (
                    <span className="text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded-md">
                        {country.regions[0]}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className={`p-4 rounded-lg flex items-center justify-between ${safetyClass} shadow-sm`}>
                    <Shield className="w-6 h-6 opacity-90" />
                    <div className="text-right">
                        <p className="text-xl font-bold leading-none">{country.lgbtq_rights_index}/5</p>
                        <p className="text-xs font-medium opacity-90 mt-1">{getSafetyVibe(country.lgbtq_rights_index)}</p>
                    </div>
                </div>

                <div className="pt-2">
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Abortion Access</p>
                    <AbortionStatusBadge status={country.abortion_access_status} />
                </div>
            </div>

            <div className="mt-6 text-xs text-surface-400 pt-4 border-t border-surface-100 flex items-center justify-between">
                <span>Verified</span>
                <span>{new Date(country.last_verified_at).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

const VisaPathList = ({ countryId, onSelectPath, onBack }) => {
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/public/visa-paths?country_id=${countryId}`)
            .then(res => res.json())
            .then(setPaths)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [countryId]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <button onClick={onBack} className="flex items-center text-surface-500 hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Countries
            </button>
            <h2 className="text-3xl font-serif font-bold mb-8">Available Visa Pathways</h2>
            <div className="grid gap-4">
                {paths.map(path => (
                    <div
                        key={path.id}
                        onClick={() => onSelectPath(path.id)}
                        className="p-6 bg-white rounded-xl border border-surface-200 shadow-sm hover:shadow-md hover:border-primary-200 cursor-pointer transition-all flex justify-between items-center group"
                    >
                        <div>
                            <h3 className="text-xl font-bold text-primary-900 group-hover:text-primary-600 transition-colors">{path.name}</h3>
                            <p className="text-surface-600 mt-1">{path.description}</p>
                            <span className="inline-block mt-3 px-2 py-1 bg-surface-100 text-surface-600 text-xs rounded font-medium uppercase tracking-wide">{path.type}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-primary-500" />
                    </div>
                ))}
                {paths.length === 0 && (
                    <div className="text-center py-10 text-surface-500 border-2 border-dashed border-surface-200 rounded-xl">
                        No visa paths found for this country yet.
                    </div>
                )}
            </div>
        </div>
    );
};

const VisaPathDetail = ({ pathId, onBack }) => {
    const [path, setPath] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/public/visa-paths/${pathId}`)
            .then(res => res.json())
            .then(setPath)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [pathId]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" /></div>;
    if (!path) return <div>Path not found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <button onClick={onBack} className="flex items-center text-surface-500 hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pathways
            </button>

            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-primary-900 mb-4">{path.name}</h1>
                <p className="text-xl text-surface-600 leading-relaxed">{path.description}</p>

                <div className="flex gap-4 mt-6">
                    <div className="px-4 py-2 bg-surface-100 rounded-lg">
                        <span className="block text-xs font-bold text-surface-500 uppercase">Type</span>
                        <span className="font-medium text-surface-900">{path.type}</span>
                    </div>
                    {path.processing_min_days && (
                        <div className="px-4 py-2 bg-surface-100 rounded-lg">
                            <span className="block text-xs font-bold text-surface-500 uppercase">Processing</span>
                            <span className="font-medium text-surface-900">{path.processing_min_days} - {path.processing_max_days} days</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-card border border-surface-200 overflow-hidden">
                <div className="p-6 border-b border-surface-100 bg-surface-50">
                    <h2 className="text-2xl font-serif font-bold flex items-center">
                        <FileText className="w-6 h-6 mr-3 text-primary-600" />
                        Requirements Checklist
                    </h2>
                </div>
                <div className="p-6">
                    <VisaPathChecklist requirements={path.requirements} />
                </div>
            </div>
        </div>
    );
};

const CountryFilterContainer = ({ onSelectCountry }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [minLgbtqIndex, setMinLgbtqIndex] = useState(3);
    const [accessFilter, setAccessFilter] = useState('All');
    const [regionFilter, setRegionFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [countries, setCountries] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/public/countries');
                if (!response.ok) throw new Error('Failed to fetch countries');
                const data = await response.json();
                setCountries(data);
            } catch (err) {
                console.error("Error fetching countries:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCountries();
    }, []);

    const availableRegions = useMemo(() => {
        const regions = new Set();
        countries.forEach(c => c.regions && c.regions.forEach(r => regions.add(r)));
        return Array.from(regions).sort();
    }, [countries]);

    const filteredCountries = useMemo(() => {
        return countries.filter(country => {
            const nameMatch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
            const lgbtqMatch = country.lgbtq_rights_index >= minLgbtqIndex;
            const accessMatch = accessFilter === 'All' ||
                (country.abortion_access_status && country.abortion_access_status.toLowerCase().includes(accessFilter.toLowerCase()));
            const regionMatch = regionFilter === 'All' || (country.regions && country.regions.includes(regionFilter));

            return nameMatch && lgbtqMatch && accessMatch && regionMatch;
        });
    }, [countries, searchQuery, minLgbtqIndex, accessFilter, regionFilter]);

    return (
        <div className="min-h-screen bg-surface-50 pb-20">

            {/* Hero Section (Authoritative & Empathetic) */}
            <header className="bg-primary-900 text-surface-50 py-20 px-4 shadow-lg">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                        Find Your <span className="text-secondary-400 italic">Safe Harbor</span>.
                    </h1>
                    <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto font-light leading-relaxed">
                        Verified immigration pathways prioritized by safety, rights, and healthcare access.
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10">
                {/* Filter Controls (Card Overlay) */}
                <div className="bg-white p-8 rounded-xl shadow-card border border-surface-200 mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-surface-100 gap-4">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                            <h2 className="text-lg font-bold text-primary-900 uppercase tracking-wide">
                                Filter Destinations
                            </h2>
                        </div>
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search countries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-4 py-2 bg-surface-50 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-surface-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Region Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                Region
                            </label>
                            <div className="relative">
                                <select
                                    value={regionFilter}
                                    onChange={(e) => setRegionFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-surface-50 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none text-surface-900"
                                >
                                    <option value="All">All Regions</option>
                                    {availableRegions.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <ChevronRight className="w-4 h-4 text-surface-500 rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* LGBTQ+ Safety Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                Minimum LGBTQ+ Rights Score
                            </label>
                            <div className="relative">
                                <select
                                    value={minLgbtqIndex}
                                    onChange={(e) => setMinLgbtqIndex(Number(e.target.value))}
                                    className="w-full pl-4 pr-10 py-3 bg-surface-50 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none text-surface-900"
                                >
                                    <option value={5}>5 - Excellent Protection</option>
                                    <option value={4}>4+ - Strong Legal Protections</option>
                                    <option value={3}>3+ - Legal but Ambiguous</option>
                                    <option value={2}>2+ - Basic Recognition</option>
                                    <option value={0}>Any Score</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <ChevronRight className="w-4 h-4 text-surface-500 rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Abortion Access Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                Abortion Access Status
                            </label>
                            <div className="relative">
                                <select
                                    value={accessFilter}
                                    onChange={(e) => setAccessFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-surface-50 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none text-surface-900"
                                >
                                    <option value="All">All Countries</option>
                                    <option value="Legal">Legal / Protected</option>
                                    <option value="Decriminalized">Decriminalized</option>
                                    <option value="Restricted">Restricted</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <ChevronRight className="w-4 h-4 text-surface-500 rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl font-serif font-bold text-primary-900">
                        Matching Destinations
                    </h2>
                    <span className="text-surface-500 font-medium">
                        {filteredCountries.length} found
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-surface-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
                        <p>Verifying latest data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 bg-red-50 rounded-xl border border-red-100">
                        <p className="font-bold">Unable to load data.</p>
                        <p className="text-sm mt-2">{error}</p>
                    </div>
                ) : filteredCountries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCountries.map(country => (
                            <CountryCard key={country.id} country={country} onClick={onSelectCountry} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-xl text-surface-500 border-2 border-dashed border-surface-200 rounded-xl bg-surface-50">
                        No countries match your strict safety filters. <br />
                        <span className="text-base mt-2 block">Try lowering the Rights Score or broadening Access Status.</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-24 py-10 border-t border-surface-200 text-center bg-white">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center justify-center text-accent-600 mb-3">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span className="font-bold text-sm uppercase tracking-wider">Important Disclaimer</span>
                    </div>
                    <p className="text-sm text-surface-500 leading-relaxed">
                        The content on this platform is for informational purposes only. It is built on verified public data but does not substitute for consultation with a licensed immigration attorney or government official.
                    </p>
                </div>
            </footer>

        </div>
    );
};

export default function App() {
    const [view, setView] = useState('list'); // 'list', 'country', 'path'
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedPathId, setSelectedPathId] = useState(null);

    const handleSelectCountry = (country) => {
        setSelectedCountry(country);
        setView('country');
    };

    const handleSelectPath = (pathId) => {
        setSelectedPathId(pathId);
        setView('path');
    };

    const handleBackToCountries = () => {
        setView('list');
        setSelectedCountry(null);
    };

    const handleBackToPaths = () => {
        setView('country');
        setSelectedPathId(null);
    };

    return (
        <div className="min-h-screen bg-surface-50 font-sans">
            {view === 'list' && <CountryFilterContainer onSelectCountry={handleSelectCountry} />}
            {view === 'country' && selectedCountry && <VisaPathList countryId={selectedCountry.id} onSelectPath={handleSelectPath} onBack={handleBackToCountries} />}
            {view === 'path' && selectedPathId && <VisaPathDetail pathId={selectedPathId} onBack={handleBackToPaths} />}
        </div>
    );
}
