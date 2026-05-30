import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { songsDB } from './songsDB'; 

// --- ICONS (Inline SVGs) ---
const IconMusic = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconMessage = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconMessageSquare = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

// --- TRANSPOSITION LOGIC ---
const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
function transposeChord(chord, steps) {
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    const root = match[1];
    const suffix = match[2];
    let index = NOTES.indexOf(root);
    if (index === -1) {
        const enharmonics = { 'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb' };
        if (enharmonics[root]) index = NOTES.indexOf(enharmonics[root]);
        if (index === -1) return chord;
    }
    let newIndex = (index + steps) % 12;
    if (newIndex < 0) newIndex += 12;
    return NOTES[newIndex] + suffix;
}

// --- COMPONENTS ---

// UPDATED: Ultimate Guitar Style Chords (Stacked above lyrics)
const HymnRenderer = ({ lyrics, transposeSteps }) => {
    const lines = lyrics.split('\n');
    return (
        <div className="hymn-lyrics text-slate-800 text-lg font-sans">
            {lines.map((line, i) => {
                if (line.trim() === '') return <div key={i} className="h-6"></div>; // Empty line spacer
                
                const parts = line.split('[');
                const segments = [];
                
                parts.forEach((part, idx) => {
                    if (idx === 0) {
                        if (part) segments.push({ chord: '', text: part });
                    } else {
                        const closeIdx = part.indexOf(']');
                        if (closeIdx !== -1) {
                            const originalChord = part.substring(0, closeIdx);
                            const text = part.substring(closeIdx + 1);
                            const transposed = transposeSteps !== 0 ? transposeChord(originalChord, transposeSteps) : originalChord;
                            segments.push({ chord: transposed, text: text });
                        } else {
                            segments.push({ chord: '', text: '[' + part });
                        }
                    }
                });

                return (
                    <div key={i} className="flex flex-wrap items-end mb-3">
                        {segments.map((seg, idx) => (
                            <div key={idx} className="flex flex-col">
                                {/* Chord on top, min-height ensures alignment even if there is no chord */}
                                <span className="text-amber-600 font-bold text-sm min-h-[1.25rem]">{seg.chord}</span>
                                {/* Text on bottom, whitespace-pre keeps exact spacing intact */}
                                <span className="whitespace-pre text-lg">{seg.text}</span>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

const HymnLibrary = ({ addToProgram, programType }) => {
    const [search, setSearch] = useState('');
    const [selectedHymn, setSelectedHymn] = useState(null);
    const [transpose, setTranspose] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Hymn');

    const filteredHymns = songsDB.filter(h => 
        h.category === activeCategory &&
        (h.title.toLowerCase().includes(search.toLowerCase()) || h.lyrics.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => a.title.localeCompare(b.title));

    const handleAddToProgram = (section) => { addToProgram(section, { ...selectedHymn, transpose }); setShowAddModal(false); };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full relative">
            <div className={`w-full md:w-1/3 flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full ${selectedHymn ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex bg-slate-200 p-1 rounded-lg mb-3">
                        <button 
                            onClick={() => { setActiveCategory('Hymn'); setSelectedHymn(null); }} 
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${activeCategory === 'Hymn' ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Traditional
                        </button>
                        <button 
                            onClick={() => { setActiveCategory('Contemporary'); setSelectedHymn(null); }} 
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${activeCategory === 'Contemporary' ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Contemporary
                        </button>
                    </div>

                    <div className="relative">
                        <IconSearch className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder={`Search ${activeCategory === 'Hymn' ? 'hymns' : 'worship songs'}...`} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none transition" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredHymns.map(hymn => (
                        <button key={hymn.id} onClick={() => { setSelectedHymn(hymn); setTranspose(0); }} className={`w-full text-left px-5 py-4 border-b border-slate-100 hover:bg-amber-50 transition ${selectedHymn?.id === hymn.id ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''}`}>
                            <div className="font-semibold text-slate-800 font-serif text-lg">{hymn.title}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                                <span>{hymn.author}</span>
                                {hymn.language && <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{hymn.language}</span>}
                            </div>
                        </button>
                    ))}
                    {filteredHymns.length === 0 && (
                        <div className="text-center p-6 text-slate-400 text-sm">No songs found in this category.</div>
                    )}
                </div>
            </div>

            <div className={`w-full md:w-2/3 bg-white border border-slate-200 rounded-xl flex-col shadow-sm h-full overflow-hidden ${!selectedHymn ? 'hidden md:flex' : 'flex'}`}>
                {selectedHymn ? (
                    <>
                        <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-900 text-white flex flex-col justify-between shrink-0">
                            <button 
                                onClick={() => setSelectedHymn(null)} 
                                className="md:hidden mb-4 text-amber-400 text-sm font-bold flex items-center w-max"
                            >
                                &larr; Back to Songs
                            </button>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif text-amber-400">{selectedHymn.title}</h2>
                                    <p className="text-slate-300 text-sm">By {selectedHymn.author} &bull; {selectedHymn.language}</p>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex-1 md:flex-none">
                                        <button onClick={() => setTranspose(p => p - 1)} className="flex-1 md:flex-none px-3 py-1 hover:bg-slate-700 font-bold">-</button>
                                        <div className="px-3 py-1 bg-slate-800 flex items-center justify-center text-sm font-medium border-x border-slate-700">Key: {transpose > 0 ? `+${transpose}` : transpose}</div>
                                        <button onClick={() => setTranspose(p => p + 1)} className="flex-1 md:flex-none px-3 py-1 hover:bg-slate-700 font-bold">+</button>
                                    </div>
                                    <button onClick={() => setShowAddModal(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-1.5 rounded-lg flex items-center justify-center transition shadow-sm">
                                        <IconPlus className="w-4 h-4 md:mr-1" /> <span className="hidden md:inline">Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex-1 overflow-y-auto paper-bg">
                            <HymnRenderer lyrics={selectedHymn.lyrics} transposeSteps={transpose} />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-[#fcfbf9]">
                        <IconMusic className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-serif">Select a song from the library</p>
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-800">Add to {programType === 'sunday' ? 'Sunday Service' : 'Prayer Meeting'}</h3>
                                <p className="text-sm text-amber-600 font-medium mt-1">"{selectedHymn.title}"</p>
                            </div>
                            <div className="p-2 h-64 overflow-y-auto">
                                {(programType === 'sunday' ? [
                                    { id: 'sundaySchool', label: 'Sunday School Hymns (Max 2)' }, { id: 'welcome', label: 'Welcome Song' }, { id: 'callToWorship', label: 'Call to Worship Hymn' },
                                    { id: 'divineWorship', label: 'Divine Worship Hymn' }, { id: 'offering', label: 'Offering Hymn' }, { id: 'response', label: 'Response Hymn' }, { id: 'sevenFoldAmen', label: 'Seven Fold Amen' }
                                ] : [
                                    { id: 'openingHymns', label: 'Two Hymns (Max 2)' }, { id: 'offering', label: 'Offering Hymn' }, { id: 'response', label: 'Response Song' }, { id: 'threefoldAmen', label: 'Threefold Amen' }
                                ]).map(section => (
                                    <button key={section.id} onClick={() => handleAddToProgram(section.id)} className="w-full text-left px-4 py-3 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition font-medium text-slate-700 border-b border-slate-50 last:border-0">
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProgramBuilder = ({ programs, setPrograms, programType, setProgramType, navigateToLibrary }) => {
    const printRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const currentProgram = programs[programType];

    const handleRemove = (sectionId, index = null) => {
        setPrograms(prev => {
            const next = {...prev};
            const currentProg = {...next[programType]};
            if (Array.isArray(currentProg[sectionId])) currentProg[sectionId] = currentProg[sectionId].filter((_, i) => i !== index);
            else currentProg[sectionId] = null;
            next[programType] = currentProg;
            return next;
        });
    };

    const handleReadingChange = (field, value) => setPrograms(prev => ({ ...prev, [programType]: { ...prev[programType], responsiveReading: { ...prev[programType].responsiveReading, [field]: value } } }));

    const exportAsImage = async () => {
        setIsExporting(true);
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fcfbf9' });
                const link = document.createElement('a'); link.download = `Bethsaida-Program.png`; link.href = canvas.toDataURL('image/png'); link.click();
            } catch (err) { console.error("Export Image failed:", err); }
            setIsExporting(false);
        }, 100);
    };

    const exportAsPDF = async () => {
        setIsExporting(true);
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fcfbf9' });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Bethsaida-Program.pdf`);
            } catch (err) { console.error("Export PDF failed:", err); }
            setIsExporting(false);
        }, 100);
    };

    const SectionSlot = ({ title, sectionId, isMultiple = false }) => {
        const items = isMultiple ? currentProgram[sectionId] : (currentProgram[sectionId] ? [currentProgram[sectionId]] : []);
        return (
            <div className="mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base">{title}</h3>
                    {!isExporting && <button onClick={navigateToLibrary} className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center px-2 py-1 bg-amber-50 rounded-md"><IconPlus className="w-3 h-3 mr-1" /> <span className="hidden md:inline">Add Song</span></button>}
                </div>
                <div className="p-3 md:p-4">
                    {items.length === 0 ? ( <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs md:text-sm">{isExporting ? "---" : "No hymn selected. Click 'Add'."}</div> ) : (
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                    <div>
                                        <p className="font-bold text-slate-900 font-serif text-base md:text-lg">{item.title} {item.transpose !== 0 && <span className="text-xs font-sans text-amber-600 font-normal ml-2">(Key: {item.transpose > 0 ? `+${item.transpose}` : item.transpose})</span>}</p>
                                        <p className="text-xs text-slate-500">By {item.author}</p>
                                    </div>
                                    {!isExporting && <button onClick={() => handleRemove(sectionId, isMultiple ? idx : null)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"><IconTrash className="w-4 h-4" /></button>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderResponsiveReading = () => (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><h3 className="font-semibold text-slate-800">Responsive Reading</h3></div>
            <div className="p-4 grid grid-cols-3 gap-2 md:gap-3">
                {['book', 'chapter', 'verse'].map(field => (
                    <div key={field}>
                        <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{field}</label>
                        {isExporting ? <p className="font-serif text-base md:text-lg font-medium text-slate-800">{currentProgram.responsiveReading[field] || '---'}</p> : 
                            <input type="text" value={currentProgram.responsiveReading[field]} onChange={(e) => handleReadingChange(field, e.target.value)} className="w-full px-2 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm" />
                        }
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 font-serif">Service Program</h2>
                    {!isExporting && (
                        <div className="flex gap-2 mt-3 bg-slate-100 p-1 rounded-lg w-max">
                            <button onClick={() => setProgramType('sunday')} className={`px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-md font-medium transition ${programType === 'sunday' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Sunday</button>
                            <button onClick={() => setProgramType('prayer')} className={`px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-md font-medium transition ${programType === 'prayer' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Prayer Meeting</button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={exportAsImage} className="flex-1 md:flex-none flex justify-center items-center px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200 transition"><IconDownload className="w-4 h-4 mr-2" /> Image</button>
                    <button onClick={exportAsPDF} className="flex-1 md:flex-none flex justify-center items-center px-4 py-2 bg-slate-900 text-amber-400 rounded-lg text-sm font-bold hover:bg-slate-800 transition"><IconDownload className="w-4 h-4 mr-2" /> PDF</button>
                </div>
            </div>

            <div ref={printRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-12 p-4 md:p-8 paper-bg rounded-xl border border-slate-200 shadow-inner">
                {isExporting && (
                    <div className="col-span-full mb-8 text-center border-b-2 border-slate-200 pb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">BETHSAIDA MUSIC TEAM</h1>
                        <h2 className="text-xl md:text-2xl font-semibold text-amber-600 mt-2 font-serif">{programType === 'sunday' ? 'Sunday Service' : 'Prayer Meeting'} Program</h2>
                        <p className="text-slate-500 mt-3 italic font-serif text-base md:text-lg">"Make a joyful noise unto the Lord."</p>
                    </div>
                )}
                {programType === 'sunday' ? (
                    <>
                        <div><SectionSlot title="Sunday School Hymns" sectionId="sundaySchool" isMultiple={true} /><SectionSlot title="Welcome Song" sectionId="welcome" /><SectionSlot title="Call to Worship Hymn" sectionId="callToWorship" /></div>
                        <div><SectionSlot title="Divine Worship Hymn" sectionId="divineWorship" />{renderResponsiveReading()}<SectionSlot title="Offering Hymn" sectionId="offering" /><SectionSlot title="Response Hymn" sectionId="response" /><SectionSlot title="Seven Fold Amen" sectionId="sevenFoldAmen" /></div>
                    </>
                ) : (
                    <>
                        <div><SectionSlot title="Two Hymns" sectionId="openingHymns" isMultiple={true} />{renderResponsiveReading()}</div>
                        <div><SectionSlot title="Offering Hymn" sectionId="offering" /><SectionSlot title="Response Song" sectionId="response" /><SectionSlot title="Threefold Amen" sectionId="threefoldAmen" /></div>
                    </>
                )}
            </div>
        </div>
    );
};

const AIAssistant = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{ role: 'model', text: "Hello! I am your Bethsaida Music Team AI. Need a hymn suggestion for a specific topic, scripture, or sermon theme? Just ask!" }]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const apiKey = import.meta.env.VITE_GROQ_API_KEY; 

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userText = input;
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput(''); setIsLoading(true);

        try {
            if (!apiKey) {
                throw new Error("API Key is missing! Did you forget to add your .env file before building?");
            }

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a helpful worship leader assistant for the Bethsaida Music Team. Keep responses concise and focused on traditional Christian hymns." },
                        { role: "user", content: "Recommend traditional hymns based on this request: " + userText }
                    ]
                })
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const data = await response.json();
            if (data.choices && data.choices.length > 0) setMessages(prev => [...prev, { role: 'model', text: data.choices[0].message.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: `System Error: ${error.message}` }]);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center shrink-0">
                <div className="bg-amber-500 text-slate-900 p-2 rounded-lg mr-3 shadow-md"><IconMessageSquare /></div>
                <div><h2 className="text-lg md:text-xl font-bold font-serif">Music Team Assistant</h2><p className="text-amber-200 text-[10px] md:text-xs">Powered by Llama 3.3 AI</p></div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 shadow-sm ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}}></div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-sm p-3 flex gap-1 shadow-sm">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 border-t border-slate-200 bg-white shrink-0">
                <div className="flex gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask the AI..." className="flex-1 px-4 py-2 md:py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm text-sm" />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white p-2 md:p-3 rounded-xl transition shadow-sm flex items-center justify-center w-10 h-10 md:w-12 md:h-12"><IconSend /></button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('library');
    const [programType, setProgramType] = useState('sunday');
    const [programs, setPrograms] = useState({
        sunday: { sundaySchool: [], welcome: null, callToWorship: null, divineWorship: null, responsiveReading: { book: '', chapter: '', verse: '' }, offering: null, response: null, sevenFoldAmen: null },
        prayer: { openingHymns: [], responsiveReading: { book: '', chapter: '', verse: '' }, offering: null, response: null, threefoldAmen: null }
    });

    const handleAddToProgram = (section, hymn) => {
        setPrograms(prev => {
            const currentProg = prev[programType];
            let newSectionData = currentProg[section];
            if (Array.isArray(newSectionData)) {
                if (newSectionData.length < 2) newSectionData = [...newSectionData, hymn];
                else newSectionData = [newSectionData[0], hymn];
            } else newSectionData = hymn;
            return { ...prev, [programType]: { ...currentProg, [section]: newSectionData } };
        });
        setActiveTab('program');
    };

    const NavItem = ({ id, label, icon: Icon }) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center w-full px-4 py-3 rounded-xl mb-2 transition font-medium ${activeTab === id ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Icon /> <span className="ml-3 hidden md:block">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans text-slate-800">
            
            {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
            <div className="hidden md:flex w-64 bg-slate-900 text-slate-200 flex-col p-4 shadow-xl z-10 shrink-0">
                <div className="mb-8">
                    <h1 className="text-xl font-bold font-serif text-white tracking-wide">Bethsaida</h1>
                    <p className="text-amber-500 text-xs uppercase tracking-widest font-bold mt-1">Music Team</p>
                </div>
                <nav className="flex-1">
                    <NavItem id="library" label="Hymn Library" icon={IconMusic} />
                    <NavItem id="program" label="Service Program" icon={IconList} />
                    <NavItem id="ai" label="AI Assistant" icon={IconMessage} />
                </nav>
                
                {/* UPDATED FOOTER WITH YOUR NAME */}
                <div className="mt-auto pb-4 text-xs text-slate-500 text-center font-bold tracking-wide">Created by Archie Abona</div>
            </div>

            {/* MOBILE TOP HEADER (Hidden on Desktop) */}
            <div className="md:hidden bg-slate-900 p-3 flex justify-center items-center shadow-md z-10 shrink-0">
                <IconMusic className="text-amber-500 w-5 h-5 mr-2" />
                <h1 className="text-lg font-bold font-serif text-white tracking-wide">Bethsaida</h1>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 p-4 md:p-6 overflow-hidden h-full">
                {activeTab === 'library' && <HymnLibrary addToProgram={handleAddToProgram} programType={programType} />}
                {activeTab === 'program' && <ProgramBuilder programs={programs} setPrograms={setPrograms} programType={programType} setProgramType={setProgramType} navigateToLibrary={() => setActiveTab('library')} />}
                {activeTab === 'ai' && <AIAssistant />}
            </div>

            {/* MOBILE BOTTOM TAB NAV (Hidden on Desktop) */}
            <div className="md:hidden bg-slate-900 flex justify-around p-2 shadow-[0_-4px_10px_rgba(0,0,0,0.2)] shrink-0 z-20 pb-6">
                <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center flex-1 p-2 transition ${activeTab === 'library' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}>
                    <IconMusic />
                    <span className="text-[10px] mt-1 font-bold tracking-wide">Library</span>
                </button>
                <button onClick={() => setActiveTab('program')} className={`flex flex-col items-center flex-1 p-2 transition ${activeTab === 'program' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}>
                    <IconList />
                    <span className="text-[10px] mt-1 font-bold tracking-wide">Program</span>
                </button>
                <button onClick={() => setActiveTab('ai')} className={`flex flex-col items-center flex-1 p-2 transition ${activeTab === 'ai' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}>
                    <IconMessage />
                    <span className="text-[10px] mt-1 font-bold tracking-wide">AI</span>
                </button>
            </div>

        </div>
    );
}