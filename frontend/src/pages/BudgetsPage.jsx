import { useState, useEffect } from 'react'
import { budgetService, categoryService } from '../services/api'
import Navbar from '../components/Navbar'


const emptyForm = {
  amount: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  categoryId: null,
  categoryName: '',
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchBudgets()
  }, [month, year])

const fetchBudgets = () => {
  setLoading(true)
  Promise.all([
    budgetService.getAll(month, year),
    categoryService.getAll(),
  ])
    .then(([budgetRes, catRes]) => {
      setBudgets(budgetRes.data)
      setCategories(catRes.data)
    })
    .catch(() => setError('Failed to load data'))
    .finally(() => setLoading(false))
}

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        amount: parseFloat(form.amount),
        month: parseInt(month),
        year: parseInt(year),
        categoryId: form.categoryId,
      }
      if (editId) {
        await budgetService.update(editId, payload)
      } else {
        await budgetService.create(payload)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditId(null)
      fetchBudgets()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget')
    }
  }

  const handleEdit = (budget) => {
    setForm({
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      categoryId: budget.categoryId,
      categoryName: budget.categoryName,
    })
    setEditId(budget.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    try {
      await budgetService.delete(id)
      fetchBudgets()
    } catch {
      setError('Failed to delete budget')
    }
  }

  const getStatus = (spent, amount) => {
    const pct = (spent / amount) * 100
    if (pct >= 90) return { color: '#dc2626', bg: '#fee2e2', label: 'Over budget' }
    if (pct >= 70) return { color: '#d97706', bg: '#fef3c7', label: 'Warning' }
    return { color: '#16a34a', bg: '#dcfce7', label: 'On track' }
  }

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Budgets</h2>
          <button
            style={styles.addBtn}
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          >
            + Add Budget
          </button>
        </div>

        {/* Month/Year Filter */}
        <div style={styles.filterRow}>
          <select
            style={styles.filterSelect}
            value={month}
            onChange={e => setMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            style={styles.filterSelect}
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Form Modal */}
        {showForm && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>
                {editId ? 'Edit Budget' : 'New Budget'}
              </h3>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                    <label style={styles.label}>Category</label>
                    <select
                        style={styles.input}
                        name="categoryId"
                        value={form.categoryId || ''}
                        onChange={handleChange}
                        required
                    >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Budget Amount</label>
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

        {/* Budget Cards */}
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : budgets.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No budgets for this month</p>
            <p style={styles.emptySubtext}>Add a budget to start tracking your spending</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {budgets.map(budget => {
              const pct = Math.min((budget.spent / budget.amount) * 100, 100)
              const status = getStatus(budget.spent, budget.amount)
              return (
                <div key={budget.id} style={styles.budgetCard}>
                  <div style={styles.budgetCardHeader}>
                    <div>
                      <p style={styles.categoryName}>{budget.categoryName}</p>
                      <span style={{ ...styles.statusBadge, backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={styles.cardActions}>
                      <button style={styles.editBtn} onClick={() => handleEdit(budget)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(budget.id)}>Delete</button>
                    </div>
                  </div>
                  <div style={styles.amountRow}>
                    <span style={styles.spentAmt}>${Number(budget.spent).toFixed(2)} spent</span>
                    <span style={styles.limitAmt}>of ${Number(budget.amount).toFixed(2)}</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      width: `${pct}%`,
                      backgroundColor: status.color,
                    }} />
                  </div>
                  <p style={styles.pctText}>{pct.toFixed(0)}% used</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: '#f5f5f5', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a' },
  addBtn: { padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' },
  filterRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  filterSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white' },
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  budgetCard: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  budgetCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  categoryName: { fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' },
  statusBadge: { fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  cardActions: { display: 'flex', gap: '6px' },
  editBtn: { padding: '5px 12px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px', fontSize: '13px', color: '#333' },
  deleteBtn: { padding: '5px 12px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', fontSize: '13px', color: '#dc2626' },
  amountRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  spentAmt: { fontSize: '14px', fontWeight: '600', color: '#333' },
  limitAmt: { fontSize: '14px', color: '#999' },
  barTrack: { height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  pctText: { fontSize: '12px', color: '#999', textAlign: 'right' },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: '16px', fontWeight: '500', color: '#666', marginBottom: '8px' },
  emptySubtext: { fontSize: '14px', color: '#999' },
  empty: { textAlign: 'center', padding: '40px', color: '#999' },
}