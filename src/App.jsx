import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    onSnapshot,
    doc,
    updateDoc
} from 'firebase/firestore';
import {
    User,
    HeartHandshake,
    MapPin,
    Users,
    MessageCircle,
    Info,
    CheckCircle2,
    ArrowRightLeft,
    CheckCircle,
    Clock,
    Languages,
    BookOpen,
    ShieldCheck
} from 'lucide-react';

// Configuration Firebase
// Load from Vite environment variables (.env)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;
let app, auth, db;

if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

const appId = import.meta.env.VITE_APP_ID || 'zakat-fitr-app';

// Traductions
const translations = {
    fr: {
        app_title: "Zakat Al-Fitr Connect",
        nav_home: "Accueil",
        nav_space: "Mon Espace",
        hero_title: "Mettre en relation pour la Zakat Al-Fitr",
        hero_subtitle: '"Le Messager d\'Allah ﷺ a imposé la Zakat Al-Fitr comme purification pour le jeûneur des paroles futiles et grossières, et comme nourriture pour les pauvres."',
        give_title: "Je veux donner",
        receive_title: "Je peux recevoir",
        who_gives: "Qui doit donner ?",
        who_gives_desc: "Tout musulman ayant de quoi se nourrir lui et sa famille pour un jour et une nuit. On donne pour soi et pour chaque personne à sa charge.",
        who_receives: "Qui peut recevoir ?",
        who_receives_desc: "Les personnes nécessiteuses qui ne possèdent pas leur nourriture pour le jour de l'Aïd. Elle ne peut être donnée qu'à des musulmans.",
        btn_donor: "S'inscrire comme Donneur",
        btn_receiver: "S'inscrire comme Bénéficiaire",
        form_donor_title: "Formulaire Donneur",
        form_receiver_title: "Besoin de Zakat",
        label_name: "Nom ou Surnom",
        label_zone: "Mosquée de rendez-vous (ex: Mosquée de Paris)",
        label_household_donor: "Nombre de personnes pour qui vous donnez",
        label_household_receiver: "Nombre de personnes dans votre foyer",
        label_contact: "Téléphone (Signal/WhatsApp/SMS)",
        contact_desc: "Visible uniquement par la personne mise en relation",
        total_dist: "Total à distribuer : env.",
        btn_confirm: "Confirmer mon engagement",
        btn_validate: "Valider ma demande",
        dashboard_title: "Mon Suivi de Zakat",
        no_active: "Vous n'avez pas encore d'inscription active.",
        status_donor: "Je suis Donneur",
        status_receiver: "Je suis Receveur",
        btn_complete: "Marquer comme finalisé",
        status_completed: "Terminé",
        matches_title: "Correspondances suggérées",
        accepted: "Qu'Allah accepte votre acte. Échange terminé.",
        searching: "Nous cherchons des profils dans votre zone...",
        call_btn: "Appeler / SMS",
        tip_rdv_title: "Organisation du RDV",
        tip_rdv_1: "Lieu public (Mosquée, place).",
        tip_rdv_2: "Discrétion et ponctualité.",
        tip_rdv_3: "Sacs propres pesés (2.5kg/pers).",
        tip_balance_title: "Équilibre des dons",
        tip_balance_desc: "Cliquez sur 'Finalisé' une fois fait pour libérer la place.",
        sunnah_title: "Ce qu'il faut donner (Sunnah)",
        sunnah_desc: "Selon la Sunnah, la mesure est de 1 Sa' (4 poignées jointes) par personne. Aujourd'hui, cela équivaut à environ 2.5 kg à 3 kg de nourriture de base par personne.",
        sunnah_examples: "Exemples : Riz, Semoule, Pâtes, Farine, Lentilles, Haricots secs ou Dattes.",
        sunnah_tip: "Le poids varie selon l'aliment. Prévoir 3kg est une précaution recommandée.",
        voluntary_notice: "Ce site est une initiative bénévole pour mettre en relation les musulmans selon la Sunnah de Mohammad ﷺ. Aucun argent n'est collecté ici : l'échange concerne uniquement des produits alimentaires remis de main à main.",
        error_fields: "Veuillez remplir tous les champs obligatoires.",
        receiver_info_title: "Conditions de réception",
        receiver_info_desc: "La Zakat Al-Fitr est destinée aux musulmans pauvres ou nécessiteux afin qu'ils n'aient pas à mendier le jour de l'Aïd. Elle doit être reçue avant la prière de l'Aïd.",
        item_rice: "Riz",
        item_semolina: "Semoule / Couscous",
        item_pasta: "Pâtes",
        item_flour: "Farine",
        item_lentils: "Lentilles / Pois chiches",
        item_dates: "Dattes"
    },
    en: {
        app_title: "Zakat Al-Fitr Connect",
        nav_home: "Home",
        nav_space: "My Dashboard",
        hero_title: "Connect for Zakat Al-Fitr",
        hero_subtitle: '"The Messenger of Allah ﷺ ordained Zakat Al-Fitr as a purification for the fasting person from idle talk and obscenity, and as food for the needy."',
        give_title: "I want to give",
        receive_title: "I can receive",
        who_gives: "Who must give?",
        who_gives_desc: "Every Muslim who has food for themselves and their family for one day and night. It is given for oneself and every dependent.",
        who_receives: "Who can receive?",
        who_receives_desc: "Needy people who do not have food for the day of Eid. It can only be given to Muslims.",
        btn_donor: "Register as Donor",
        btn_receiver: "Register as Receiver",
        form_donor_title: "Donor Form",
        form_receiver_title: "Need Zakat",
        label_name: "Name or Nickname",
        label_zone: "Meeting Mosque (ex: Central Mosque)",
        label_household_donor: "Number of people you are giving for",
        label_household_receiver: "Number of people in your household",
        label_contact: "Phone (Signal/WhatsApp/SMS)",
        contact_desc: "Only visible to the matched person",
        total_dist: "Total to distribute: approx.",
        btn_confirm: "Confirm Commitment",
        btn_validate: "Submit Request",
        dashboard_title: "My Zakat Tracking",
        no_active: "You have no active registration yet.",
        status_donor: "I am a Donor",
        status_receiver: "I am a Receiver",
        btn_complete: "Mark as Completed",
        status_completed: "Completed",
        matches_title: "Suggested Matches",
        accepted: "May Allah accept your deed. Exchange completed.",
        searching: "Searching for profiles in your area...",
        call_btn: "Call / SMS",
        tip_rdv_title: "Meeting Setup",
        tip_rdv_1: "Public place (Mosque, square).",
        tip_rdv_2: "Discretion and punctuality.",
        tip_rdv_3: "Clean weighed bags (2.5kg/person).",
        tip_balance_title: "Balance of Donations",
        tip_balance_desc: "Click 'Completed' once done to free up the slot.",
        sunnah_title: "What to give (Sunnah)",
        sunnah_desc: "According to the Sunnah, the measure is 1 Sa' (4 joined handfuls) per person. Today, this equals approx. 2.5kg to 3kg of staple food per person.",
        sunnah_examples: "Examples: Rice, Semolina, Pasta, Flour, Lentils, Beans or Dates.",
        sunnah_tip: "Weight varies by food type. Providing 3kg is a recommended precaution.",
        voluntary_notice: "This site is a voluntary initiative to connect Muslims according to the Sunnah of Mohammad ﷺ. No money is collected here: the exchange only concerns food products handed over in person.",
        error_fields: "Please fill in all required fields.",
        receiver_info_title: "Eligibility to receive",
        receiver_info_desc: "Zakat Al-Fitr is intended for poor or needy Muslims so they don't have to beg on Eid day. It must be received before the Eid prayer.",
        item_rice: "Rice",
        item_semolina: "Semolina / Couscous",
        item_pasta: "Pasta",
        item_flour: "Flour",
        item_lentils: "Lentils / Chickpeas",
        item_dates: "Dates"
    }
};

export default function App() {
    const [lang, setLang] = useState('fr');
    const [user, setUser] = useState(null);
    const [view, setView] = useState('home');
    const [donors, setDonors] = useState([]);
    const [receivers, setReceivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const t = translations[lang];

    useEffect(() => {
        if (!isFirebaseConfigured) return;
        const initAuth = async () => {
            try {
                await signInAnonymously(auth);
            } catch (err) {
                console.error("Auth error:", err);
            }
        };
        initAuth();
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, setUser);
            return () => unsubscribe();
        }
    }, []);

    useEffect(() => {
        if (!isFirebaseConfigured || !user) return;
        const qDonors = collection(db, 'artifacts', appId, 'public', 'data', 'donors');
        const qReceivers = collection(db, 'artifacts', appId, 'public', 'data', 'receivers');
        const unsubDonors = onSnapshot(qDonors, (s) => setDonors(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => console.error(err));
        const unsubReceivers = onSnapshot(qReceivers, (s) => {
            setReceivers(s.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (err) => console.error(err));
        return () => { unsubDonors(); unsubReceivers(); };
    }, [user]);

    const handleRegister = async (type, formData) => {
        if (!user) return;

        // Validation: Nom, Zone et Contact requis
        if (!formData.name.trim() || !formData.zone.trim() || !formData.contact.trim()) {
            alert(t.error_fields);
            return;
        }

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', type + 's'), {
                ...formData,
                userId: user.uid,
                status: 'active',
                createdAt: new Date().toISOString()
            });
            // Force reset view to immediately show exactly the dashboard
            setView('dashboard');
        } catch (err) {
            console.error("Firebase Add Error:", err);
            alert("Erreur lors de l'enregistrement. Vérifiez que votre base de données Firestore est bien ouverte dans console.firebase.google.com (Security Rules) !");
        }
    };

    const markAsCompleted = async (type, id) => {
        const colName = type === 'donor' ? 'donors' : 'receivers';
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, id), { status: 'completed' });
        } catch (err) { console.error(err); }
    };

    if (!isFirebaseConfigured) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">La configuration Firebase est manquante !</h2>
                    <p className="text-slate-600 mb-4">Veuillez configurer les variables d'environnement dans un fichier `.env` à la racine de votre projet.</p>
                    <code className="block bg-slate-100 p-4 rounded text-left text-sm text-slate-800 break-all">
                        VITE_FIREBASE_API_KEY=xxx<br />
                        VITE_FIREBASE_AUTH_DOMAIN=xxx<br />
                        VITE_FIREBASE_PROJECT_ID=xxx<br />
                        VITE_FIREBASE_STORAGE_BUCKET=xxx<br />
                        VITE_FIREBASE_MESSAGING_SENDER_ID=xxx<br />
                        VITE_FIREBASE_APP_ID=xxx
                    </code>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <nav className="bg-emerald-700 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button onClick={() => setView('home')} className="text-xl font-bold flex items-center gap-2">
                        <HeartHandshake /> {t.app_title}
                    </button>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <button onClick={() => setView('home')} className="hover:text-emerald-200 hidden sm:block">{t.nav_home}</button>
                        <button onClick={() => setView('dashboard')} className="hover:text-emerald-200">{t.nav_space}</button>
                        <button
                            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                            className="flex items-center gap-1 bg-emerald-800 px-3 py-1 rounded-full border border-emerald-600 hover:bg-emerald-900 transition-colors"
                        >
                            <Languages size={16} /> {lang === 'fr' ? 'EN' : 'FR'}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-4 md:p-8 flex-grow w-full">
                {view === 'home' && <Home setView={setView} t={t} />}
                {view === 'donor' && <Form type="donor" onSubmit={(d) => handleRegister('donor', d)} t={t} lang={lang} />}
                {view === 'receiver' && <Form type="receiver" onSubmit={(d) => handleRegister('receiver', d)} t={t} lang={lang} />}
                {view === 'dashboard' && <Dashboard donors={donors} receivers={receivers} currentUser={user} onComplete={markAsCompleted} t={t} />}
            </main>

            <footer className="bg-slate-200 p-6 mt-auto">
                <div className="max-w-4xl mx-auto text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-xs">
                        <ShieldCheck size={16} /> 100% {lang === 'fr' ? 'Bénévole & Sans Frais' : 'Voluntary & Free'}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl mx-auto italic">
                        {t.voluntary_notice}
                    </p>
                </div>
            </footer>
        </div>
    );
}

function Home({ setView, t }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="text-center space-y-4 py-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-800">{t.hero_title}</h2>
                <p className="text-slate-600 max-w-2xl mx-auto italic">{t.hero_subtitle}</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <Card title={t.give_title} infoTitle={t.who_gives} infoDesc={t.who_gives_desc} btnLabel={t.btn_donor} onClick={() => setView('donor')} color="emerald" icon={<HeartHandshake size={48} />} />
                <Card title={t.receive_title} infoTitle={t.who_receives} infoDesc={t.who_receives_desc} btnLabel={t.btn_receiver} onClick={() => setView('receiver')} color="orange" icon={<User size={48} />} />
            </div>
        </div>
    );
}

function Card({ title, infoTitle, infoDesc, btnLabel, onClick, color, icon }) {
    const colorClass = color === 'emerald' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-orange-100 bg-orange-50 text-orange-600';
    const btnClass = color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700';
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow ${colorClass}`}>
            <div className={`p-4 rounded-full ${colorClass}`}>{icon}</div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <div className={`p-4 rounded-lg text-left text-sm flex gap-3 ${color === 'emerald' ? 'bg-blue-50 text-blue-800' : 'bg-orange-50 text-orange-800'}`}>
                <Info className="shrink-0" size={20} />
                <p><strong>{infoTitle}</strong> {infoDesc}</p>
            </div>
            <button onClick={onClick} className={`w-full py-3 text-white rounded-xl font-bold transition-colors ${btnClass}`}>{btnLabel}</button>
        </div>
    );
}

function Form({ type, onSubmit, t, lang }) {
    const [form, setForm] = useState({ name: '', zone: '', householdSize: 1, contact: '' });
    const isDonor = type === 'donor';

    return (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className={`bg-white p-8 rounded-2xl shadow-sm space-y-6 border-t-4 ${isDonor ? 'border-emerald-500' : 'border-orange-500'}`}>
                <h3 className={`text-2xl font-bold ${isDonor ? 'text-emerald-800' : 'text-orange-800'}`}>
                    {isDonor ? t.form_donor_title : t.form_receiver_title}
                </h3>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-medium">{t.label_name} *</span>
                        <input className="w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 ring-emerald-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">{t.label_zone} *</span>
                        <input className="w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none" placeholder={lang === 'fr' ? 'Ex: Mosquée de Paris' : 'Ex: Central Mosque'} value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} required />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">{isDonor ? t.label_household_donor : t.label_household_receiver}</span>
                        <input type="number" min="1" className="w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none" value={form.householdSize} onChange={e => setForm({ ...form, householdSize: parseInt(e.target.value) })} />
                        {isDonor && <p className="text-xs text-slate-500 mt-1 font-bold">{t.total_dist} {form.householdSize * 2.5}kg - {form.householdSize * 3}kg</p>}
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">{t.label_contact} *</span>
                        <input className="w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none" placeholder="..." value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} required />
                        <p className="text-xs text-slate-500 mt-1">{t.contact_desc}</p>
                    </label>
                    <button onClick={() => onSubmit(form)} className={`w-full py-4 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${isDonor ? 'bg-emerald-600' : 'bg-orange-600'}`}>
                        {isDonor ? t.btn_confirm : t.btn_validate}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h4 className={`font-bold flex items-center gap-2 ${isDonor ? 'text-emerald-800' : 'text-orange-800'}`}>
                        {isDonor ? <BookOpen size={20} /> : <Info size={20} />}
                        {isDonor ? t.sunnah_title : t.receiver_info_title}
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {isDonor ? t.sunnah_desc : t.receiver_info_desc}
                    </p>

                    {isDonor ? (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <p className="text-sm font-semibold text-emerald-900 mb-2 underline decoration-emerald-200 decoration-2">
                                {t.sunnah_examples}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800 italic">
                                <span>• {t.item_rice}</span>
                                <span>• {t.item_semolina}</span>
                                <span>• {t.item_pasta}</span>
                                <span>• {t.item_flour}</span>
                                <span>• {t.item_lentils}</span>
                                <span>• {t.item_dates}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                            <p className="text-sm text-orange-900 italic leading-relaxed">
                                {t.who_receives_desc}
                            </p>
                        </div>
                    )}

                    <div className="text-xs text-slate-500 border-t pt-4">
                        <p>💡 <em>{isDonor ? t.sunnah_tip : (lang === 'fr' ? "Il est recommandé de se faire connaître tôt pour faciliter l'organisation des donneurs." : "It is recommended to register early to help donors organize logistics.")}</em></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper for typo-tolerant matching
const normalizeString = (str) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

function Dashboard({ donors, receivers, currentUser, onComplete, t }) {
    const myDonation = donors.find(d => d.userId === currentUser?.uid);
    const myRequest = receivers.find(r => r.userId === currentUser?.uid);
    const entry = myDonation || myRequest;

    const getMatches = () => {
        if (!entry || entry.status === 'completed') return [];
        const list = myDonation ? receivers : donors;
        const myZoneNorm = normalizeString(entry.zone);

        return list.filter(item => {
            if (item.status === 'completed') return false;
            const itemZoneNorm = normalizeString(item.zone);

            // Allow matching if one string is a substring of another, or if the Levenshtein distance is very close (e.g. <= 3 for typo tolerance)
            const isSubstring = itemZoneNorm.includes(myZoneNorm) || myZoneNorm.includes(itemZoneNorm);
            const distance = levenshtein(myZoneNorm, itemZoneNorm);

            return isSubstring || distance <= 3;
        }).slice(0, 5);
    };

    const matches = getMatches();

    const handleContact = (e, contact) => {
        e.preventDefault();
        window.location.href = `tel:${contact}`;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><ArrowRightLeft className="text-emerald-600" /> {t.dashboard_title}</h3>
                {!entry ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed">{t.no_active}</div>
                ) : (
                    <div className="space-y-8">
                        <div className={`p-5 rounded-2xl border-2 ${myDonation ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md ${myDonation ? 'bg-emerald-200 text-emerald-800' : 'bg-orange-200 text-orange-800'}`}>
                                        {myDonation ? t.status_donor : t.status_receiver}
                                    </span>
                                    <h4 className="text-2xl font-bold mt-2">{entry.name}</h4>
                                    <p className="text-slate-600 flex items-center gap-1 mt-1"><MapPin size={16} /> {entry.zone}</p>
                                </div>
                                {entry.status === 'completed' ? (
                                    <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold"><CheckCircle size={20} /> {t.status_completed}</div>
                                ) : (
                                    <button onClick={() => onComplete(myDonation ? 'donor' : 'receiver', entry.id)} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-xl hover:bg-slate-100 font-medium">{t.btn_complete}</button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} /> {t.matches_title}</h4>
                            {entry.status === 'completed' ? (
                                <div className="p-8 text-center bg-emerald-50 rounded-xl text-emerald-800 font-medium">{t.accepted}</div>
                            ) : matches.length > 0 ? (
                                <div className="grid gap-4">
                                    {matches.map(m => (
                                        <div key={m.id} className="p-5 bg-white border rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <p className="font-bold text-lg">{m.name}</p>
                                                <p className="text-sm text-slate-500"><MapPin size={14} className="inline mr-1" />{m.zone} • {m.householdSize} pers.</p>
                                            </div>
                                            <button
                                                onClick={(e) => handleContact(e, m.contact)}
                                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-colors"
                                            >
                                                <MessageCircle size={18} /> {t.call_btn}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                                    <Clock className="mx-auto text-slate-400" size={32} />
                                    <p className="text-slate-500">{t.searching}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Tip title={t.tip_rdv_title} items={[t.tip_rdv_1, t.tip_rdv_2, t.tip_rdv_3]} color="blue" />
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-3">
                    <h4 className="font-bold text-amber-800 flex items-center gap-2"><CheckCircle2 size={20} /> {t.tip_balance_title}</h4>
                    <p className="text-sm text-amber-900 leading-relaxed">{t.tip_balance_desc}</p>
                </div>
            </div>
        </div>
    );
}

function Tip({ title, items, color }) {
    const c = color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-800' : '';
    return (
        <div className={`${c} p-6 rounded-2xl border space-y-3`}>
            <h4 className="font-bold flex items-center gap-2"><Info size={20} /> {title}</h4>
            <ul className="text-sm space-y-2 list-disc list-inside">
                {items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
        </div>
    );
}
