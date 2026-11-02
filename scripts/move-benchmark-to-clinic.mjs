import fs from 'fs';

// 1. In ClinicDashboard.web.tsx: Add import and render
let clinicCode = fs.readFileSync('apps/mobile/src/components/ClinicDashboard.web.tsx', 'utf8');

if (!clinicCode.includes('MarketComparisonCard')) {
  clinicCode = clinicCode.replace(
    "import ClinicNutritionOverview from './ClinicNutritionOverview';",
    "import ClinicNutritionOverview from './ClinicNutritionOverview';\r\nimport MarketComparisonCard from './MarketComparisonCard';"
  );
}

const targetClinic = "{(section==='coordination'||section==='overview')&&<ClinicReviewQueue patients={patients} onOpen={id=>{const p=patients.find(p=>p.id===id);if(p)openPatient(p,'coordination');}}/>}";
const replacementClinic = targetClinic + "\r\n{section==='overview'&&<MarketComparisonCard />}";

if (clinicCode.includes(targetClinic) && !clinicCode.includes('{section===\'overview\'&&<MarketComparisonCard />}')) {
  clinicCode = clinicCode.replace(targetClinic, replacementClinic);
}

fs.writeFileSync('apps/mobile/src/components/ClinicDashboard.web.tsx', clinicCode, 'utf8');
console.log('Successfully added MarketComparisonCard to ClinicDashboard.web.tsx');
