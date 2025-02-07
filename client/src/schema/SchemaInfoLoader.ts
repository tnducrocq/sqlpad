import { useEffect } from 'react';
import { loadSchema } from '../stores/editor-actions';
import { useSessionCatalog, useSessionConnectionId } from '../stores/editor-store';

/**
 * Instead of loading schema on selection,
 * this is acts as a listener-as-a-component for schema changes.
 * This is not in the schema sidebar,
 * because sidebar could be hidden and this is an application-level need
 */
function SchemaInfoLoader() {
  const selectedConnectionId = useSessionConnectionId();
  const selectedCatalog = useSessionCatalog();
  useEffect(() => {
    if (selectedConnectionId && selectedCatalog) {
      loadSchema(selectedConnectionId, selectedCatalog);
    }
  }, [selectedConnectionId, selectedCatalog]);

  return null;
}

export default SchemaInfoLoader;
