import { SampleFilters } from "../components/SampleFilters";
import { Settings } from "../components/Settings";

export const Home = () => {
  return (
    <div className="flex flex-col gap-4">
      <Settings />
      <SampleFilters />
    </div>
  );
};
