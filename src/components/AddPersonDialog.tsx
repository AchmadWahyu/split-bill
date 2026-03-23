import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AddPersonDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  recentNames: string[];
  existingNames: string[];
};

export function AddPersonDialog({
  open,
  onClose,
  onAdd,
  recentNames,
  existingNames,
}: AddPersonDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const filteredSuggestions = recentNames.filter(
    (n) => !existingNames.includes(n)
  );

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nama tidak boleh kosong');
      return;
    }
    if (existingNames.includes(trimmed)) {
      setError('Nama sudah ada di daftar');
      return;
    }
    onAdd(trimmed);
    setName('');
    setError('');
    onClose();
  };

  const handleQuickAdd = (suggestion: string) => {
    onAdd(suggestion);
    setName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tambah Anggota</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Masukkan nama..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            autoFocus
            className="bg-white border-slate-200"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}

          {filteredSuggestions.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-2">
                Nama yang terakhir dipakai
              </p>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleQuickAdd(suggestion)}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex flex-row justify-between gap-2">
          <Button
            onClick={handleClose}
            type="button"
            variant="outline"
            className="h-12 flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={handleAdd}
            type="button"
            className="h-12 flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Tambah
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
