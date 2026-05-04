import { useState, useEffect } from 'react'
import { transactionService, categoryService } from '../services/api'
import Navbar from '../components/Navbar'

const emptyForm = {
  amount: '',
  description: '',
  type: 'EXPENSE',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [txnRes, catRes] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
      ])
      setTransactions(txnRes.data)
      setCategories(catRes.data)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      }
      if (editId) {
        await transactionService.update(editId, payload)
      } else {
        await transactionService.create(payload)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditId(null)
      fetchAll()
    } catch {
      setError('Failed to save transaction')
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      const res = await categoryService.create({ name: newCategory })
      setCategories([...categories, res.data])
      setNewCategory('')
      setShowCategoryForm(false)
    } catch {
      setError('Failed to create category')
    }
  }

  const handleEdit = (txn) => {
    setForm({
      amount: txn.amount,
      description: txn.description || '',
      type: txn.type,
      date: txn.date,
      categoryId: txn.categoryId || '',
    })
    setEditId(txn.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await transactionService.delete(id)
      fetchAll()
    } catch {
      setError('Failed to delete transaction')
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Transactions</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={styles.secondaryBtn}
              onClick={() => setShowCategoryForm(true)}
            >
              + Category
            </button>
            <button
              style={styles.addBtn}
              onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>New Category</h3>
              <form onSubmit={handleAddCategory} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Category Name</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="e.g. Food, Transport, Health"
                    required
                  />
                </div>
                <div style={styles.formBtns}>
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => setShowCategoryForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showForm && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>
                {editId ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Type</label>
                  <select
                    style={styles.input}
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Amount</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.input}
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">No category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      No categories yet — add one with the "+ Category" button
                    </p>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Description</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="What was this for?"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={styles.formBtns}>
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => { setShowForm(false); setEditId(null) }}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    {editId ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No transactions yet</p>
            <p style={styles.emptySubtext}>Add your first transaction to get started</p>
          </div>
        ) : (
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} style={styles.tr}>
                    <td style={styles.td}>{txn.date}</td>
                    <td style={styles.td}>{txn.description || '—'}</td>
                    <td style={styles.td}>{txn.categoryName || '—'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: txn.type === 'INCOME' ? '#dcfce7' : '#fee2e2',
                        color: txn.type === 'INCOME' ? '#16a34a' : '#dc2626',
                      }}>
                        {txn.type}
                      </span>
                    </td>
                    <td style={{
                      ...styles.td,
                      fontWeight: '600',
                      color: txn.type === 'INCOME' ? '#16a34a' : '#dc2626'
                    }}>
                      {txn.type === 'INCOME' ? '+' : '-'}${Number(txn.amount).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleEdit(txn)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(txn.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: '#f5f5f5', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a' },
  addBtn: { padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  secondaryBtn: { padding: '10px 18px', backgroundColor: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  error: { backgroundColor: '#fff0f0', color: '#cc0000', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { backgroundColor: 'white', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  modalTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a1a' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#444' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  formBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '10px 18px', backgroundColor: 'transparent', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#555' },
  submitBtn: { padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  editBtn: { padding: '5px 12px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px', fontSize: '13px', marginRight: '6px', color: '#333' },
  deleteBtn: { padding: '5px 12px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', fontSize: '13px', color: '#dc2626' },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: '16px', fontWeight: '500', color: '#666', marginBottom: '8px' },
  emptySubtext: { fontSize: '14px', color: '#999' },
  empty: { textAlign: 'center', padding: '40px', color: '#999' },
}