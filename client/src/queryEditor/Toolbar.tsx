import React from 'react';
import ConnectionDropDown from './ConnectionDropdown';
import ToolbarChartButton from './ToolbarChartButton';
import ToolbarConnectionClientButton from './ToolbarConnectionClientButton';
import ToolbarHistoryButton from './ToolbarHistoryButton';
import ToolbarQueryName from './ToolbarQueryName';
import ToolbarRunButton from './ToolbarRunButton';
import ToolbarCancelButton from './ToolbarCancelButton';
import ToolbarSpacer from './ToolbarSpacer';
import ToolbarToggleSchemaButton from './ToolbarToggleSchemaButton';
import { CatalogDropdown } from './CatalogDropdown';
import { useEditorStore, useSessionCatalogDriver } from '../stores/editor-store';

const { getState } = useEditorStore;

function Toolbar() {
  const isDriverCatalog = useSessionCatalogDriver(); 
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        padding: 6,
        borderBottom: '1px solid rgb(204, 204, 204)',
      }}
    >
      <div style={{ display: 'flex' }}>
        <ToolbarToggleSchemaButton />
        <ConnectionDropDown />
        <ToolbarSpacer />
        { isDriverCatalog ? ( 
          <CatalogDropdown />
        ) : (
          <></>
        )}
        <ToolbarSpacer />
        <ToolbarConnectionClientButton />
        <ToolbarSpacer grow />
        <ToolbarQueryName />
        <ToolbarSpacer grow />
        <ToolbarRunButton />
        <ToolbarSpacer />
        <ToolbarCancelButton />
        <ToolbarSpacer />
        <ToolbarHistoryButton />
        <ToolbarChartButton />
      </div>
    </div>
  );
}

export default React.memo(Toolbar);
