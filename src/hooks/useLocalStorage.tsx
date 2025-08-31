import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Mock data hooks for the admin panel
export function useEmployees() {
  const [employees, setEmployees] = useLocalStorage('employees', [
    {
      id: 1,
      name: "Karthick R",
      department: "Customer Service",
      employeeId: "CL001",
      salary: 20000,
      joinDate: "2025-07-10",
      status: "Active",
      email: "karthick@admin.com",
      phone: "9876543210"
    }
  ]);

  const addEmployee = (employee: any) => {
    const newEmployee = {
      ...employee,
      id: Date.now(),
      employeeId: `CL${String(employees.length + 1).padStart(3, '0')}`
    };
    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id: number, updates: any) => {
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
  };

  const deleteEmployee = (id: number) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return { employees, addEmployee, updateEmployee, deleteEmployee };
}

export function useServices() {
  const [services, setServices] = useLocalStorage('services', [
    {
      id: 1,
      name: "Deep Cleaning",
      description: "Thorough cleaning including baseboards, light fixtures, and appliances",
      price: 120,
      duration: 4,
      status: "Active"
    },
    {
      id: 2,
      name: "Kitchen Deep Clean",
      description: "Complete kitchen cleaning including inside appliances and cabinets",
      price: 80,
      duration: 3,
      status: "Active"
    },
    {
      id: 3,
      name: "Bathroom Deep Clean",
      description: "Comprehensive bathroom cleaning and sanitization",
      price: 60,
      duration: 2,
      status: "Active"
    },
    {
      id: 4,
      name: "Window Cleaning",
      description: "Interior and exterior window cleaning",
      price: 40,
      duration: 1,
      status: "Active"
    },
    {
      id: 5,
      name: "Carpet Cleaning",
      description: "Professional carpet cleaning and stain removal",
      price: 100,
      duration: 3,
      status: "Active"
    },
    {
      id: 6,
      name: "Move-in/Move-out Cleaning",
      description: "Complete property cleaning for moving",
      price: 200,
      duration: 6,
      status: "Active"
    }
  ]);

  const addService = (service: any) => {
    const newService = { ...service, id: Date.now() };
    setServices([...services, newService]);
  };

  const updateService = (id: number, updates: any) => {
    setServices(services.map(service => service.id === id ? { ...service, ...updates } : service));
  };

  const deleteService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
  };

  return { services, addService, updateService, deleteService };
}