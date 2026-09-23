import React from 'react';

interface QuickCallBarProps {
  phone?: string;
  whatsappNumber?: string;
}

export default function QuickCallBar({
  phone = '+977 9825870047',
  whatsappNumber = '9779825870047',
}: QuickCallBarProps) {
  return null;
}
