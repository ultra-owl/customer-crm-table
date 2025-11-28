// src/App.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { generateCustomers, MAX_RECORDS } from './data/dataGenerator.js';
import { useDebounce } from './hooks/useDebounce.js';
import './App.css';

// --- Table configuration ---
const ROW_HEIGHT = 48;
const VIEWPORT_HEIGHT = 700;

// Columns shown in the table
const COLUMNS = [
  { key: 'id', label: 'ID', width: 60, sortable: true },
  { key: 'name', label: 'Name', width: 200, sortable: true },
  { key: 'email', label: 'Email', width: 250, sortable: true },
  { key: 'phone', label: 'Phone', width: 180, sortable: true },
  { key: 'score', label: 'Score', width: 80, sortable: true },
  { key: 'lastMessageAt', label: 'Last Message', width: 180, sortable: true },
  { key: 'addedBy', label: 'Added By', width: 120, sortable: true },
];

// Row renderer
const TableRow = React.memo(({ customer }) => {
  if (!customer) return null;

  return (
    <div className="table-row">
      {COLUMNS.map((col) => {
        let value = customer[col.key];
        if (col.key === 'lastMessageAt') {
          value = new Date(value).toLocaleString();
        }
        return (
          <div
            key={col.key}
            className="table-cell"
            style={{ flex: `0 0 ${col.width}px` }}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
});

// Header renderer
const TableHeader = ({ sortConfig, onSort }) => {
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <div className="table-header">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`header-cell ${col.sortable ? 'sortable' : ''}`}
          style={{ flex: `0 0 ${col.width}px` }}
          onClick={() => col.sortable && onSort(col.key)}
        >
          <span className="header-label">{col.label}</span>
          {col.sortable && (
            <span className="sort-icon">{getSortIndicator(col.key)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// FILTER PANEL (correct version)
const FiltersDropdown = ({
  scoreFilter,
  setScoreFilter,
  dateFilter,
  setDateFilter,
  addedByFilter,
  setAddedByFilter,
  uniqueAddedBy,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-dropdown">
      <button className="filter-button" onClick={() => setOpen(!open)}>
        Filters
      </button>

      {open && (
        <div className="filter-panel">
          <h4>Score Range</h4>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="low">0–2000</option>
            <option value="mid">2001–5000</option>
            <option value="high">5001–8000</option>
            <option value="top">8001+</option>
          </select>

          <h4>Last Message</h4>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="older">Older</option>
          </select>

          <h4>Added By</h4>
          <select
            value={addedByFilter}
            onChange={(e) => setAddedByFilter(e.target.value)}
          >
            <option value="all">All</option>
            {uniqueAddedBy.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

// MAIN APP
export default function App() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [loading, setLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending',
  });

  // FILTER STATES (correct location)
  const [scoreFilter, setScoreFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [addedByFilter, setAddedByFilter] = useState('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  // Load data
  useEffect(() => {
    const data = generateCustomers(MAX_RECORDS);
    setAllCustomers(data);
    setLoading(false);
  }, []);

  // Unique addedBy list
  const uniqueAddedBy = useMemo(() => {
    return [...new Set(allCustomers.map((c) => c.addedBy))];
  }, [allCustomers]);

  // Filter + search + sort pipeline
  const filteredAndSorted = useMemo(() => {
    let data = [...allCustomers];

    // SEARCH
    if (debouncedSearchTerm) {
      const s = debouncedSearchTerm.toLowerCase();
      data = data.filter((c) => {
        return (
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.replace(/\D/g, '').includes(s)
        );
      });
    }

    // SCORE FILTER
    if (scoreFilter !== 'all') {
      data = data.filter((c) => {
        const s = c.score;
        if (scoreFilter === 'low') return s <= 2000;
        if (scoreFilter === 'mid') return s > 2000 && s <= 5000;
        if (scoreFilter === 'high') return s > 5000 && s <= 8000;
        if (scoreFilter === 'top') return s > 8000;
      });
    }

    // DATE FILTER
    if (dateFilter !== 'all') {
      const now = Date.now();
      const day = 86400000;

      data = data.filter((c) => {
        const diff = now - c.lastMessageAt;
        if (dateFilter === '24h') return diff <= day;
        if (dateFilter === '7d') return diff <= 7 * day;
        if (dateFilter === '30d') return diff <= 30 * day;
        if (dateFilter === 'older') return diff > 30 * day;
      });
    }

    // ADDED BY FILTER
    if (addedByFilter !== 'all') {
      data = data.filter((c) => c.addedBy === addedByFilter);
    }

    // SORT
    const { key, direction } = sortConfig;
    const dir = direction === 'ascending' ? 1 : -1;

    data.sort((a, b) => {
      if (a[key] < b[key]) return -1 * dir;
      if (a[key] > b[key]) return 1 * dir;
      return 0;
    });

    return data;
  }, [
    allCustomers,
    debouncedSearchTerm,
    scoreFilter,
    dateFilter,
    addedByFilter,
    sortConfig,
  ]);

  // Virtualization
  const total = filteredAndSorted.length;
  const rowsInView = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT);
  const buffer = 10;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - buffer);
  const end = Math.min(total, start + rowsInView + buffer * 2);

  const visibleRows = filteredAndSorted.slice(start, end);

  const paddingTop = start * ROW_HEIGHT;
  const paddingBottom = Math.max(
    0,
    total * ROW_HEIGHT - paddingTop - visibleRows.length * ROW_HEIGHT
  );

  const TOTAL_WIDTH = COLUMNS.reduce((w, c) => w + c.width, 0);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const next =
        prev.key === key
          ? {
              key,
              direction:
                prev.direction === 'ascending' ? 'descending' : 'ascending',
            }
          : { key, direction: 'ascending' };

      const table = document.querySelector('.customer-table');
      if (table) table.scrollTop = 0;
      setScrollTop(0);

      return next;
    });
  };

  if (loading)
    return (
      <div className="app-container">
        <h2>Loading 1M records...</h2>
      </div>
    );

  return (
    <div className="app-container">
      <h1>Customer List ({filteredAndSorted.length.toLocaleString()})</h1>

      <div className="controls">
        <input
          className="search-input"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FiltersDropdown
          scoreFilter={scoreFilter}
          setScoreFilter={setScoreFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          addedByFilter={addedByFilter}
          setAddedByFilter={setAddedByFilter}
          uniqueAddedBy={uniqueAddedBy}
        />
      </div>

      <div
        className="customer-table"
        style={{ maxHeight: VIEWPORT_HEIGHT, width: TOTAL_WIDTH }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <TableHeader sortConfig={sortConfig} onSort={handleSort} />
        <div className="table-body">
          <div style={{ height: paddingTop }} />
          {visibleRows.map((c) => (
            <TableRow key={c.id} customer={c} />
          ))}
          <div style={{ height: paddingBottom }} />
        </div>
      </div>
    </div>
  );
}
