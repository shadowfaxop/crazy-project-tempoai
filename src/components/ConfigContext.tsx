import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { NodeItem } from "./Canvas";
import { AWS_REGIONS, getAvailabilityZones } from "@/lib/aws-regions";

// Local storage key for persisting the selected region
const REGION_STORAGE_KEY = "aws-infrastructure-builder-region";

interface ConfigContextType {
  subnets: NodeItem[];
  securityGroups: NodeItem[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  availabilityZones: { value: string; label: string }[];
  availableRegions: { value: string; label: string }[];
  isRegionSelectorVisible: boolean;
  setRegionSelectorVisible: (visible: boolean) => void;
}

const ConfigContext = createContext<ConfigContextType>({
  subnets: [],
  securityGroups: [],
  selectedRegion: "us-east-1",
  setSelectedRegion: () => {},
  availabilityZones: [],
  availableRegions: AWS_REGIONS,
  isRegionSelectorVisible: false,
  setRegionSelectorVisible: () => {},
});

export const useConfigContext = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
  nodes: NodeItem[];
  className?: string;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  nodes,
  className,
}) => {
  const [subnets, setSubnets] = useState<NodeItem[]>([]);
  const [securityGroups, setSecurityGroups] = useState<NodeItem[]>([]);
  const [isRegionSelectorVisible, setRegionSelectorVisible] = useState(false);

  // Load the region from local storage or use default
  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (typeof window !== "undefined") {
      const savedRegion = localStorage.getItem(REGION_STORAGE_KEY);
      return savedRegion || "us-east-1";
    }
    return "us-east-1";
  });

  const [availabilityZones, setAvailabilityZones] = useState(
    getAvailabilityZones(selectedRegion),
  );

  // Update subnets and security groups when nodes change
  useEffect(() => {
    const filteredSubnets = nodes.filter((node) => node.type === "subnet");
    const filteredSecurityGroups = nodes.filter(
      (node) => node.type === "securitygroup",
    );

    setSubnets(filteredSubnets);
    setSecurityGroups(filteredSecurityGroups);
  }, [nodes]);

  // Update availability zones when region changes
  useEffect(() => {
    setAvailabilityZones(getAvailabilityZones(selectedRegion));

    // Save the selected region to local storage
    if (typeof window !== "undefined") {
      localStorage.setItem(REGION_STORAGE_KEY, selectedRegion);
    }
  }, [selectedRegion]);

  return (
    <ConfigContext.Provider
      value={{
        subnets,
        securityGroups,
        selectedRegion,
        setSelectedRegion,
        availabilityZones,
        availableRegions: AWS_REGIONS,
        isRegionSelectorVisible,
        setRegionSelectorVisible,
      }}
    >
      <div className={className}>{children}</div>
    </ConfigContext.Provider>
  );
};
