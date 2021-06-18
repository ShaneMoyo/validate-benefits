import React, { useState } from 'react'; 
import readXlsxFile from 'read-excel-file'

function App() {
  const [benefitsData, setBenefitsData] = useState(); 
  const [workdayData, setWorkdayData] = useState(); 

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
    </div>
  );
}

export default App;
