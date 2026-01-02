// src/components/MasterItemManager.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function MasterItemManager({ onClose, onRefresh }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk form tambah baru
    const [newItem, setNewItem] = useState({ 
        category: 'FEM', 
        title: '', 
        description: '' 
    });
    
    // State untuk edit
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_master_items')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error) setItems(data);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.title) return;

        const { error } = await supabase
            .from('audit_master_items')
            .insert([newItem]);
        
        if (error) {
            alert('Gagal menambah: ' + error.message);
        } else {
            setNewItem({ category: 'FEM', title: '', description: '' });
            fetchItems();
            onRefresh();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus dokumen ini? Data status di semua tahun juga akan terhapus.')) return;

        const { error } = await supabase
            .from('audit_master_items')
            .delete()
            .eq('id', id);
        
        if (error) alert('Gagal hapus: ' + error.message);
        else {
            fetchItems();
            onRefresh();
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditForm(item);
    };

    const handleUpdate = async () => {
        const { error } = await supabase
            .from('audit_master_items')
            .update({ 
                title: editForm.title, 
                description: editForm.description, 
                category: editForm.category 
            })
            .eq('id', editingId);

        if (error) alert('Gagal update: ' + error.message);
        else {
            setEditingId(null);
            fetchItems();
            onRefresh();
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        transition: 'border-color 0.2s'
    };

    const buttonStyle = {
        padding: '0.5rem',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            padding: '2rem',
            marginBottom: '2rem',
            position: 'relative',
            animation: 'slideDown 0.3s ease-out'
        }}>
            {/* Close Button */}
            <button 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    lineHeight: 1
                }}
                onMouseEnter={(e) => e.target.style.color = '#374151'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
                ✕
            </button>

            {/* Header */}
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{ fontSize: '1.75rem' }}>📋</span>
                Manajemen Master Dokumen
            </h3>

            {/* FORM TAMBAH BARU */}
            <form onSubmit={handleAdd} style={{
                backgroundColor: '#eff6ff',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid #bfdbfe'
            }}>
                <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    ✨ Tambah Dokumen Baru
                </h4>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr',
                        gap: '0.75rem',
                        alignItems: 'center'
                    }}>
                        <select 
                            style={{...inputStyle}}
                            value={newItem.category}
                            onChange={e => setNewItem({...newItem, category: e.target.value})}
                        >
                            <option value="FEM">FEM</option>
                            <option value="ISO50001">ISO 50001</option>
                        </select>
                        
                        <input 
                            type="text" 
                            placeholder="Judul Dokumen (contoh: Laporan PROPER)" 
                            style={{...inputStyle}}
                            value={newItem.title}
                            onChange={e => setNewItem({...newItem, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '0.75rem'
                    }}>
                        <input 
                            type="text" 
                            placeholder="Deskripsi Singkat (opsional)" 
                            style={{...inputStyle}}
                            value={newItem.description}
                            onChange={e => setNewItem({...newItem, description: e.target.value})}
                        />
                        
                        <button 
                            type="submit"
                            style={{
                                ...buttonStyle,
                                width: '120px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            + Tambah
                        </button>
                    </div>
                </div>
            </form>

            {/* LIST DAFTAR DOKUMEN */}
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '0.5rem'
            }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                        Loading...
                    </p>
                ) : items.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                        Belum ada dokumen. Tambahkan yang pertama!
                    </p>
                ) : items.map((item) => (
                    <div 
                        key={item.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            borderBottom: '1px solid #f3f4f6',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {editingId === item.id ? (
                            // MODE EDIT
                            <>
                                <div style={{
                                    flex: 1,
                                    display: 'grid',
                                    gridTemplateColumns: '100px 1fr 1fr',
                                    gap: '0.5rem',
                                    marginRight: '0.75rem'
                                }}>
                                    <select 
                                        style={{...inputStyle, padding: '0.375rem'}}
                                        value={editForm.category} 
                                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                                    >
                                        <option value="FEM">FEM</option>
                                        <option value="ISO50001">ISO 50001</option>
                                    </select>
                                    <input 
                                        style={{...inputStyle, padding: '0.375rem'}}
                                        value={editForm.title} 
                                        onChange={e => setEditForm({...editForm, title: e.target.value})} 
                                    />
                                    <input 
                                        style={{...inputStyle, padding: '0.375rem'}}
                                        value={editForm.description} 
                                        onChange={e => setEditForm({...editForm, description: e.target.value})} 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={handleUpdate}
                                        style={{...buttonStyle, color: '#059669'}}
                                        title="Simpan"
                                    >
                                        ✓
                                    </button>
                                    <button 
                                        onClick={() => setEditingId(null)}
                                        style={{...buttonStyle, color: '#6b7280'}}
                                        title="Batal"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </>
                        ) : (
                            // MODE TAMPIL
                            <>
                                <div style={{ flex: 1 }}>
                                    <span style={{
                                        marginRight: '0.5rem',
                                        padding: '0.125rem 0.5rem',
                                        fontSize: '0.75rem',
                                        borderRadius: '0.25rem',
                                        fontWeight: 'bold',
                                        backgroundColor: item.category === 'FEM' ? '#d1fae5' : '#dbeafe',
                                        color: item.category === 'FEM' ? '#065f46' : '#1e40af'
                                    }}>
                                        {item.category}
                                    </span>
                                    <span style={{ fontWeight: '600', color: '#374151' }}>
                                        {item.title}
                                    </span>
                                    <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                                        - {item.description}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => startEdit(item)}
                                        style={{...buttonStyle, color: '#3b82f6'}}
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        style={{...buttonStyle, color: '#ef4444'}}
                                        title="Hapus"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}