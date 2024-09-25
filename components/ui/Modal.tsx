// components/ui/Modal.tsx

import { ReactNode } from 'react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <Card className="bg-black rounded-lg shadow-lg w-96 p-6">
        <CardContent>
          {children}
        </CardContent>
        <div className="mt-4 flex justify-end">
          <Button
            variant="destructive"
            onClick={onClose}
            aria-label="Close Modal"
            size="sm"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
