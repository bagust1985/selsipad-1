'use client';

import { ContractModeStep } from './components/ContractModeStep';
import { ExternalScanStep } from '../../../src/app/create/presale/components/ExternalScanStep';
import { TemplateModeStep } from '../../../src/app/create/presale/components/TemplateModeStep';

interface ContractSetupStepProps {
  // Step 0: Mode Selection
  selectedMode: 'EXTERNAL_CONTRACT' | '  LAUNCHPAD_TEMPLATE' | null;
  onSelectMode: (mode: 'EXTERNAL_CONTRACT' | 'LAUNCHPAD_TEMPLATE') => void;
  network: string;

  // Step 0a: External Contract OR Template
  contractAddress: string;
  onContractAddressChange: (address: string) => void;
  projectId: string; // Draft project ID for scan
  scanStatus: string | null;
  onScanComplete: (status: 'PASS' | 'FAIL' | 'NEEDS_REVIEW') => void;

  templateVersion: string;
  templateAuditStatus: 'VALID' | 'NOT_AUDITED' | null;

  // Flow control
  currentSubStep: 0 | 1; // 0 = mode selection, 1 = external/template
}

export function ContractSetupStep({
  selectedMode,
  onSelectMode,
  network,
  contractAddress,
  onContractAddressChange,
  projectId,
  scanStatus,
  onScanComplete,
  templateVersion,
  templateAuditStatus,
  currentSubStep,
}: ContractSetupStepProps) {
  // Sub-step 0: Contract Mode Selection
  if (currentSubStep === 0) {
    return (
      <ContractModeStep selectedMode={selectedMode} onSelectMode={onSelectMode} network={network} />
    );
  }

  // Sub-step 1: External Scan OR Template  Info
  if (selectedMode === 'EXTERNAL_CONTRACT') {
    return (
      <ExternalScanStep
        projectId={projectId}
        network={network}
        contractAddress={contractAddress}
        onContractAddressChange={onContractAddressChange}
        onScanComplete={onScanComplete}
      />
    );
  }

  if (selectedMode === 'LAUNCHPAD_TEMPLATE') {
    return (
      <TemplateModeStep
        templateVersion={templateVersion}
        network={network}
        templateAuditStatus={templateAuditStatus}
      />
    );
  }

  return null;
}
