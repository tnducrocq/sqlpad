import React from 'react';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';

const LINK_STYLE = { display: 'inline-flex', alignItems: 'center' };

type Props = {
  version?: string;
};

function AboutContent({ version = '' }: Props) {
  return (
    <div>
      <p>
        <strong>Version</strong>: {version}
      </p>

      <p>
        <strong>Shortcuts</strong>
      </p>
      <ul style={{ paddingLeft: 0 }}>
        <li style={{ listStyleType: 'none', marginBottom: 8 }}>
          <code>ctrl+s</code> / <code>command+s</code> : Save
        </li>
        <li style={{ listStyleType: 'none', marginBottom: 8 }}>
          <code>ctrl+return</code> / <code>command+return</code> : Run
        </li>
        <li style={{ listStyleType: 'none', marginBottom: 8 }}>
          <code>shift+return</code> : Format
        </li>
      </ul>

      <p>
        <strong>Tip</strong>
      </p>
      <p>Run only a portion of a query by highlighting it first.</p>
    </div>
  );
}

export default AboutContent;
