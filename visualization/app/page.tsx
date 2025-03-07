
import ClusterDashboard from "./components/ClusterDashboard"
import GraphVisiualization from "./alogrithms/GraphVisiual"
import TMRDashboard from "./components/TMR";
import TwoPhaseTMRDashboard from "./components/TwoPhaseTMR"
import StatusInfoBar from "./components/StatusInfoBar"
import ReactiveTMRDashboard from "./components/ReactiveTMR";

export default function Home() {
  return (
    <div className="">
      <div className="pl-[10%] pt-20">
        <StatusInfoBar />
      </div>
      <TMRDashboard />
      <div className="border-t-2 border-gray-200 mt-10"></div>
      <TwoPhaseTMRDashboard />
      <div className="border-t-2 border-gray-200 mt-10"></div>
      <ReactiveTMRDashboard />
      <div className="border-t-2 border-gray-200 mt-10"></div>
      {/* <GraphVisiualization /> */}
      <ClusterDashboard />
    </div>
  );
}
