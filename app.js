/* Portfolio Dashboard */
const APP_KEY = 'portfolioDataV4';
let S = {};
let charts = {};
const LEGEND_PALETTE = [
  '#0e7d8b',
  '#17c3b2',
  '#0b5a92',
  '#7b2ff7',
  '#f107a3',
  '#f6b93b',
  '#17a673',
  '#e08a1e',
  '#6ec1ff',
  '#ff8fc4',
  '#7fe0a1',
  '#c9a6ff'
];
const SEMI = {
  SMH: 100,
  SPMO: 45,
  SOXX: 100,
  'SPY-UITF': 10,
  'MANULIFE-ASIA': 15
};
const CATEGORIES_BY_TYPE = {
  Capital: '💰',
  Growth: '📈',
  Income: '💵',
  Freedom: '🕊️',
  Resilience: '🛡️',
  Family: '👨‍👩‍👧‍👦'
};
let REBALANCE_MODE = 'current';
let incomeFiMessageText = '';

/* ===== helpers ===== */
function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = el(id);
  if (node) {
    node.textContent = value;
  }
}

function setHtml(id, value) {
  const node = el(id);
  if (node) {
    node.innerHTML = value;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function today() {
  return new Date();
}

function daysBetween(dateString, targetDate) {
  if (!dateString) {
    return 0;
  }
  return Math.floor((targetDate - new Date(dateString)) / 86400000);
}

function num(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : (fallback || 0);
}

function peso(value, decimals) {
  const amount = num(value, 0);
  const options = decimals == null
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return '₱' + amount.toLocaleString('en-PH', options);
}

function usd(value) {
  const amount = num(value, 0);
  return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function pct(value, decimals) {
  const digits = decimals == null ? 1 : decimals;
  return num(value, 0).toFixed(digits) + '%';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function save() {
  localStorage.setItem(APP_KEY, JSON.stringify(S));
}

function toast(message) {
  const toastNode = document.createElement('div');
  toastNode.className = 'toast';
  toastNode.textContent = message;
  document.body.appendChild(toastNode);
  setTimeout(function () {
    toastNode.remove();
  }, 4000);
}

function makeChart(id, config) {
  const node = el(id);
  if (!node || typeof Chart === 'undefined') {
    return null;
  }

  if (charts[id]) {
    try {
      charts[id].destroy();
    } catch (_) {
      // ignore chart destruction errors
    }
  }

  try {
    charts[id] = new Chart(node, config);
    return charts[id];
  } catch (error) {
    console.error('chart ' + id, error);
    return null;
  }
}

/* ===== defaults and compatibility ===== */
function seedMilestones() {
  function buildMilestone(category, type, threshold, label, motivator, manual) {
    return {
      id: category + '_' + type + '_' + threshold + '_' + label.slice(0, 4),
      cat: category,
      type: type,
      threshold: threshold,
      label: label,
      motivator: motivator,
      manual: !!manual,
      achieved: false
    };
  }

  return [
    buildMilestone('Capital', 'capital', 100000, 'First ₱100k invested', '🔥 Congrats! Most people never reach six figures. You\'re officially building wealth.'),
    buildMilestone('Capital', 'capital', 250000, '₱250k invested', '🚀 ₱250k invested. The snowball is still small, but it\'s finally rolling downhill.'),
    buildMilestone('Capital', 'capital', 500000, '₱500k invested', '💪 ₱500k invested. You\'re closer to your first million than to zero.'),
    buildMilestone('Capital', 'capital', 1000000, 'First ₱1M invested', '🚀 Welcome to the millionaire investor club. Most people dream about building wealth. You now have proof that you\'re actually doing it.'),
    buildMilestone('Capital', 'capital', 2000000, '₱2M invested', '⚡ ₱2M invested. Compounding has something substantial to work with now.'),
    buildMilestone('Capital', 'capital', 3000000, '₱3M invested', '📈 ₱3M invested. Your portfolio is starting to become a meaningful financial asset.'),
    buildMilestone('Capital', 'capital', 5000000, '₱5M invested', '👑 ₱5M invested. Wealth isn\'t a goal anymore—it\'s becoming a reality.'),
    buildMilestone('Freedom', 'coast', 0, 'Coast FIRE reached', '🏝 Future contributions are now optional, not required. Time is your biggest asset from here.'),
    buildMilestone('Freedom', 'incomeCover', 0.25, 'Income covers 25% of spending', '🌿 One quarter of your lifestyle is now funded by your assets.'),
    buildMilestone('Freedom', 'incomeCover', 0.5, 'Income covers 50% of spending', '🚀 Half your lifestyle is funded before you even show up to work.'),
    buildMilestone('Freedom', 'incomeCover', 1, '👑 Work Optional', '🏝 Financial Independence Achieved. Your portfolio can now carry your lifestyle.'),
    buildMilestone('Growth', 'gain', 50000, 'First ₱50k gain', '🌱 Your first ₱50k gain. Proof that money can work while you sleep.'),
    buildMilestone('Growth', 'gain', 100000, '₱100k unrealized gain', '📈 ₱100k gained. Patience is starting to show up in the numbers.'),
    buildMilestone('Growth', 'gain', 500000, '₱500k gain', '🚀 ₱500k gained. Half a million earned by ownership, not labor.'),
    buildMilestone('Growth', 'gain', 1000000, '₱1M gain', '💎 ₱1M gained. Compounding just became impossible to ignore.'),
    buildMilestone('Growth', 'double', 2, 'Doubled your money', '🔥 Congratulations. Your money has officially worked as hard as you have.'),
    buildMilestone('Income', 'income', 1000, 'First ₱1k/mo income', '☕ Your portfolio just bought its first monthly coffee.'),
    buildMilestone('Income', 'income', 5000, '₱5k/mo income', '🍔 Your investments can now pay for a casual dinner every month.'),
    buildMilestone('Income', 'income', 10000, '₱10k/mo income', '⚡ Bills are starting to meet their replacement.'),
    buildMilestone('Income', 'income', 20000, '₱20k/mo income', '💪 A meaningful part of life is now funded by ownership.'),
    buildMilestone('Income', 'income', 30000, '₱30k/mo income', '🏡 Your portfolio is becoming a serious financial partner.'),
    buildMilestone('Income', 'income', 50000, '₱50k/mo income', '👑 Many people work full-time for this kind of monthly cash flow.'),
    buildMilestone('Resilience', 'manual', 0, 'Stayed invested during volatility', '🛡️ You stayed invested while others panicked. This is how wealth is built.', true),
    buildMilestone('Resilience', 'manual', 0, 'Added during a drawdown', '⚔️ You bought when fear was high. Future-you may thank present-you.', true),
    buildMilestone('Resilience', 'manual', 0, '12 months of consistent contributions', '🔥 Twelve straight months of investing. Discipline beats motivation.', true),
    buildMilestone('Resilience', 'manual', 0, 'Five-year review completed', '📚 Five-year review completed. Great investors evolve without abandoning the plan.', true),
    buildMilestone('Family', 'manual', 0, 'Education goal initialized', 'A family-focused savings goal is now active.', true),
    buildMilestone('Family', 'manual', 0, 'Stability bucket reviewed', 'Capital preservation plans were refreshed.', true),
    buildMilestone('Family', 'manual', 0, 'Family plan updated', 'Core household goals were revisited.', true)
  ];
}

function createPosition(ticker, name, bucket, currency, units, price, dividend, taxOverride, isIlliquid, invested) {
  return {
    ticker: ticker,
    name: name,
    bucket: bucket,
    currency: currency,
    units: units,
    currentPrice: price,
    div: dividend,
    divTaxOverride: taxOverride,
    isIlliquid: isIlliquid,
    invested: invested,
    lu: {
      currentPrice: '2026-07-01',
      div: '2026-04-15'
    }
  };
}

function seed() {
  S = {
    profile: {
      currentAge: 25,
      retireAge: 60,
      annualSpending: 790000,
      monthlyContribution: 30000,
      contribStepUp: 0.05,
      incomeCoverageTargetPct: 10,
      defaultNetYield: 0.07,
      domesticDivTax: 0.10,
      fxRate: 61.5,
      fxLu: '2026-07-01',
      withdrawalMultiplier: 30,
      realReturnMode: 'auto',
      realReturnManual: 0.06,
      bucketReturns: { Growth: 0.07, Income: 0.015, Stability: 0.03 },
      defaultDistribution: { Growth: 70, Income: 10, Stability: 20 }
    },
    positions: [
      createPosition('MBT', 'Metrobank', 'Income', 'PHP', 500, 78, 4.0, null, false, 30000),
      createPosition('AREIT', 'AREIT Inc', 'Income', 'PHP', 2000, 40, 2.2, null, false, 68000),
      createPosition('SPY-UITF', 'BPI US Feeder (SPY UITF)', 'Growth', 'PHP', 1000, 135, 0, null, false, 120000),
      createPosition('SOXX', 'Semiconductors ETF', 'Growth', 'USD', 20, 300, 0, null, false, 292500),
      createPosition('MP2', 'MP2 Pag-IBIG', 'Stability', 'PHP', 200000, 1, 0.065, 0, false, 200000),
      createPosition('VUL', 'Insurance Fund', 'Insurance', 'PHP', 1, 110000, 0, null, true, 100000)
    ],
    snapshots: [
      { date: '2026-01-31', invested: 400000, marketValue: 410000 },
      { date: '2026-03-31', invested: 440000, marketValue: 465000 },
      { date: '2026-05-31', invested: 480000, marketValue: 505000 },
      { date: '2026-06-30', invested: 500000, marketValue: 512000 }
    ],
    cadence: { currentPrice: 7, annualDividendPerUnit: 100, fxRate: 7 },
    milestones: seedMilestones(),
    achievedIds: [],
    ui: { tab: 'dashboard', tool: 'dividend', excludeIlliquidCharts: true, theme: 'dark' }
  };
}

function ensureDefaults() {
  const profile = S.profile || {};

  profile.currentAge = num(profile.currentAge, 25);
  profile.retireAge = num(profile.retireAge, 55);
  profile.annualSpending = num(profile.annualSpending, 780000);
  profile.monthlyContribution = num(profile.monthlyContribution, 31500);
  profile.contribStepUp = num(profile.contribStepUp, 0.05);
  profile.contribStepUpMode = profile.contribStepUpMode === 'php' ? 'php' : 'percent';
  profile.incomeCoverageTargetPct = num(
    profile.incomeCoverageTargetPct,
    profile.targetMonthlyIncome ? ((num(profile.targetMonthlyIncome) * 12) / (num(profile.annualSpending, 780000) || 1) * 100) : 50
  );
  profile.defaultNetYield = num(profile.defaultNetYield, 0.07);
  profile.domesticDivTax = num(profile.domesticDivTax, 0.10);
  profile.fxRate = num(profile.fxRate, 61.5);
  profile.fxLu = profile.fxLu || todayISO();
  profile.withdrawalMultiplier = num(profile.withdrawalMultiplier, 30);
  profile.realReturnMode = profile.realReturnMode || 'auto';
  profile.realReturnManual = num(profile.realReturnManual, 0.06);
  profile.bucketReturns = profile.bucketReturns || { Growth: 0.07, Income: 0.045, Stability: 0.025, Insurance: 0 };
  profile.bucketReturns = {
    Growth: num(profile.bucketReturns.Growth, 0.07),
    Income: num(profile.bucketReturns.Income, 0.045),
    Stability: num(profile.bucketReturns.Stability, 0.025),
    Insurance: num(profile.bucketReturns.Insurance, 0)
  };
  profile.defaultDistribution = profile.defaultDistribution || { Growth: 70, Income: 20, Stability: 10, Insurance: 0 };
  profile.defaultDistribution = {
    Growth: num(profile.defaultDistribution.Growth, 70),
    Income: num(profile.defaultDistribution.Income, 20),
    Stability: num(profile.defaultDistribution.Stability, 10),
    Insurance: num(profile.defaultDistribution.Insurance, 0)
  };

  delete profile.includeMP2Income;
  delete profile.targetMonthlyIncome;

  S.profile = profile;
  S.positions = Array.isArray(S.positions) ? S.positions : [];
  S.positions.forEach(function (position) {
    if (!position.lu) {
      position.lu = { currentPrice: todayISO(), div: todayISO() };
    }
    position.invested = num(position.invested, 0);
    position.isIlliquid = !!position.isIlliquid;
  });
  S.snapshots = Array.isArray(S.snapshots) ? S.snapshots : [];
  S.cadence = S.cadence || { currentPrice: 7, annualDividendPerUnit: 100, fxRate: 7 };
  S.achievedIds = Array.isArray(S.achievedIds) ? S.achievedIds : [];
  S.milestones = Array.isArray(S.milestones) && S.milestones.length ? S.milestones : seedMilestones();
  S.ui = S.ui || {};
  S.ui.theme = S.ui.theme === 'light' ? 'light' : 'dark';
  S.ui.tab = S.ui.tab || 'dashboard';
  if (['alloc', 'target'].indexOf(S.ui.tool) >= 0) {
    S.ui.tool = 'dividend';
  }
  S.ui.tool = S.ui.tool || 'dividend';
  S.ui.excludeIlliquidCharts = S.ui.excludeIlliquidCharts !== false;
  S.ui.projectorIncludeIncomeBucket = !!S.ui.projectorIncludeIncomeBucket;
}

function load() {
  try {
    const raw = localStorage.getItem(APP_KEY);
    S = raw ? JSON.parse(raw) : null;
  } catch (_) {
    S = null;
  }

  if (!S || !S.profile || !S.positions) {
    seed();
    save();
    return;
  }

  ensureDefaults();
  save();
}

/* ===== portfolio and income logic ===== */
function fx() {
  return num(S.profile.fxRate, 1);
}

function isMP2(position) {
  return position && position.ticker === 'MP2';
}

function isInsurance(position) {
  return position && position.bucket === 'Insurance';
}

function nonInsurancePositions() {
  return S.positions.filter(function (position) {
    return !isInsurance(position);
  });
}

function allocationPositions() {
  return orderedPositionsWithIndex().map(function (item) {
    return item.position;
  }).filter(function (position) {
    const excludeIlliquid = S.ui.excludeIlliquidCharts && position.isIlliquid;
    return !excludeIlliquid;
  });
}

function positionValuePHP(position) {
  const units = num(position.units, 0);
  const currentPrice = num(position.currentPrice, 0);
  const fxRate = position.currency === 'USD' ? fx() : 1;
  return units * currentPrice * fxRate;
}

function valuePHP(position) {
  return positionValuePHP(position);
}

function effectiveTaxRate(position) {
  if (position.divTaxOverride != null && position.divTaxOverride !== '') {
    return num(position.divTaxOverride, 0);
  }
  return num(S.profile.domesticDivTax, 0.10);
}

function positionIncomePHP(position) {
  const units = num(position.units, 0);
  const dividend = num(position.div, 0);
  const fxRate = position.currency === 'USD' ? fx() : 1;
  return units * dividend * (1 - effectiveTaxRate(position)) * fxRate;
}

function incomePHP(position) {
  return positionIncomePHP(position);
}

function spendablePayers() {
  return orderedPositionsWithIndex().map(function (item) {
    return item.position;
  }).filter(function (position) {
    return num(position.div) > 0 && !isMP2(position);
  });
}

function incomeBucketPayers() {
  return S.positions.filter(function (position) {
    return position && position.bucket === 'Income' && num(position.div) > 0 && !isMP2(position);
  });
}

function getIncomeBucketTotals() {
  let investedTotal = 0;
  let currentValueTotal = 0;
  let annualIncomeTotal = 0;

  incomeBucketPayers().forEach(function (position) {
    investedTotal += num(position.invested, 0);
    currentValueTotal += valuePHP(position);
    annualIncomeTotal += incomePHP(position);
  });

  return {
    invested: investedTotal,
    currentValue: currentValueTotal,
    annualIncome: annualIncomeTotal,
    monthlyIncome: annualIncomeTotal / 12,
    yieldOnCost: investedTotal ? (annualIncomeTotal / investedTotal) * 100 : 0,
    yieldNow: currentValueTotal ? (annualIncomeTotal / currentValueTotal) * 100 : 0
  };
}

function getPortfolioTotals() {
  let investedTotal = 0;
  let currentValueTotal = 0;
  const incomeBucketTotals = getIncomeBucketTotals();

  S.positions.forEach(function (position) {
    investedTotal += num(position.invested, 0);
    currentValueTotal += valuePHP(position);
  });

  const gain = currentValueTotal - investedTotal;

  return {
    invested: investedTotal,
    currentValue: currentValueTotal,
    gain: gain,
    gainPct: investedTotal ? (gain / investedTotal) * 100 : 0,
    annualIncome: incomeBucketTotals.annualIncome,
    monthlyIncome: incomeBucketTotals.monthlyIncome,
    yieldOnCost: incomeBucketTotals.yieldOnCost,
    yieldNow: incomeBucketTotals.yieldNow
  };
}

function getWealthEngineMetrics() {
  const portfolioTotals = getPortfolioTotals();
  const annualSpending = num(S.profile.annualSpending, 0);
  const withdrawalMultiple = num(S.profile.withdrawalMultiplier, 30);
  const withdrawalRate = withdrawalMultiple > 0 ? 1 / withdrawalMultiple : 0;
  const growthStabilityValue = nonInsurancePositions().reduce(function (sum, position) {
    if (position.bucket === 'Growth' || position.bucket === 'Stability') {
      sum += valuePHP(position);
    }
    return sum;
  }, 0);
  const growthStabilityAnnualSupport = growthStabilityValue * withdrawalRate;
  const totalAnnualSupport = growthStabilityAnnualSupport + num(portfolioTotals.annualIncome, 0);
  const expenseCoveragePct = annualSpending ? (totalAnnualSupport / annualSpending) * 100 : 0;

  return {
    growthStabilityValue: growthStabilityValue,
    growthStabilityAnnualSupport: growthStabilityAnnualSupport,
    incomeAnnual: num(portfolioTotals.annualIncome, 0),
    totalAnnualSupport: totalAnnualSupport,
    expenseCoveragePct: expenseCoveragePct,
    annualSpending: annualSpending
  };
}

function currentIncomeTargetAnnual() {
  return num(S.profile.annualSpending) * num(S.profile.incomeCoverageTargetPct, 50) / 100;
}

function getDashboardSnapshot() {
  const portfolioTotals = getPortfolioTotals();
  const coastMetrics = getCoastMetrics();
  const incomeTargetAnnual = currentIncomeTargetAnnual();
  const incomeTargetPct = incomeTargetAnnual
    ? (portfolioTotals.annualIncome / incomeTargetAnnual) * 100
    : 0;
  const spendingCoveragePct = num(S.profile.annualSpending)
    ? (portfolioTotals.annualIncome / num(S.profile.annualSpending)) * 100
    : 0;

  return {
    portfolioTotals: portfolioTotals,
    coastMetrics: coastMetrics,
    incomeTargetAnnual: incomeTargetAnnual,
    incomeTargetPct: incomeTargetPct,
    spendingCoveragePct: spendingCoveragePct
  };
}

function coastEligibleValue() {
  const eligibleBuckets = { Growth: true, Stability: true };

  return nonInsurancePositions().reduce(function (sum, position) {
    if (eligibleBuckets[position.bucket]) {
      sum += valuePHP(position);
    }
    return sum;
  }, 0);
}

function coastBucketWeights() {
  const distribution = S.profile.defaultDistribution || { Growth: 70, Income: 20, Stability: 10 };
  const growthWeight = num(distribution.Growth, 70);
  const stabilityWeight = num(distribution.Stability, 10);
  const totalCoastWeight = growthWeight + stabilityWeight;

  return {
    Growth: totalCoastWeight ? (growthWeight / totalCoastWeight) : 0,
    Stability: totalCoastWeight ? (stabilityWeight / totalCoastWeight) : 0
  };
}

function getCoastContributionShare() {
  const distribution = S.profile.defaultDistribution || { Growth: 70, Income: 20, Stability: 10 };
  const growthWeight = num(distribution.Growth, 70);
  const stabilityWeight = num(distribution.Stability, 10);
  const incomeWeight = num(distribution.Income, 20);
  const totalWeight = growthWeight + stabilityWeight + incomeWeight;

  return totalWeight > 0 ? ((growthWeight + stabilityWeight) / totalWeight) : 1;
}

function coastAutoReturnRate() {
  const weights = coastBucketWeights();
  const bucketRates = S.profile.bucketReturns || { Growth: 0.07, Income: 0.045, Stability: 0.025 };

  return (
    weights.Growth * num(bucketRates.Growth, 0.07) +
    weights.Stability * num(bucketRates.Stability, 0.025)
  );
}

function realReturn() {
  if (S.profile.realReturnMode === 'manual') {
    return num(S.profile.realReturnManual, 0.06);
  }

  return coastAutoReturnRate() || 0.06;
}

function getCoastSpendingInputs(options) {
  const spending = num(options && options.spending != null ? options.spending : S.profile.annualSpending, 0);
  const useIncomeBucket = !!(options && options.useIncomeBucket);
  const coverageTarget = normalizeCoverageRate(
    num(options && options.coverageTarget != null ? options.coverageTarget : (useIncomeBucket ? num(S.profile.incomeCoverageTargetPct, 0) : 0), 0)
  );
  const effectiveAnnualSpending = useIncomeBucket ? Math.max(spending * (1 - coverageTarget), 0) : spending;

  return {
    annualSpending: spending,
    useIncomeBucket: useIncomeBucket,
    coverageTarget: coverageTarget,
    effectiveAnnualSpending: effectiveAnnualSpending
  };
}

function getCoastMetrics(options) {
  const spendingInputs = getCoastSpendingInputs(options);
  const investmentReturnRate = realReturn();
  const annualFireSpend = spendingInputs.effectiveAnnualSpending * num(S.profile.withdrawalMultiplier, 30);
  const fireNumber = annualFireSpend;
  const yearsToRetirement = num(S.profile.retireAge) - num(S.profile.currentAge);
  const rawTarget = yearsToRetirement > 0
    ? annualFireSpend / Math.pow(1 + investmentReturnRate, yearsToRetirement)
    : annualFireSpend;
  const coastCurrentValue = coastEligibleValue();

  return {
    returnRate: investmentReturnRate,
    fireSpend: annualFireSpend,
    fireNumber: fireNumber,
    target: rawTarget,
    coastTarget: rawTarget,
    currentValue: coastCurrentValue,
    progress: fireNumber ? (coastCurrentValue / fireNumber) * 100 : 0,
    annualSpending: spendingInputs.annualSpending,
    effectiveAnnualSpending: spendingInputs.effectiveAnnualSpending,
    coverageTarget: spendingInputs.coverageTarget,
    useIncomeBucket: spendingInputs.useIncomeBucket
  };
}

function nextAnnualContribution(annualContribution, step, mode, contributionShare) {
  if (mode === 'php') {
    return annualContribution + num(step, 0) * 12 * num(contributionShare, 1);
  }
  return annualContribution * (1 + num(step, 0));
}

function getWindDownMetrics(options) {
  const coastMetrics = getCoastMetrics(options);
  const currentValue = num(coastMetrics.currentValue, 0);
  const annualFireSpend = num(coastMetrics.fireSpend, 0);
  const returnRate = num(coastMetrics.returnRate, 0);
  const currentAge = num(S.profile.currentAge, 25);
  const retireAge = num(S.profile.retireAge, 55);
  const monthlyContribution = num(S.profile.monthlyContribution, 0);
  const annualStepUp = num(S.profile.contribStepUp, 0);
  const annualStepUpMode = S.profile.contribStepUpMode || 'percent';
  const yearsRemaining = Math.max(retireAge - currentAge, 0);
  const growthStabilityShare = getCoastContributionShare();

  let yearsToTarget = yearsRemaining;
  let projectedValue = currentValue;
  let annualContribution = monthlyContribution * 12 * growthStabilityShare;
  let targetValue = annualFireSpend;

  if (currentValue >= annualFireSpend && annualFireSpend > 0) {
    yearsToTarget = 0;
    projectedValue = currentValue;
    targetValue = annualFireSpend;
  } else if (currentValue >= 0 && returnRate >= 0) {
    for (let year = 0; year <= yearsRemaining; year++) {
      projectedValue = projectedValue * (1 + returnRate);
      projectedValue += annualContribution;

      const yearsToRetirementAtThisPoint = Math.max(yearsRemaining - year, 0);
      targetValue = yearsToRetirementAtThisPoint > 0
        ? annualFireSpend / Math.pow(1 + returnRate, yearsToRetirementAtThisPoint)
        : annualFireSpend;

      if (projectedValue >= targetValue) {
        yearsToTarget = year;
        break;
      }

      annualContribution = nextAnnualContribution(annualContribution, annualStepUp, annualStepUpMode, growthStabilityShare);
    }
  }

  return {
    yearsToTarget: yearsToTarget,
    projectedValue: projectedValue,
    targetValue: targetValue
  };
}

function coast() {
  return getCoastMetrics();
}

function historicalPct() {
  if (!S.snapshots.length) {
    return 0;
  }

  const latestSnapshot = S.snapshots[S.snapshots.length - 1];
  return num(latestSnapshot.invested)
    ? ((num(latestSnapshot.marketValue) - num(latestSnapshot.invested)) / num(latestSnapshot.invested)) * 100
    : 0;
}

function semiExposure(filteredPositions) {
  const arr = filteredPositions || S.positions;
  let numerator = 0;
  let denominator = 0;

  arr.forEach(function (position) {
    const value = valuePHP(position);
    denominator += value;
    numerator += value * ((SEMI[position.ticker] || 0) / 100);
  });

  return denominator ? (numerator / denominator) * 100 : 0;
}

/* ===== staleness ===== */
function stale() {
  const result = [];
  const now = today();

  S.positions.forEach(function (position) {
    const lu = position.lu || {};

    if (lu.currentPrice) {
      const priceDays = daysBetween(lu.currentPrice, now);
      if (priceDays > S.cadence.currentPrice) {
        result.push({ txt: '🔴 ' + position.ticker + ' price — ' + priceDays + ' days ago · overdue', red: true });
      } else if (priceDays >= S.cadence.currentPrice * 0.8) {
        result.push({ txt: '🟡 ' + position.ticker + ' price — ' + priceDays + ' days · due soon', red: false });
      }
    }

    if (num(position.div) > 0 && lu.div) {
      const dividendDays = daysBetween(lu.div, now);
      if (dividendDays > S.cadence.annualDividendPerUnit) {
        result.push({ txt: '🔴 ' + position.ticker + ' dividend — ' + dividendDays + ' days ago · overdue', red: true });
      }
    }
  });

  if (S.profile.fxLu) {
    const fxDays = daysBetween(S.profile.fxLu, now);
    if (fxDays > S.cadence.fxRate) {
      result.push({ txt: '🔴 FX rate — ' + fxDays + ' days ago · overdue', red: true });
    }
  }

  result.sort(function (a, b) {
    return Number(b.red) - Number(a.red);
  });

  return result;
}

/* ===== navigation ===== */
function showTab(name) {
  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.classList.remove('active');
  });

  const section = el('tab-' + name);
  if (section) {
    section.classList.add('active');
  }

  document.querySelectorAll('.navbtn').forEach(function (button) {
    button.classList.toggle('sel', button.dataset.tab === name);
  });

  S.ui.tab = name;
  save();
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTool(name) {
  document.querySelectorAll('.tool').forEach(function (tool) {
    tool.classList.remove('active');
  });

  const section = el('tool-' + name);
  if (section) {
    section.classList.add('active');
  }

  document.querySelectorAll('.toolbtn').forEach(function (button) {
    button.classList.toggle('sel', button.dataset.tool === name);
  });

  S.ui.tool = name;
  save();
  renderTools();
}

/* ===== view preferences and display metrics ===== */
const HOLDING_BUCKET_ORDER = { Income: 0, Growth: 1, Stability: 2, Insurance: 3 };

function orderedPositionsWithIndex() {
  return S.positions.map(function (position, index) {
    return { position: position, index: index };
  }).sort(function (a, b) {
    const bucketDifference = num(HOLDING_BUCKET_ORDER[a.position.bucket], 99) - num(HOLDING_BUCKET_ORDER[b.position.bucket], 99);
    const investmentDifference = num(b.position.invested, 0) - num(a.position.invested, 0);
    return bucketDifference || investmentDifference || (a.index - b.index);
  });
}

function getPositionPerformance(position) {
  const invested = num(position.invested, 0);
  const currentValue = valuePHP(position);
  const gain = currentValue - invested;
  return {
    position: position,
    invested: invested,
    currentValue: currentValue,
    gain: gain,
    gainPct: invested ? (gain / invested) * 100 : 0
  };
}

function getGrowthMovers() {
  const ranked = S.positions.filter(function (position) {
    return position.bucket === 'Growth' && num(position.invested, 0) > 0;
  }).map(getPositionPerformance).sort(function (a, b) {
    return b.gain - a.gain;
  });

  return {
    gainers: ranked.filter(function (item) { return item.gain > 0; }).slice(0, 3),
    losers: ranked.filter(function (item) { return item.gain < 0; }).sort(function (a, b) { return a.gain - b.gain; }).slice(0, 3)
  };
}

function applyTheme(theme, shouldSave) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  S.ui.theme = nextTheme;

  const toggle = el('themeToggle');
  if (toggle) {
    const isDark = nextTheme === 'dark';
    toggle.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
    toggle.querySelector('.theme-label').textContent = isDark ? 'Light' : 'Dark';
    toggle.setAttribute('aria-label', 'Switch to ' + (isDark ? 'light' : 'dark') + ' mode');
    toggle.title = 'Switch to ' + (isDark ? 'light' : 'dark') + ' mode';
  }

  if (shouldSave) {
    save();
    renderAll();
  }
}

function toggleTheme() {
  applyTheme(S.ui.theme === 'dark' ? 'light' : 'dark', true);
}

/* ===== rendering pipeline ===== */
function renderAll() {
  [renderBell, renderDashboard, renderMilestones, renderTools, renderData].forEach(function (renderFn) {
    try {
      renderFn();
    } catch (error) {
      console.error(renderFn.name, error);
    }
  });
}

function renderBell() {
  const items = stale();
  const redCount = items.filter(function (item) {
    return item.red;
  }).length;

  const badge = el('bellBadge');
  if (badge) {
    badge.textContent = redCount;
    badge.style.display = redCount ? 'flex' : 'none';
  }

  const list = el('bellList');
  if (list) {
    list.innerHTML = items.length
      ? items.map(function (item) {
        return '<li style="color:' + (item.red ? 'var(--bad)' : 'var(--warn)') + '">' + item.txt + '</li>';
      }).join('')
      : '<li>🟢 All systems go. Your portfolio data is mission ready.</li>';
  }
}

function buildIncomeFiMessage(yieldOnCost, monthlyIncome) {
  const yocValue = num(yieldOnCost, 0).toFixed(2);
  const monthlyValue = num(monthlyIncome, 0).toFixed(2).toLocaleString('en-PH');
  const emphasizedYoc = '<span style="font-size:1.5rem;font-weight:700">' + yocValue + '%</span>';
  const emphasizedMonthly = '<span style="font-size:1.5rem;font-weight:700">₱' + monthlyValue + '</span>';
  const messages = [
    'Talk about cash flow leverage! Your income bucket is currently flexing a ' + emphasizedYoc + ' Return on Original Capital, handing you ' + emphasizedMonthly + ' in monthly freedom cash on pure autopilot. Markets will swing and prices will bleed, but your cash flow engine doesn’t care about short-term noise—every down day is just a discount sale on your independence. Redeploy that yield to compound your empire, or treat yourself for staying the course!',
    'Your money is officially fighting for your freedom! Operating at a bad-ass ' + emphasizedYoc + ' Yield on Cost, your portfolio is churning out ' + emphasizedMonthly + ' of net cash flow every single month. When red markets hit and panic sets in, remember: price is noise, but yield is real. Bear markets are where true wealth is built—keep stacking discounted shares, lock in higher future yields, and watch your monthly freedom check grow!',
    'Your freedom engine is running at ' + emphasizedYoc + ' Yield on Cost—unlocking ' + emphasizedMonthly + '/month in passive cash. Red market days are just your strategy on sale; stick to the plan, grab a little treat if you’ve earned it, and keep buying back your time piece by piece.',
    'Your income bucket is no longer just sitting there—it’s building your exit plan. At ' + emphasizedYoc + ' Yield on Cost, you’re already generating ' + emphasizedMonthly + '/month in cash flow that can buy back time, fund your freedom, and keep the mission moving when markets get noisy.',
    'Every dividend check is a vote for your future. With ' + emphasizedYoc + ' Yield on Cost, your portfolio is sending ' + emphasizedMonthly + '/month of freedom cash your way—proof that patience, discipline, and compounding are still the ultimate wealth hack.'
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function renderGrowthMovers() {
  const gainersNode = el('growthGainers');
  const losersNode = el('growthLosers');
  const emptyNode = el('growthMoversEmpty');
  if (!gainersNode || !losersNode) {
    return;
  }

  const movers = getGrowthMovers();
  function rows(items, emptyText) {
    if (!items.length) {
      return '<p class="movers-empty">' + emptyText + '</p>';
    }
    return items.map(function (item) {
      const positive = item.gain >= 0;
      const signedAmount = (positive ? '+' : '−') + peso(Math.abs(item.gain));
      const signedPct = (positive ? '+' : '−') + pct(Math.abs(item.gainPct), 2);
      return '<div class="mover-row"><div><b>' + item.position.ticker + '</b><span>' + item.position.name + '</span></div><div class="mover-value ' + (positive ? 'up' : 'down') + '"><b>' + signedAmount + '</b><span>' + signedPct + '</span></div></div>';
    }).join('');
  }

  gainersNode.innerHTML = rows(movers.gainers, 'No Growth holdings are currently above invested capital.');
  losersNode.innerHTML = rows(movers.losers, 'No Growth holdings are currently below invested capital.');
  if (emptyNode) {
    emptyNode.style.display = (movers.gainers.length || movers.losers.length) ? 'none' : 'block';
  }
}

function renderDashboard() {
  renderGrowthMovers();
  const snapshot = getDashboardSnapshot();
  const portfolioTotals = snapshot.portfolioTotals;
  const coastMetrics = snapshot.coastMetrics;
  const incomeTargetAnnual = snapshot.incomeTargetAnnual;
  const incomeTargetPct = snapshot.incomeTargetPct;
  const wealthEngine = getWealthEngineMetrics();
  const windDown = getWindDownMetrics();

  setText('coastTarget', pct(coastMetrics.progress));
  setText('coastSub', peso(coastMetrics.currentValue) + ' of ' + peso(coastMetrics.fireNumber) + ' accumulated');
  setText('wealthEngineValue', pct(wealthEngine.expenseCoveragePct));
  setText('coastYears', windDown.yearsToTarget === 0 ? '0' : windDown.yearsToTarget.toFixed(1));
  setText('windDownSub', 'Projected: ' + peso(windDown.projectedValue) + ' vs target ' + peso(windDown.targetValue));
  setText('wealthEngineSub', 'Growth & Stability: ' + peso(wealthEngine.growthStabilityAnnualSupport) + ' + Income: ' + peso(wealthEngine.incomeAnnual) + ' = ' + peso(wealthEngine.totalAnnualSupport));
  setText('totalInvested', peso(portfolioTotals.invested));
  setText('incomeCoverage', pct(incomeTargetPct));
  setText('incomeCoverageSub', 'Target: ' + pct(S.profile.incomeCoverageTargetPct) + ' of annual spending');
  setText('currentValue', peso(portfolioTotals.currentValue));

  const gainNode = el('gainPct');
  if (gainNode) {
    gainNode.textContent = (portfolioTotals.gain >= 0 ? '+' : '') + pct(portfolioTotals.gainPct);
    gainNode.className = 'val ' + (portfolioTotals.gain >= 0 ? 'up' : 'down');
  }

  setText('netMonthly', peso(portfolioTotals.monthlyIncome, 2));
  const incomeFiNode = el('incomeFiMessage');
  if (incomeFiNode) {
    if (!incomeFiMessageText) {
      incomeFiMessageText = buildIncomeFiMessage(portfolioTotals.yieldOnCost, portfolioTotals.monthlyIncome);
    }
    incomeFiNode.innerHTML = incomeFiMessageText;
  }
  setText('coastTargetMetric', peso(coastMetrics.coastTarget));

  const coastBar = el('coastHeroBar');
  if (coastBar) {
    coastBar.style.width = clamp(coastMetrics.progress, 0, 100) + '%';
  }

  const wealthEngineBar = el('wealthEngineBar');
  if (wealthEngineBar) {
    wealthEngineBar.style.width = clamp(wealthEngine.expenseCoveragePct, 0, 100) + '%';
  }

  const incomeBar = el('incomeHeroBar');
  if (incomeBar) {
    incomeBar.style.width = clamp(incomeTargetPct, 0, 100) + '%';
  }

  const illiquidToggle = el('illiquidToggle');
  if (illiquidToggle) {
    illiquidToggle.checked = !!S.ui.excludeIlliquidCharts;
    illiquidToggle.onchange = function () {
      S.ui.excludeIlliquidCharts = illiquidToggle.checked;
      save();
      renderDashboard();
    };
  }

  nextUp(portfolioTotals, coastMetrics);

  const positionsForCharts = allocationPositions();
  const semiBadge = el('semiBadge');
  if (semiBadge) {
    const semiValue = semiExposure(positionsForCharts);
    semiBadge.textContent = 'Semiconductor exposure: ' + semiValue.toFixed(1) + '% (cap 30%)';
    semiBadge.className = 'badge ' + (semiValue <= 30 ? 'ok' : 'warn');
  }

  drawBucket();
  drawHolding();
  drawIncome();
  drawValue();
}

function nextUp(portfolioTotals, coastMetrics) {
  const candidates = [];

  S.milestones.forEach(function (milestone) {
    let current = null;
    let threshold = milestone.threshold;
    let unitType = '';

    if (milestone.type === 'capital') {
      current = portfolioTotals.invested;
      unitType = 'capital';
    } else if (milestone.type === 'gain') {
      current = portfolioTotals.gain;
      unitType = 'capital';
    } else if (milestone.type === 'income') {
      current = portfolioTotals.monthlyIncome;
      unitType = 'income';
    } else if (milestone.type === 'incomeCover') {
      current = portfolioTotals.annualIncome;
      threshold = num(S.profile.annualSpending) * num(milestone.threshold);
      unitType = 'annualIncome';
    } else if (milestone.type === 'coast') {
      current = coastMetrics.currentValue;
      threshold = coastMetrics.target;
      unitType = 'capital';
    } else {
      return;
    }

    if (current < threshold) {
      candidates.push({
        milestone: milestone,
        ratio: threshold ? (current / threshold) : 0,
        current: current,
        threshold: threshold,
        unit: unitType
      });
    }
  });

  candidates.sort(function (a, b) {
    return b.ratio - a.ratio;
  });

  const block = el('nextUp');
  const bar = el('nextUpBar');

  if (!candidates.length) {
    if (block) {
      block.textContent = 'All numeric milestones achieved! 🎉';
    }
    if (bar) {
      bar.style.width = '100%';
    }
    return;
  }

  const candidate = candidates[0];
  const remaining = candidate.threshold - candidate.current;
  const needText = peso(remaining);

  if (block) {
    block.textContent = 'Next Up: ' + candidate.milestone.label + ' — ' + needText + ' more to go.';
  }

  if (bar) {
    bar.style.width = clamp(candidate.ratio * 100, 0, 100) + '%';
  }
}

function shareList(list, labelFn) {
  const total = list.reduce(function (sum, item) {
    return sum + item.v;
  }, 0);

  return list.map(function (item) {
    return {
      label: labelFn(item),
      v: item.v,
      pct: total ? (item.v / total) * 100 : 0
    };
  });
}

function legend(id, items) {
  const node = el(id);
  if (!node) {
    return;
  }

  node.innerHTML = items.map(function (item, index) {
    return '<li><span><span class="dot" style="background:' + LEGEND_PALETTE[index % LEGEND_PALETTE.length] + '"></span>' + item.label + '</span><span>' + item.pct.toFixed(1) + '%</span></li>';
  }).join('');
}

function drawBucket() {
  const grouped = {};
  allocationPositions().forEach(function (position) {
    grouped[position.bucket] = (grouped[position.bucket] || 0) + valuePHP(position);
  });

  const items = shareList(
    Object.keys(grouped).map(function (bucket) {
      return { label: bucket, v: grouped[bucket] };
    }),
    function (item) {
      return item.label;
    }
  );

  makeChart('chartBucket', {
    type: 'doughnut',
    data: {
      labels: items.map(function (item) {
        return item.label;
      }),
      datasets: [{
        data: items.map(function (item) {
          return item.v;
        }),
        backgroundColor: LEGEND_PALETTE
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce(function (sum, value) {
                return sum + value;
              }, 0);
              return context.label + ': ' + peso(context.parsed) + ' (' + (total ? (context.parsed / total) * 100 : 0).toFixed(1) + '%)';
            }
          }
        }
      }
    }
  });

  legend('legendBucket', items);
}

function drawHolding() {
  const items = shareList(
    allocationPositions().map(function (position) {
      return { label: position.ticker, v: valuePHP(position) };
    }),
    function (item) {
      return item.label;
    }
  );

  makeChart('chartHolding', {
    type: 'doughnut',
    data: {
      labels: items.map(function (item) {
        return item.label;
      }),
      datasets: [{
        data: items.map(function (item) {
          return item.v;
        }),
        backgroundColor: LEGEND_PALETTE.concat(LEGEND_PALETTE)
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce(function (sum, value) {
                return sum + value;
              }, 0);
              return context.label + ': ' + peso(context.parsed) + ' (' + (total ? (context.parsed / total) * 100 : 0).toFixed(1) + '%)';
            }
          }
        }
      }
    }
  });

  legend('legendHolding', items);
}

function drawIncome() {
  const list = spendablePayers();
  const datasets = list.map(function (position, index) {
    return {
      label: position.ticker,
      data: [incomePHP(position) / 12],
      backgroundColor: LEGEND_PALETTE[index % LEGEND_PALETTE.length]
    };
  });

  makeChart('chartIncome', {
    type: 'bar',
    data: {
      labels: ['Monthly Income'],
      datasets: datasets
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ' + peso(context.parsed.x);
            }
          }
        }
      }
    }
  });
}

function drawValue() {
  const emptyNode = el('valueEmpty');

  if (!S.snapshots.length) {
    if (emptyNode) {
      emptyNode.style.display = 'block';
    }
    if (charts.chartValue) {
      try {
        charts.chartValue.destroy();
      } catch (_) {
        // ignore chart destruction errors
      }
    }
    return;
  }

  if (emptyNode) {
    emptyNode.style.display = 'none';
  }

  makeChart('chartValue', {
    type: 'line',
    data: {
      labels: S.snapshots.map(function (snapshot) {
        return snapshot.date;
      }),
      datasets: [
        {
          label: 'Invested',
          data: S.snapshots.map(function (snapshot) {
            return snapshot.invested;
          }),
          borderColor: '#0b5a92',
          tension: 0.3
        },
        {
          label: 'Market Value',
          data: S.snapshots.map(function (snapshot) {
            return snapshot.marketValue;
          }),
          borderColor: '#17c3b2',
          tension: 0.3
        }
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ' + peso(context.parsed.y);
            }
          }
        }
      }
    }
  });
}

/* ===== milestones ===== */
function renderMilestones() {
  const box = el('questGrid');
  if (!box) {
    return;
  }

  const portfolioTotals = getPortfolioTotals();
  const coastMetrics = coast();

  box.innerHTML = S.milestones.map(function (milestone) {
    let achieved = false;
    let current = 0;
    let threshold = milestone.threshold;

    if (milestone.type === 'capital') {
      current = portfolioTotals.invested;
      achieved = current >= threshold;
    } else if (milestone.type === 'gain') {
      current = portfolioTotals.gain;
      achieved = current >= threshold;
    } else if (milestone.type === 'double') {
      threshold = 2 * portfolioTotals.invested;
      current = portfolioTotals.currentValue;
      achieved = portfolioTotals.invested > 0 && current >= threshold;
    } else if (milestone.type === 'income') {
      current = portfolioTotals.monthlyIncome;
      achieved = current >= threshold;
    } else if (milestone.type === 'incomeCover') {
      current = portfolioTotals.annualIncome;
      threshold = num(S.profile.annualSpending) * num(milestone.threshold);
      achieved = current >= threshold;
    } else if (milestone.type === 'coast') {
      current = coastMetrics.currentValue;
      threshold = coastMetrics.target;
      achieved = current >= threshold;
    } else if (milestone.type === 'manual') {
      achieved = !!milestone.achieved;
    }

    if (milestone.type !== 'manual' && achieved && S.achievedIds.indexOf(milestone.id) < 0) {
      S.achievedIds.push(milestone.id);
      save();
      setTimeout(function () {
        toast(milestone.motivator);
      }, 50);
    }

    const emoji = (milestone.motivator.match(/[\p{Emoji_Presentation}\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u) || [CATEGORIES_BY_TYPE[milestone.cat] || '⭐'])[0];

    let barHtml = '';
    if (milestone.type !== 'manual' && threshold > 0) {
      const progress = Math.min(current / threshold, 1) * 100;
      barHtml = '<div class="bar mini"><span style="width:' + progress + '%"></span></div>';
    }

    const checkbox = milestone.type === 'manual'
      ? '<label style="display:flex;gap:6px;align-items:center;font-size:.8rem;margin-top:6px"><input type="checkbox" ' + (achieved ? 'checked' : '') + ' onclick="toggleManual(\'' + milestone.id + '\')"> mark done</label>'
      : '';

    return '<div class="qcard cat-' + milestone.cat + (achieved ? ' done' : ' locked') + '">' +
      '<span class="lock">' + (achieved ? '' : '🔒') + '</span>' +
      '<span class="emoji">' + emoji + '</span>' +
      '<div class="qlabel">' + milestone.label + '</div>' +
      barHtml +
      (achieved ? '<div class="motiv">' + milestone.motivator + '</div>' : '') +
      checkbox +
      (milestone.custom ? '<button class="btn ghost" style="margin-top:6px;padding:2px 8px" onclick="delMilestone(\'' + milestone.id + '\')">remove</button>' : '') +
      '</div>';
  }).join('');
}

function toggleManual(id) {
  const item = S.milestones.find(function (milestone) {
    return milestone.id === id;
  });

  if (item) {
    item.achieved = !item.achieved;
    if (item.achieved) {
      toast(item.motivator);
    }
    save();
    renderMilestones();
  }
}

function addMilestone() {
  const type = (el('mType') || {}).value;
  const threshold = num((el('mThreshold') || {}).value, 0);
  const category = (el('mCat') || {}).value || 'Custom';
  const label = (el('mLabel') || {}).value || 'My quest';
  const motivator = (el('mMotivator') || {}).value || '🎉';

  S.milestones.push({
    id: 'c' + Date.now(),
    cat: category,
    type: type,
    threshold: threshold,
    label: label,
    motivator: motivator,
    manual: type === 'manual',
    achieved: false,
    custom: true
  });

  save();
  renderMilestones();
}

function delMilestone(id) {
  S.milestones = S.milestones.filter(function (milestone) {
    return milestone.id !== id;
  });
  save();
  renderMilestones();
}

/* ===== tools ===== */
function renderTools() {
  const active = S.ui.tool || 'dividend';
  const map = {
    dividend: renderDividend,
    rebalance: renderRebalance,
    projector: renderProjector
  };

  if (map[active]) {
    try {
      map[active]();
    } catch (error) {
      console.error(error);
    }
  }
}

function setTargetFromExpense(id) {
  const monthly = Math.round(currentIncomeTargetAnnual() / 12);
  const node = el(id);
  if (node) {
    node.value = monthly;
    if (id === 'divTarget') {
      renderDividend();
    }
  }
  toast('Planner target set to ' + peso(monthly) + '/mo from the current coverage target.');
}

function additionalCapitalAtTargetPrice(position, additionalAnnualNeeded, targetPrice) {
  const netDividendPerUnit = num(position.div, 0) * (1 - effectiveTaxRate(position));
  const currencyRate = position.currency === 'USD' ? fx() : 1;
  const annualIncomePerUnitPHP = netDividendPerUnit * currencyRate;
  if (annualIncomePerUnitPHP <= 0 || targetPrice <= 0) {
    return 0;
  }
  const additionalUnits = additionalAnnualNeeded / annualIncomePerUnitPHP;
  return additionalUnits * targetPrice * currencyRate;
}

function renderDividend() {
  const targetNode = el('divTarget');
  const targetMonthlyDefault = currentIncomeTargetAnnual() / 12;
  if (targetNode && !targetNode.value) {
    targetNode.value = Math.round(targetMonthlyDefault);
  }

  const desiredYield = (num((el('divDesiredYield') || {}).value, 7)) / 100;
  const targetMonthly = num((el('divTarget') || {}).value, targetMonthlyDefault);
  const targetAnnual = targetMonthly * 12;
  const plannerTotals = getIncomeBucketTotals();
  const incomeTargetAnnual = currentIncomeTargetAnnual();
  const incomeTargetPct = incomeTargetAnnual ? (plannerTotals.annualIncome / incomeTargetAnnual) * 100 : 0;

  setText('divCurrent', peso(plannerTotals.annualIncome));
  setText('divCoverage', pct(incomeTargetPct));
  setText('divGap', peso(Math.max(targetAnnual - plannerTotals.annualIncome, 0)));
  setText('plannerYoc', pct(plannerTotals.yieldOnCost, 2));
  setText('divResult', '');

  const rows = incomeBucketPayers().slice().sort(function (a, b) {
    const aYield = valuePHP(a) ? (incomePHP(a) / valuePHP(a)) : 0;
    const bYield = valuePHP(b) ? (incomePHP(b) / valuePHP(b)) : 0;
    return bYield - aYield;
  }).map(function (position) {
    const currentValue = valuePHP(position);
    const netYield = currentValue ? (incomePHP(position) / currentValue) : 0;
    const currentPrice = num(position.currentPrice);
    const currentMonthly = incomePHP(position) / 12;
    const currentAnnualIncome = incomePHP(position);
    const additionalAnnualNeeded = Math.max(targetAnnual - currentAnnualIncome, 0);
    const targetPrice = (num(position.div) * (1 - effectiveTaxRate(position))) / (desiredYield || 0.0001);
    const priceFormatter = function (value) {
      const amount = num(value, 0);
      const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
      return (position.currency === 'USD' ? '$' : '₱') + amount.toLocaleString(position.currency === 'USD' ? 'en-US' : 'en-PH', options);
    };
    const additionalCapital = additionalCapitalAtTargetPrice(position, additionalAnnualNeeded, targetPrice);
    const showBuy = currentPrice < targetPrice;

    return '<tr><td>' + position.ticker + '</td><td>' + priceFormatter(currentPrice) + '</td><td>' + peso(currentMonthly) + '</td><td>' + pct(netYield * 100, 2) + '</td><td class="' + (showBuy ? 'buy' : 'wait') + '">' + priceFormatter(targetPrice) + '</td><td>' + (additionalCapital > 0 ? peso(additionalCapital) : '—') + '</td></tr>';
  });

  setHtml('divTable', rows.join(''));
}

function capitalToAdd() {
  renderDividend();
}

function bucketTargetsForMode() {
  if (REBALANCE_MODE === 'default') {
    return {
      Growth: num(S.profile.defaultDistribution.Growth, 70),
      Income: num(S.profile.defaultDistribution.Income, 20),
      Stability: num(S.profile.defaultDistribution.Stability, 10)
    };
  }

  const buckets = { Growth: 0, Income: 0, Stability: 0 };
  let total = 0;

  nonInsurancePositions().forEach(function (position) {
    if (buckets[position.bucket] != null) {
      buckets[position.bucket] += valuePHP(position);
      total += valuePHP(position);
    }
  });

  return {
    Growth: total ? (buckets.Growth / total) * 100 : 0,
    Income: total ? (buckets.Income / total) * 100 : 0,
    Stability: total ? (buckets.Stability / total) * 100 : 0
  };
}

function withinBucketWeights(bucket) {
  const holdings = nonInsurancePositions().filter(function (position) {
    return position.bucket === bucket;
  });
  const bucketValue = holdings.reduce(function (sum, position) {
    return sum + valuePHP(position);
  }, 0);

  return holdings.map(function (position) {
    return {
      ticker: position.ticker,
      pct: bucketValue ? (valuePHP(position) / bucketValue) * 100 : (holdings.length ? (100 / holdings.length) : 0)
    };
  });
}

function renderRebalance() {
  const table = el('rbTable');
  if (!table) {
    return;
  }

  const buckets = ['Growth', 'Income', 'Stability'];
  const bucketTargets = bucketTargetsForMode();
  let html = '';

  buckets.forEach(function (bucket) {
    html += '<tr class="rbhead"><td colspan="2"><b>' + bucket + '</b></td><td><input class="inp-sm" id="rb_' + bucket + '" type="number" value="' + bucketTargets[bucket].toFixed(0) + '" oninput="computeRebalance()"> %</td><td colspan="2"></td></tr>';
    html += '<tr class="rbsummary"><td colspan="5" id="rbsum_' + bucket + '"></td></tr>';

    withinBucketWeights(bucket).forEach(function (item) {
      const foundPosition = S.positions.find(function (position) {
        return position.ticker === item.ticker;
      });
      html += '<tr><td>' + item.ticker + '</td><td>' + peso(valuePHP(foundPosition)) + '</td><td><input class="inp-sm" id="rw_' + item.ticker + '" type="number" value="' + item.pct.toFixed(0) + '" oninput="computeRebalance()"></td><td id="rbt_' + item.ticker + '"></td><td id="rba_' + item.ticker + '"></td></tr>';
    });
  });

  table.innerHTML = html;
  computeRebalance();
}

function computeRebalance() {
  const add = num((el('rbAdd') || {}).value, 0);
  const total = nonInsurancePositions().reduce(function (sum, position) {
    return sum + valuePHP(position);
  }, 0) + add;

  ['Growth', 'Income', 'Stability'].forEach(function (bucket) {
    const bucketHoldings = nonInsurancePositions().filter(function (position) {
      return position.bucket === bucket;
    });
    const bucketTotalPct = bucketHoldings.reduce(function (sum, position) {
      return sum + num((el('rw_' + position.ticker) || {}).value, 0);
    }, 0);
    const isComplete = Math.abs(bucketTotalPct - 100) <= 0.01;
    const summaryNode = el('rbsum_' + bucket);

    if (summaryNode) {
      summaryNode.innerHTML = '<span class="rb-pill ' + (isComplete ? 'ok' : 'warn') + '">' + (isComplete ? '✓' : '⚠') + ' ' + bucketTotalPct.toFixed(1) + '% of bucket</span>';
    }
  });

  nonInsurancePositions().forEach(function (position) {
    if (['Growth', 'Income', 'Stability'].indexOf(position.bucket) < 0) {
      return;
    }

    const bucketTargetPct = num((el('rb_' + position.bucket) || {}).value, 0);
    const withinBucketPct = num((el('rw_' + position.ticker) || {}).value, 0);
    const ideal = total * (bucketTargetPct / 100) * (withinBucketPct / 100);
    const delta = ideal - valuePHP(position);

    const targetNode = el('rbt_' + position.ticker);
    if (targetNode) {
      targetNode.textContent = peso(ideal);
    }

    const actionNode = el('rba_' + position.ticker);
    if (actionNode) {
      actionNode.textContent = delta > 0 ? ('Buy ' + peso(delta)) : peso(delta);
      actionNode.className = delta > 0 ? 'buy' : '';
    }
  });
}

function loadCurrentDistribution() {
  REBALANCE_MODE = 'current';
  renderRebalance();
  toast('Loaded current bucket weights.');
}

function loadDefaultDistribution() {
  REBALANCE_MODE = 'default';
  renderRebalance();
  toast('Loaded default distribution profile.');
}



function projectorIncludeIncomeBucket() {
  if (S.ui && typeof S.ui.projectorIncludeIncomeBucket === 'boolean') {
    return S.ui.projectorIncludeIncomeBucket;
  }
  return num(S.profile.incomeCoverageTargetPct, 0) > 0;
}
function normalizeCoverageRate(value) {
  const numericValue = num(value, 0);
  return numericValue > 1 ? numericValue / 100 : numericValue;
}
function getProjectorIncomePct() {
  const slider = el('pjIncomePct');
  if (slider) {
    return clamp(num(slider.value, num(S.profile.incomeCoverageTargetPct, 0)), 0, 100);
  }
  return num(S.profile.incomeCoverageTargetPct, 0);
}
function getProjectorTargetCoastAge() {
  const node = el('pjTargetCoast');
  const currentAge = num((el('pjAge') || {}).value, num(S.profile.currentAge, 25));
  const retireAge = num((el('pjRetire') || {}).value, num(S.profile.retireAge, 55));
  const fallback = Math.max(currentAge + 1, retireAge - 5);
  const value = num(node ? node.value : '', fallback);
  return clamp(value, currentAge, retireAge);
}
function getBucketValue(bucket) {
  return S.positions.reduce(function (sum, position) {
    return position.bucket === bucket ? sum + valuePHP(position) : sum;
  }, 0);
}
function getProjectorSelectedBuckets() {
  const defaults = { Growth: true, Stability: true, Insurance: false };
  return ['Growth', 'Stability', 'Insurance'].filter(function (bucket) {
    const node = el('pjBucket' + bucket);
    return node ? node.checked : !!defaults[bucket];
  });
}
function getProjectorPortfolioSource() {
  const source = (document.querySelector('input[name="pjPortfolioSource"]:checked') || {}).value;
  return source || ((S.ui && S.ui.projectorPortfolioSource) || 'auto');
}
function getProjectorAutoPortfolioValue(buckets) {
  return (buckets || getProjectorSelectedBuckets()).reduce(function (sum, bucket) {
    return sum + getBucketValue(bucket);
  }, 0);
}
function getProjectorStartingPortfolio() {
  if (getProjectorPortfolioSource() === 'manual') {
    return num((el('pjPort') || {}).value, 0);
  }
  return getProjectorAutoPortfolioValue();
}
function getDistributionTotal() {
  const d = S.profile.defaultDistribution || {};
  return ['Growth', 'Income', 'Stability', 'Insurance'].reduce(function (sum, bucket) {
    return sum + num(d[bucket], 0);
  }, 0);
}
function getSelectedContributionShare(selectedBuckets) {
  const d = S.profile.defaultDistribution || {};
  const selected = selectedBuckets || getProjectorSelectedBuckets();
  const total = getDistributionTotal();
  const selectedTotal = selected.reduce(function (sum, bucket) {
    return sum + num(d[bucket], 0);
  }, 0);
  return total ? selectedTotal / total : 0;
}
function getBucketContributionShares(selectedBuckets) {
  const distribution = S.profile.defaultDistribution || { Growth: 70, Income: 20, Stability: 10, Insurance: 0 };
  const selected = selectedBuckets || ['Growth', 'Stability'];
  const total = selected.reduce(function (sum, bucket) {
    return sum + num(distribution[bucket], 0);
  }, 0);
  const shares = {};
  selected.forEach(function (bucket) {
    shares[bucket] = total ? num(distribution[bucket], 0) / total : 0;
  });
  return shares;
}
function getBlendedReturnRate(selectedBuckets) {
  if (S.profile.realReturnMode === 'manual') {
    return num(S.profile.realReturnManual, 0.06);
  }
  const shares = getBucketContributionShares(selectedBuckets);
  const bucketReturns = S.profile.bucketReturns || { Growth: 0.07, Income: 0.045, Stability: 0.025, Insurance: 0 };
  let result = 0;
  Object.keys(shares).forEach(function (bucket) {
    result += shares[bucket] * num(bucketReturns[bucket], 0);
  });
  return result || realReturn();
}
function buildProjectorInputs() {
  const selectedBuckets = getProjectorSelectedBuckets();
  const startPortfolio = getProjectorStartingPortfolio();
  const coverageTarget = normalizeCoverageRate(getProjectorIncomePct());
  const useIncomeBucket = projectorIncludeIncomeBucket();
  const monthlyContribution = num((el('pjMonthly') || {}).value, num(S.profile.monthlyContribution, 0));
  const contributionShare = getSelectedContributionShare(selectedBuckets);
  const stepMode = (el('pjStepMode') || {}).value === 'php' ? 'php' : 'percent';
  const stepValue = num((el('pjStep') || {}).value, 0);
  return {
    age: num((el('pjAge') || {}).value, num(S.profile.currentAge, 25)),
    targetAge: num((el('pjRetire') || {}).value, num(S.profile.retireAge, 55)),
    targetCoastAge: getProjectorTargetCoastAge(),
    monthlyContribution: monthlyContribution,
    annualContribution: monthlyContribution * 12 * contributionShare,
    step: stepMode === 'percent' ? stepValue / 100 : stepValue,
    stepMode: stepMode,
    returnRate: num((el('pjReturn') || {}).value, 6) / 100,
    spending: num((el('pjSpend') || {}).value, 0),
    withdrawalMultiple: num((el('pjMult') || {}).value, 30),
    startPortfolio: startPortfolio,
    selectedBuckets: selectedBuckets,
    coverageTarget: coverageTarget,
    useIncomeBucket: useIncomeBucket,
    contributionShare: contributionShare
  };
}
function buildProjectionSeries(options) {
  const age = num(options.age, 25);
  const targetAge = num(options.targetAge, 55);
  const startPortfolio = num(options.startPortfolio, 0);
  const annualContribution = num(options.annualContribution, 0);
  const step = num(options.step, 0);
  const stepMode = options.stepMode === 'php' ? 'php' : 'percent';
  const contributionShare = num(options.contributionShare, 1);
  const returnRate = num(options.returnRate, 0.06);
  const annualFireSpend = num(options.annualFireSpend, 0);
  const labels = [String(age)];
  const portfolioValues = [startPortfolio];
  const deposited = [startPortfolio];
  const newDeposits = [0];
  const gains = [0];
  const coastTargets = [targetAge > age ? annualFireSpend / Math.pow(1 + returnRate, targetAge - age) : annualFireSpend];
  let portfolio = startPortfolio;
  let cumulativeNewDeposits = 0;
  let cumulativeGains = 0;
  let contributionValue = annualContribution;
  let coastAge = startPortfolio >= coastTargets[0] && annualFireSpend > 0 ? age : null;
  let coastIndex = coastAge === age ? 0 : null;
  let coastTargetAtIntersection = coastAge === age ? coastTargets[0] : null;
  let portfolioAtIntersection = coastAge === age ? startPortfolio : null;
  let depositsAtIntersection = coastAge === age ? 0 : null;
  let gainsAtIntersection = coastAge === age ? 0 : null;
  for (let year = age + 1; year <= targetAge; year++) {
    const annualReturn = portfolio * returnRate;
    portfolio += annualReturn + contributionValue;
    cumulativeGains += annualReturn;
    cumulativeNewDeposits += contributionValue;
    const yearsToRetirement = Math.max(targetAge - year, 0);
    const target = yearsToRetirement > 0 ? annualFireSpend / Math.pow(1 + returnRate, yearsToRetirement) : annualFireSpend;
    labels.push(String(year));
    portfolioValues.push(portfolio);
    deposited.push(startPortfolio + cumulativeNewDeposits);
    newDeposits.push(cumulativeNewDeposits);
    gains.push(cumulativeGains);
    coastTargets.push(target);
    if (coastAge == null && portfolio >= target) {
      coastAge = year;
      coastIndex = labels.length - 1;
      coastTargetAtIntersection = target;
      portfolioAtIntersection = portfolio;
      depositsAtIntersection = cumulativeNewDeposits;
      gainsAtIntersection = cumulativeGains;
    }
    contributionValue = nextAnnualContribution(contributionValue, step, stepMode, contributionShare);
  }
  return {
    labels: labels,
    portfolioValues: portfolioValues,
    deposited: deposited,
    newDeposits: newDeposits,
    gains: gains,
    coastTargets: coastTargets,
    portfolio: portfolio,
    coastAge: coastAge,
    coastIndex: coastIndex,
    coastTargetAtIntersection: coastTargetAtIntersection,
    portfolioAtIntersection: portfolioAtIntersection,
    depositsAtIntersection: depositsAtIntersection,
    gainsAtIntersection: gainsAtIntersection
  };
}
function projectRetirementScenario(options) {
  const spendingInputs = getCoastSpendingInputs({
    spending: options.spending,
    useIncomeBucket: !!options.useIncomeBucket,
    coverageTarget: normalizeCoverageRate(options.coverageTarget)
  });
  const fullRetirementNeed = spendingInputs.annualSpending * num(options.withdrawalMultiple, 30);
  const adjustedRetirementNeed = spendingInputs.effectiveAnnualSpending * num(options.withdrawalMultiple, 30);
  const contributionShare = num(options.contributionShare, getSelectedContributionShare(options.selectedBuckets));
  const annualContribution = (num(options.monthlyContribution, 0) + num(options.extraMonthly, 0)) * 12 * contributionShare;
  const startPortfolio = num(options.startPortfolio, 0) + num(options.lumpSum, 0);
  const yearlyProjection = buildProjectionSeries({
    age: options.age,
    targetAge: options.targetAge,
    startPortfolio: startPortfolio,
    annualContribution: annualContribution,
    step: options.step,
    stepMode: options.stepMode,
    contributionShare: contributionShare,
    returnRate: options.returnRate,
    annualFireSpend: adjustedRetirementNeed
  });
  let portfolioWithWithdraw = startPortfolio;
  let contributionValue = annualContribution;
  let contributing = true;
  let fullFireAge = null;
  for (let year = num(options.age, 25) + 1; year <= num(options.targetAge, 55); year++) {
    portfolioWithWithdraw *= (1 + num(options.returnRate, 0.06));
    if (contributing) {
      portfolioWithWithdraw += contributionValue;
    }
    if (fullFireAge == null && portfolioWithWithdraw >= adjustedRetirementNeed) {
      fullFireAge = year;
    }
    if (contributing && portfolioWithWithdraw >= adjustedRetirementNeed) {
      contributing = false;
    }
    if (!contributing) {
      portfolioWithWithdraw -= spendingInputs.effectiveAnnualSpending;
    }
    contributionValue = nextAnnualContribution(contributionValue, options.step, options.stepMode, contributionShare);
  }
  return {
    fullRetirementNeed: fullRetirementNeed,
    adjustedRetirementNeed: adjustedRetirementNeed,
    effectiveAnnualSpending: spendingInputs.effectiveAnnualSpending,
    coastAge: yearlyProjection.coastAge,
    coastTargetAtIntersection: yearlyProjection.coastTargetAtIntersection,
    portfolioAtIntersection: yearlyProjection.portfolioAtIntersection,
    depositsAtIntersection: yearlyProjection.depositsAtIntersection,
    gainsAtIntersection: yearlyProjection.gainsAtIntersection,
    portfolioAtTargetAgeNoWithdraw: yearlyProjection.portfolio,
    portfolioAtTargetAgeWithWithdraw: portfolioWithWithdraw,
    fullFireAge: fullFireAge,
    fullFireNumber: adjustedRetirementNeed,
    yearlyProjection: yearlyProjection
  };
}
function solveExtraMonthlyContribution(options) {
  const targetCoastAge = num(options.targetCoastAge, num(options.targetAge, 55));
  const baseOptions = Object.assign({}, options, { extraMonthly: 0 });
  const baseScenario = projectRetirementScenario(baseOptions);
  if (baseScenario.coastAge != null && baseScenario.coastAge <= targetCoastAge) return 0;
  let low = 0, high = 1000000, result = high;
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const scenario = projectRetirementScenario(Object.assign({}, baseOptions, { extraMonthly: mid }));
    if (scenario.coastAge != null && scenario.coastAge <= targetCoastAge) { result = mid; high = mid; } else { low = mid; }
  }
  return result;
}
function solveRequiredLumpSum(options) {
  const targetCoastAge = num(options.targetCoastAge, num(options.targetAge, 55));
  const baseOptions = Object.assign({}, options, { lumpSum: 0 });
  const baseScenario = projectRetirementScenario(baseOptions);
  if (baseScenario.coastAge != null && baseScenario.coastAge <= targetCoastAge) return 0;
  let low = 0, high = 100000000, result = high;
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const scenario = projectRetirementScenario(Object.assign({}, baseOptions, { lumpSum: mid }));
    if (scenario.coastAge != null && scenario.coastAge <= targetCoastAge) { result = mid; high = mid; } else { low = mid; }
  }
  return result;
}
function solveRequiredSpendingReduction(options) {
  const targetCoastAge = num(options.targetCoastAge, num(options.targetAge, 55));
  const spending = num(options.spending, 0);
  if (spending <= 0) return 0;
  const baseOptions = Object.assign({}, options, { spending: spending });
  const baseScenario = projectRetirementScenario(baseOptions);
  if (baseScenario.coastAge != null && baseScenario.coastAge <= targetCoastAge) return 0;
  let low = 0, high = spending, result = high;
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const scenario = projectRetirementScenario(Object.assign({}, baseOptions, { spending: Math.max(spending - mid, 0) }));
    if (scenario.coastAge != null && scenario.coastAge <= targetCoastAge) { result = mid; high = mid; } else { low = mid; }
  }
  return result;
}
function renderProjectorBucketPicker() {
  const list = el('pjBucketList');
  if (!list) return;
  const rows = ['Growth', 'Stability', 'Insurance'].map(function (bucket) {
    const value = getBucketValue(bucket);
    const checked = bucket === 'Growth' || bucket === 'Stability' ? ' checked' : '';
    const returnRate = num((S.profile.bucketReturns || {})[bucket], 0) * 100;
    const dist = num((S.profile.defaultDistribution || {})[bucket], 0);
    const note = (bucket === 'Insurance' ? 'illiquid optional · ' : '') + dist.toFixed(0) + '% of monthly contribution · ' + returnRate.toFixed(1) + '% return';
    return '<label class="bucket-check"><input id="pjBucket' + bucket + '" type="checkbox" value="' + bucket + '"' + checked + '> <span>' + bucket + '</span><b>' + peso(value) + '</b><em>' + note + '</em></label>';
  });
  list.innerHTML = rows.join('') + '<div class="bucket-check disabled"><span>Income</span><b>Expense reducer only</b><em>' + num((S.profile.defaultDistribution || {}).Income, 0).toFixed(0) + '% of monthly contribution, excluded from Coast capital</em></div>';
}
function updateProjectorReturnFromBuckets(force) {
  const node = el('pjReturn');
  if (!node) return;
  if (force || S.profile.realReturnMode === 'auto') {
    node.value = (getBlendedReturnRate(getProjectorSelectedBuckets()) * 100).toFixed(2);
  }
}
function syncProjectorPortfolioInput() {
  const source = getProjectorPortfolioSource();
  const port = el('pjPort');
  if (!port) return;
  const isAuto = source === 'auto';
  port.readOnly = isAuto;
  port.classList.toggle('readonly', isAuto);
  if (isAuto) {
    port.value = Math.round(getProjectorAutoPortfolioValue());
  }
  setText('pjStartPortfolioValue', peso(num(port.value, 0)));
  const buckets = getProjectorSelectedBuckets();
  const annualContribution = num((el('pjMonthly') || {}).value, 0) * 12 * getSelectedContributionShare(buckets);
  setText('pjBucketStory', isAuto ? ('Using ' + (buckets.length ? buckets.join(' + ') : 'no selected bucket') + '. Annual contribution counted: ' + peso(annualContribution) + '.') : 'Using your manual portfolio value.');
}
function renderProjector() {
  const profile = S.profile || {};
  function setValue(id, value) {
    const node = el(id);
    if (node && (node.value === '' || node.dataset.projectorInitialized !== '1')) {
      node.value = value;
      node.dataset.projectorInitialized = '1';
    }
  }
  function setSelect(id, value) {
    const node = el(id);
    if (node) node.value = String(value);
  }
  setValue('pjAge', profile.currentAge);
  setValue('pjRetire', profile.retireAge);
  setValue('pjMonthly', profile.monthlyContribution);
  const stepMode = profile.contribStepUpMode === 'php' ? 'php' : 'percent';
  const stepModeNode = el('pjStepMode');
  if (stepModeNode && stepModeNode.dataset.projectorInitialized !== '1') {
    stepModeNode.value = stepMode;
    stepModeNode.dataset.projectorInitialized = '1';
  }
  setValue('pjStep', stepMode === 'percent' ? (profile.contribStepUp * 100).toFixed(1) : profile.contribStepUp);
  setValue('pjReturn', (getBlendedReturnRate(['Growth', 'Stability']) * 100).toFixed(2));
  setValue('pjSpend', profile.annualSpending);
  setValue('pjTargetCoast', Math.max(num(profile.currentAge, 25) + 1, num(profile.retireAge, 55) - 5));
  setSelect('pjMult', profile.withdrawalMultiplier);
  renderProjectorBucketPicker();
  const source = (S.ui && S.ui.projectorPortfolioSource) || 'auto';
  const radio = document.querySelector('input[name="pjPortfolioSource"][value="' + source + '"]');
  if (radio) radio.checked = true;
  const incomeToggle = el('pjIncludeIncome');
  if (incomeToggle) incomeToggle.checked = projectorIncludeIncomeBucket();
  const incomeSlider = el('pjIncomePct');
  if (incomeSlider) {
    const sliderValue = clamp(num(profile.incomeCoverageTargetPct, 50), 0, 100);
    incomeSlider.value = sliderValue;
    setText('pjIncomePctValue', sliderValue.toFixed(0) + '%');
  }
  updateProjectorReturnFromBuckets(false);
  syncProjectorPortfolioInput();
  syncContributionStepLabels();
  ['pjAge', 'pjRetire', 'pjTargetCoast', 'pjMonthly', 'pjStep', 'pjStepMode', 'pjReturn', 'pjSpend', 'pjMult', 'pjPort', 'pjIncomePct'].forEach(function (id) {
    const node = el(id);
    if (!node || node.dataset.projectorBound === '1') return;
    const update = function () {
      if (id === 'pjIncomePct') setText('pjIncomePctValue', num(node.value, 0).toFixed(0) + '%');
      if (id === 'pjStepMode') syncContributionStepLabels();
      computeProjector();
    };
    node.addEventListener('input', update);
    node.addEventListener('change', update);
    node.dataset.projectorBound = '1';
  });
  document.querySelectorAll('input[name="pjPortfolioSource"], #pjBucketList input').forEach(function (node) {
    if (node.dataset.projectorBound === '1') return;
    node.addEventListener('change', function () {
      S.ui = S.ui || {};
      S.ui.projectorPortfolioSource = getProjectorPortfolioSource();
      save();
      updateProjectorReturnFromBuckets(true);
      syncProjectorPortfolioInput();
      computeProjector();
    });
    node.dataset.projectorBound = '1';
  });
  if (incomeToggle && incomeToggle.dataset.projectorBound !== '1') {
    incomeToggle.addEventListener('change', function () {
      S.ui = S.ui || {};
      S.ui.projectorIncludeIncomeBucket = incomeToggle.checked;
      save();
      computeProjector();
    });
    incomeToggle.dataset.projectorBound = '1';
  }
  computeProjector();
}
function renderProjectionChart(series) {
  const node = el('pjYearlyChart');
  if (!node || !series || !series.labels || !series.labels.length) return;
  makeChart('pjYearlyChart', {
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [
        { label: 'Starting + deposits', data: series.deposited, borderColor: '#0b5a92', backgroundColor: 'rgba(11,90,146,.26)', tension: 0.25, fill: true, stack: 'portfolio' },
        { label: 'Unrealized gains', data: series.gains, borderColor: '#17c3b2', backgroundColor: 'rgba(23,195,178,.36)', tension: 0.25, fill: true, stack: 'portfolio' },
        { label: 'Coast FI target', data: series.coastTargets, borderColor: '#e08a1e', borderDash: [6, 5], tension: 0.25, fill: false, pointRadius: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { callbacks: { label: function (context) { return context.dataset.label + ': ' + peso(context.parsed.y); } } } },
      scales: { y: { beginAtZero: true, stacked: true }, x: { stacked: true } }
    }
  });
}
function computeProjector() {
  syncProjectorPortfolioInput();
  const inputs = buildProjectorInputs();
  const scenario = projectRetirementScenario(inputs);
  const extraMonthly = solveExtraMonthlyContribution(inputs);
  const requiredLumpSum = solveRequiredLumpSum(inputs);
  const requiredSpendingReduction = solveRequiredSpendingReduction(inputs);
  const requiredSpendingReductionPct = inputs.spending > 0 ? (requiredSpendingReduction / inputs.spending) * 100 : 0;
  const canReachTargetCoastAge = scenario.coastAge != null && scenario.coastAge <= inputs.targetCoastAge;
  const bucketLine = inputs.selectedBuckets.length ? inputs.selectedBuckets.join(' + ') : 'manual value';
  setText('pjResultTitle', canReachTargetCoastAge ? ('Coast FI can be reached by age ' + inputs.targetCoastAge + '.') : ('Current path misses your age ' + inputs.targetCoastAge + ' Coast FI target.'));
  setText('pjResultCopy', 'Start at ' + peso(inputs.startPortfolio) + ', count ' + peso(inputs.annualContribution) + '/yr from selected bucket contribution share, grow at ' + pct(inputs.returnRate * 100, 2) + ', and model expenses at ' + peso(scenario.effectiveAnnualSpending) + '/yr.');
  setText('pjChartSub', 'Stacked area: Starting + deposits plus unrealized gains equals portfolio value. Coast target is the dashed line. Source: ' + bucketLine + '.');
  setText('pjStartPortfolioValue', peso(inputs.startPortfolio));
  setText('pjRetireAgeValue', inputs.targetAge);
  setText('pjFullFireValue', peso(scenario.fullFireNumber));
  setText('pjAdjustedSpendingValue', peso(scenario.effectiveAnnualSpending));
  setText('pjNoWithdrawValue', peso(scenario.portfolioAtTargetAgeNoWithdraw));
  setText('pjWithdrawValue', peso(scenario.portfolioAtTargetAgeWithWithdraw));
  setText('pjCoastAgeValue', scenario.coastAge != null ? ('Age ' + scenario.coastAge) : 'Not yet');
  setText('pjCoastTargetValue', scenario.coastTargetAtIntersection != null ? peso(scenario.coastTargetAtIntersection) : '—');
  setText('pjFullFireAgeValue', scenario.fullFireAge != null ? ('Age ' + scenario.fullFireAge) : ('>' + inputs.targetAge));
  setText('pjCrossStartValue', scenario.coastAge != null ? peso(inputs.startPortfolio) : '—');
  setText('pjCrossDepositValue', scenario.depositsAtIntersection != null ? peso(scenario.depositsAtIntersection) : '—');
  setText('pjCrossGainValue', scenario.gainsAtIntersection != null ? peso(scenario.gainsAtIntersection) : '—');
  setText('pjCrossPortfolioValue', scenario.portfolioAtIntersection != null ? peso(scenario.portfolioAtIntersection) : '—');
  renderProjectionChart(scenario.yearlyProjection);
  setText('pjSolveMonthlyValue', extraMonthly >= 1000000 ? '₱1M+/mo' : (peso(extraMonthly) + '/mo'));
  setText('pjSolveLumpValue', peso(requiredLumpSum));
  setText('pjSolveSpendValue', requiredSpendingReduction > 0 ? (peso(requiredSpendingReduction) + '/yr') : 'None');
  setText('pjSolveMonthlyHint', extraMonthly > 0 ? ('Add ' + peso(extraMonthly) + '/month to hit age ' + inputs.targetCoastAge + '.') : 'Current monthly contribution already gets there.');
  setText('pjSolveLumpHint', requiredLumpSum > 0 ? ('Add ' + peso(requiredLumpSum) + ' once to close the gap.') : 'No lump sum needed.');
  setText('pjSolveSpendHint', requiredSpendingReduction > 0 ? ('Reduce annual spending by ' + pct(requiredSpendingReductionPct) + '.') : 'No spending cut needed.');
  setText('pjResultFootnote', 'Selected buckets drive both starting value and counted monthly contribution share. Income remains an expense reducer only.');
}

/* ===== settings and holdings ===== */
function renderData() {
  renderProfileForm();
  renderPosCards();
  renderSnapTable();
}

function renderProfileForm() {
  const profile = S.profile;
  function setValue(id, value) {
    const node = el(id);
    if (node) {
      node.value = value;
    }
  }

  setValue('pfAge', profile.currentAge);
  setValue('pfRetire', profile.retireAge);
  setValue('pfSpend', profile.annualSpending);
  setValue('pfMonthly', profile.monthlyContribution);
  const stepMode = profile.contribStepUpMode === 'php' ? 'php' : 'percent';
  setValue('pfStepMode', stepMode);
  setValue('pfStep', stepMode === 'percent' ? (profile.contribStepUp * 100).toFixed(1) : profile.contribStepUp);
  setValue('pfIncomePct', num(profile.incomeCoverageTargetPct, 50).toFixed(0));
  setValue('pfNetYield', (profile.defaultNetYield * 100).toFixed(1));
  setValue('pfDivTax', (profile.domesticDivTax * 100).toFixed(1));
  setValue('pfFx', profile.fxRate);
  setValue('pfMult', profile.withdrawalMultiplier);
  setValue('pfReturnManual', (profile.realReturnManual * 100).toFixed(2));
  setValue('pfRetGrowth', (profile.bucketReturns.Growth * 100).toFixed(1));
  setValue('pfRetIncome', (profile.bucketReturns.Income * 100).toFixed(1));
  setValue('pfRetStability', (profile.bucketReturns.Stability * 100).toFixed(1));
  setValue('pfRetInsurance', (profile.bucketReturns.Insurance * 100).toFixed(1));
  setValue('pfDefGrowth', profile.defaultDistribution.Growth);
  setValue('pfDefIncome', profile.defaultDistribution.Income);
  setValue('pfDefStability', profile.defaultDistribution.Stability);
  setValue('pfDefInsurance', profile.defaultDistribution.Insurance);

  const modeNode = el('pfReturnMode');
  if (modeNode) {
    modeNode.value = profile.realReturnMode;
    modeNode.onchange = syncReturnMode;
  }

  const stepModeNode = el('pfStepMode');
  if (stepModeNode) {
    stepModeNode.onchange = syncContributionStepLabels;
  }
  syncContributionStepLabels();
  syncReturnMode();
}

function syncContributionStepLabels() {
  ['pj', 'pf'].forEach(function (prefix) {
    const mode = (el(prefix + 'StepMode') || {}).value;
    const label = el(prefix + 'StepLabel');
    if (label) {
      label.textContent = mode === 'php' ? 'Annual step-up (₱/mo)' : 'Annual step-up (%)';
    }
  });
}

function syncReturnMode() {
  const mode = (el('pfReturnMode') || {}).value;
  const isAuto = mode === 'auto';

  ['pfReturnManual'].forEach(function (id) {
    const node = el(id);
    if (node) {
      node.disabled = isAuto;
    }
  });

  ['pfRetGrowth', 'pfRetIncome', 'pfRetStability', 'pfRetInsurance'].forEach(function (id) {
    const node = el(id);
    if (node) {
      node.disabled = !isAuto;
    }
  });
}

function saveProfile() {
  const profile = S.profile;
  function numberField(id, fallback) {
    return num((el(id) || {}).value, fallback);
  }

  profile.currentAge = numberField('pfAge', profile.currentAge);
  profile.retireAge = numberField('pfRetire', profile.retireAge);
  profile.annualSpending = numberField('pfSpend', profile.annualSpending);
  profile.monthlyContribution = numberField('pfMonthly', profile.monthlyContribution);
  profile.contribStepUpMode = (el('pfStepMode') || {}).value === 'php' ? 'php' : 'percent';
  const stepValue = numberField('pfStep', profile.contribStepUpMode === 'percent' ? profile.contribStepUp * 100 : profile.contribStepUp);
  profile.contribStepUp = profile.contribStepUpMode === 'percent' ? stepValue / 100 : stepValue;
  profile.incomeCoverageTargetPct = numberField('pfIncomePct', profile.incomeCoverageTargetPct);
  profile.defaultNetYield = numberField('pfNetYield', profile.defaultNetYield * 100) / 100;
  profile.domesticDivTax = numberField('pfDivTax', profile.domesticDivTax * 100) / 100;

  const fxValue = numberField('pfFx', profile.fxRate);
  if (fxValue !== profile.fxRate) {
    profile.fxLu = todayISO();
  }
  profile.fxRate = fxValue;

  profile.withdrawalMultiplier = numberField('pfMult', profile.withdrawalMultiplier);
  profile.realReturnMode = (el('pfReturnMode') || {}).value || 'auto';
  profile.realReturnManual = numberField('pfReturnManual', profile.realReturnManual * 100) / 100;
  profile.bucketReturns = {
    Growth: numberField('pfRetGrowth', profile.bucketReturns.Growth * 100) / 100,
    Income: numberField('pfRetIncome', profile.bucketReturns.Income * 100) / 100,
    Stability: numberField('pfRetStability', profile.bucketReturns.Stability * 100) / 100,
    Insurance: numberField('pfRetInsurance', profile.bucketReturns.Insurance * 100) / 100
  };
  profile.defaultDistribution = {
    Growth: numberField('pfDefGrowth', profile.defaultDistribution.Growth),
    Income: numberField('pfDefIncome', profile.defaultDistribution.Income),
    Stability: numberField('pfDefStability', profile.defaultDistribution.Stability),
    Insurance: numberField('pfDefInsurance', profile.defaultDistribution.Insurance)
  };

  delete profile.targetMonthlyIncome;
  delete profile.includeMP2Income;

  save();
  renderAll();
  toast('📸 Wealth checkpoint captured.');
}

function renderPosCards() {
  const box = el('posCards');
  if (!box) {
    return;
  }

  const buckets = ['Growth', 'Income', 'Stability', 'Insurance'];
  const currencies = ['PHP', 'USD'];

  box.innerHTML = orderedPositionsWithIndex().map(function (item) {
    const position = item.position;
    const index = item.index;
    function select(field, options, value) {
      return '<select onchange="updatePos(' + index + ',\'' + field + '\',this.value)">' +
        options.map(function (option) {
          return '<option' + (option === value ? ' selected' : '') + '>' + option + '</option>';
        }).join('') +
        '</select>';
    }

    function input(field, value, type) {
      return '<input ' + (type ? 'type="' + type + '" ' : '') + 'value="' + value + '" onchange="updatePos(' + index + ',\'' + field + '\',this.value)">';
    }

    return '<div class="poscard b-' + position.bucket + '"><h4><span>' + position.ticker + '</span><button class="btn danger" style="padding:2px 10px" onclick="delPos(' + index + ')">&times;</button></h4>' +
      '<div class="pf"><label>Name</label>' + input('name', position.name) + '</div>' +
      '<div class="pf"><label>Bucket</label>' + select('bucket', buckets, position.bucket) + '</div>' +
      '<div class="pf"><label>Currency</label>' + select('currency', currencies, position.currency) + '</div>' +
      '<div class="pf"><label>Units</label>' + input('units', position.units, 'number') + '</div>' +
      '<div class="pf"><label>Current price</label>' + input('currentPrice', position.currentPrice, 'number') + '</div>' +
      '<div class="pf"><label>Annual dividend / unit</label>' + input('div', position.div, 'number') + '</div>' +
      '<div class="pf"><label>Dividend tax override (blank = default)</label>' + input('divTaxOverride', (position.divTaxOverride == null ? '' : position.divTaxOverride), 'number') + '</div>' +
      '<div class="pf"><label>Invested (₱ cost basis)</label>' + input('invested', position.invested, 'number') + '</div>' +
      '<div class="pf"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" ' + (position.isIlliquid ? 'checked' : '') + ' onchange="updatePos(' + index + ',\'isIlliquid\',this.checked)"> Illiquid</label></div>' +
      '</div>';
  }).join('');
}

function updatePos(index, field, value) {
  const position = S.positions[index];
  if (!position) {
    return;
  }

  if (field === 'isIlliquid') {
    position.isIlliquid = value;
  } else if (field === 'name' || field === 'bucket' || field === 'currency') {
    position[field] = value;
  } else if (field === 'divTaxOverride') {
    position.divTaxOverride = (value === '' ? null : Number(value));
  } else {
    position[field] = Number(value);
  }

  if (field === 'currentPrice') {
    position.lu.currentPrice = todayISO();
  }
  if (field === 'div') {
    position.lu.div = todayISO();
  }

  save();
  renderAll();
}

function delPos(index) {
  if (confirm('Delete ' + S.positions[index].ticker + '?')) {
    S.positions.splice(index, 1);
    save();
    renderAll();
  }
}

function addPos() {
  function read(id) {
    return (el(id) || {}).value;
  }

  const ticker = read('apTicker');
  if (!ticker) {
    toast('Ticker required');
    return;
  }

  S.positions.push({
    ticker: ticker,
    name: read('apName') || ticker,
    bucket: read('apBucket'),
    currency: read('apCur'),
    units: num(read('apUnits'), 0),
    currentPrice: num(read('apPrice'), 0),
    div: num(read('apDiv'), 0),
    divTaxOverride: (read('apTax') === '' ? null : Number(read('apTax'))),
    invested: num(read('apInvested'), 0),
    isIlliquid: !!(el('apIlliq') || {}).checked,
    lu: { currentPrice: todayISO(), div: todayISO() }
  });

  save();
  renderAll();
  toast('🚀 ' + ticker + ' added to your wealth-building army.');
}

function renderSnapTable() {
  const table = el('snapTable');
  if (!table) {
    return;
  }

  table.innerHTML = S.snapshots.map(function (snapshot, index) {
    return '<tr><td>' + snapshot.date + '</td><td>' + peso(snapshot.invested) + '</td><td>' + peso(snapshot.marketValue) + '</td><td><button class="btn ghost" style="padding:2px 8px" onclick="delSnap(' + index + ')">&times;</button></td></tr>';
  }).join('');
}

function saveSnapshot() {
  const portfolioTotals = getPortfolioTotals();
  S.snapshots.push({
    date: todayISO(),
    invested: Math.round(portfolioTotals.invested),
    marketValue: Math.round(portfolioTotals.currentValue)
  });
  save();
  renderAll();
  toast('📸 Wealth checkpoint recorded.');
}

function clearSnapshots() {
  if (confirm('Remove ALL snapshots?')) {
    S.snapshots = [];
    save();
    renderAll();
  }
}

function delLastSnapshot() {
  S.snapshots.pop();
  save();
  renderAll();
}

function delSnap(index) {
  S.snapshots.splice(index, 1);
  save();
  renderAll();
}

function exportJSON() {
  try {
    const text = JSON.stringify(S, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'portfolio_' + todayISO() + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert('Export failed: ' + error.message);
  }
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !data.profile || !Array.isArray(data.positions)) {
        throw new Error('missing profile/positions');
      }
      S = data;
      ensureDefaults();
      save();
      renderAll();
      alert('Import successful ✓');
    } catch (error) {
      console.error(error);
      alert('Invalid JSON file: ' + error.message);
    }
  };
  reader.readAsText(file);
}

/* ===== init ===== */
window.addEventListener('DOMContentLoaded', function () {
  load();
  applyTheme(S.ui.theme, false);

  const themeToggle = el('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  document.querySelectorAll('.navbtn').forEach(function (button) {
    button.addEventListener('click', function () {
      showTab(button.dataset.tab);
    });
  });

  document.querySelectorAll('.toolbtn').forEach(function (button) {
    button.addEventListener('click', function () {
      showTool(button.dataset.tool);
    });
  });

  const bell = el('bellBtn');
  if (bell) {
    bell.addEventListener('click', function () {
      const panel = el('bellPanel');
      if (panel) {
        panel.classList.toggle('open');
      }
    });
  }

  showTab(S.ui.tab || 'dashboard');
  showTool(S.ui.tool || 'dividend');
});

/* ===== expose to window ===== */
window.showTab = showTab;
window.showTool = showTool;
window.exportJSON = exportJSON;
window.importJSON = importJSON;
window.saveProfile = saveProfile;
window.addPos = addPos;
window.updatePos = updatePos;
window.delPos = delPos;
window.saveSnapshot = saveSnapshot;
window.clearSnapshots = clearSnapshots;
window.delLastSnapshot = delLastSnapshot;
window.delSnap = delSnap;
window.addMilestone = addMilestone;
window.delMilestone = delMilestone;
window.toggleManual = toggleManual;
window.computeProjector = computeProjector;
window.capitalToAdd = capitalToAdd;
window.setTargetFromExpense = setTargetFromExpense;
window.syncReturnMode = syncReturnMode;
window.computeRebalance = computeRebalance;
window.loadCurrentDistribution = loadCurrentDistribution;
window.loadDefaultDistribution = loadDefaultDistribution;
window.renderDividend = renderDividend;

window.toggleTheme = toggleTheme;
