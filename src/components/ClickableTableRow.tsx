import { TableRow } from '@mui/material';
import type { TableRowProps } from '@mui/material';
import type { KeyboardEvent } from 'react';

interface ClickableTableRowProps extends Omit<TableRowProps, 'onClick'> {
  onActivate: () => void;
}

/** A TableRow that navigates on click, Enter, or Space — with a visible keyboard focus ring. */
export function ClickableTableRow({ onActivate, onKeyDown, sx, ...rest }: ClickableTableRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
    onKeyDown?.(event);
  };

  return (
    <TableRow
      hover
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      sx={{ cursor: 'pointer', ...sx }}
      {...rest}
    />
  );
}
