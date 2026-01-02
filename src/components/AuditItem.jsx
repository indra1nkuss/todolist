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
    const [showDropdown, setShowDropdown] = useState(false);
    
    const currentStatusKey = yearlyData?.status || 'not_started';
    const currentConfig = statusConfig[currentStatusKey];

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        setShowDropdown(false);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            let error;

            if (yearlyData?.id) {
                // Update existing record
                const { error: updateError } = await supabase
                    .from('audit_yearly_status')
                    .update({ status: newStatus, updated_by: userId })
                    .eq('id', yearlyData.id);
                error = updateError;
            } else {
                // Insert new record
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
            onUpdate(); // Refresh parent data

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
            transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
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
                    <div 
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                        <button
                            type="button"
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
                        
                        {/* Dropdown Menu - FIXED STRUCTURE */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%', // Menempel tepat di bawah tombol
                                paddingTop: '0.5rem', // Menggunakan padding sebagai 'jembatan', bukan margin
                                zIndex: 9999, // <--- PERBAIKAN DI SINI (Layer paling atas)
                            }}>
                                {/* Container Visual Menu (Lapis Dalam) */}
                                <div style={{
                                    width: '10rem',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '0.25rem 0' }}>
                                        {Object.keys(statusConfig).map((statusKey) => {
                                            const config = statusConfig[statusKey];
                                            return (
                                                <button
                                                    key={statusKey}
                                                    onClick={() => handleStatusChange(statusKey)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '0.75rem 1rem',
                                                        fontSize: '0.875rem',
                                                        color: '#374151',
                                                        backgroundColor: statusKey === currentStatusKey ? '#f3f4f6' : 'transparent',
                                                        fontWeight: statusKey === currentStatusKey ? '600' : '400',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = statusKey === currentStatusKey ? '#f3f4f6' : 'transparent'
                                                    }}
                                                >
                                                    <span style={{ 
                                                        marginRight: '0.5rem', 
                                                        fontSize: '1rem',
                                                        color: config.color 
                                                    }}>
                                                        {config.icon}
                                                    </span>
                                                    {config.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}