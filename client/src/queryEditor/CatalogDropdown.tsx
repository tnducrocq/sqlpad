import React, { useState, ChangeEvent } from 'react';
import Select from '../common/Select';
import {
  loadSchema,
  selectCatalog,
} from '../stores/editor-actions';
import { useSessionCatalog, useSessionConnectionId } from '../stores/editor-store';
import { api } from '../utilities/api';

export function CatalogDropdown() {
  const selectedConnectionId = useSessionConnectionId();
  const selectedCatalog = useSessionCatalog();
  
  const { data: catalogsData } = api.useCatalogs(selectedConnectionId);
  const catalogs = catalogsData || [];


  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {  
    const catalog = event.target.value;
    console.log("CatalogDropdown: handleChange: ", catalog);
    selectCatalog(selectedConnectionId, catalog); 
    loadSchema(selectedConnectionId, catalog, true);
  };
 
  const style = { width: 220 };
  return (
    <>
      <Select
        style={style}
        onChange={handleChange}
      >
        { selectedCatalog ? (
          <option value={selectedCatalog} hidden>
            {selectedCatalog}
          </option>
         ) : (
          <option value="" hidden>
            choose a catalog
          </option>
         )
        }
        
        {catalogs.map((item) => {
          return (
            <option key={item} value={item}>
              {item}
            </option>
          );
        })}
      </Select>
    </>
  );
}
