import fs from 'fs';

let content = fs.readFileSync('apps/mobile/src/components/Dashboard.web.tsx', 'utf8');

// 1. Add new imports
const targetImport = "import NextMealReactiveCard from './NextMealReactiveCard';";
const newImports = targetImport + '\r\n' +
  "import SyringeCalculator from './SyringeCalculator';\r\n" +
  "import DoctorReportExport from './DoctorReportExport';\r\n" +
  "import WeeklyBioCycleMap from './WeeklyBioCycleMap';\r\n" +
  "import MarketComparisonCard from './MarketComparisonCard';";
if (!content.includes('import SyringeCalculator')) {
  content = content.replace(targetImport, newImports);
}

// 2. Add MarketComparisonCard to tab === 'home'
const targetHome = '{nutritionCard}<div className="tl-right-stack">';
const newHome = '{nutritionCard}<div className="tl-right-stack"><MarketComparisonCard />';
if (!content.includes('<MarketComparisonCard />')) {
  content = content.replace(targetHome, newHome);
}

// 3. Add WeeklyBioCycleMap, SyringeCalculator, DoctorReportExport to tab === 'cycle'
const targetCycle = '{tab===\'cycle\'&&<div className="tl-detail-layout">{cycleCard}<DoseScienceGuide/>';
const newCycle = '{tab===\'cycle\'&&<div className="tl-detail-layout">{cycleCard}<WeeklyBioCycleMap/><SyringeCalculator/><DoseScienceGuide/><DoctorReportExport patientId={patientId} patientName={displayName} medication={applicationMedication || \'Tirzepatida\'} doseMg={parseFloat(applicationDose) || 2.5}/>';
if (!content.includes('<WeeklyBioCycleMap/>')) {
  content = content.replace(targetCycle, newCycle);
}

// 4. Add DoctorReportExport to tab === 'progress'
const targetProgress = '{tab===\'progress\'&&<><CareProgress patientId={patientId}/><ActivitySummary patientId={patientId}/></>}';
const newProgress = '{tab===\'progress\'&&<><CareProgress patientId={patientId}/><ActivitySummary patientId={patientId}/><DoctorReportExport patientId={patientId} patientName={displayName} medication={applicationMedication || \'Tirzepatida\'} doseMg={parseFloat(applicationDose) || 2.5}/></>}';
if (content.includes(targetProgress)) {
  content = content.replace(targetProgress, newProgress);
}

fs.writeFileSync('apps/mobile/src/components/Dashboard.web.tsx', content, 'utf8');
console.log('Successfully updated Dashboard.web.tsx with market-leading differentiators!');
