// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AuditItem from './AuditItem';
import MasterItemManager from './MasterItemManager';

export default function Dashboard({ session }) {
    const [loading, setLoading] = useState(true);
    const [masterItems, setMasterItems] = useState([]);
    const [yearlyStatuses, setYearlyStatuses] = useState([]);
    
    // Generate years 2023-2035
    const startYear = 2023;
    const endYear = 2035;
    const availableYears = Array.from(
        { length: endYear - startYear + 1 }, 
        (_, i) => startYear + i
    );
    
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMasterManager, setShowMasterManager] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let { data: masters, error: masterError } = await supabase
                .from('audit_master_items')
                .select('*')
                .order('category', { ascending: true });

            if (masterError) throw masterError;

            let { data: statuses, error: statusError } = await supabase
                .from('audit_yearly_status')
                .select('*')
                .eq('year', selectedYear);

            if (statusError) throw statusError;

            setMasterItems(masters);
            setYearlyStatuses(statuses);

        } catch (error) {
            alert('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const totalItems = masterItems.length;
    const completedItems = yearlyStatuses.filter(s => s.status === 'completed').length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Navbar */}
            <nav style={{
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: '4rem',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                            Energy Audit Tracker
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => setShowMasterManager(!showMasterManager)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: showMasterManager ? '#eff6ff' : 'transparent',
                                color: showMasterManager ? '#1e40af' : '#4b5563'
                            }}
                        >
                            <span style={{ marginRight: '0.5rem', fontSize: '1.125rem' }}>⚙️</span>
                            Kelola Dokumen
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            style={{
                                fontSize: '0.875rem', color: '#dc2626', fontWeight: '500',
                                background: 'transparent', border: 'none', cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main style={{
                maxWidth: '1024px',
                margin: '0 auto',
                padding: '2rem 1.5rem',
                // PENTING: Ruang kosong di bawah agar item terakhir bisa discroll naik
                paddingBottom: '350px' 
            }}>
                
                {showMasterManager && (
                    <MasterItemManager onClose={() => setShowMasterManager(false)} onRefresh={fetchData} />
                )}

                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth > 768 ? 'row' : 'column',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth > 768 ? 'center' : 'flex-start',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Dashboard Audit</h2>
                        <p style={{ marginTop: '0.25rem', color: '#6b7280' }}>Status kelengkapan dokumen</p>
                    </div>
                    
                    <div style={{
                        marginTop: window.innerWidth > 768 ? 0 : '1rem',
                        backgroundColor: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span style={{ marginRight: '0.5rem' }}>📅</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            style={{ border: 'none', fontSize: '1rem', fontWeight: 'bold' }}
                        >
                            {availableYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                        </select>
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                    backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Progress {selectedYear}</span>
                        <strong>{progressPercentage}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercentage}%`, height: '100%', background: '#10b981', transition: 'width 0.5s' }}></div>
                    </div>
                </div>

                {/* Main List Container */}
                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: '2rem' }}>Memuat data...</p>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderRadius: '1rem',
                        border: '1px solid #e5e7eb',
                        // 🔴 KUNCI 1: Hapus overflow hidden, ganti visible
                        overflow: 'visible', 
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Header List */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            background: '#f3f4f6',
                            borderTopLeftRadius: '1rem',
                            borderTopRightRadius: '1rem'
                        }}>
                            <h3 style={{ fontWeight: 'bold' }}>Checklist Dokumen</h3>
                        </div>

                        {/* List Items */}
                        <div style={{ padding: '0' }}>
                            {masterItems.map((item, index) => {
                                const statusData = yearlyStatuses.find(s => s.master_item_id === item.id);
                                
                                // 🔴 KUNCI 2: Z-INDEX MENURUN
                                // Item 1 z-index = 1000
                                // Item 2 z-index = 999
                                // Item 3 z-index = 998
                                // ...
                                // Ini memastikan dropdown item atas SELALU muncul DI ATAS item bawahnya
                                const itemZIndex = 1000 - index; 

                                return (
                                    <div 
                                        key={item.id} 
                                        style={{ 
                                            position: 'relative', 
                                            zIndex: itemZIndex // Terapkan z-index di sini
                                        }}
                                    >
                                        <AuditItem
                                            item={item}
                                            yearlyData={statusData}
                                            year={selectedYear}
                                            onUpdate={fetchData}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}