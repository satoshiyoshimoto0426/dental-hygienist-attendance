import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import { PatientReport } from '../components/reports/PatientReport';
import { PatientComparisonReport } from '../components/reports/PatientComparisonReport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-reports-tabpanel-${index}`}
      aria-labelledby={`patient-reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `patient-reports-tab-${index}`,
    'aria-controls': `patient-reports-tabpanel-${index}`,
  };
}

/**
 * 患者レポートページ
 */
export const PatientReports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="患者レポートタブ">
          <Tab label="患者別統計" {...a11yProps(0)} />
          <Tab label="患者比較" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <PatientReport />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <PatientComparisonReport />
      </TabPanel>
    </Box>
  );
};