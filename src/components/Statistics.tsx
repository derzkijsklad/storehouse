// import React, { useEffect, useState } from "react";
// import { fetchStatistics } from "../../services/api";

// const Statistics = () => {
//   const [statistics, setStatistics] = useState<any>(null);

//   useEffect(() => {
//     fetchStatistics().then((data) => setStatistics(data));
//   }, []);

//   return (
//     <div>
//       <h1>Statistics</h1>
//       {statistics ? (
//         <pre>{JSON.stringify(statistics, null, 2)}</pre>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// };

// export default Statistics;
