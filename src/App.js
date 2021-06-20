import React, { useState } from 'react'; 
import readXlsxFile from 'read-excel-file'

const guardianToWorkdayMap = { 
  "AD&D: Basic Term Life Volume": "USA Accidental Death & Dismemberment (AD&D) - USA Guardian  (Employee)", 
  "Group Term Life: Basic Term Life Premium": "USA Group Term Life - USA Guardian  (Employee)", 
  "Accident Premium": "USA Accident - USA Guardian", 
  "Dental Fee Premium": "USA Dental - USA Guardian PPO Dental",
  "LTD Premium": "USA Long Term Disability (LTD) - USA Guardian LTD (Employee)",
  "STD Premium": "USA Short Term Disability (STD) - USA Guardian  (Employee)",
  "Vol Hospital Indemnity Premium": "USA Hospital Coverage - USA Guardian",
  "Voluntary Critical Illness Premium": "USA Critical Illness Coverage - USA Guardian  (Employee)", 
  "Supplementary Voluntary Term Life Premium":"USA Supplemental Life - USA Guardian  (Employee)"
};

const workdayToGuardianMap = { 
 "USA Accidental Death & Dismemberment (AD&D) - USA Guardian  (Employee)": "AD&D: Basic Term Life Volume", 
 "USA Group Term Life - USA Guardian  (Employee)": "Group Term Life: Basic Term Life Premium", 
 "USA Accident - USA Guardian": "Accident Premium", 
 "USA Dental - USA Guardian PPO Dental": "Dental Fee Premium",
 "USA Long Term Disability (LTD) - USA Guardian LTD (Employee)" : "LTD Premium",
 "USA Short Term Disability (STD) - USA Guardian  (Employee)" : "STD Premium",
 "USA Hospital Coverage - USA Guardian" : "Vol Hospital Indemnity Premium",
 "USA Critical Illness Coverage - USA Guardian  (Employee)": "Voluntary Critical Illness Premium", 
"USA Supplemental Life - USA Guardian  (Employee)" : "Supplementary Voluntary Term Life Premium",
};

function App() {
  const [guardianData, setGuardianData] = useState(); 
  const [workdayData, setWorkdayData] = useState(); 

  const handleGuardianFileUpload = async ({ target: { files }}) => await readXlsxFile(files[0]).then((rows) => setGuardianData(rows));
  const handleWorkdayFileUpload = async ({ target: { files }}) => await readXlsxFile(files[0]).then((rows) => setWorkdayData(rows));
   
  const handleValidate = () => { 
    const workDayEmployeeMap = {}; 
    const guardianEmployeeMap = {}; 
    const badRows = [];
    let x = 0;
    let y = 0;
    let w1 = []; 
    workdayData.forEach(employee => { 
      let workdayBenefit = employee[10];
      const employeeName = `${employee[2]?.toUpperCase()}, ${employee[3]?.toUpperCase()}`;
      const isDental = workdayBenefit === 'USA Dental - USA Guardian PPO Low' || workdayBenefit === 'USA Dental - USA Guardian PPO High';
      
      if (isDental) workdayBenefit = 'USA Dental - USA Guardian PPO Dental';
      
      if(Array.isArray(workDayEmployeeMap[employeeName])) { 
        x++
        workdayToGuardianMap[workdayBenefit] && workDayEmployeeMap[employeeName].push(workdayBenefit)
      } else { 
        y++
        w1.push(employeeName)
        console.log('workDayEmployeeMap[employeeName]', workDayEmployeeMap[employeeName])
        workDayEmployeeMap[employeeName] = workdayToGuardianMap[workdayBenefit] ? [workdayBenefit] : [];
      }
    }); 
    
    console.log('workdayData count : ', Object.keys(workdayData).length);
    console.log('workDayEmployeeMap count : ', Object.keys(workDayEmployeeMap).length);
    
    let m = 0; 
    const benfitHeaders = guardianData[0];
    
    guardianData.forEach(employee => {  
      let employeeName = employee[0];    
      if(!employeeName) { 
        m++
        return ; 
      }

      if(employeeName && employeeName.split(' ').length === 3) {
        const pieces = employeeName.split(' '); 
        let newEmployeeName = pieces[0];
        for(let i = 1; i <pieces.length; i++) {
          const piece = pieces[i];
          if(piece.length > 1) newEmployeeName = `${newEmployeeName} ${piece}`
        }
        employeeName = newEmployeeName;
      }

      
      if(!Array.isArray(guardianEmployeeMap[employeeName])) {
        guardianEmployeeMap[employeeName] = [];
      } 
      
      
      for(let i = 5; i < employee.length; i++) {
        const benefit = employee[i] ? benfitHeaders[i] : null;
        const workdayBenifitsForEmployee = workDayEmployeeMap[employeeName];
        const guardianBenifitsForEmployee = guardianEmployeeMap[employeeName]; 
        guardianToWorkdayMap[benefit] && guardianEmployeeMap[employeeName].push(benefit); 
        if(benefit && guardianToWorkdayMap[benefit] && !workdayBenifitsForEmployee?.includes(guardianToWorkdayMap[benefit])) {
          const reason = (workdayBenifitsForEmployee && workdayBenifitsForEmployee[0]) ? `Has ${benefit} in guardian but does not have ${guardianToWorkdayMap[benefit]} in workday.` : `Has ${benefit} in guardian but has no benefits in workday.`
          if(badRows[employeeName]){
            badRows[employeeName].errors.push(
              reason, 
            )
          } else { 
            badRows[employeeName] = {
              workdayBenifitsForEmployee,
              guardianBenifitsForEmployee,
              errors: [
              reason,
            ]
          }
          }
        }
      }
    }); 
    const noDataInWorkDay = {}; 
    const missingBenefits = {}; 
    Object.entries(badRows).forEach(([employeeName, data]) => {
      if(data.workdayBenifitsForEmployee) {
        missingBenefits[employeeName] = data
      } else {
        noDataInWorkDay[employeeName] = data
      }
    })
    
    
    Object.entries(workDayEmployeeMap).forEach(([employeeName, data]) => {
      data?.forEach(plan => { 
        if(!guardianEmployeeMap[employeeName]?.includes(plan)) { 
          const err = `Has ${plan} on workday but does not have ${workdayToGuardianMap[plan]}`;
          badRows[employeeName]?.errors?.push(err);
        }
      })
    });
    console.log('missing : ', m);
    console.log('bad count : ', Object.keys(badRows).length);
    console.log('noDataInWorkDay count : ', Object.keys(noDataInWorkDay).length); 
    console.log('noDataInWorkDay: ', noDataInWorkDay); 
    console.log('missingBenefits count : ', Object.keys(missingBenefits).length); 
    console.log('missingBenefits: ', missingBenefits); 
  }
  return (
    <div className="App">
      <label>Upload benefits file: </label>
      <br/>
      <input type="file" onChange={handleGuardianFileUpload} /> 
      <br/>
      <br/>
      <br/>
      <label>Upload workday file: </label>
      <br/>
      <input type="file" onChange={handleWorkdayFileUpload} /> 
      <br/>
      <br/>
      <br/>
      <button onClick={handleValidate}>Validate benefits</button>
    </div>
  );
}

export default App;
