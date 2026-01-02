// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import AuditItem from './AuditItem.jsx';
import MasterItemManager from './MasterItemManager.jsx';

export default function Dashboard({ session }) {
    const [loading, setLoading] = useState(true);
    const [masterItems, setMasterItems] = useState([]);
    const [yearlyStatuses, setYearlyStatuses] = useState([]);
    
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
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{
                    maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem',
                    display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                            Energy Audit Tracker
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => setShowMasterManager(!showMasterManager)}
                            style={{
                                display: 'flex', alignItems: 'center', padding: '0.5rem 1rem',
                                fontSize: '0.875rem', fontWeight: '500', borderRadius: '0.5rem',
                                border: 'none', cursor: 'pointer',
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
                flex: 1
            }}>
                
                {showMasterManager && (
                    <MasterItemManager onClose={() => setShowMasterManager(false)} onRefresh={fetchData} />
                )}

                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Dashboard Audit</h2>
                        <p style={{ marginTop: '0.25rem', color: '#6b7280' }}>Status kelengkapan dokumen</p>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center'
                    }}>
                        <span style={{ marginRight: '0.5rem' }}>📅</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            style={{ border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {availableYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                            Progress {selectedYear}
                        </span>
                        <strong style={{ fontSize: '0.875rem', color: '#059669' }}>
                            {completedItems} / {totalItems} ({progressPercentage}%)
                        </strong>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ 
                            width: `${progressPercentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
                            transition: 'width 0.5s ease-in-out',
                            borderRadius: '10px'
                        }}></div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: '4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: '#6b7280' }}>Memuat data...</p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderRadius: '1rem',
                        border: '1px solid #e5e7eb',
                        overflow: 'visible',
                        marginBottom: '3rem'
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderTopLeftRadius: '1rem',
                            borderTopRightRadius: '1rem'
                        }}>
                            <h3 style={{ fontWeight: 'bold', color: 'white', fontSize: '1.125rem' }}>
                                📋 Checklist Dokumen
                            </h3>
                        </div>

                        <div style={{ padding: '0', position: 'relative' }}>
                            {masterItems.length === 0 ? (
                                <div style={{ 
                                    padding: '4rem 2rem', 
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                                        Belum ada dokumen
                                    </p>
                                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                        Klik "Kelola Dokumen" untuk menambahkan dokumen pertama
                                    </p>
                                </div>
                            ) : (
                                masterItems.map((item, index) => {
                                    const statusData = yearlyStatuses.find(s => s.master_item_id === item.id);
                                    const isBottomItem = index >= masterItems.length - 3;
                                    
                                    return (
                                        <AuditItem
                                            key={item.id}
                                            item={item}
                                            yearlyData={statusData}
                                            year={selectedYear}
                                            onUpdate={fetchData}
                                            openUpwards={isBottomItem}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{
                backgroundColor: 'white',
                borderTop: '1px solid #e5e7eb',
                padding: '1.5rem',
                marginTop: 'auto'
            }}>
                <div style={{
                    maxWidth: '1024px',
                    margin: '0 auto',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <span>Made with</span>
                    <span style={{ 
                        color: '#ef4444', 
                        fontSize: '1rem',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }}>
                        ❤️
                    </span>
                    <span style={{ fontWeight: '600', color: '#374151' }}>1nkuss</span>
                </div>
            </footer>
        </div>
    );
}