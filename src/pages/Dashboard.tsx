import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Plus,
  QrCode,
  Scan,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  setDoc,
  serverTimestamp, 
  doc, 
  updateDoc,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { UserRole, AttendanceSession, Course, AttendanceRecord, OperationType } from '../types';
import { cn, handleFirestoreError } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format, subDays } from 'date-fns';

// --- Dashboard Component ---

export default function Dashboard() {
  const { profile, isLecturer, isStudent, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!profile) return null;

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-primary text-white transition-all duration-300 flex flex-col z-40",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <span className="text-xl font-display font-bold tracking-tight">MAPOLY</span>
          ) : (
            <span className="text-xl font-display font-bold tracking-tight">M</span>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem 
            active={activeTab === 'overview'} 
            icon={<LayoutDashboard />} 
            label="Overview" 
            collapsed={!isSidebarOpen} 
            onClick={() => setActiveTab('overview')}
          />
          {isLecturer && (
            <NavItem 
              active={activeTab === 'sessions'} 
              icon={<QrCode />} 
              label="Attendance" 
              collapsed={!isSidebarOpen} 
              onClick={() => setActiveTab('sessions')}
            />
          )}
          {isStudent && (
            <NavItem 
              active={activeTab === 'scan'} 
              icon={<Scan />} 
              label="Scan Now" 
              collapsed={!isSidebarOpen} 
              onClick={() => setActiveTab('scan')}
            />
          )}
          <NavItem 
            active={activeTab === 'courses'} 
            icon={<BookOpen />} 
            label="Courses" 
            collapsed={!isSidebarOpen} 
            onClick={() => setActiveTab('courses')}
          />
          <NavItem 
            active={activeTab === 'history'} 
            icon={<History />} 
            label="History" 
            collapsed={!isSidebarOpen} 
            onClick={() => setActiveTab('history')}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <NavItem 
            icon={<Settings />} 
            label="Settings" 
            collapsed={!isSidebarOpen} 
          />
          <NavItem 
            icon={<LogOut />} 
            label="Logout" 
            collapsed={!isSidebarOpen} 
            onClick={handleLogout}
            className="text-rose-400 hover:bg-rose-500/10"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
             >
               <MenuIcon isSidebarOpen={isSidebarOpen} />
             </button>
             <h2 className="text-xl font-bold font-display capitalize">
               {activeTab}
             </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex relative">
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-secondary w-64"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
            
            <button className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold">{profile.fullName}</div>
                <div className="text-xs text-slate-500">{profile.role}</div>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary font-bold">
                {profile.fullName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isLecturer ? <LecturerOverview /> : <StudentOverview />}
              </motion.div>
            )}

            {activeTab === 'sessions' && isLecturer && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LecturerSessions profile={profile} />
              </motion.div>
            )}

            {activeTab === 'scan' && isStudent && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AttendanceScanner />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Specific Views & Components ---

function NavItem({ icon, label, active, collapsed, onClick, className }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  collapsed?: boolean, 
  onClick?: () => void,
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center rounded-xl transition-all h-12 relative group",
        active 
          ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
          : "text-slate-400 hover:bg-slate-800 hover:text-white",
        collapsed ? "justify-center" : "px-4 gap-4",
        className
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
      
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );
}

function MenuIcon({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  return isSidebarOpen ? (
    <div className="space-y-1 w-5">
      <div className="h-0.5 bg-current rounded" />
      <div className="h-0.5 w-3 bg-current rounded" />
      <div className="h-0.5 bg-current rounded" />
    </div>
  ) : (
    <div className="space-y-1 w-5">
      <div className="h-0.5 bg-current rounded" />
      <div className="h-0.5 bg-current rounded" />
      <div className="h-0.5 bg-current rounded" />
    </div>
  );
}

// --- Lecturer Views ---

function LecturerOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalAttendance: 0,
    courseCount: 0,
  });

  const chartData = [
    { day: 'Mon', count: 45 },
    { day: 'Tue', count: 52 },
    { day: 'Wed', count: 38 },
    { day: 'Thu', count: 65 },
    { day: 'Fri', count: 48 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users className="text-secondary" />} 
          label="Total Students" 
          value="1,240" 
          trend="+12%" 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-accent" />} 
          label="Avg. Attendance" 
          value="84%" 
          trend="+5%" 
        />
        <StatCard 
          icon={<Clock className="text-warning" />} 
          label="Active Sessions" 
          value="3" 
          isWarning
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Attendance Trends</h3>
            <select className="bg-slate-50 border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-0">
              <input type="button" value="Weekly" />
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Active Sessions</h3>
            <button className="text-secondary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
             <ActiveSessionItem 
              course="CSC 301 - Data Structures" 
              time="10:00 AM - 12:00 PM" 
              count={42} 
             />
             <ActiveSessionItem 
              course="MAT 202 - Calculus II" 
              time="02:00 PM - 04:00 PM" 
              count={18} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}

function LecturerSessions({ profile }: { profile: any }) {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);

  useEffect(() => {
    // Initial fetch of courses
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, 'courses'), where('department', '==', profile?.department || ''));
        const querySnapshot = await getDocs(q);
        const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        if (courses.length > 0) {
          setCourseList(courses);
        } else {
          // Fallback mock if none in DB
          setCourseList([
            { id: '1', title: 'Data Structures', code: 'CSC 301', unitLoad: 3, department: 'CSC', level: 'ND2', semester: '1', lecturerIds: [] },
          ]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, [profile]);

  const [presentCount, setPresentCount] = useState(0);

  useEffect(() => {
    if (!activeSession) return;
    const q = query(collection(db, `sessions/${activeSession.id}/records`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPresentCount(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `sessions/${activeSession.id}/records`);
    });
    return () => unsubscribe();
  }, [activeSession]);

  const handleCreateSession = async (courseId: string) => {
     setIsCreating(true);
     try {
       const sessionData = {
         courseId,
         lecturerId: auth.currentUser?.uid,
         startTime: serverTimestamp(),
         endTime: new Date(Date.now() + 3600000).toISOString(),
         type: 'qr',
         status: 'active',
         qrCodeValue: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
         createdAt: serverTimestamp()
       };
       const docRef = await addDoc(collection(db, 'sessions'), sessionData);
       setActiveSession({ ...sessionData, id: docRef.id } as any);
     } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'sessions');
     } finally {
       setIsCreating(false);
     }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {activeSession ? (
        <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-2xl text-center space-y-8">
           <div className="space-y-2">
             <h2 className="text-3xl font-display font-bold">Live Attendance QR</h2>
             <p className="text-slate-500 font-medium">Class: CSC 301 - Data Structures</p>
           </div>
           
           <div className="mx-auto w-64 h-64 p-4 border-8 border-primary/5 rounded-[40px] flex items-center justify-center bg-white shadow-inner">
              <QRCodeSVG value={activeSession.qrCodeValue!} size={220} />
           </div>

           <div className="pt-8 grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl">
                <div className="text-3xl font-bold text-primary">{presentCount}</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Students Present</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl">
                <div className="text-3xl font-bold text-slate-500">12m</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Time Left</div>
              </div>
           </div>

           <button 
            onClick={() => setActiveSession(null)}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
           >
             Close Session
           </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold">Create New Session</h3>
            <p className="text-slate-500 text-sm">Select a course to generate a QR code</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {courseList.map(course => (
               <button 
                 key={course.id}
                 onClick={() => handleCreateSession(course.id)}
                 className="p-6 bg-white rounded-3xl border border-slate-200 text-left hover:border-secondary hover:shadow-lg hover:shadow-secondary/5 transition-all group"
               >
                 <div className="w-10 h-10 bg-slate-50 rounded-xl mb-4 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                   <Plus className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-slate-900">{course.code} - {course.title}</h4>
                 <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{course.level} • {course.semester} Semester</p>
               </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Student Views ---

function StudentOverview() {
  const { profile } = useAuth();

  const recordData = [
    { name: 'Mon', status: 'present' },
    { name: 'Tue', status: 'present' },
    { name: 'Wed', status: 'absent' },
    { name: 'Thu', status: 'present' },
    { name: 'Fri', status: 'late' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-primary rounded-[40px] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold mb-2">Hello, {profile?.fullName.split(' ')[0]}!</h2>
          <p className="text-slate-300 max-w-sm">Your overall attendance is looking great. Keep it up!</p>
          
          <div className="mt-12 flex items-end gap-12">
             <div>
               <div className="text-5xl font-display font-bold">88%</div>
               <div className="text-xs font-bold text-slate-400 uppercase mt-2">Overall Rate</div>
             </div>
             <div className="hidden sm:block">
               <div className="text-5xl font-display font-bold">14</div>
               <div className="text-xs font-bold text-slate-400 uppercase mt-2">Classes Attended</div>
             </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-[-20deg] transform translate-x-12" />
        <TrendingUp className="absolute top-10 right-10 w-32 h-32 text-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold mb-6">Recent Status</h3>
           <div className="flex justify-between items-center px-4">
              {recordData.map((d, i) => (
                <div key={i} className="text-center space-y-2">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center",
                     d.status === 'present' ? "bg-accent/10 text-accent" :
                     d.status === 'late' ? "bg-warning/10 text-warning" : "bg-rose-500/10 text-rose-500"
                   )}>
                     {d.status === 'present' ? <CheckCircle2 className="w-6 h-6" /> : 
                      d.status === 'late' ? <Clock className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.name}</div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold mb-6">Upcoming Classes</h3>
           <div className="space-y-4">
              <CourseItem code="CSC 301" time="10:00 AM" room="Room 12B" />
              <CourseItem code="MAT 202" time="02:00 PM" room="Hall 1" />
           </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceScanner() {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanner = () => {
    setScanning(true);
    setSuccess(false);
    setError(null);
    
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render(async (decodedText) => {
        console.log("Scanned:", decodedText);
        scanner.clear();
        setScanning(false);
        
        try {
          // Find the session with this QR code
          const q = query(collection(db, 'sessions'), where('qrCodeValue', '==', decodedText), where('status', '==', 'active'));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            setError("Invalid or expired QR code.");
            return;
          }
          
          const session = querySnapshot.docs[0];
          const sessionId = session.id;
          
          // Use a doc ref with deterministic ID to prevent duplicates (studentId_sessionId)
          const recordId = `${auth.currentUser?.uid}_${sessionId}`;
          const recordRef = doc(db, `sessions/${sessionId}/records`, recordId);
          
          await setDoc(recordRef, {
            sessionId,
            studentId: auth.currentUser?.uid,
            timestamp: serverTimestamp(),
            status: 'present',
            deviceFingerprint: navigator.userAgent // Simple fingerprint
          });
          
          setSuccess(true);
        } catch (err) {
          console.error("Attendance marking failed:", err);
          setError("Failed to mark attendance. Please try again.");
        }
      }, (errorMessage) => {
        // console.warn(errorMessage);
      });
    }, 100);
  };

  return (
    <div className="max-w-xl mx-auto">
      {success ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] border-2 border-accent text-center space-y-6"
        >
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto shadow-xl shadow-accent/20">
             <CheckCircle2 className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-display font-bold">Attendance Marked!</h2>
          <p className="text-slate-500">You have successfully marked your attendance for CSC 301.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold"
          >
            Done
          </button>
        </motion.div>
      ) : (
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl overflow-hidden relative">
           {!scanning ? (
             <div className="text-center py-12 space-y-8">
                <div className="w-24 h-24 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto relative">
                   <Scan className="w-12 h-12 text-secondary" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-display font-bold text-slate-900">Scan Attendance QR</h2>
                   <p className="text-slate-500 max-w-xs mx-auto">Position the QR code within the frame to automatically mark your attendance.</p>
                </div>
                <button 
                  onClick={startScanner}
                  className="w-full py-4 bg-secondary text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Scan className="w-5 h-5" />
                  Open Scanner
                </button>
                {error && (
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100 animate-shake">
                    {error}
                  </div>
                )}
             </div>
           ) : (
             <div className="space-y-6">
                <div id="reader" className="w-full overflow-hidden rounded-2xl bg-slate-900 min-h-[300px]"></div>
                <button 
                  onClick={() => setScanning(false)}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
             </div>
           )}
           
           <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full">
                 <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Active Sync</span>
              </div>
           </div>
        </div>
      )}

      <div className="mt-8 flex items-center gap-4 p-6 bg-slate-900 rounded-3xl shadow-xl text-white">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
           <AlertCircle className="text-warning w-6 h-6" />
        </div>
        <div className="flex-1">
           <h4 className="text-sm font-bold">Security Alert</h4>
           <p className="text-[10px] text-slate-400">Device binding is active. Do not share your login credentials.</p>
        </div>
      </div>
    </div>
  );
}

// --- Shared Helper Components ---

function StatCard({ icon, label, value, trend, isWarning }: { icon: React.ReactNode, label: string, value: string, trend?: string, isWarning?: boolean }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:translate-y-[-4px]">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
          {icon}
        </div>
        {trend && (
           <span className="text-[10px] font-bold text-accent bg-accent/5 px-2 py-1 rounded-full uppercase tracking-tighter">
             {trend}
           </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-slate-900">{value}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

function ActiveSessionItem({ course, time, count }: { course: string, time: string, count: number }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
           <QrCode className="w-5 h-5 text-secondary" />
        </div>
        <div>
           <div className="text-[13px] font-bold text-slate-900">{course}</div>
           <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{time}</div>
        </div>
      </div>
      <div className="text-right">
         <div className="text-lg font-bold text-slate-900">{count}</div>
         <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Joined</div>
      </div>
    </div>
  );
}

function CourseItem({ code, time, room }: { code: string, time: string, room: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-slate-100 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-xs text-primary">
          {code.split(' ')[0]}
        </div>
        <div>
           <div className="text-sm font-bold text-slate-900">{code}</div>
           <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{room}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-[10px] font-bold text-primary shadow-sm">
            <Clock className="w-3 h-3" />
            {time}
         </div>
         <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
