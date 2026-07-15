import { Box, IconButton, TextField, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';

export interface DraftLineItem {
  key: string;
  description: string;
  quantity: string;
  unit: string;
}

interface LineItemsEditorProps {
  items: DraftLineItem[];
  onChange: (items: DraftLineItem[]) => void;
}

export function LineItemsEditor({ items, onChange }: LineItemsEditorProps) {
  const updateItem = (key: string, changes: Partial<DraftLineItem>) => {
    onChange(items.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  };

  const removeItem = (key: string) => {
    onChange(items.filter((item) => item.key !== key));
  };

  const addItem = () => {
    onChange([...items, { key: crypto.randomUUID(), description: '', quantity: '', unit: '' }]);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 120px 40px',
          gap: 1.5,
          mb: 1,
          px: 0.5,
        }}
      >
        <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Item
        </Typography>
        <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Qty
        </Typography>
        <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Unit
        </Typography>
        <Box />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {items.map((item) => (
          <Box
            key={item.key}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 120px 40px',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              placeholder="Describe the item"
              value={item.description}
              onChange={(e) => updateItem(item.key, { description: e.target.value })}
            />
            <TextField
              size="small"
              type="number"
              slotProps={{ htmlInput: { min: 0 } }}
              value={item.quantity}
              onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
            />
            <TextField
              size="small"
              placeholder="e.g. unit"
              value={item.unit}
              onChange={(e) => updateItem(item.key, { unit: e.target.value })}
            />
            <IconButton
              size="small"
              aria-label="Remove line item"
              onClick={() => removeItem(item.key)}
              disabled={items.length === 1}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      <Button size="small" startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }}>
        Add line item
      </Button>
    </Box>
  );
}
