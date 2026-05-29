import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- HYMN DATABASE ---
const hymnsDB = [
    { id: 1, title: "Amazing Grace", author: "John Newton", lyrics: `[G]Amazing grace! How [C]sweet the [G]sound\nThat saved a wretch like [D]me!\nI [G]once was lost, but [C]now am [G]found;\nWas blind, but [D]now I [G]see.` },
    { id: 2, title: "How Great Thou Art", author: "Carl Boberg", lyrics: `[G]O Lord my God, when [C]I in awesome wonder\nCon[G]sider all the [D]worlds Thy hands have [G]made,\nI see the stars, I [C]hear the rolling thunder,\nThy [G]power through[D]out the universe dis[G]played.\n\nChorus:\nThen sings my [G]soul, my [C]Savior God, to [G]Thee:\nHow great Thou [D]art, how great Thou [G]art!` },
    { id: 3, title: "Holy, Holy, Holy", author: "Reginald Heber", lyrics: `[D]Holy, holy, [Bm]ho[A]ly! [D]Lord [G]God Al[D]mighty!\n[A]Early in the [Bm]morn[A]ing our [E]song shall rise to [A]Thee;\n[D]Holy, holy, [Bm]ho[A]ly, [D]merci[G]ful and [D]mighty!\n[Bm]God in three [G]Per[D]sons, [Em]blessed [A]Trini[D]ty!` },
    { id: 61, title: "Come Thou Fount of Every Blessing", author: "Robert Robinson 1758", lyrics: `[C]Come, Thou Fount of every [G]blessing, tune my [F]heart to sing [G]Thy [C]grace;\n[C]Streams of mercy, never [G]ceasing, call for [F]songs of [G]loudest [C]praise.\n[Am]Teach [G]me [F]some melodious sonnet, [Am]sung [G]by flaming tongues a[F]bove.\n[C]Praise the mount! I'm fixed up[G]on it, Mount of [F]God's re[G]deeming [C]love.` },
    { id: 62, title: "Tell It To Jesus", author: "Edmund S. Lorenz", lyrics: `[G]Are you weary, [C]are you heavy [G]hearted?\n[D]Tell it to Jesus, [G]tell it to Jesus.\nAre you grieving [C]over joys [G]departed?\n[D]Tell it to Jesus [G]alone.\n\nChorus:\n[D]Tell it to Jesus, [G]tell it to Jesus,\n[C]He is a [G]friend that's well [D]known.\n[G]You've no other [C]such a friend or [G]brother,\n[G]Tell it to [D]Jesus [G]alone.` },
    { id: 63, title: "Glory To His Name", author: "E.A. Hoffman", lyrics: `[G]Down at the cross where my [C]Savior died,\n[G]down where for cleansing from sin I [D]cried;\n[G]There to my heart was the [C]blood applied;\n[G]Glory to [D]His [G]Name!\n\nChorus:\n[C]Glory to His na-a-ame, [G]glory to His [D]na-a-ame!\n[G]There to my heart was the [C]blood applied;\n[G]Glory to [D]His [G]name!` },
    { id: 64, title: "Seven Fold Amen", author: "Traditional", lyrics: `[A]A-------[D]men\n[A]-------[E]men\n[A]-------[F#m]men\n[A]A...a...a..aa.a.[A7]a..[E]men [D]\n[C#m]A...men\n[D]A....men\n[Esus]A........[E]men [A]` },
    { id: 65, title: "I Have Decided To Follow Jesus", author: "Traditional", lyrics: `[C]I have decided to follow Jesus; [C7]\n[F]I have decided to follow [C]Jesus;\n[C]I have decided to follow [Am]Jesus;\n[C]No turning back, [G]no [G7]turning [C]back.` },
    { id: 66, title: "Follow On", author: "W.O. Cushing", lyrics: `[G]Down in the valley with my Savior I [C]would go,\n[G]Where the flowers are blooming and [Em]\n[A]the sweet waters [D]flow; [D7]\n[G]Everywhere He leads me I would\n[C]follow, follow on, [G]\n[G]Walking in His footsteps till the [Em]\n[D]crown be [D7]won. [G]\n\nChorus:\n[G]Follow! follow! I would follow Je - [C]sus! [C/G]\n[G]Anywhere, everywhere, I would follow on! [Em] [A] [D]\n[G]Follow! follow! I would follow Je - [C]sus! [C/G]\n[G]Everywhere He leads me I would [Em]\n[D]follow [D7]on! [G]` },
    { id: 67, title: "Leaning On The Everlasting Arms", author: "Elisha A. Hoffman", lyrics: `[G]What a fellowship, [C]what a joy divine\n[G]Leaning on the [Em]everlasting [A]arms [D]\n[G]What a blessedness, [C]what a peace is mine\n[G]Leaning on the [Em]everlasting [D]arms [G]\n\nChorus:\n[G]Leaning, [G7]leaning [C] [Cm]\n[G]Safe and se[Em]cure from all a[A]larms [D]\n[G]Lean[G7]ing, [C]lean[Cm]ing\n[G]Leaning on the [Em]everlasting [D]arms! [D7] [G]` },
    { id: 68, title: "Our Best", author: "Traditional", lyrics: `[A]Hear ye the Master's call, [D]"Give Me thy [A]best!"\n[E7]For, be it [A]great or small, [E]that [B7]is His [E7]test.\n[A]Do then the [A7]best you can, [D]not for reward,\n[Dm]Not for the [A]praise of men, [D]but [E7]for the [A]Lord.\n\nChorus:\n[E7]Every work for [A]Jesus [D]will be [A]blest,\n[E7]But He asks from [F#m]everyone his [C#]best.\n[A]Our talents [A7]may be few, these may be [D]small,\n[Dm]But unto [A]Him is due [D]our [E7]best, our [A]all.` },
    { id: 69, title: "Sanctuary", author: "John W. Thompson & Randy Scruggs", lyrics: `Intro: [D] [A] [G] [D] [A]\n\nChorus:\n[D]Lord prepare me, to be a sanctu[A]ary\n[G]Pure and holy, tried and [D]true [A]\n[D]With thanksgiving, I'll be a liv[A]ing\n[G]Sanctuary, [F#]for [E]You [D]` },
    { id: 70, title: "Kumusta Lamano & Birthday Medley", author: "Traditional", lyrics: `[Verse 1]\n[D]Pagka-anindot ning adlawa\n[D]Ka-malipayon nga naghi-usa\n[D]Mga Anak sa Dios\n[D]Naga-kasadya [A]\n[Em]Ka-malipayon sa Imong panag[A]way\n[Em]Ka-masanagon gayod sa kanu[A]nay\n[Em]Ang Himaya gayod sa Dios Magali[A]pay [D7]\n\n[Chorus]\n[G]Oh, Kumusta, Pagaksa ko Higa[A]la\n[F#m]Kay labihan gayod nakong minga[Bm]wa\n[Em]Sa kadugay sa panahon [A]nga wa ta nagka-kita [D] [D7]\n[G]Oh, Kumusta, Pagaksa ko Higa[A]la\n[F#m]Kay labihan gayod nakong lipa[Bm]ya\n[Em]Usa ragyod ta sa [A]lawas ni Kris[D]to\n\nHAPPY BIRTHDAY\n[G]H [D]B [D]TO [D]YOU\n[G]H [D]B [D]TO [D]YOU\n[G]H [D]B [G7]D, [C]H [Cm]B [D]D\n[G]H [D]B [D]TO [D]YOU\n\nRefrain:\n[G]Sweeter as the years go [C]by,\n[D]Sweeter as the years go [G]by;\n[G]Richer, fuller, [G7]deeper,\n[C]Jesus' love is [Cm]sweeter,\n[D]Sweeter as the years go [D7]by. [G]` },
    { id: 71, title: "Threefold Amen", author: "Traditional", lyrics: `[G]A-[C]men, [G]A-[D]men, [C]A-[G]men.` }
];

// --- ICONS ---
const IconMusic = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconList = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>;
const IconMessage = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconPlus = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconDownload = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconSend = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

// --- TRANSPOSITION LOGIC ---
const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
function transposeChord(chord, steps) {
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    const root = match[1];
    const suffix = match[2];
    let index = NOTES.indexOf(root);
    if (index === -1) { const enharmonics = { 'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb' }; if (enharmonics[root]) index = NOTES.indexOf(enharmonics[root]); if (index === -1) return chord; }
    let newIndex = (index + steps) % 12; if (newIndex < 0) newIndex += 12;
    return NOTES[newIndex] + suffix;
}

// --- COMPONENTS ---
const HymnRenderer = ({ lyrics, transposeSteps }) => {
    const lines = lyrics.split('\n');
    return (
        <div className="hymn-lyrics text-slate-800 text-lg">
            {lines.map((line, i) => {
                if (line.trim() === '') return <br key={i} />;
                const parts = []; let currentText = ''; let j = 0;
                while (j < line.length) {
                    if (line[j] === '[') {
                        if (currentText) { parts.push({ type: 'text', content: currentText }); currentText = ''; }
                        let chordEnd = line.indexOf(']', j);
                        if (chordEnd !== -1) {
                            const originalChord = line.substring(j + 1, chordEnd);
                            const transposed = transposeSteps !== 0 ? transposeChord(originalChord, transposeSteps) : originalChord;
                            parts.push({ type: 'chord', content: transposed }); j = chordEnd + 1;
                        } else { currentText += line[j]; j++; }
                    } else { currentText += line[j]; j++; }
                }
                if (currentText) parts.push({ type: 'text', content: currentText });
                return (
                    <div key={i} className="mb-2 leading-loose">
                        {parts.map((part, idx) => part.type === 'chord' ? <span key={idx} className="chord">{part.content}</span> : <span key={idx}>{part.content}</span> )}
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

    const filteredHymns = hymnsDB.filter(h => h.title.toLowerCase().includes(search.toLowerCase()) || h.lyrics.toLowerCase().includes(search.toLowerCase()));
    
    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="w-full md:w-1/3 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[50vh] md:h-full">
                <input type="text" placeholder="Search hymns..." className="p-4 border-b border-slate-200 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
                <div className="flex-1 overflow-y-auto">
                    {filteredHymns.map(hymn => (
                        <button key={hymn.id} onClick={() => { setSelectedHymn(hymn); setTranspose(0); }} className={`w-full text-left px-5 py-4 border-b border-slate-100 ${selectedHymn?.id === hymn.id ? 'bg-amber-50' : ''}`}>
                            <div className="font-semibold text-slate-800 text-lg">{hymn.title}</div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-2/3 bg-white border border-slate-200 rounded-xl flex flex-col h-[60vh] md:h-full overflow-hidden">
                {selectedHymn ? (
                    <>
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                            <h2 className="font-bold">{selectedHymn.title}</h2>
                            <button onClick={() => addToProgram(null, { ...selectedHymn, transpose })} className="bg-amber-500 px-3 py-1 rounded text-xs">Add</button>
                        </div>
                        <div className="p-6 overflow-y-auto"><HymnRenderer lyrics={selectedHymn.lyrics} transposeSteps={transpose} /></div>
                    </>
                ) : <div className="p-10 text-center text-slate-400">Select a hymn</div>}
            </div>
        </div>
    );
};

const AIAssistant = () => {
    const [messages, setMessages] = useState([{ role: 'model', text: "Ask me for a hymn suggestion!" }]);
    const [input, setInput] = useState('');
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    const handleSend = async () => {
        if (!input.trim()) return;
        const newMsgs = [...messages, { role: 'user', text: input }];
        setMessages(newMsgs); setInput('');
        
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "system", content: "Suggest traditional hymns." }, { role: "user", content: input }]
                })
            });
            const data = await response.json();
            setMessages([...newMsgs, { role: 'model', text: data.choices[0].message.content }]);
        } catch (e) { setMessages([...newMsgs, { role: 'model', text: "Error connecting to AI." }]); }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((m, i) => <div key={i} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-amber-500 text-white self-end' : 'bg-slate-100'}`}>{m.text}</div>)}
            </div>
            <div className="flex gap-2">
                <input className="flex-1 border rounded p-2" value={input} onChange={e => setInput(e.target.value)} />
                <button onClick={handleSend} className="bg-slate-900 text-white p-2 rounded"><IconSend /></button>
            </div>
        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('library');
    const [programs, setPrograms] = useState({ sunday: { hymns: [] } });

    const NavItem = ({ id, label, icon: Icon }) => (
        <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center p-3 w-full ${activeTab === id ? 'text-amber-500' : 'text-slate-400'}`}>
            <Icon /> <span className="text-[10px] mt-1">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            <div className="flex-1 p-2 md:p-6 overflow-hidden">
                {activeTab === 'library' && <HymnLibrary addToProgram={(s, h) => setPrograms(p => ({...p, sunday: { hymns: [...p.sunday.hymns, h]}}))} />}
                {activeTab === 'ai' && <AIAssistant />}
                {activeTab === 'program' && <div className="p-4 bg-white rounded-xl">Your Program: {programs.sunday.hymns.length} songs</div>}
            </div>
            <div className="fixed bottom-0 w-full bg-slate-900 flex justify-around md:relative">
                <NavItem id="library" label="Library" icon={IconMusic} />
                <NavItem id="program" label="Program" icon={IconList} />
                <NavItem id="ai" label="AI" icon={IconMessage} />
            </div>
        </div>
    );
}