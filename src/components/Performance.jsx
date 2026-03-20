import React, { useState } from 'react'
import {
  ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend,
} from 'recharts'
import { useMobile } from '../lib/useMobile'

// ── Per-client performance profiles ──────────────────────────────────────────
const PROFILES = {
  'Chen Family Office': {
    aum: 42_300_000,
    inception: 'Jan 2016',
    twrr:  9.8,
    irr:   13.1,
    ytd:   11.4,
    yr1:   12.2,
    yr3:   10.8,
    since: 11.4,
    benchmark: { name: 'Blended (60/40)', ytd: 8.2, yr1: 9.1, yr3: 8.4, since: 7.9 },
    pme: { sp500: 0.94, msci: 1.08 },   // PME ratios vs S&P 500 and MSCI World
    // Monthly NAV index (base 100 at inception)
    navSeries: [
      { month: 'Jan 16', port: 100.0, bench: 100.0 },
      { month: 'Jul 16', port: 103.8, bench: 102.1 },
      { month: 'Jan 17', port: 109.4, bench: 107.5 },
      { month: 'Jul 17', port: 114.2, bench: 112.3 },
      { month: 'Jan 18', port: 119.1, bench: 116.8 },
      { month: 'Jul 18', port: 125.6, bench: 119.4 },
      { month: 'Jan 19', port: 122.8, bench: 111.2 },
      { month: 'Jul 19', port: 131.4, bench: 121.8 },
      { month: 'Jan 20', port: 138.2, bench: 128.6 },
      { month: 'Jul 20', port: 133.9, bench: 121.4 },
      { month: 'Jan 21', port: 144.8, bench: 132.9 },
      { month: 'Jul 21', port: 156.2, bench: 142.8 },
      { month: 'Jan 22', port: 163.4, bench: 148.1 },
      { month: 'Jul 22', port: 158.2, bench: 134.8 },
      { month: 'Jan 23', port: 169.8, bench: 139.4 },
      { month: 'Jul 23', port: 181.2, bench: 148.6 },
      { month: 'Jan 24', port: 192.4, bench: 158.2 },
      { month: 'Jul 24', port: 205.8, bench: 166.4 },
      { month: 'Jan 25', port: 218.6, bench: 172.1 },
      { month: 'Mar 26', port: 243.2, bench: 186.5 },
    ],
    // Attribution by asset class (bps contribution to YTD return)
    attribution: [
      { cls: 'Real Estate',    contrib: 4.2, weight: 38, ret: 14.2 },
      { cls: 'Private Equity', contrib: 3.8, weight: 33, ret: 16.8 },
      { cls: 'Hedge Fund',     contrib: 1.6, weight: 13, ret:  8.9 },
      { cls: 'Fixed Income',   contrib: 0.8, weight: 10, ret:  5.8 },
      { cls: 'Cash',           contrib: 0.1, weight:  6, ret:  5.2 },
    ],
    // Top/bottom fund attribution
    fundAttrib: [
      { fund: 'KKR Americas XIV',     cls: 'PE',  contrib: +2.4 },
      { fund: 'Blackstone RE XI',     cls: 'RE',  contrib: +2.1 },
      { fund: 'Harrison St. RE',      cls: 'RE',  contrib: +1.8 },
      { fund: 'Bridgewater',          cls: 'HF',  contrib: +1.2 },
      { fund: 'PIMCO Income',         cls: 'FI',  contrib: +0.6 },
    ],
    // Quarterly cash flows (+ inflows to funds, - distributions)
    cashFlows: [
      { q: 'Q1 21', contributions: -2_200_000, distributions:        0, nav: 26_400_000 },
      { q: 'Q2 21', contributions:          0, distributions:  280_000, nav: 27_100_000 },
      { q: 'Q3 21', contributions: -1_800_000, distributions:        0, nav: 29_800_000 },
      { q: 'Q4 21', contributions:          0, distributions:  320_000, nav: 31_200_000 },
      { q: 'Q1 22', contributions: -2_500_000, distributions:        0, nav: 33_800_000 },
      { q: 'Q2 22', contributions:          0, distributions:  410_000, nav: 34_200_000 },
      { q: 'Q3 22', contributions:          0, distributions:  380_000, nav: 34_800_000 },
      { q: 'Q4 22', contributions: -1_200_000, distributions:        0, nav: 36_400_000 },
      { q: 'Q1 23', contributions:          0, distributions:  520_000, nav: 37_600_000 },
      { q: 'Q2 23', contributions: -1_600_000, distributions:        0, nav: 39_800_000 },
      { q: 'Q3 23', contributions:          0, distributions:  480_000, nav: 40_400_000 },
      { q: 'Q4 23', contributions:          0, distributions:  610_000, nav: 41_200_000 },
      { q: 'Q1 24', contributions: -1_800_000, distributions:        0, nav: 42_300_000 },
      { q: 'Q2 24', contributions:          0, distributions:  680_000, nav: 43_100_000 },
      { q: 'Q3 24', contributions:          0, distributions:  520_000, nav: 43_800_000 },
      { q: 'Q4 24', contributions: -2_100_000, distributions:        0, nav: 44_600_000 },
    ],
    // TVPI progression by fund over time
    tvpiProgress: [
      { fund: 'KKR Americas XIV',  v2020: 1.00, v2021: 1.14, v2022: 1.38, v2023: 1.56, v2024: 1.72, v2025: 1.84 },
      { fund: 'Blackstone RE XI',  v2020: 1.00, v2021: 1.09, v2022: 1.28, v2023: 1.46, v2024: 1.62, v2025: 1.78 },
      { fund: 'Harrison St. RE',   v2021: 1.00, v2022: 1.12, v2023: 1.28, v2024: 1.42, v2025: 1.54 },
    ],
  },

  'Meridian Capital Partners': {
    aum: 38_100_000,
    inception: 'Mar 2014',
    twrr:  11.8,
    irr:   16.2,
    ytd:   13.2,
    yr1:   14.8,
    yr3:   12.4,
    since: 13.8,
    benchmark: { name: 'PE Benchmark (CA)', ytd: 10.1, yr1: 11.4, yr3: 9.8, since: 10.2 },
    pme: { sp500: 1.12, msci: 1.28 },
    navSeries: [
      { month: 'Mar 14', port: 100.0, bench: 100.0 },
      { month: 'Jan 15', port: 106.2, bench: 104.8 },
      { month: 'Jan 16', port: 114.8, bench: 110.2 },
      { month: 'Jan 17', port: 128.4, bench: 118.6 },
      { month: 'Jan 18', port: 144.2, bench: 128.4 },
      { month: 'Jan 19', port: 138.6, bench: 118.2 },
      { month: 'Jan 20', port: 158.8, bench: 131.4 },
      { month: 'Jan 21', port: 172.4, bench: 142.8 },
      { month: 'Jan 22', port: 194.6, bench: 158.4 },
      { month: 'Jan 23', port: 186.2, bench: 142.6 },
      { month: 'Jan 24', port: 214.8, bench: 156.8 },
      { month: 'Jan 25', port: 248.6, bench: 172.4 },
      { month: 'Mar 26', port: 281.4, bench: 186.2 },
    ],
    attribution: [
      { cls: 'Private Equity', contrib: 9.4, weight: 72, ret: 18.4 },
      { cls: 'Real Estate',    contrib: 1.6, weight: 13, ret: 13.5 },
      { cls: 'Credit',         contrib: 0.8, weight:  9, ret:  9.8 },
      { cls: 'Cash',           contrib: 0.3, weight:  6, ret:  5.2 },
    ],
    fundAttrib: [
      { fund: 'Vista Equity VII',    cls: 'PE', contrib: +3.8 },
      { fund: 'Apollo Global XVI',   cls: 'PE', contrib: +3.2 },
      { fund: 'Carlyle VIII',        cls: 'PE', contrib: +2.6 },
      { fund: 'Ares RE IV',          cls: 'RE', contrib: +1.4 },
      { fund: 'Oaktree Credit IV',   cls: 'CR', contrib: +0.8 },
    ],
    cashFlows: [
      { q: 'Q1 21', contributions: -3_800_000, distributions:        0, nav: 28_400_000 },
      { q: 'Q2 21', contributions:          0, distributions:  180_000, nav: 29_600_000 },
      { q: 'Q3 21', contributions: -2_400_000, distributions:        0, nav: 32_800_000 },
      { q: 'Q4 21', contributions:          0, distributions:  240_000, nav: 33_800_000 },
      { q: 'Q1 22', contributions: -3_200_000, distributions:        0, nav: 36_600_000 },
      { q: 'Q2 22', contributions:          0, distributions:  310_000, nav: 37_200_000 },
      { q: 'Q3 22', contributions:          0, distributions:  280_000, nav: 37_800_000 },
      { q: 'Q4 22', contributions: -1_800_000, distributions:        0, nav: 38_600_000 },
      { q: 'Q1 23', contributions:          0, distributions:  420_000, nav: 38_200_000 },
      { q: 'Q2 23', contributions: -2_200_000, distributions:        0, nav: 39_400_000 },
      { q: 'Q3 23', contributions:          0, distributions:  380_000, nav: 39_800_000 },
      { q: 'Q4 23', contributions:          0, distributions:  520_000, nav: 40_200_000 },
      { q: 'Q1 24', contributions: -2_800_000, distributions:        0, nav: 38_100_000 },
      { q: 'Q2 24', contributions:          0, distributions:  610_000, nav: 38_800_000 },
      { q: 'Q3 24', contributions:          0, distributions:  480_000, nav: 39_400_000 },
      { q: 'Q4 24', contributions: -2_400_000, distributions:        0, nav: 38_900_000 },
    ],
    tvpiProgress: [
      { fund: 'Apollo Global XVI',    v2020: 1.00, v2021: 1.18, v2022: 1.42, v2023: 1.64, v2024: 1.78, v2025: 1.92 },
      { fund: 'Carlyle VIII',         v2020: 1.00, v2021: 1.14, v2022: 1.38, v2023: 1.56, v2024: 1.68, v2025: 1.76 },
      { fund: 'Vista Equity VII',     v2021: 1.00, v2022: 1.16, v2023: 1.42, v2024: 1.68, v2025: 1.88 },
    ],
  },

  'Okonkwo Family Trust': {
    aum: 28_400_000,
    inception: 'Jun 2018',
    twrr:  9.4,
    irr:   11.5,
    ytd:   10.8,
    yr1:   11.4,
    yr3:    9.8,
    since: 10.2,
    benchmark: { name: 'HF Index (HFRI)', ytd: 7.8, yr1: 8.4, yr3: 7.2, since: 7.6 },
    pme: { sp500: 0.88, msci: 1.02 },
    navSeries: [
      { month: 'Jun 18', port: 100.0, bench: 100.0 },
      { month: 'Jan 19', port: 104.8, bench: 102.2 },
      { month: 'Jan 20', port: 112.4, bench: 108.6 },
      { month: 'Jan 21', port: 108.2, bench: 104.8 },
      { month: 'Jan 22', port: 124.6, bench: 114.4 },
      { month: 'Jan 23', port: 134.2, bench: 120.8 },
      { month: 'Jan 24', port: 148.8, bench: 128.4 },
      { month: 'Jan 25', port: 164.4, bench: 138.6 },
      { month: 'Mar 26', port: 182.2, bench: 149.4 },
    ],
    attribution: [
      { cls: 'Hedge Fund',     contrib: 5.8, weight: 54, ret: 13.5 },
      { cls: 'Private Equity', contrib: 2.2, weight: 19, ret: 10.1 },
      { cls: 'Credit',         contrib: 1.4, weight: 15, ret:  7.4 },
      { cls: 'Cash',           contrib: 0.6, weight: 12, ret:  5.2 },
    ],
    fundAttrib: [
      { fund: 'Millennium Partners', cls: 'HF', contrib: +2.4 },
      { fund: 'Citadel Wellington',  cls: 'HF', contrib: +2.2 },
      { fund: 'Two Sigma Spectrum',  cls: 'HF', contrib: +1.8 },
      { fund: 'TPG Rise Climate',    cls: 'PE', contrib: +1.2 },
      { fund: 'Blackstone Credit',   cls: 'CR', contrib: +0.8 },
    ],
    cashFlows: [
      { q: 'Q1 21', contributions: -2_000_000, distributions:       0, nav: 18_400_000 },
      { q: 'Q2 21', contributions:          0, distributions: 180_000, nav: 19_200_000 },
      { q: 'Q3 21', contributions: -1_500_000, distributions:       0, nav: 21_400_000 },
      { q: 'Q4 21', contributions:          0, distributions: 220_000, nav: 22_000_000 },
      { q: 'Q1 22', contributions: -2_200_000, distributions:       0, nav: 23_600_000 },
      { q: 'Q2 22', contributions:          0, distributions: 260_000, nav: 24_200_000 },
      { q: 'Q3 22', contributions:          0, distributions: 280_000, nav: 24_800_000 },
      { q: 'Q4 22', contributions: -1_000_000, distributions:       0, nav: 25_600_000 },
      { q: 'Q1 23', contributions:          0, distributions: 320_000, nav: 26_200_000 },
      { q: 'Q2 23', contributions: -1_200_000, distributions:       0, nav: 27_200_000 },
      { q: 'Q3 23', contributions:          0, distributions: 340_000, nav: 27_600_000 },
      { q: 'Q4 23', contributions:          0, distributions: 380_000, nav: 27_800_000 },
      { q: 'Q1 24', contributions: -1_600_000, distributions:       0, nav: 28_400_000 },
      { q: 'Q2 24', contributions:          0, distributions: 420_000, nav: 28_800_000 },
      { q: 'Q3 24', contributions:          0, distributions: 380_000, nav: 28_400_000 },
      { q: 'Q4 24', contributions: -1_800_000, distributions:       0, nav: 27_800_000 },
    ],
    tvpiProgress: [
      { fund: 'Citadel Wellington',  v2020: 1.00, v2021: 1.12, v2022: 1.28, v2023: 1.42, v2024: 1.54, v2025: 1.62 },
      { fund: 'Millennium Partners', v2020: 1.00, v2021: 1.10, v2022: 1.24, v2023: 1.38, v2024: 1.48, v2025: 1.55 },
    ],
  },

  'Park & Lee Family Office': {
    aum: 35_600_000,
    inception: 'Sep 2017',
    twrr:  8.2,
    irr:   10.8,
    ytd:    9.6,
    yr1:   10.2,
    yr3:    8.8,
    since:  9.4,
    benchmark: { name: 'Blended (50/50)', ytd: 8.8, yr1: 9.4, yr3: 8.2, since: 8.6 },
    pme: { sp500: 0.82, msci: 0.96 },
    navSeries: [
      { month: 'Sep 17', port: 100.0, bench: 100.0 },
      { month: 'Jan 18', port: 102.8, bench: 102.2 },
      { month: 'Jan 19', port: 100.4, bench: 97.8 },
      { month: 'Jan 20', port: 112.8, bench: 108.4 },
      { month: 'Jan 21', port: 106.2, bench: 102.6 },
      { month: 'Jan 22', port: 122.8, bench: 116.4 },
      { month: 'Jan 23', port: 128.4, bench: 110.8 },
      { month: 'Jan 24', port: 142.6, bench: 122.4 },
      { month: 'Jan 25', port: 156.4, bench: 133.8 },
      { month: 'Mar 26', port: 171.4, bench: 146.2 },
    ],
    attribution: [
      { cls: 'Equity',         contrib: 4.2, weight: 43, ret: 12.4 },
      { cls: 'Private Equity', contrib: 2.4, weight: 23, ret: 14.8 },
      { cls: 'Real Estate',    contrib: 1.4, weight: 16, ret: 11.2 },
      { cls: 'Credit',         contrib: 0.8, weight: 12, ret:  8.2 },
      { cls: 'Cash',           contrib: 0.3, weight:  6, ret:  5.2 },
    ],
    fundAttrib: [
      { fund: 'JP Morgan PE',      cls: 'PE', contrib: +2.2 },
      { fund: 'Morgan Stanley',    cls: 'EQ', contrib: +1.8 },
      { fund: 'Nuveen RE',         cls: 'RE', contrib: +1.4 },
      { fund: 'PGIM Credit',       cls: 'CR', contrib: +0.8 },
      { fund: 'iShares',           cls: 'EQ', contrib: +0.6 },
    ],
    cashFlows: [
      { q: 'Q1 21', contributions: -2_400_000, distributions:       0, nav: 24_600_000 },
      { q: 'Q2 21', contributions:          0, distributions: 120_000, nav: 25_400_000 },
      { q: 'Q3 21', contributions: -1_800_000, distributions:       0, nav: 27_200_000 },
      { q: 'Q4 21', contributions:          0, distributions: 180_000, nav: 28_000_000 },
      { q: 'Q1 22', contributions: -2_000_000, distributions:       0, nav: 29_600_000 },
      { q: 'Q2 22', contributions:          0, distributions: 220_000, nav: 30_200_000 },
      { q: 'Q3 22', contributions:          0, distributions: 200_000, nav: 30_800_000 },
      { q: 'Q4 22', contributions: -1_400_000, distributions:       0, nav: 31_600_000 },
      { q: 'Q1 23', contributions:          0, distributions: 280_000, nav: 32_400_000 },
      { q: 'Q2 23', contributions: -1_800_000, distributions:       0, nav: 33_400_000 },
      { q: 'Q3 23', contributions:          0, distributions: 320_000, nav: 34_000_000 },
      { q: 'Q4 23', contributions:          0, distributions: 360_000, nav: 34_600_000 },
      { q: 'Q1 24', contributions: -2_200_000, distributions:       0, nav: 35_600_000 },
      { q: 'Q2 24', contributions:          0, distributions: 400_000, nav: 36_200_000 },
      { q: 'Q3 24', contributions:          0, distributions: 360_000, nav: 36_600_000 },
      { q: 'Q4 24', contributions: -1_600_000, distributions:       0, nav: 35_800_000 },
    ],
    tvpiProgress: [
      { fund: 'JP Morgan PE',    v2020: 1.00, v2021: 1.10, v2022: 1.28, v2023: 1.44, v2024: 1.58, v2025: 1.70 },
      { fund: 'Nuveen RE',       v2021: 1.00, v2022: 1.14, v2023: 1.28, v2024: 1.40, v2025: 1.50 },
    ],
  },

  'Rosenberg Family Trust': {
    aum: 35_000_000,
    inception: 'Apr 2015',
    twrr:  10.8,
    irr:   14.1,
    ytd:   12.1,
    yr1:   13.4,
    yr3:   11.8,
    since: 12.2,
    benchmark: { name: 'RE Benchmark (NCREIF)', ytd: 9.8, yr1: 10.6, yr3: 9.2, since: 9.4 },
    pme: { sp500: 1.04, msci: 1.18 },
    navSeries: [
      { month: 'Apr 15', port: 100.0, bench: 100.0 },
      { month: 'Jan 16', port: 106.8, bench: 104.2 },
      { month: 'Jan 17', port: 116.4, bench: 111.8 },
      { month: 'Jan 18', port: 128.6, bench: 120.4 },
      { month: 'Jan 19', port: 124.2, bench: 114.8 },
      { month: 'Jan 20', port: 142.8, bench: 126.4 },
      { month: 'Jan 21', port: 138.4, bench: 121.8 },
      { month: 'Jan 22', port: 158.6, bench: 136.4 },
      { month: 'Jan 23', port: 168.4, bench: 140.8 },
      { month: 'Jan 24', port: 186.8, bench: 152.4 },
      { month: 'Jan 25', port: 208.4, bench: 164.8 },
      { month: 'Mar 26', port: 233.6, bench: 178.2 },
    ],
    attribution: [
      { cls: 'Real Estate',    contrib: 6.8, weight: 51, ret: 16.2 },
      { cls: 'Credit',         contrib: 1.8, weight: 16, ret: 10.8 },
      { cls: 'Private Equity', contrib: 1.4, weight: 13, ret: 13.2 },
      { cls: 'Equity',         contrib: 0.8, weight: 11, ret: 10.2 },
      { cls: 'Cash',           contrib: 0.5, weight:  9, ret:  5.2 },
    ],
    fundAttrib: [
      { fund: 'Blackstone RE X',       cls: 'RE', contrib: +3.8 },
      { fund: 'Starwood Capital V',     cls: 'RE', contrib: +2.8 },
      { fund: 'Ares Capital VII',       cls: 'CR', contrib: +1.8 },
      { fund: 'Hamilton Lane Sec.',     cls: 'PE', contrib: +1.4 },
      { fund: 'Vanguard Total Mkt',     cls: 'EQ', contrib: +0.8 },
    ],
    cashFlows: [
      { q: 'Q1 21', contributions: -2_800_000, distributions:       0, nav: 24_200_000 },
      { q: 'Q2 21', contributions:          0, distributions: 240_000, nav: 25_000_000 },
      { q: 'Q3 21', contributions: -2_200_000, distributions:       0, nav: 27_400_000 },
      { q: 'Q4 21', contributions:          0, distributions: 280_000, nav: 28_200_000 },
      { q: 'Q1 22', contributions: -2_600_000, distributions:       0, nav: 30_200_000 },
      { q: 'Q2 22', contributions:          0, distributions: 320_000, nav: 30_800_000 },
      { q: 'Q3 22', contributions:          0, distributions: 360_000, nav: 31_400_000 },
      { q: 'Q4 22', contributions: -1_600_000, distributions:       0, nav: 32_400_000 },
      { q: 'Q1 23', contributions:          0, distributions: 420_000, nav: 33_200_000 },
      { q: 'Q2 23', contributions: -2_000_000, distributions:       0, nav: 34_400_000 },
      { q: 'Q3 23', contributions:          0, distributions: 460_000, nav: 34_800_000 },
      { q: 'Q4 23', contributions:          0, distributions: 500_000, nav: 34_200_000 },
      { q: 'Q1 24', contributions: -2_400_000, distributions:       0, nav: 35_000_000 },
      { q: 'Q2 24', contributions:          0, distributions: 540_000, nav: 35_600_000 },
      { q: 'Q3 24', contributions:          0, distributions: 480_000, nav: 35_200_000 },
      { q: 'Q4 24', contributions: -2_000_000, distributions:       0, nav: 34_800_000 },
    ],
    tvpiProgress: [
      { fund: 'Blackstone RE X',   v2020: 1.00, v2021: 1.14, v2022: 1.36, v2023: 1.54, v2024: 1.68, v2025: 1.82 },
      { fund: 'Starwood Capital V', v2020: 1.00, v2021: 1.12, v2022: 1.30, v2023: 1.48, v2024: 1.62, v2025: 1.74 },
      { fund: 'Hamilton Lane Sec.', v2021: 1.00, v2022: 1.10, v2023: 1.24, v2024: 1.38, v2025: 1.52 },
    ],
  },
}

const FALLBACK = 'Meridian Capital Partners'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt$m = v => `$${(v / 1_000_000).toFixed(1)}M`
const fmt$k = v => v >= 0 ? `+$${(v/1_000).toFixed(0)}K` : `-$${(Math.abs(v)/1_000).toFixed(0)}K`

const CLS_COLORS = {
  'Private Equity': '#3b82f6',
  'Real Estate':    '#a78bfa',
  'Hedge Fund':     '#14b8a6',
  'Fixed Income':   '#f59e0b',
  'Credit':         '#f59e0b',
  'Equity':         '#22c55e',
  'Cash':           '#4a4a62',
}
const TVPI_COLORS = ['#3b82f6', '#a78bfa', '#14b8a6', '#f59e0b']

const PERIODS = ['YTD', '1 Year', '3 Year', 'Since Inception']

// ── Main component ─────────────────────────────────────────────────────────────
export default function Performance({ activeClient }) {
  const name    = activeClient?.name ?? FALLBACK
  const profile = PROFILES[name] ?? PROFILES[FALLBACK]
  const isMobile = useMobile()

  const [navPeriod, setNavPeriod] = useState('full')

  // Filter navSeries by period
  const filteredNav = navPeriod === 'full' ? profile.navSeries
    : navPeriod === '3yr' ? profile.navSeries.slice(-7)
    : profile.navSeries.slice(-4)

  // Cumulative contributions & distributions for J-curve
  let cumContrib = 0, cumDistrib = 0
  const jCurve = profile.cashFlows.map(q => {
    cumContrib += Math.abs(q.contributions)
    cumDistrib += q.distributions
    return {
      q:             q.q,
      contributions: -Math.abs(q.contributions) / 1_000_000,
      distributions: q.distributions / 1_000_000,
      nav:           q.nav / 1_000_000,
      netCF:         (cumDistrib - cumContrib) / 1_000_000,
    }
  })

  // Attribution total
  const totalContrib = profile.attribution.reduce((s, a) => s + a.contrib, 0)

  // PME color
  const pmeColor = (v) => v >= 1 ? 'var(--green)' : 'var(--amber)'

  // TVPI chart data — years as columns
  const tvpiYears = ['2020','2021','2022','2023','2024','2025']
  const tvpiData  = tvpiYears.map(yr => {
    const row = { year: yr }
    profile.tvpiProgress.forEach(f => { row[f.fund] = f[`v${yr}`] ?? null })
    return row
  })

  return (
    <div style={{ padding: isMobile ? '14px 14px' : '24px 28px', animation: 'fadeUp 0.3s ease' }}>

      {/* ── Period return KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 14, marginBottom: 24 }}>
        {[
          { label: 'YTD Return',        port: profile.ytd,   bench: profile.benchmark.ytd },
          { label: '1-Year Return',     port: profile.yr1,   bench: profile.benchmark.yr1 },
          { label: '3-Year TWRR',       port: profile.yr3,   bench: profile.benchmark.yr3 },
          { label: 'Since Inception',   port: profile.since, bench: profile.benchmark.since },
        ].map(({ label, port, bench }) => {
          const alpha = +(port - bench).toFixed(1)
          return (
            <div key={label} style={{
              background: 'var(--bg2)', border: '1px solid var(--bdr)',
              borderRadius: 14, padding: '16px 18px',
            }}>
              <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--green)' }}>{port}%</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{profile.benchmark.name}: {bench}%</span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: alpha >= 0 ? 'var(--green)' : 'var(--red)',
                  background: alpha >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  padding: '2px 6px', borderRadius: 5,
                }}>
                  {alpha >= 0 ? '+' : ''}{alpha}% α
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Section 1: NAV index / return timeline ── */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Return Timeline (Base 100)</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
              Portfolio vs {profile.benchmark.name} · Since {profile.inception}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['1yr','1 Year'],['3yr','3 Year'],['full','Full']].map(([v,l]) => (
              <PeriodBtn key={v} label={l} active={navPeriod === v} onClick={() => setNavPeriod(v)} />
            ))}
          </div>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredNav} margin={{ top: 8, right: 8, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--tx3)', fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--tx3)', fontSize: 9 }} tickLine={false} axisLine={false} domain={['auto','auto']} />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                formatter={(v, n) => [`${v.toFixed(1)}`, n === 'port' ? 'Portfolio' : profile.benchmark.name]}
              />
              <Area dataKey="port"  type="monotone" stroke="var(--blue)"  strokeWidth={2} fill="rgba(59,130,246,0.08)" dot={false} name="port" />
              <Line dataKey="bench" type="monotone" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="bench" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
          {[['var(--blue)','Portfolio',false],['rgba(255,255,255,0.3)',profile.benchmark.name,true]].map(([c,l,dash]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--tx3)' }}>
              <svg width={20} height={8}>
                <line x1="0" y1="4" x2="20" y2="4" stroke={c} strokeWidth={dash ? 1.5 : 2} strokeDasharray={dash ? '4 3' : 'none'} />
              </svg>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sections 2 & 3: Attribution + PME side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18, marginBottom: 22 }}>

        {/* Attribution */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Attribution Analysis</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 16 }}>Return contribution by asset class · YTD</div>

          {/* Asset class attribution bars */}
          {profile.attribution.map(a => (
            <div key={a.cls} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: CLS_COLORS[a.cls] ?? '#888', display: 'inline-block' }} />
                  <span style={{ fontSize: 11 }}>{a.cls}</span>
                  <span style={{ fontSize: 9, color: 'var(--tx3)' }}>{a.weight}%</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{a.ret}% ret</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: CLS_COLORS[a.cls] ?? '#888', minWidth: 36, textAlign: 'right' }}>+{a.contrib}%</span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--bg4)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(a.contrib / totalContrib) * 100}%`,
                  background: CLS_COLORS[a.cls] ?? '#888',
                }} />
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 8 }}>Top fund contributors</div>
            {profile.fundAttrib.map(f => (
              <div key={f.fund} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--bdr)' }}>
                <div>
                  <span style={{ fontSize: 11 }}>{f.fund}</span>
                  <span style={{ fontSize: 9, color: 'var(--tx3)', marginLeft: 6 }}>{f.cls}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: f.contrib >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {f.contrib >= 0 ? '+' : ''}{f.contrib}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PME */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>PME — Public Market Equivalent</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 20 }}>
            How $1 invested in this portfolio compares to public markets over the same period
          </div>

          {/* PME gauges */}
          {[
            { label: 'vs S&P 500', value: profile.pme.sp500, desc: 'Portfolio IRR vs S&P 500 IRR (same cash flow timing)' },
            { label: 'vs MSCI World', value: profile.pme.msci, desc: 'Portfolio IRR vs MSCI World IRR (same cash flow timing)' },
          ].map(p => (
            <div key={p.label} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>{p.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 2 }}>{p.desc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: pmeColor(p.value), letterSpacing: '-0.5px' }}>{p.value}x</div>
                  <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{p.value >= 1 ? 'Outperforming' : 'Underperforming'}</div>
                </div>
              </div>
              {/* Visual bar: 0.5x to 1.5x range */}
              <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'var(--bg4)' }}>
                {/* 1.0x marker */}
                <div style={{ position: 'absolute', left: '50%', top: -2, width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${Math.min(100, Math.max(0, (p.value - 0.5) / 1.0 * 100))}%`,
                  background: `linear-gradient(90deg, ${p.value >= 1 ? 'var(--blue), var(--green)' : 'var(--red), var(--amber)'})`,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--tx3)', marginTop: 4 }}>
                <span>0.5x</span><span>1.0x (parity)</span><span>1.5x</span>
              </div>
            </div>
          ))}

          <div style={{ background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4 }}>Key Return Metrics</div>
            {[
              ['Net IRR (inception)', `${profile.irr}%`],
              ['TWRR (3-year)',       `${profile.yr3}%`],
              ['AUM',                 fmt$m(profile.aum)],
              ['Benchmark',           profile.benchmark.name],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--bdr)' }}>
                <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{l}</span>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 4: J-curve & cash flow waterfall ── */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>J-Curve & Cash Flow Waterfall</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
              Quarterly contributions (calls) vs distributions · Net cumulative position
            </div>
          </div>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={jCurve} margin={{ top: 8, right: 8, left: 20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="q" tick={{ fill: 'var(--tx3)', fontSize: 9 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis
                tickFormatter={v => `$${v}M`}
                tick={{ fill: 'var(--tx3)', fontSize: 9 }} tickLine={false} axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                formatter={(v, n) => [`$${Math.abs(v).toFixed(1)}M`, n === 'contributions' ? 'Capital Called' : n === 'distributions' ? 'Distributions' : 'Portfolio NAV']}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
              <Bar dataKey="contributions" stackId="cf" fill="rgba(239,68,68,0.6)"  radius={[0,0,0,0]} barSize={14} />
              <Bar dataKey="distributions" stackId="cf" fill="rgba(34,197,94,0.7)"  radius={[3,3,0,0]} barSize={14} />
              <Line dataKey="nav" type="monotone" stroke="var(--blue)" strokeWidth={2} dot={false} yAxisId={0} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
          {[['rgba(239,68,68,0.7)','Capital Called'],['rgba(34,197,94,0.7)','Distributions'],['var(--blue)','NAV']].map(([c,l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx3)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4b: TVPI progression ── */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>TVPI Progression by Fund</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
            Total Value to Paid-In multiple over time · DPI + RVPI
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={tvpiData} margin={{ top: 8, right: 8, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: 'var(--tx3)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={v => `${v}x`}
                tick={{ fill: 'var(--tx3)', fontSize: 9 }} tickLine={false} axisLine={false}
                domain={[1, 'auto']}
              />
              <ReferenceLine y={1} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 3" label={{ value:'1.0x', fill:'var(--tx3)', fontSize: 9, position:'right' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--bdr2)', borderRadius: 8, fontSize: 11 }}
                formatter={(v, n) => v ? [`${v}x`, n] : [null, null]}
              />
              {profile.tvpiProgress.map((f, i) => (
                <Line
                  key={f.fund}
                  dataKey={f.fund}
                  type="monotone"
                  stroke={TVPI_COLORS[i % TVPI_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: TVPI_COLORS[i % TVPI_COLORS.length] }}
                  connectNulls
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          {profile.tvpiProgress.map((f, i) => (
            <div key={f.fund} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--tx3)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: TVPI_COLORS[i % TVPI_COLORS.length], display: 'inline-block' }} />
              {f.fund}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function PeriodBtn({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 500,
        cursor: 'pointer', border: 'none', transition: 'all 0.15s',
        background: active ? 'rgba(59,130,246,0.2)' : hov ? 'var(--surf)' : 'var(--bg3)',
        color: active ? 'var(--blue2)' : hov ? 'var(--tx)' : 'var(--tx2)',
        outline: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
      }}
    >{label}</button>
  )
}
