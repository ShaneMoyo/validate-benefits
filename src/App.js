import React, { useState } from 'react'; 
import readXlsxFile from 'read-excel-file'; 
import MaterialTable from "material-table";
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import {DropzoneArea} from 'material-ui-dropzone'

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
  const [employeesWithErrors, setEmployeesWithErrors] = useState(); 
  const [employeesWithNoWorkday, setEmployeesWithNoWorkday] = useState(); 
  const [employeesWithMissingBenefit, setEmployeesWithMissingBenefit] = useState();
  const [view, setView] = useState('missing-benefit');

  const handleGuardianFileUpload = async ( files ) => await files && readXlsxFile(files[0]).then((rows) => setGuardianData(rows));
  const handleWorkdayFileUpload = async ( files ) => await files && readXlsxFile(files[0]).then((rows) => setWorkdayData(rows));
   
  const handleValidate = () => { 
    const workDayEmployeeMap = {}; 
    const guardianEmployeeMap = {}; 
    const employeesWithInvalidBenefits = [];
    let x = 0;
    let y = 0;
    let w1 = []; 
    console.log('workdayData: ', workdayData); 
    workdayData.forEach(employee => { 
      let workdayBenefit = employee[2];
      const employeeName = `${employee[0]?.toUpperCase()}, ${employee[1]?.toUpperCase()}`;
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
    console.log('workDayEmployeeMap : ', workDayEmployeeMap);
    let m = 0; 
    const benfitHeaders = guardianData[0];
    
    guardianData.slice(1).forEach(employee => {  
      let employeeName = employee[0];    
      if(!employeeName) { 
        m++
        return ; 
      }

      if(employeeName.split(' ').length === 3) {
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
        const guardianBenefit = employee[i] ? benfitHeaders[i] : null;
        const workdayBenifitsForEmployee = workDayEmployeeMap[employeeName]?.length > 0 ? workDayEmployeeMap[employeeName] : undefined;
        const guardianBenifitsForEmployee = guardianEmployeeMap[employeeName]?.length > 0 ? guardianEmployeeMap[employeeName] : undefined; 
        guardianToWorkdayMap[guardianBenefit] && guardianEmployeeMap[employeeName].push(guardianBenefit); 
        if(guardianToWorkdayMap[guardianBenefit] && !workdayBenifitsForEmployee?.includes(guardianToWorkdayMap[guardianBenefit])) {
          const reason = (workdayBenifitsForEmployee && workdayBenifitsForEmployee[0]) ? `Has ${guardianBenefit} in guardian but does not have ${guardianToWorkdayMap[guardianBenefit]} in workday.` : `Has ${guardianBenefit} in guardian but has no benefits in workday.`
          if(employeesWithInvalidBenefits[employeeName]){
            employeesWithInvalidBenefits[employeeName].guardianBenifitsForEmployee = !guardianToWorkdayMap[guardianBenefit] ? guardianBenifitsForEmployee : [guardianBenefit]
            employeesWithInvalidBenefits[employeeName].errors.push(
              reason, 
            )
          } else { 
            employeesWithInvalidBenefits[employeeName] = {
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
    
    
    
    
    Object.entries(workDayEmployeeMap).forEach(([employeeName, plans]) => {
      
      plans?.forEach(plan => { 
        let err =""; 
        if(!guardianEmployeeMap[employeeName]) {
          err = `Has no benfits in guardian`;
          if(employeesWithInvalidBenefits[employeeName]) {
            employeesWithInvalidBenefits[employeeName].errors.push(err);
          } else {
            
            employeesWithInvalidBenefits[employeeName] = {
              workdayBenifitsForEmployee: plans,
              guardianBenifitsForEmployee: guardianEmployeeMap[employeeName]?.length > 0 ? guardianEmployeeMap[employeeName] : undefined,
              errors: [
                err,
              ]
            } 
          } 
          return;
        }

        if(!guardianEmployeeMap[employeeName].includes(workdayToGuardianMap[plan])) { 
          err = `Has ${plan} on workday but does not have ${workdayToGuardianMap[plan]} in guardian`;
          if(employeesWithInvalidBenefits[employeeName]) {
            employeesWithInvalidBenefits[employeeName].errors.push(err);
          } else {
            
            employeesWithInvalidBenefits[employeeName] = {
              workdayBenifitsForEmployee: plans,
              guardianBenifitsForEmployee: guardianEmployeeMap[employeeName]?.length > 0 ? guardianEmployeeMap[employeeName] : undefined,
              errors: [
                err,
              ]
            } 
          } 
          return;
        }
      })
    });

    const missingEmployee = {}; 
    const missingBenefitMatch = {}; 
    Object.entries(employeesWithInvalidBenefits).forEach(([employeeName, data]) => {
      if(!Array.isArray(data.workdayBenifitsForEmployee) || !Array.isArray(data.guardianBenifitsForEmployee)) {

        missingEmployee[employeeName] = data
      } else {
        missingBenefitMatch[employeeName] = data
      }
    })

    console.log('missing : ', m);
    console.log('bad count : ', Object.keys(employeesWithInvalidBenefits).length);
    console.log('missingEmployee count : ', Object.keys(missingEmployee).length); 
    console.log('missingEmployee: ', missingEmployee); 
    console.log('missingBenefitMatch count : ', Object.keys(missingBenefitMatch).length); 
    console.log('missingBenefitMatch: ', missingBenefitMatch); 
    setEmployeesWithErrors(employeesWithInvalidBenefits); 
    setEmployeesWithNoWorkday(missingEmployee); 
    setEmployeesWithMissingBenefit(missingBenefitMatch)
  }
  const dataForView = view === 'missing-benefit' ? employeesWithMissingBenefit : employeesWithNoWorkday; 
  return (
    <div className="App">
      <div>
        
      
      <div style={{ display: "flex"}}>
        <div style={{ flex: 1, marginRight: "20px" }}>
          <label>Upload Guardian file: </label>
          <DropzoneArea
            onChange={handleGuardianFileUpload}
          />
        </div>
        
        <div style={{ flex: 1, }}>
          <label>Upload Workday file: </label>
          <DropzoneArea
            onChange={handleWorkdayFileUpload}
            />
        </div>
      </div>
      <br/>
      <br/>
        <br/>
      <Button style={{ margin: "auto", width: "70%", display: "flex" }} variant="outlined" color='primary' onClick={handleValidate}>Validate benefits</Button>
      </div>
      <br/>
      
      <div>
        {employeesWithErrors && (
          <div style={{ margin: "auto", width: "70%", display: "flex" }}>
            <Button style={{ flex: 1, marginRight: "20px "}} variant="outlined" color='primary' onClick={() => setView('no-workday')}>
              {`Missing employee match: ${Object.keys(employeesWithNoWorkday).length}`}
            </Button>
            <Button style={{ flex: 1, marginRight: "20px "}} variant="outlined" color='primary' onClick={() => setView('missing-benefit')}>
              {`Benefits out of sync: ${Object.keys(employeesWithMissingBenefit).length}`}
            </Button>
          </div> 
        )}
       
        <MaterialTable
          columns={[
            {  field: "name" }
          ]}
          data={Object.entries(dataForView || {}).map(([employeeName, data]) => ({ name: employeeName, ...data }))}
          title={view === 'missing-benefit' ? 'Employees with benefits out of sync' : 'Missing employee match in workday or guardian'}
          detailPanel={rowData => {
            console.log('what!: ', rowData)
            return (
              <div>
                <ul style={{ listStyleType: "none"}}>
                  <li>
                    <div>
                      <p>Errors: </p>
                      <ul>
                        {rowData.errors.map(error => <li>{error}</li>)}
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div>
                      <p>Guardian benfits: </p>
                      <ul>
                        {rowData.guardianBenifitsForEmployee?.map(benefit => <li>{benefit}</li>)}
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div>
                      <p>Workday benfits: </p>
                      <ul>
                        {rowData.workdayBenifitsForEmployee?.map(benefit => <li>{benefit}</li>)}
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            )
          }}
        />
      </div>
      
    </div>
  );
}

export default App;
