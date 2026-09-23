import React, { useEffect, useMemo, useState } from "react";
// trying to do better
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import "./App.css";

const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

const initialTransactions = [
  {
    id: 1,
    title: "Monthly Salary",
    amount: 35000,
    type: "income",
    category: "Salary",
    date: "2026-09-01",
  },
  {
    id: 2,
    title: "Groceries",
    amount: 2200,
    type: "expense",
    category: "Food",
    date: "2026-09-03",
  },
  {
    id: 3,
    title: "Internet Bill",
    amount: 999,
    type: "expense",
    category: "Bills",
    date: "2026-09-05",
  },
];

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("expenseTrackerTransactions");

    if (saved) {
      return JSON.parse(saved);
    }

    return initialTransactions;
  });

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerTransactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    setCategory(type === "expense" ? "Food" : "Salary");
  }, [type]);

  const addTransaction = (e) => {
    e.preventDefault();

    if (!title.trim() || !amount || Number(amount) <= 0 || !date) {
      alert("Please enter valid transaction details.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    setTitle("");
    setAmount("");
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = transaction.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "All" ||
        transaction.category === filterCategory;

      const matchesMonth = transaction.date.startsWith(selectedMonth);

      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [transactions, search, filterCategory, selectedMonth]);

  const monthlyIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyExpense = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = monthlyIncome - monthlyExpense;

  const expenseByCategory = useMemo(() => {
    const data = {};

    filteredTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        data[item.category] =
          (data[item.category] || 0) + item.amount;
      });

    return Object.entries(data).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredTransactions]);

  const dailyExpenseData = useMemo(() => {
    const data = {};

    filteredTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        data[item.date] = (data[item.date] || 0) + item.amount;
      });

    return Object.entries(data)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, expense]) => ({
        date: date.slice(8, 10),
        expense,
      }));
  }, [filteredTransactions]);

  const monthlyTrendData = useMemo(() => {
    const data = {};

    transactions.forEach((item) => {
      const month = item.date.slice(0, 7);

      if (!data[month]) {
        data[month] = {
          month,
          income: 0,
          expense: 0,
        };
      }

      if (item.type === "income") {
        data[month].income += item.amount;
      } else {
        data[month].expense += item.amount;
      }
    });

    return Object.values(data)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [transactions]);

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const headers = [
      "Title",
      "Amount",
      "Type",
      "Category",
      "Date",
    ];

    const rows = transactions.map((item) => [
      item.title,
      item.amount,
      item.type,
      item.category,
      item.date,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-tracker.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const categories =
    type === "expense" ? expenseCategories : incomeCategories;

  const allCategories = [
    ...new Set(transactions.map((item) => item.category)),
  ];

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Manage your money. Understand your spending.</p>
        </div>

        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </header>

      <main className="container">
        {/* Summary */}

        <section className="summary-grid">
          <div className="summary-card income-card">
            <span>Total Income</span>
            <h2>₹{monthlyIncome.toLocaleString("en-IN")}</h2>
          </div>

          <div className="summary-card expense-card">
            <span>Total Expense</span>
            <h2>₹{monthlyExpense.toLocaleString("en-IN")}</h2>
          </div>

          <div className="summary-card balance-card">
            <span>Balance</span>
            <h2>₹{balance.toLocaleString("en-IN")}</h2>
          </div>

          <div className="summary-card transaction-card">
            <span>Transactions</span>
            <h2>{filteredTransactions.length}</h2>
          </div>
        </section>

        {/* Add Transaction */}

        <section className="panel">
          <h2>Add Transaction</h2>

          <form onSubmit={addTransaction} className="transaction-form">
            <input
              type="text"
              placeholder="Transaction title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button type="submit">Add Transaction</button>
          </form>
        </section>

        {/* Filters */}

        <section className="panel">
          <div className="filter-header">
            <h2>Transactions</h2>

            <div className="filters">
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value)
                }
              >
                <option value="All">All Categories</option>

                {allCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
              />
            </div>
          </div>

          <div className="transaction-list">
            {filteredTransactions.length === 0 ? (
              <div className="empty">
                No transactions found.
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  className="transaction"
                  key={transaction.id}
                >
                  <div className="transaction-info">
                    <div className="transaction-icon">
                      {transaction.type === "income"
                        ? "+"
                        : "-"}
                    </div>

                    <div>
                      <h3>{transaction.title}</h3>
                      <p>
                        {transaction.category} •{" "}
                        {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="transaction-right">
                    <strong
                      className={
                        transaction.type === "income"
                          ? "income-text"
                          : "expense-text"
                      }
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}
                      ₹
                      {transaction.amount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTransaction(transaction.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Analytics */}

        <section className="analytics">
          <div className="panel chart-card">
            <h2>Expense by Category</h2>

            {expenseByCategory.length === 0 ? (
              <div className="empty">
                No expense data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {expenseByCategory.map((_, index) => (
                      <Cell
                        key={index}
                        fill={`hsl(${
                          (index * 55) % 360
                        }, 70%, 55%)`}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="panel chart-card">
            <h2>Income vs Expense</h2>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#22c55e"
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel chart-card full-chart">
            <h2>Daily Expense Trend</h2>

            {dailyExpenseData.length === 0 ? (
              <div className="empty">
                No expense data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={dailyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;