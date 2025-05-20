"use client"
import styled from 'styled-components'


export const TitleBox = styled.div`
  width: 50px;
`;
interface MachineContainerProps {
  bordercolor?: string;
}
// 样式定义
export const MachineContainer = styled.div<MachineContainerProps>`
  width: 200px;
  margin: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-color: ${(props: MachineContainerProps) => {
    return props.bordercolor;
  }};
`;

export const CpuList = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
`;

export const StorageList = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
`;

export interface StateProp {
    state?: string;
    disabled?: boolean;
    bordercolor?: string
}

export const StorageCore = styled.div<StateProp>`
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 5%;
  background-color: ${(props: StateProp) => {
    switch (props.state) {
      case "Idle":
        return "#28a745";
      case "Broke":
        return "#e74c3c";
      default:
        return "#28a745";
    }
  }};
  ${(props: StateProp) => props.disabled && `&:before {
    content: "";
    position: absolute;
    top: -3px;
    left: 9px;
    display: block;
    width:1px;
    height: 26px;
    background: black;
    transform: rotate(-45deg);
  }`}
`;

export const CpuCore = styled.div<StateProp>`
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props: StateProp) => {
    switch (props.state) {
      case "Idel":
        return "#28a745";
      case "Busy":
        return "#ffcc00";
      case "Broke":
        return "#e74c3c";
      default:
        return "#28a745";
    }
  }};
  ${(props: StateProp) => props.disabled && `&:before {
    content: "";
    position: absolute;
    top: 0px;
    left: 9px;
    display: block;
    width:1px;
    height: 19px;
    background: black;
    transform: rotate(-45deg);
  }`}
  ${(props: StateProp) => props.bordercolor && `
    border: 1px solid ${props.bordercolor}
    `}
`;

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  position: relative;
`;



export const ClusterGrid = styled.div`
  display: flex;
  width: 720px;
  flex-wrap: wrap;
  justify-content: start;
`;