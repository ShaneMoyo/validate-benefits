import React, { useState } from 'react'; 
import readXlsxFile from 'read-excel-file'

function App() {
  const [benefitsData, setBenefitsData] = useState(); 
  const [workdayData, setWorkdayData] = useState(); 
  const [invalidRows, setInvalidRows] = useState(); 

  const handleBenefitFileUpload = async ({ target: { files }}) => { 
    await readXlsxFile(files[0]).then((rows) => {
     setBenefitsData(rows); 
    })
  }

  const handleWorkdayFileUpload = async ({ target: { files }}) => { 
     await readXlsxFile(files[0]).then((rows) => {
      setWorkdayData(rows); 
     })
   }
   const map = { 
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

  const bmap = { 
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

  const handleValidate = () => { 
    const workDayEmployeeMap = {}; 
    const benefitsEmployeeMap = {}; 
    const badRows = [];
    workdayData.forEach(employee => { 
      const id = `${employee[2]?.toUpperCase()}, ${employee[3]?.toUpperCase()}`;
      const isdDnetal = employee[10] === 'USA Dental - USA Guardian PPO Low' || employee[10] === 'USA Dental - USA Guardian PPO High';
      const benefitName = isdDnetal ? 'USA Dental - USA Guardian PPO Dental' : employee[10];
      if(workDayEmployeeMap[id]) { 
        bmap[benefitName] && workDayEmployeeMap[id].push(benefitName)
      } else { 
         workDayEmployeeMap[id] = bmap[benefitName] ? [benefitName] : undefined;
      }
    }); 
    console.log('workdayData count : ', Object.keys(workdayData).length);
    console.log('workDayEmployeeMap count : ', Object.keys(workDayEmployeeMap).length);

    
    let m = 0; 
    const benfitHeaders = benefitsData.shift();
    
    benefitsData.forEach(employee => {  
      let id = employee[0];    
      if(!id) { 
        m++
      }

      if(id && id.split(' ').length === 3) {
        const pieces = id.split(' '); 
        let newId = pieces[0];
        for(let i = 1; i <pieces.length; i++) {
          const piece = pieces[i];
          if(piece.length > 1) newId = `${newId} ${piece}`
        }
        id = newId;
      }

      if(id) {
        if(!benefitsEmployeeMap[id]) {
          benefitsEmployeeMap[id] = [];
        } 
      }
      
      for(let i = 5; i < employee.length; i++) {
        const benefit = employee[i] ? benfitHeaders[i] : null;
        const workdayBenifitsForEmployee = workDayEmployeeMap[id];
        const guardianBenifitsForEmployee = benefitsEmployeeMap[id]; 
        map[benefit] && benefitsEmployeeMap[id]?.push(benefit); 
        if(benefit && map[benefit] && !workdayBenifitsForEmployee?.includes(map[benefit])) {
          const reason = (workdayBenifitsForEmployee && workdayBenifitsForEmployee[0]) ? `Has ${benefit} in guardian but does not have ${map[benefit]} in workday.` : `Has ${benefit} in guardian but has no benefits in workday.`
          if(badRows[id]){
            badRows[id].errors.push(
              reason, 
            )
          } else { 
            badRows[id] = {
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
        if(!benefitsEmployeeMap[employeeName]?.includes(plan)) { 
          const err = `Has ${plan} on workday but does not have ${bmap[plan]}`;
          badRows[employeeName]?.errors?.push(err);
        }
      })
    });
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
      <input type="file" onChange={handleBenefitFileUpload} /> 
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
