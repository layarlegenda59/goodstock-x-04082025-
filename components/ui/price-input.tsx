import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PriceInput({ value, onChange, placeholder = "", className, disabled }: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    if (num === 0) return '';
    return num.toLocaleString('id-ID');
  };

  // Remove formatting and convert to number
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[^0-9]/g, '');
    return cleaned === '' ? 0 : parseInt(cleaned, 10);
  };

  // Update display value when value prop changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  // Initialize display value
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers and dots/commas for formatting
    if (!/^[0-9.,]*$/.test(inputValue)) {
      return;
    }

    setDisplayValue(inputValue);
    const numericValue = parseNumber(inputValue);
    onChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    setDisplayValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the number when focus is lost
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatNumber(value));
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder=""
      className={cn(className)}
      disabled={disabled}
    />
  );
}