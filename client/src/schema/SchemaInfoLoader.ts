import { useEffect } from 'react';
import { loadSchema, loadSchemaCatalog } from '../stores/editor-actions';
import { useSessionCatalog, useSessionCatalogDriver, useSessionConnectionId } from '../stores/editor-store';

/**
 * Instead of loading schema on selection,
 * this is acts as a listener-as-a-component for schema changes.
 * This is not in the schema sidebar,
 * because sidebar could be hidden and this is an application-level need
 */
function SchemaInfoLoader() {
  const selectedConnectionId = useSessionConnectionId();
  const manageCatalog = useSessionCatalogDriver();
  const selectedCatalog = useSessionCatalog();
  useEffect(() => {
      if (manageCatalog) {
          if (selectedConnectionId && selectedCatalog) {
            loadSchemaCatalog(selectedConnectionId, selectedCatalog);
          }
      
      } else {
          if (selectedConnectionId) {
            loadSchema(selectedConnectionId);
          }
        
      }
  }, [selectedConnectionId, selectedCatalog]);
  return null;
}

export default SchemaInfoLoader;
