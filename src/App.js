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

  const handleValidate = () => { 
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

    const workDayEmployeeMap = {}; 

    const badRows = [];

    workdayData.forEach(employee => { 
      const id = `${employee[2]?.toUpperCase()}, ${employee[3]?.toUpperCase()?.toUpperCase()}`;
      const isdDnetal = employee[10] === 'USA Dental - USA Guardian PPO Low' || employee[10] === 'USA Dental - USA Guardian PPO High';
      const benefitName = isdDnetal ? 'USA Dental - USA Guardian PPO Dental' : employee[10];
      if(workDayEmployeeMap[id]) { 
        workDayEmployeeMap[id].push(benefitName)
      } else { 
        workDayEmployeeMap[id] = [benefitName];
      }
    }); 

    console.log('workDayEmployeeMap:', workDayEmployeeMap); 
    let m = 0; 
    const benfitHeaders = benefitsData.shift();
    console.log('benfitHeaders: ', benfitHeaders)
    benefitsData.forEach(employee => { 
      
      let id = employee[0];    
      //console.log('id: ', id)
      if(!id) { 
        m++
      }
      if(id && id.split(' ').length === 3) {
        console.log('converting middle name: ', id); 
        const pieces = id.split(' '); 
        let newId = pieces[0];
        for(let i = 1; i <pieces.length; i++) {
          const piece = pieces[i];
          if(piece.length > 1) newId = `${newId} ${piece}`
        }
        id = newId;
        console.log('newid: ', id)
      }

      
      for(let i = 5; i < employee.length; i++) {
        const benefit = employee[i] ? benfitHeaders[i] : null;
        //console.log("benefit: ", benefit)
        const workdayBenifitsForEmployee = workDayEmployeeMap[id]; 
        
        
        if(benefit && map[benefit] && !workdayBenifitsForEmployee?.includes(map[benefit])) {
          // console.log(`workdayBenifitsForEmployee for ${id}`, workdayBenifitsForEmployee); 
          // console.log('employee[i]: ', employee[i])
          // console.log('benfitHeaders[i: ', benfitHeaders[i])
          // console.log('benefit: ', benefit)
          // console.log('map[benefit]: ', map[benefit])
          const reason = (workdayBenifitsForEmployee && workdayBenifitsForEmployee[0]) ? `${employee[0]} has ${benefit} in guardian but does not have ${map[benefit]} in workday.` : `${id} has ${benefit} in guardian but has no benefits in workday.`
          if(badRows[id]){
            badRows[id].push({
              reason, 
              workdayBenifitsForEmployee
            })
          } else { 
            badRows[id] = [{
              reason,
              workdayBenifitsForEmployee
            }]
          }
        }
      }
      
    }); 
    console.log('bad count : ', Object.keys(badRows).length); 
    console.log('badRows: ', badRows); 
  }

   console.log('state:')
   console.log('benfits:', benefitsData);
   console.log('workday:', workdayData); 
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
