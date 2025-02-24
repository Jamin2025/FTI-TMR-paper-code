
import ClusterDashboard from "./components/ClusterDashboard"
import GraphVisiualization from "./alogrithms/GraphVisiual"

export default function Home() {
  return (
    <div className="">
      <GraphVisiualization />
      <ClusterDashboard />
    </div>
  );
}
