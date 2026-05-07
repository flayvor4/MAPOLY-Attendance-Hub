import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth as firebaseAuth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, UserProfile } from '../types';
import { GraduationCap, BookOpen, Shield, ChevronRight, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginPage({ onComplete }: { onComplete: () => void }) {
  const { user, profile, loading } = useAuth();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    matricNumber: '',
    staffId: '',
    department: '',
    faculty: '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && profile) {
      onComplete();
    }
  }, [loading, profile, onComplete]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRole) return;

    setIsSubmitting(true);
    try {
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: formData.fullName,
        role: selectedRole,
        matricNumber: selectedRole === UserRole.STUDENT ? formData.matricNumber : undefined,
        staffId: selectedRole === UserRole.LECTURER ? formData.staffId : undefined,
        department: formData.department,
        faculty: formData.faculty,
        phoneNumber: formData.phoneNumber,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...newUserProfile,
        createdAt: serverTimestamp(),
      });
      
      onComplete();
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Complete Your Profile</h1>
          <p className="text-slate-600 mt-2">Welcome to MAPOLY Attendance Hub. Let's get you set up.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {step === 'role' ? (
            <div className="p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <UserCircle className="text-secondary w-5 h-5" />
                Select Your Role
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RoleCard 
                  role={UserRole.STUDENT}
                  title="Student"
                  description="Mark attendance, track eligibility, and view history."
                  icon={<BookOpen className="w-6 h-6" />}
                  onClick={() => handleRoleSelect(UserRole.STUDENT)}
                />
                <RoleCard 
                  role={UserRole.LECTURER}
                  title="Lecturer"
                  description="Generate QR codes, manage courses, and track analytics."
                  icon={<Shield className="w-6 h-6" />}
                  onClick={() => handleRoleSelect(UserRole.LECTURER)}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
               <button 
                type="button"
                onClick={() => setStep('role')}
                className="text-sm font-medium text-slate-400 hover:text-primary mb-6 flex items-center gap-1"
               >
                 ← Change role
               </button>

               <h2 className="text-xl font-bold mb-6">Enter Your Details</h2>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Full Name</label>
                   <input 
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none transition-all"
                   />
                 </div>

                 {selectedRole === UserRole.STUDENT && (
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Matric Number</label>
                     <input 
                      required
                      type="text"
                      value={formData.matricNumber}
                      onChange={e => setFormData({...formData, matricNumber: e.target.value})}
                      placeholder="e.g. 2021/CS/1234"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none transition-all"
                     />
                   </div>
                 )}

                 {selectedRole === UserRole.LECTURER && (
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Staff ID</label>
                     <input 
                      required
                      type="text"
                      value={formData.staffId}
                      onChange={e => setFormData({...formData, staffId: e.target.value})}
                      placeholder="Enter your staff ID"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none transition-all"
                     />
                   </div>
                 )}

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Faculty</label>
                    <input 
                      required
                      type="text"
                      value={formData.faculty}
                      onChange={e => setFormData({...formData, faculty: e.target.value})}
                      placeholder="e.g. Science"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none transition-all"
                    />
                   </div>
                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Department</label>
                    <input 
                      required
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      placeholder="e.g. Comp. Science"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none transition-all"
                    />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Phone Number</label>
                   <input 
                    required
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none transition-all"
                   />
                 </div>
               </div>

               <button
                disabled={isSubmitting}
                className="w-full mt-8 bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
               >
                 {isSubmitting ? 'Processing...' : 'Complete Registration'}
                 <ChevronRight className="w-5 h-5" />
               </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, title, description, icon, onClick }: { role: UserRole, title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-6 rounded-2xl border text-left transition-all group",
        "bg-slate-50 border-slate-200 hover:border-secondary hover:bg-white hover:shadow-xl hover:shadow-secondary/5"
      )}
    >
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <div className="text-slate-400 group-hover:text-secondary transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        {description}
      </p>
    </button>
  );
}
