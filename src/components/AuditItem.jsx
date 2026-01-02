// src/components/AuditItem.jsx
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';

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

export default function AuditItem({ item, yearlyData, year, onUpdate, openUpwards = false }) {
    const [updating, setUpdating] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    
    const currentStatusKey = yearlyData?.status || 'not_started';
    const currentConfig = statusConfig[currentStatusKey];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        setShowDropdown(false);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            let error;

            if (yearlyData?.id) {
                const { error: updateError } = await supabase
                    .from('audit_yearly_status')
                    .update({ status: newStatus, updated_by: userId })
                    .eq('id', yearlyData.id);
                error = updateError;
            } else {
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
            onUpdate();

        } catch (error) {
            alert('Error updating status: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #f3f4f6',
            backgroundColor: 'white',
            transition: 'background-color 0.2s',
            position: 'relative'
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

            {/* Bagian Kanan: Dropdown Status */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
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
                    <>
                        <button
                            type="button"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #d1d5db',
                                boxShadow: showDropdown ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: currentConfig.color,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minWidth: '140px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.125rem' }}>{currentConfig.icon}</span>
                                {currentConfig.label}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                {showDropdown ? '▲' : '▼'}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                [openUpwards ? 'bottom' : 'top']: openUpwards ? '100%' : '100%',
                                marginTop: openUpwards ? '0' : '0.5rem',
                                marginBottom: openUpwards ? '0.5rem' : '0',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.75rem',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
                                padding: '0.5rem',
                                minWidth: '200px',
                                zIndex: 1000,
                                animation: 'slideDown 0.2s ease-out'
                            }}>
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
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                backgroundColor: isActive ? config.bgColor : 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.15s',
                                                fontSize: '0.875rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.target.style.backgroundColor = '#f9fafb';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.target.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <span style={{ 
                                                marginRight: '0.75rem', 
                                                fontSize: '1.125rem',
                                                color: config.color 
                                            }}>
                                                {config.icon}
                                            </span>
                                            <span style={{ 
                                                fontWeight: isActive ? '600' : '500', 
                                                color: isActive ? config.color : '#374151',
                                                flex: 1
                                            }}>
                                                {config.label}
                                            </span>
                                            {isActive && (
                                                <span style={{ color: config.color, fontWeight: 'bold' }}>✓</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}