export type DesktopInstance = {
  label: string;
  aws_value: string;
};

export const defaultDesktopInstance: DesktopInstance = {
  label: "2 cores, 4 GB memory",
  aws_value: "t3a.medium",
};

export const hpcDesktopInstances: DesktopInstance[] = [
  {
    label: "2 cores, 8 GB memory",
    aws_value: "t3a.large",
  },
  {
    label: "4 cores, 	16 GB memory",
    aws_value: "t3a.xlarge",
  },
  {
    label: "8 cores, 32 GB memory",
    aws_value: "t3a.2xlarge",
  },
  {
    label: "8 cores, 16 GB memory (compute optimised)",
    aws_value: "c6a.2xlarge",
  },
  {
    label: "8 cores, 32 GB memory (memory optimised)",
    aws_value: "m6a.2xlarge",
  },
  {
    label: "4 cores, 16 GB memory, NVIDIA T4 GPU",
    aws_value: "g4dn.xlarge",
  },
  {
    label: "8 cores, 32 GB memory, NVIDIA T4 GPU",
    aws_value: "g4dn.2xlarge",
  },
  {
    label: "4 cores, 16 GB memory, NVIDIA L4 GPU",
    aws_value: "g6.xlarge",
  },
  {
    label: "16 cores, 64 GB memory, NVIDIA L4 GPU",
    aws_value: "g6.4xlarge",
  },
  {
    label: "48 cores, 192 GB memory, 4 × NVIDIA L4 GPU",
    aws_value: "g6.12xlarge",
  },
  {
    label: "4 cores, 16 GB memory, NVIDIA A10G GPU",
    aws_value: "g5.xlarge",
  },
  {
    label: "8 cores, 32 GB memory, NVIDIA A10G GPU",
    aws_value: "g5.2xlarge",
  },
];
