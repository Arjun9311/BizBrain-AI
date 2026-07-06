'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Contact, 
  Search, 
  Plus, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Check, 
  X,
  FileCheck,
  UserCheck
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  salary: number;
  hireDate: string;
  department?: { id: string; name: string };
  attendance: any[];
  leaves: any[];
}

export default function EmployeesPage() {
  const { token } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal / Add Employee States
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Sales Executive');
  const [salary, setSalary] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const fetchHRData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
        setDepartments(data.departments);
        if (data.departments.length > 0) {
          setDepartmentId(data.departments[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHRData();
    }
  }, [token]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    try {
      const res = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          role,
          departmentId,
          salary: parseFloat(salary) || 3000
        })
      });

      if (res.ok) {
        fetchHRData();
        setShowAddModal(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setSalary('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLeave = (leaveId: string, employeeId: string) => {
    // Local state simulation
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          leaves: emp.leaves.map(l => l.id === leaveId ? { ...l, status: 'APPROVED' } : l)
        };
      }
      return emp;
    }));
    alert('Leave request approved successfully.');
  };

  const handleRejectLeave = (leaveId: string, employeeId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          leaves: emp.leaves.map(l => l.id === leaveId ? { ...l, status: 'REJECTED' } : l)
        };
      }
      return emp;
    }));
    alert('Leave request rejected.');
  };

  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  // Extract all pending leaves across employees
  const pendingLeaves: any[] = [];
  employees.forEach(emp => {
    emp.leaves.forEach(l => {
      if (l.status === 'PENDING') {
        pendingLeaves.push({
          ...l,
          empId: emp.id,
          empName: `${emp.firstName} ${emp.lastName}`
        });
      }
    });
  });

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HR & Employee Management</h1>
          <p className="text-xs text-slate-500 mt-1">Review workforce directories, attendance logs, leave calendars, and payroll cycles.</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Employees List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-100/40 dark:shadow-none">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-80">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees by name, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium bg-slate-50 dark:bg-slate-950/20">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Payroll (Salary)</th>
                  <th className="p-4 text-center">Attendance (Today)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Loading HR roster...</td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No employees cataloged.</td></tr>
                ) : (
                  filteredEmployees.map(e => {
                    const todayAttendance = e.attendance?.slice(-1)[0];
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350 transition-colors">
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{e.firstName} {e.lastName}</span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-400">{e.email}</span>
                          </div>
                        </td>
                        <td className="p-4">{e.department?.name || 'Engineering'}</td>
                        <td className="p-4 font-semibold">{e.role}</td>
                        <td className="p-4 text-right font-bold">${e.salary.toLocaleString()}/mo</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                            todayAttendance?.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' :
                            todayAttendance?.status === 'LATE' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-rose-500/10 text-rose-500'
                          }`}>
                            {todayAttendance?.status || 'NOT LOGGED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Leaves Requests & Payroll Summary */}
        <div className="space-y-6">
          {/* Leaves */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Leaves Calendar Requests</h3>
              <span className="px-2 py-0.5 bg-blue-500/15 text-blue-500 rounded text-[10px] font-bold uppercase tracking-wider">
                {pendingLeaves.length} pending
              </span>
            </div>

            {pendingLeaves.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 border border-dashed rounded-xl text-center">No pending leave requests</p>
            ) : (
              <div className="space-y-4">
                {pendingLeaves.map(l => (
                  <div key={l.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{l.empName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{l.type} • {l.reason || 'General'}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" /> 3 days
                      </span>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-slate-200/50 dark:border-slate-800/40 pt-3">
                      <button
                        onClick={() => handleRejectLeave(l.id, l.empId)}
                        className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApproveLeave(l.id, l.empId)}
                        className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Org insights */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white relative overflow-hidden">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payroll Statistics</h4>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Monthly Payroll:</span>
                <strong className="text-white">${employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Staff:</span>
                <strong className="text-white">{employees.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average Attendance Rate:</span>
                <strong className="text-emerald-450 text-emerald-400">96.4%</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 animate-slide-in">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Register New Employee</h3>
            
            <form onSubmit={handleCreateEmployee} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">First Name</label>
                  <input
                    type="text" required placeholder="John"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text" required placeholder="Doe"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Office Email</label>
                  <input
                    type="email" required placeholder="email@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text" placeholder="+1 (555) 0000"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Role / Designation</label>
                  <select
                    value={role} onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="HR Manager">HR Manager</option>
                    <option value="Lead Architect">Lead Architect</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Support Agent">Support Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Department</label>
                  <select
                    value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Monthly Salary ($)</label>
                <input
                  type="number" required placeholder="4500"
                  value={salary} onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow shadow-blue-500/10"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
