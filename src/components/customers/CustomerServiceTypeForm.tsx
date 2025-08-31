
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomerServiceTypeFormProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomerServiceTypeForm: React.FC<CustomerServiceTypeFormProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="service-type">Customer Service Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select service type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="regular">Regular</SelectItem>
          <SelectItem value="elite">Elite</SelectItem>
          <SelectItem value="royal">Royal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
