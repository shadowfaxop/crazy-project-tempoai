import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { NodeItem } from "./Canvas";
import { AWS_REGIONS, getAvailabilityZones } from "@/lib/aws-regions";

interface ConfigContextType {
  subnets: NodeItem[];
  securityGroups: NodeItem[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  availabilityZones: { value: string; label: string }[];
}

const ConfigContext = createContext<ConfigContextType>({
  subnets: [],
  securityGroups: [],
  selectedRegion: "us-east-1",
  setSelectedRegion: () => {},
  availabilityZones: [],
});

export const useConfigContext = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
  nodes: NodeItem[];
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  nodes,
}) => {
  const [subnets, setSubnets] = useState<NodeItem[]>([]);
  const [securityGroups, setSecurityGroups] = useState<NodeItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  const [availabilityZones, setAvailabilityZones] = useState(
    getAvailabilityZones("us-east-1"),
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
  }, [selectedRegion]);

  return (
    <ConfigContext.Provider
      value={{
        subnets,
        securityGroups,
        selectedRegion,
        setSelectedRegion,
        availabilityZones,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
