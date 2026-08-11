// ---------- Trial data (hours per 9-hr shift) ----------
const TRIAL_DAYS = ["Jul 30", "Jul 31", "Aug 3", "Aug 4", "Aug 5", "Aug 6", "Aug 7", "Aug 10"];
const LATHE_HRS = [1.27, 0, 2.9, 2.05, 0.82, 1.73, 2.12, 1.92];
const WELD_HRS = [1.17, 4.58, 2.95, 3.73, 4.65, 4.17, 0, 2.18];
const TRIAL_SHIFT_HRS = 9;

function el(id) { return document.getElementById(id); }

function renderHourBars(containerId, values, cls) {
  const container = el(containerId);
  container.innerHTML = "";
  TRIAL_DAYS.forEach((day, i) => {
    const v = values[i];
    const pct = (v / TRIAL_SHIFT_HRS) * 100;
    const row = document.createElement("div");
    row.className = "util-row";
    row.innerHTML = `
      <div class="util-day">${day}</div>
      <div class="util-bar-track"><div class="util-bar-fill ${cls}" style="width:${pct}%;"></div></div>
      <div class="util-hrs-label">${v.toFixed(2)}h run</div>
    `;
    container.appendChild(row);
  });
}

renderHourBars("latheBars", LATHE_HRS, "lathe");
renderHourBars("weldBars", WELD_HRS, "weld");

// ---------- ROI Calculator (hours-based) ----------
const machineCountInput = el("machineCount");
const locationCountInput = el("locationCount");
const shiftHoursInput = el("shiftHours");
const workingDaysInput = el("workingDays");
const avgRuntimeHrsInput = el("avgRuntimeHrs");
const rateLowInput = el("rateLow");
const rateMidInput = el("rateMid");
const rateHighInput = el("rateHigh");
const pctInputs = {
  conservative: el("pctConservative"),
  moderate: el("pctModerate"),
  aggressive: el("pctAggressive"),
};

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString("en-US");
const fmtHrs = (n) => Math.round(n).toLocaleString("en-US");

function getInputs() {
  return {
    machineCount: parseFloat(machineCountInput.value) || 0,
    locationCount: parseFloat(locationCountInput.value) || 1,
    shiftHours: parseFloat(shiftHoursInput.value) || 0,
    workingDays: parseFloat(workingDaysInput.value) || 0,
    avgRuntimeHrs: parseFloat(avgRuntimeHrsInput.value) || 0,
    rateLow: parseFloat(rateLowInput.value) || 0,
    rateMid: parseFloat(rateMidInput.value) || 0,
    rateHigh: parseFloat(rateHighInput.value) || 0,
  };
}

function render() {
  const inp = getInputs();
  const idleHrsPerShift = Math.max(inp.shiftHours - inp.avgRuntimeHrs, 0);
  const idleHrsPerMachineYr = idleHrsPerShift * inp.workingDays;

  // header scope strip
  el("scopeMachines").textContent = fmtHrs(inp.machineCount);
  el("scopeLocations").textContent = fmtHrs(inp.locationCount);

  // callout
  el("currentIdleHrsMachine").textContent = fmtHrs(idleHrsPerMachineYr);
  el("currentIdleHrsShift").textContent = idleHrsPerShift.toFixed(2);

  // scenario table
  let conservativeMidValue = 0;
  ["conservative", "moderate", "aggressive"].forEach((key) => {
    const pct = parseFloat(pctInputs[key].value) || 0;
    // % utilization increase -> additional hours/machine/yr, based on shift length
    const rawHrsPerMachine = inp.shiftHours * (pct / 100) * inp.workingDays;
    // Cap at the available idle pool per machine, so it can't exceed reality
    const cappedHrsPerMachine = Math.min(rawHrsPerMachine, idleHrsPerMachineYr);
    const totalHrs = cappedHrsPerMachine * inp.machineCount;

    el(`hrsPerMachine${cap(key)}`).textContent = cappedHrsPerMachine.toFixed(0) + " hrs";
    el(`total${cap(key)}`).textContent = fmtHrs(totalHrs) + " hrs";
    const low = totalHrs * inp.rateLow;
    const mid = totalHrs * inp.rateMid;
    const high = totalHrs * inp.rateHigh;
    el(`low${cap(key)}`).textContent = fmtMoney(low);
    el(`mid${cap(key)}`).textContent = fmtMoney(mid);
    el(`high${cap(key)}`).textContent = fmtMoney(high);

    if (key === "conservative") conservativeMidValue = mid;
  });

  // payback banner
  el("paybackHeadline").textContent = fmtMoney(conservativeMidValue) + "/yr";
  el("pbMidRate").textContent = inp.rateMid;
  el("pbMachines").textContent = fmtHrs(inp.machineCount);

  // basis note
  el("basisNote").textContent =
    `Idle pool basis: ${fmtHrs(idleHrsPerMachineYr)} idle hrs/machine/yr ` +
    `(${inp.shiftHours}-hr shift − ${inp.avgRuntimeHrs}-hr avg runtime) × ${inp.workingDays} working days. ` +
    `Utilization increase % is converted to hrs/machine/yr as (shift hrs × % increase × working days), capped at this idle ceiling. ` +
    `Total hrs = hrs/machine/yr × ${inp.machineCount} machines. Value = total hrs × selected $/hr rate.`;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

[
  machineCountInput,
  locationCountInput,
  shiftHoursInput,
  workingDaysInput,
  avgRuntimeHrsInput,
  rateLowInput,
  rateMidInput,
  rateHighInput,
  ...Object.values(pctInputs),
].forEach((input) => input.addEventListener("input", render));

render();
