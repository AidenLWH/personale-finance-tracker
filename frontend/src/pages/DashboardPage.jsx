import { useState, useEffect } from 'react'
import { dashboardService } from '../services/api'
import Navbar from '../components/Navbar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardService.get()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <Navbar />
      <div style={styles.center}>Loading...</div>
    </div>
  )

  if (error) return (
    <div>
      <Navbar />
      <div style={styles.center}>{error}</div>
    </div>
  )

  const chartData = [
    { name: 'Income', amount: Number(data?.totalIncome || 0) },
    { name: 'Expenses', amount: Number(data?.totalExpenses || 0) },
    { name: 'Savings', amount: Number(data?.netSavings || 0) },
  ]

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Dashboard</h2>

        {/* Summary Cards */}
        <div style={styles.cardGrid}>
          <div style={{ ...styles.card, borderTop: '4px solid #22c55e' }}>
            <p style={styles.cardLabel}>Total Income</p>
            <p style={{ ...styles.cardValue, color: '#22c55e' }}>
              ${Number(data?.totalIncome || 0).toFixed(2)}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: '4px solid #ef4444' }}>
            <p style={styles.cardLabel}>Total Expenses</p>
            <p style={{ ...styles.cardValue, color: '#ef4444' }}>
              ${Number(data?.totalExpenses || 0).toFixed(2)}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: '4px solid #2563eb' }}>
            <p style={styles.cardLabel}>Net Savings</p>
            <p style={{ ...styles.cardValue, color: '#2563eb' }}>
              ${Number(data?.netSavings || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Financial Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.twoCol}>
          {/* Recent Transactions */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Recent Transactions</h3>
            {data?.recentTransactions?.length === 0 ? (
              <p style={styles.empty}>No transactions yet</p>
            ) : (
              data?.recentTransactions?.map(txn => (
                <div key={txn.id} style={styles.txnRow}>
                  <div>
                    <p style={styles.txnName}>
                      {txn.description || txn.categoryName || 'Transaction'}
                    </p>
                    <p style={styles.txnMeta}>
                      {txn.categoryName} · {txn.date}
                    </p>
                  </div>
                  <span style={{
                    ...styles.txnAmount,
                    color: txn.type === 'INCOME' ? '#22c55e' : '#ef4444'
                  }}>
                    {txn.type === 'INCOME' ? '+' : '-'}${Number(txn.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Budgets */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>This Month's Budgets</h3>
            {data?.budgets?.length === 0 ? (
              <p style={styles.empty}>No budgets set for this month</p>
            ) : (
              data?.budgets?.map(budget => {
                const pct = Math.min((budget.spent / budget.amount) * 100, 100)
                const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e'
                return (
                  <div key={budget.id} style={styles.budgetRow}>
                    <div style={styles.budgetHeader}>
                      <span style={styles.budgetName}>{budget.categoryName}</span>
                      <span style={styles.budgetAmt}>
                        ${Number(budget.spent).toFixed(0)} / ${Number(budget.amount).toFixed(0)}
                      </span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{
                        ...styles.barFill,
                        width: `${pct}%`,
                        backgroundColor: color
                      }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: '#f5f5f5', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' },
  heading: { fontSize: '22px', fontWeight: '700', marginBottom: '20px', color: '#1a1a1a' },
  center: { display: 'flex', justifyContent: 'center', padding: '60px', color: '#666' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px' },
  cardLabel: { fontSize: '13px', color: '#666', marginBottom: '8px' },
  cardValue: { fontSize: '28px', fontWeight: '700' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  txnRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  txnName: { fontSize: '14px', fontWeight: '500', color: '#1a1a1a' },
  txnMeta: { fontSize: '12px', color: '#999', marginTop: '2px' },
  txnAmount: { fontSize: '14px', fontWeight: '600' },
  empty: { fontSize: '14px', color: '#999', textAlign: 'center', padding: '20px 0' },
  budgetRow: { marginBottom: '14px' },
  budgetHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  budgetName: { fontSize: '13px', fontWeight: '500', color: '#333' },
  budgetAmt: { fontSize: '12px', color: '#666' },
  barTrack: { height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
}