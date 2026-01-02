// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AuditItem from './AuditItem';
import MasterItemManager from './MasterItemManager';

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
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '400px',
                height: '400px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            {/* Navbar */}
            <nav style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: '4.5rem',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '45px',
                            height: '45px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}>
                            ⚡
                        </div>
                        <div>
                            <h1 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                margin: 0
                            }}>
                                Energy Audit Tracker
                            </h1>
                            <p style={{ 
                                fontSize: '0.75rem', 
                                color: '#6b7280',
                                margin: 0
                            }}>
                                Manajemen Dokumen Audit Energi
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => setShowMasterManager(!showMasterManager)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1.25rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: showMasterManager 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                    : 'transparent',
                                color: showMasterManager ? 'white' : '#4b5563',
                                transition: 'all 0.2s',
                                boxShadow: showMasterManager ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!showMasterManager) {
                                    e.target.style.background = '#f3f4f6';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showMasterManager) {
                                    e.target.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ marginRight: '0.5rem', fontSize: '1.25rem' }}>⚙️</span>
                            Kelola Dokumen
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '0.75rem 1.25rem',
                                fontSize: '0.875rem',
                                color: '#ef4444',
                                fontWeight: '600',
                                background: 'transparent',
                                border: '2px solid #fee2e2',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{
                maxWidth: '1400px',
                width: '100%',
                margin: '0 auto',
                padding: '3rem 2rem',
                flex: 1
            }}>
                
                {showMasterManager && (
                    <MasterItemManager onClose={() => setShowMasterManager(false)} onRefresh={fetchData} />
                )}

                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div>
                        <h2 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: 'bold', 
                            color: 'white',
                            margin: 0,
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}>
                            Dashboard Audit
                        </h2>
                        <p style={{ 
                            marginTop: '0.5rem', 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '1.125rem'
                        }}>
                            Status kelengkapan dokumen audit energi
                        </p>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '1rem',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                        gap: '0.75rem'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>📅</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            style={{
                                border: 'none',
                                fontSize: '1.125rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                background: 'transparent',
                                color: '#374151'
                            }}
                        >
                            {availableYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                        </select>
                    </div>
                </div>

                {/* Progress Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                    marginBottom: '2.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '600', 
                                color: '#1f2937',
                                margin: 0
                            }}>
                                Progress Tahun {selectedYear}
                            </h3>
                            <p style={{ 
                                fontSize: '0.875rem', 
                                color: '#6b7280',
                                margin: '0.25rem 0 0 0'
                            }}>
                                Tracking kelengkapan dokumen audit
                            </p>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ 
                                    fontSize: '2rem', 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {progressPercentage}%
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {completedItems} / {totalItems} selesai
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        background: '#e5e7eb', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{ 
                            width: `${progressPercentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '12px',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                        }}></div>
                    </div>
                </div>

                {/* Checklist Card */}
                {loading ? (
                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: '4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '5px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '5px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: 'white', fontSize: '1.125rem', fontWeight: '500' }}>
                            Memuat data...
                        </p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        overflow: 'hidden',
                        marginBottom: '3rem'
                    }}>
                        <div style={{
                            padding: '2rem',
                            borderBottom: '1px solid #e5e7eb',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}>
                            <h3 style={{ 
                                fontWeight: 'bold', 
                                color: 'white', 
                                fontSize: '1.5rem',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.75rem' }}>📋</span>
                                Checklist Dokumen
                            </h3>
                            <p style={{ 
                                color: 'rgba(255, 255, 255, 0.9)', 
                                fontSize: '0.875rem',
                                margin: '0.5rem 0 0 0'
                            }}>
                                Klik status untuk mengubahnya
                            </p>
                        </div>

                        <div style={{ padding: '0', position: 'relative' }}>
                            {masterItems.length === 0 ? (
                                <div style={{ 
                                    padding: '5rem 2rem', 
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</p>
                                    <p style={{ 
                                        fontSize: '1.5rem', 
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Belum ada dokumen
                                    </p>
                                    <p style={{ fontSize: '1rem', color: '#6b7280' }}>
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
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '2rem',
                marginTop: 'auto'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <span>Made with</span>
                        <span style={{ 
                            color: '#ef4444', 
                            fontSize: '1.25rem',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            display: 'inline-block'
                        }}>
                            ❤️
                        </span>
                        <span>by</span>
                        <span style={{ 
                            fontWeight: '700', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontSize: '1rem'
                        }}>
                            1nkuss
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                    }}>
                        © 2025 Energy Audit Tracker. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}