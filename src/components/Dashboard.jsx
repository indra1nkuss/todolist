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
            // Fetch Master Items
            let { data: masters, error: masterError } = await supabase
                .from('audit_master_items')
                .select('*')
                .order('category', { ascending: true });

            if (masterError) throw masterError;

            // Fetch Yearly Statuses
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

    // Calculate progress
    const totalItems = masterItems.length;
    const completedItems = yearlyStatuses.filter(s => s.status === 'completed').length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingBottom: '5rem' }}>
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
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#1e3a8a',
                            letterSpacing: '-0.025em'
                        }}>
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
                                transition: 'all 0.2s',
                                backgroundColor: showMasterManager ? '#eff6ff' : 'transparent',
                                color: showMasterManager ? '#1e40af' : '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                                if (!showMasterManager) e.target.style.backgroundColor = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                                if (!showMasterManager) e.target.style.backgroundColor = 'transparent'
                            }}
                        >
                            <span style={{ marginRight: '0.5rem', fontSize: '1.125rem' }}>⚙️</span>
                            Kelola Dokumen
                        </button>
                        
                        <span style={{ 
                            fontSize: '0.875rem', 
                            color: '#6b7280',
                            display: window.innerWidth > 768 ? 'block' : 'none'
                        }}>
                            {session.user.email}
                        </span>
                        
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.875rem',
                                color: '#dc2626',
                                fontWeight: '500',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#991b1b'}
                            onMouseLeave={(e) => e.target.style.color = '#dc2626'}
                        >
                            <span style={{ marginRight: '0.25rem' }}>🚪</span>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main style={{
                maxWidth: '1024px',
                margin: '0 auto',
                padding: '2rem 1.5rem'
            }}>
                
                {/* Master Item Manager */}
                {showMasterManager && (
                    <MasterItemManager 
                        onClose={() => setShowMasterManager(false)} 
                        onRefresh={fetchData} 
                    />
                )}

                {/* Header & Year Selector */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth > 768 ? 'row' : 'column',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth > 768 ? 'center' : 'flex-start',
                    marginBottom: '2rem',
                    gap: '1rem'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.875rem',
                            fontWeight: 'bold',
                            color: '#111827'
                        }}>
                            Dashboard Audit
                        </h2>
                        <p style={{
                            marginTop: '0.25rem',
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>
                            Status kelengkapan dokumen FEM & ISO 50001
                        </p>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            marginRight: '0.75rem',
                            letterSpacing: '0.05em'
                        }}>
                            Periode Audit
                        </span>
                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>📅</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            style={{
                                background: 'transparent',
                                fontWeight: 'bold',
                                fontSize: '1.125rem',
                                color: '#374151',
                                border: 'none',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            {availableYears.map(yr => (
                                <option key={yr} value={yr}>{yr}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                    }}>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            Progress Tahun {selectedYear}
                        </span>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#667eea'
                        }}>
                            {progressPercentage}%
                        </span>
                    </div>
                    <div style={{
                        width: '100%',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        height: '0.75rem',
                        overflow: 'hidden'
                    }}>
                        <div
                            style={{
                                background: 'linear-gradient(to right, #667eea, #22c55e)',
                                height: '100%',
                                borderRadius: '9999px',
                                transition: 'width 0.5s ease',
                                width: `${progressPercentage}%`
                            }}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.75rem',
                        fontSize: '0.75rem',
                        color: '#6b7280'
                    }}>
                        <span>{completedItems} dari {totalItems} item selesai</span>
                        <span>{totalItems - completedItems} tersisa</span>
                    </div>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5rem 0',
                        color: '#9ca3af'
                    }}>
                        <div className="spinner" style={{ marginBottom: '1rem' }} />
                        <p>Memuat data...</p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        borderRadius: '1rem',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(to right, #eff6ff, #d1fae5)',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: 'bold',
                                color: '#111827'
                            }}>
                                Checklist Tahun <span style={{ color: '#667eea' }}>{selectedYear}</span>
                            </h3>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px'
                            }}>
                                Total: {totalItems} Dokumen
                            </span>
                        </div>
                        
                        <div style={{ borderTop: '1px solid #f3f4f6' }}>
                            {masterItems.length === 0 ? (
                                <div style={{
                                    padding: '2.5rem',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                                        Belum ada daftar dokumen.
                                    </p>
                                    <button 
                                        onClick={() => setShowMasterManager(true)}
                                        style={{
                                            color: '#667eea',
                                            fontWeight: '600',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        + Tambahkan Dokumen Master
                                    </button>
                                </div>
                            ) : (
                                masterItems.map((item) => {
                                    const statusData = yearlyStatuses.find(s => s.master_item_id === item.id);
                                    return (
                                        <AuditItem
                                            key={item.id}
                                            item={item}
                                            yearlyData={statusData}
                                            year={selectedYear}
                                            onUpdate={fetchData}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Hint */}
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }}>
                    <p>💡 Arahkan kursor ke status untuk mengubahnya</p>
                </div>
            </main>
        </div>
    );
}