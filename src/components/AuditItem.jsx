// src/components/AuditItem.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';

const statusConfig = {
    not_started: { 
        label: 'Belum Mulai', 
        color: '#6b7280', 
        bgColor: '#f3f4f6',
        icon: '○'
    },
    in_progress: { 
        label: 'Proses', 
        color: '#d97706', 
        bgColor: '#fef3c7',
        icon: '⚠'
    },
    completed: { 
        label: 'Selesai', 
        color: '#059669', 
        bgColor: '#d1fae5',
        icon: '✓'
    },
    'n/a': { 
        label: 'N/A', 
        color: '#9ca3af', 
        bgColor: '#f3f4f6',
        icon: '✕'
    },
};

export default function AuditItem({ item, yearlyData, year, onUpdate }) {
    const [updating, setUpdating] = useState(false);
    const [showPopup, setShowPopup] = useState(false); // Ganti nama jadi showPopup
    
    const currentStatusKey = yearlyData?.status || 'not_started';
    const currentConfig = statusConfig[currentStatusKey];

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        setShowPopup(false); // Tutup popup
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            let error;

            if (yearlyData?.id) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('audit_yearly_status')
                    .update({ status: newStatus, updated_by: userId })
                    .eq('id', yearlyData.id);
                error = updateError;
            } else {
                // Insert new
                const { error: insertError } = await supabase
                    .from('audit_yearly_status')
                    .insert([{ 
                        year: year, 
                        master_item_id: item.id, 
                        status: newStatus, 
                        updated_by: userId 
                    }]);
                error = insertError;
            }

            if (error) throw error;
            onUpdate(); // Refresh data parent

        } catch (error) {
            alert('Error updating status: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: 'white',
                transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
                {/* Bagian Kiri: Teks & Info */}
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: item.category === 'FEM' ? '#d1fae5' : '#dbeafe',
                        color: item.category === 'FEM' ? '#065f46' : '#1e40af'
                    }}>
                        {item.category}
                    </span>
                    <h4 style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        marginTop: '0.5rem',
                        fontSize: '1rem'
                    }}>
                        {item.title}
                    </h4>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginTop: '0.25rem'
                    }}>
                        {item.description}
                    </p>
                </div>

                {/* Bagian Kanan: Tombol Status */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {updating ? (
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '3px solid #f3f4f6',
                            borderTop: '3px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowPopup(true)} // Klik untuk buka Popup
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '0.5rem',
                                border: '1px solid #d1d5db',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: currentConfig.color,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            <span style={{ marginRight: '0.5rem', fontSize: '1.125rem' }}>
                                {currentConfig.icon}
                            </span>
                            {currentConfig.label}
                        </button>
                    )}
                </div>
            </div>

            {/* --- POPUP MENU / MODAL (SOLUSI FIX) --- */}
            {showPopup && (
                <>
                    {/* 1. Layar Gelap Belakang (Backdrop) */}
                    <div 
                        onClick={() => setShowPopup(false)}
                        style={{
                            position: 'fixed', // Kunci: FIXED supaya lepas dari container
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            zIndex: 9998,
                            backdropFilter: 'blur(2px)' // Efek blur biar keren
                        }}
                    />

                    {/* 2. Kotak Menu di Tengah Layar */}
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)', // Trik biar pas di tengah
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        zIndex: 9999,
                        width: '90%',
                        maxWidth: '320px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>
                                Ubah Status
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Pilih status baru untuk item ini
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {Object.keys(statusConfig).map((statusKey) => {
                                const config = statusConfig[statusKey];
                                const isActive = statusKey === currentStatusKey;
                                return (
                                    <button
                                        key={statusKey}
                                        onClick={() => handleStatusChange(statusKey)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: isActive ? `2px solid ${config.color}` : '1px solid #e5e7eb',
                                            backgroundColor: isActive ? config.bgColor : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ 
                                            marginRight: '0.75rem', 
                                            fontSize: '1.25rem',
                                            color: config.color 
                                        }}>
                                            {config.icon}
                                        </span>
                                        <span style={{ 
                                            fontWeight: '600', 
                                            color: '#374151',
                                            fontSize: '1rem'
                                        }}>
                                            {config.label}
                                        </span>
                                        {isActive && (
                                            <span style={{ marginLeft: 'auto', color: config.color }}>✓</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => setShowPopup(false)}
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                padding: '0.75rem',
                                border: 'none',
                                background: 'transparent',
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Batal
                        </button>
                    </div>
                </>
            )}
        </>
    );
}